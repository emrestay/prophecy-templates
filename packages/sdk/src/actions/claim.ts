/**
 * claim — withdraw a trader's settled winnings for a resolved market.
 *
 * After a market is resolved (or voided), the caller's share position
 * is redeemable via ProphecySettlement.claimSettlement(marketId). The
 * contract computes the pro-rata payout for the caller's YES/NO shares
 * and transfers stake tokens (or native STT) back.
 *
 * Note: `claimSettlement` settles for `msg.sender` only — pass a
 * walletClient whose account is the actual ticket holder.
 */
import {
    decodeEventLog,
    type Account,
    type Address,
    type Chain,
    type Hash,
    type PublicClient,
    type Transport,
    type WalletClient,
} from "viem";

import { ProphecySettlementABI } from "../abis/index.js";
import { getAddresses, type ProphecyNetwork } from "../addresses.js";

export interface ClaimParams {
    marketId: bigint;
}

export interface ClaimResult {
    txHash: Hash;
    blockNumber: bigint;
    marketId: bigint;
    user: Address;
    /** Amount paid out, decoded from the WinningsClaimed event (0 if no winnings). */
    payout: bigint;
    explorerUrl: string;
}

/**
 * Claim winnings for a resolved market.
 *
 * @example
 *   const { payout } = await claim({
 *     walletClient,
 *     publicClient,
 *     params: { marketId: 42n },
 *   });
 *   console.log(`Claimed ${payout} base units`);
 */
export async function claim({
    walletClient,
    publicClient,
    params,
    options = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    params: ClaimParams;
    options?: { network?: ProphecyNetwork; receiptTimeoutMs?: number };
}): Promise<ClaimResult> {
    const addresses = getAddresses(options.network ?? "staging");
    const receiptTimeoutMs = options.receiptTimeoutMs ?? 60_000;
    const user = walletClient.account.address;

    const txHash = await walletClient.writeContract({
        address: addresses.ProphecySettlement,
        abi: ProphecySettlementABI,
        functionName: "claimSettlement",
        args: [params.marketId],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: receiptTimeoutMs,
    });

    if (receipt.status !== "success") {
        throw new Error(
            `claim reverted — tx=${txHash} gasUsed=${receipt.gasUsed}. ` +
                `Most common causes: market not yet resolved, already claimed, or zero winnings.`,
        );
    }

    let payout = 0n;
    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== addresses.ProphecySettlement.toLowerCase()) continue;
        try {
            const decoded = decodeEventLog({
                abi: ProphecySettlementABI,
                data: log.data,
                topics: log.topics,
            });
            if (decoded.eventName === "WinningsClaimed") {
                const args = decoded.args as { user: Address; payout: bigint };
                if (args.user.toLowerCase() === user.toLowerCase()) {
                    payout = args.payout;
                    break;
                }
            }
        } catch {
            // skip non-matching logs
        }
    }

    const explorerUrl = `${publicClient.chain.blockExplorers?.default.url}/tx/${txHash}`;

    return {
        txHash,
        blockNumber: receipt.blockNumber,
        marketId: params.marketId,
        user,
        payout,
        explorerUrl,
    };
}
