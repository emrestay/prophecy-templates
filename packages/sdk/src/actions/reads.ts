/**
 * Read helpers — on-chain view calls that don't require a wallet.
 *
 * Everything here takes a `PublicClient` only. These are cheap to call
 * repeatedly (e.g. inside a useEffect or a server component fetch) and
 * convert the raw tuple/struct returns from the contracts into the
 * ergonomic types defined in `../types`.
 */
import { type Address, type Chain, type PublicClient, type Transport } from "viem";

import { ProphecyCoreABI } from "../abis/index.js";
import { getAddresses, type ProphecyNetwork } from "../addresses.js";
import {
    type Market,
    type MarketPrice,
    MarketStatus,
    type MarketStatusValue,
    Outcome,
    type OutcomeValue,
    type SharePosition,
} from "../types/index.js";

const ONE_E18 = 10n ** 18n;

interface ReadOptions {
    network?: ProphecyNetwork;
}

/**
 * Fetch the core state and human-readable name for a market.
 * Throws if the market ID does not exist.
 */
export async function getMarket({
    publicClient,
    marketId,
    options = {},
}: {
    publicClient: PublicClient<Transport, Chain>;
    marketId: bigint;
    options?: ReadOptions;
}): Promise<Market> {
    const addresses = getAddresses(options.network ?? "staging");

    const [[core, rawName], eventId] = await Promise.all([
        publicClient.readContract({
            address: addresses.ProphecyCore,
            abi: ProphecyCoreABI,
            functionName: "getMarketCore",
            args: [marketId],
        }),
        publicClient.readContract({
            address: addresses.ProphecyCore,
            abi: ProphecyCoreABI,
            functionName: "marketEventId",
            args: [marketId],
        }),
    ]);

    // Prefer AI-generated event name → creator's original question → option label ("yes")
    let name = rawName;
    if (eventId > 0n) {
        const [aiName, humanName] = await Promise.all([
            publicClient.readContract({
                address: addresses.ProphecyCore,
                abi: ProphecyCoreABI,
                functionName: "generatedEventName",
                args: [eventId],
            }),
            publicClient.readContract({
                address: addresses.ProphecyCore,
                abi: ProphecyCoreABI,
                functionName: "eventName",
                args: [eventId],
            }),
        ]);
        name = (aiName as string) || (humanName as string) || rawName;
    }

    return {
        marketId,
        name,
        creator: core.creator,
        resolver: core.resolver,
        stakeToken: core.stakeToken,
        tradingStartTs: core.tradingStartTs,
        tradingEndTs: core.tradingEndTs,
        resolutionStartTs: core.resolutionStartTs,
        resolutionEndTs: core.resolutionEndTs,
        resolved: core.resolved,
        outcome: core.outcome as OutcomeValue,
        totalYesShares: core.totalYesShares,
        totalNoShares: core.totalNoShares,
        totalShares: core.totalShares,
        participantCount: core.participantCount,
        initialLiquidityBase: core.initialLiquidityBase,
        feeBps: core.feeBps,
    };
}

/**
 * Get a user's YES/NO share position for a market.
 * Returns all-zero positions for users who have never traded.
 */
export async function getUserPosition({
    publicClient,
    marketId,
    user,
    options = {},
}: {
    publicClient: PublicClient<Transport, Chain>;
    marketId: bigint;
    user: Address;
    options?: ReadOptions;
}): Promise<SharePosition> {
    const addresses = getAddresses(options.network ?? "staging");

    const position = await publicClient.readContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "getUserPosition",
        args: [marketId, user],
    });

    return {
        yes: position.yes,
        no: position.no,
        claimed: position.claimed,
    };
}

/**
 * Read the current CPMM pool reserves and derive instantaneous spot
 * prices for a market. YES and NO price are returned as 1e18 fixed
 * point (0 .. 1e18 each, summing to 1e18 modulo rounding).
 *
 * The CPMM pricing formula for a binary market:
 *   yesPrice = noPool / (yesPool + noPool)   → probability of YES
 *   noPrice  = yesPool / (yesPool + noPool)  → probability of NO
 *
 * For a freshly created 50/50 market both prices start at 5e17 (0.5).
 */
export async function getPrice({
    publicClient,
    marketId,
    options = {},
}: {
    publicClient: PublicClient<Transport, Chain>;
    marketId: bigint;
    options?: ReadOptions;
}): Promise<MarketPrice> {
    const addresses = getAddresses(options.network ?? "staging");

    const [yesPool, noPool] = await publicClient.readContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "getCurrentReserves",
        args: [marketId],
    });

    const total = yesPool + noPool;
    if (total === 0n) {
        return { yesPool, noPool, yesPrice: 0n, noPrice: 0n };
    }
    return {
        yesPool,
        noPool,
        yesPrice: (noPool * ONE_E18) / total,
        noPrice: (yesPool * ONE_E18) / total,
    };
}

/**
 * Convenience wrapper around ProphecyCore.quoteBuy.
 *
 * Returns the number of shares the caller would receive for
 * `amountIn`, plus the total fee that would be deducted at
 * the supplied venueId's fee rate.
 */
export async function quoteBuy({
    publicClient,
    marketId,
    amountIn,
    side,
    venueId = 54n,
    options = {},
}: {
    publicClient: PublicClient<Transport, Chain>;
    marketId: bigint;
    amountIn: bigint;
    side: "YES" | "NO";
    venueId?: bigint;
    options?: ReadOptions;
}): Promise<{ sharesOut: bigint; fee: bigint }> {
    const addresses = getAddresses(options.network ?? "staging");
    const [sharesOut, fee] = await publicClient.readContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "quoteBuy",
        args: [marketId, amountIn, side === "YES", venueId],
    });
    return { sharesOut, fee };
}

/**
 * Convenience wrapper around ProphecyCore.quoteSell.
 */
export async function quoteSell({
    publicClient,
    marketId,
    sharesIn,
    side,
    venueId = 54n,
    options = {},
}: {
    publicClient: PublicClient<Transport, Chain>;
    marketId: bigint;
    sharesIn: bigint;
    side: "YES" | "NO";
    venueId?: bigint;
    options?: ReadOptions;
}): Promise<{ amountOut: bigint; fee: bigint }> {
    const addresses = getAddresses(options.network ?? "staging");
    const [amountOutNet, fee] = await publicClient.readContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "quoteSell",
        args: [marketId, sharesIn, side === "YES", venueId],
    });
    return { amountOut: amountOutNet, fee };
}

/**
 * Derive the lifecycle status of a market from its on-chain state.
 *
 * NOTE: The deployed ProphecyCore ABI does not yet expose a
 * `getMarketStatus` view function, so we compute the status locally
 * from `Market` plus a reference timestamp. Pass `now` in seconds as
 * a BigInt (e.g. `BigInt(Math.floor(Date.now() / 1000))`) if you want
 * clock-adjusted results; otherwise `Date.now()`-derived values are
 * assumed.
 */
export function getMarketStatus(
    market: Market,
    now: bigint = BigInt(Math.floor(Date.now() / 1000)),
): MarketStatusValue {
    if (market.resolved) {
        if (market.outcome === Outcome.VOIDED) return MarketStatus.VOIDED;
        return MarketStatus.RESOLVED;
    }
    if (now < market.tradingStartTs) return MarketStatus.PENDING;
    if (now < market.tradingEndTs) return MarketStatus.ACTIVE;
    return MarketStatus.CLOSED;
}

/** Friendly label for a MarketStatus value — handy for UI. */
export function marketStatusLabel(status: MarketStatusValue): string {
    switch (status) {
        case MarketStatus.PENDING:
            return "Pending";
        case MarketStatus.ACTIVE:
            return "Active";
        case MarketStatus.CLOSED:
            return "Closed";
        case MarketStatus.RESOLVED:
            return "Resolved";
        case MarketStatus.VOIDED:
            return "Voided";
        case MarketStatus.SETTLED:
            return "Settled";
    }
}

/** Friendly label for an Outcome value. */
export function outcomeLabel(outcome: OutcomeValue): "YES" | "NO" | "VOIDED" {
    switch (outcome) {
        case Outcome.YES:
            return "YES";
        case Outcome.NO:
            return "NO";
        case Outcome.VOIDED:
            return "VOIDED";
    }
}
