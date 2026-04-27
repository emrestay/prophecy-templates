/**
 * resolve — MOM markets are resolved automatically by the Somnia Agents
 * AI pipeline; there is no manual `resolve(outcome)` call from the
 * creator for MULTI_OUTCOME markets.
 *
 * Resolution flow for MOM markets:
 *   1. At `resolutionStartTs` the market dispatches an AI request via
 *      IHttpSingletonSomniaAgents using the configured `prompt`, `urls`,
 *      `resultType`, and `minAgreement`.
 *   2. Agents fetch from each URL, return their answers, and the
 *      on-chain aggregator compares them against each option's
 *      `conditions` to determine the outcome.
 *   3. ProphecyCore receives the outcome via `finalizeMarket` and emits
 *      `MarketResolved(marketId, outcome)`.
 *   4. The resolver may retry if the agents fail to reach `minAgreement`;
 *      if the window expires without a resolution, the market is voided.
 *
 * A separate `CREATOR` resolver type exists in the contracts for manual
 * creator-settled markets, but at the time of this SDK it is not
 * registered in the staging VenueRegistry and not documented publicly.
 * We track this as "§7 Open Blocker" in AGENTS.md; once the Prophecy
 * team enables CREATOR resolvers, we'll re-add a `resolve` helper here.
 *
 * For now, apps observe resolution via:
 *   - polling `getMarket(publicClient, marketId)` and checking `resolved`
 *   - subscribing to the `MarketResolved` event on ProphecyCore
 *
 * See `actions/reads.ts` for read helpers.
 */
import {
    decodeEventLog,
    type Account,
    type Chain,
    type Hash,
    type PublicClient,
    type Transport,
    type WalletClient,
} from "viem";

import { ProphecyCoreABI } from "../abis/index.js";
import { getAddresses, type ProphecyNetwork } from "../addresses.js";

export interface WaitForResolutionOptions {
    network?: ProphecyNetwork;
    /** Max time to wait in ms. Defaults to 10 minutes. */
    timeoutMs?: number;
    /** Poll interval in ms. Defaults to 5_000. */
    pollIntervalMs?: number;
}

export interface ResolutionObserved {
    marketId: bigint;
    outcome: number; // 0 = NO, 1 = YES, 2 = VOIDED
    resolvedAt: bigint; // unix seconds from the block
    txHash: Hash | null;
}

/**
 * Poll ProphecyCore until the market's `resolved` flag flips to true,
 * or the timeout elapses. Returns the observed outcome.
 *
 * Throws on timeout — callers that want best-effort polling should
 * catch the error and fall back to UI spinners / retry.
 */
export async function waitForResolution({
    publicClient,
    marketId,
    options = {},
}: {
    publicClient: PublicClient<Transport, Chain>;
    marketId: bigint;
    options?: WaitForResolutionOptions;
}): Promise<ResolutionObserved> {
    const addresses = getAddresses(options.network ?? "staging");
    const timeoutMs = options.timeoutMs ?? 10 * 60 * 1000;
    const pollIntervalMs = options.pollIntervalMs ?? 5_000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const [core] = await publicClient.readContract({
            address: addresses.ProphecyCore,
            abi: ProphecyCoreABI,
            functionName: "getMarketCore",
            args: [marketId],
        });

        if (core.resolved) {
            return {
                marketId,
                outcome: Number(core.outcome),
                resolvedAt: BigInt(Math.floor(Date.now() / 1000)),
                txHash: null,
            };
        }
        await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error(
        `Timed out waiting for market ${marketId} to resolve after ${timeoutMs}ms.`,
    );
}

/**
 * Parse a `MarketResolved` event from a transaction receipt (or any
 * array of viem logs). Useful in apps that index events rather than
 * polling.
 */
export function findMarketResolvedInLogs(
    logs: Array<{ address: `0x${string}`; data: `0x${string}`; topics: readonly `0x${string}`[] }>,
    prophecyCoreAddress: `0x${string}`,
): { marketId: bigint; outcome: number } | null {
    for (const log of logs) {
        if (log.address.toLowerCase() !== prophecyCoreAddress.toLowerCase()) continue;
        try {
            const decoded = decodeEventLog({
                abi: ProphecyCoreABI,
                data: log.data,
                topics: log.topics as unknown as [`0x${string}`, ...`0x${string}`[]],
            });
            if (decoded.eventName === "MarketResolved") {
                const args = decoded.args as { marketId: bigint; outcome: number };
                return { marketId: args.marketId, outcome: Number(args.outcome) };
            }
        } catch {
            /* ignore non-matching log */
        }
    }
    return null;
}
