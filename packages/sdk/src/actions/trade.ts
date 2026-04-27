/**
 * Trade actions — buyYes / buyNo / sellYes / sellNo on ProphecyCore.
 *
 * All four trade flows share the same venue-permit plumbing, so this file
 * exposes a single internal `trade()` primitive plus four thin wrappers
 * that pin the side + direction.
 *
 * On a signerless venue (signer = address(0), as with the hackathon
 * venue #54), the `signature` argument is simply `"0x"` and `deadline`
 * is sanity-checked only. That means no EIP-712 signing is required on
 * the client — users pay gas from their connected wallet and the trade
 * lands directly.
 *
 * For buys on an ERC20-staked market, the caller must have approved
 * ProphecyCore to pull `amountIn`. This helper ensures that approval
 * happens automatically the first time (max uint256 allowance) unless
 * `options.skipApproval` is set.
 *
 * The actual trade result (shares received / tokens received) is
 * decoded from the `Trade` event emitted by ProphecyCore, not from the
 * return value — this keeps the implementation independent of viem's
 * per-function generic inference which breaks across the payable /
 * nonpayable split between buy and sell.
 */
import {
    decodeEventLog,
    erc20Abi,
    maxUint256,
    zeroAddress,
    type Account,
    type Address,
    type Chain,
    type Hash,
    type Hex,
    type PublicClient,
    type Transport,
    type WalletClient,
} from "viem";

import { ERC20ABI, ProphecyCoreABI } from "../abis/index.js";
import { getAddresses, type ProphecyNetwork } from "../addresses.js";

export interface TradeSharedOptions {
    /** "staging" (default) or "development". */
    network?: ProphecyNetwork;
    /** Venue routing the trade. Defaults to the hackathon venue (54). */
    venueId?: bigint;
    /**
     * Maximum acceptable total fee in basis points
     * (LP fee + venue fee). Defaults to 10_000 (100 %) which disables
     * the fee ceiling — tighten this if you want to reject trades when
     * venues raise their fees mid-auction.
     */
    maxFeeBps?: bigint;
    /** EIP-712 venue permit. Empty bytes for signerless venues. */
    signature?: Hex;
    /** Permit deadline (unix seconds). `0n` = no deadline (signerless venues). */
    deadline?: bigint;
    /** Skip the ERC20 allowance check / approval step. */
    skipApproval?: boolean;
    /** Transaction receipt polling timeout in ms. Defaults to 60_000. */
    receiptTimeoutMs?: number;
}

export interface BuyParams {
    marketId: bigint;
    /** Stake tokens to spend, in base units (wei). */
    amountIn: bigint;
    /** Minimum share amount to accept (slippage protection). 0n disables. */
    minSharesOut: bigint;
    /** ERC20 stake token. Use zeroAddress for native STT. */
    stakeToken: Address;
}

export interface SellParams {
    marketId: bigint;
    /** Shares to burn. */
    sharesIn: bigint;
    /** Minimum stake-token amount to accept (slippage protection). 0n disables. */
    minAmountOut: bigint;
}

export interface TradeResult {
    txHash: Hash;
    blockNumber: bigint;
    /** For buys: shares received. For sells: stake tokens received. */
    amount: bigint;
    approvalTxHash: Hash | null;
    explorerUrl: string;
}

const DEFAULT_HACKATHON_VENUE_ID = 54n;
const DEFAULT_MAX_FEE_BPS = 10_000n;

async function ensureAllowance({
    walletClient,
    publicClient,
    token,
    spender,
    amount,
    owner,
    receiptTimeoutMs,
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    token: Address;
    spender: Address;
    amount: bigint;
    owner: Address;
    receiptTimeoutMs: number;
}): Promise<Hash | null> {
    const allowance = await publicClient.readContract({
        address: token,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [owner, spender],
    });
    if (allowance >= amount) return null;

    const hash = await walletClient.writeContract({
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, maxUint256],
    });
    await publicClient.waitForTransactionReceipt({ hash, timeout: receiptTimeoutMs });
    return hash;
}

/**
 * Decode the amount out from a Trade event emitted by ProphecyCore.
 * For buys returns `shareAmount`; for sells returns `tokenAmount`.
 */
function decodeTradeAmount(
    receipt: { logs: readonly { address: Address; topics: readonly Hex[]; data: Hex }[] },
    coreAddress: Address,
    isBuy: boolean,
): bigint {
    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== coreAddress.toLowerCase()) continue;
        try {
            const decoded = decodeEventLog({
                abi: ProphecyCoreABI,
                data: log.data,
                topics: log.topics as [Hex, ...Hex[]],
            });
            if (decoded.eventName === "Trade") {
                const args = decoded.args as {
                    isBuy: boolean;
                    tokenAmount: bigint;
                    shareAmount: bigint;
                };
                if (args.isBuy === isBuy) {
                    return isBuy ? args.shareAmount : args.tokenAmount;
                }
            }
        } catch {
            // Non-ProphecyCore log — skip.
        }
    }
    return 0n;
}

/**
 * Buy YES shares by spending `amountIn` stake tokens.
 * Auto-handles ERC20 approval on the first trade.
 */
export async function buyYes({
    walletClient,
    publicClient,
    params,
    options = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    params: BuyParams;
    options?: TradeSharedOptions;
}): Promise<TradeResult> {
    const addresses = getAddresses(options.network ?? "staging");
    const isNative = params.stakeToken === zeroAddress;
    const receiptTimeoutMs = options.receiptTimeoutMs ?? 60_000;
    const venueId = options.venueId ?? DEFAULT_HACKATHON_VENUE_ID;
    const maxFeeBps = options.maxFeeBps ?? DEFAULT_MAX_FEE_BPS;
    const signature: Hex = options.signature ?? "0x";

    let approvalTxHash: Hash | null = null;
    if (!isNative && !options.skipApproval) {
        approvalTxHash = await ensureAllowance({
            walletClient,
            publicClient,
            token: params.stakeToken,
            spender: addresses.ProphecyCore,
            amount: params.amountIn,
            owner: walletClient.account.address,
            receiptTimeoutMs,
        });
    }

    const txHash = await walletClient.writeContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "buyYes",
        args: [
            params.marketId,
            isNative ? 0n : params.amountIn,
            params.minSharesOut,
            maxFeeBps,
            venueId,
            options.deadline ?? 0n,
            signature,
        ],
        value: isNative ? params.amountIn : 0n,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: receiptTimeoutMs,
    });
    if (receipt.status !== "success") {
        throw new Error(`buyYes reverted — tx=${txHash}`);
    }

    return {
        txHash,
        blockNumber: receipt.blockNumber,
        amount: decodeTradeAmount(receipt, addresses.ProphecyCore, true),
        approvalTxHash,
        explorerUrl: `${publicClient.chain.blockExplorers?.default.url}/tx/${txHash}`,
    };
}

/**
 * Buy NO shares by spending `amountIn` stake tokens.
 * Auto-handles ERC20 approval on the first trade.
 */
export async function buyNo({
    walletClient,
    publicClient,
    params,
    options = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    params: BuyParams;
    options?: TradeSharedOptions;
}): Promise<TradeResult> {
    const addresses = getAddresses(options.network ?? "staging");
    const isNative = params.stakeToken === zeroAddress;
    const receiptTimeoutMs = options.receiptTimeoutMs ?? 60_000;
    const venueId = options.venueId ?? DEFAULT_HACKATHON_VENUE_ID;
    const maxFeeBps = options.maxFeeBps ?? DEFAULT_MAX_FEE_BPS;
    const signature: Hex = options.signature ?? "0x";

    let approvalTxHash: Hash | null = null;
    if (!isNative && !options.skipApproval) {
        approvalTxHash = await ensureAllowance({
            walletClient,
            publicClient,
            token: params.stakeToken,
            spender: addresses.ProphecyCore,
            amount: params.amountIn,
            owner: walletClient.account.address,
            receiptTimeoutMs,
        });
    }

    const txHash = await walletClient.writeContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "buyNo",
        args: [
            params.marketId,
            isNative ? 0n : params.amountIn,
            params.minSharesOut,
            maxFeeBps,
            venueId,
            options.deadline ?? 0n,
            signature,
        ],
        value: isNative ? params.amountIn : 0n,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: receiptTimeoutMs,
    });
    if (receipt.status !== "success") {
        throw new Error(`buyNo reverted — tx=${txHash}`);
    }

    return {
        txHash,
        blockNumber: receipt.blockNumber,
        amount: decodeTradeAmount(receipt, addresses.ProphecyCore, true),
        approvalTxHash,
        explorerUrl: `${publicClient.chain.blockExplorers?.default.url}/tx/${txHash}`,
    };
}

/** Sell YES shares back into the pool for stake tokens. */
export async function sellYes({
    walletClient,
    publicClient,
    params,
    options = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    params: SellParams;
    options?: TradeSharedOptions;
}): Promise<TradeResult> {
    const addresses = getAddresses(options.network ?? "staging");
    const receiptTimeoutMs = options.receiptTimeoutMs ?? 60_000;
    const venueId = options.venueId ?? DEFAULT_HACKATHON_VENUE_ID;
    const maxFeeBps = options.maxFeeBps ?? DEFAULT_MAX_FEE_BPS;
    const signature: Hex = options.signature ?? "0x";

    const txHash = await walletClient.writeContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "sellYes",
        args: [
            params.marketId,
            params.sharesIn,
            params.minAmountOut,
            maxFeeBps,
            venueId,
            options.deadline ?? 0n,
            signature,
        ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: receiptTimeoutMs,
    });
    if (receipt.status !== "success") {
        throw new Error(`sellYes reverted — tx=${txHash}`);
    }

    return {
        txHash,
        blockNumber: receipt.blockNumber,
        amount: decodeTradeAmount(receipt, addresses.ProphecyCore, false),
        approvalTxHash: null,
        explorerUrl: `${publicClient.chain.blockExplorers?.default.url}/tx/${txHash}`,
    };
}

/** Sell NO shares back into the pool for stake tokens. */
export async function sellNo({
    walletClient,
    publicClient,
    params,
    options = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    params: SellParams;
    options?: TradeSharedOptions;
}): Promise<TradeResult> {
    const addresses = getAddresses(options.network ?? "staging");
    const receiptTimeoutMs = options.receiptTimeoutMs ?? 60_000;
    const venueId = options.venueId ?? DEFAULT_HACKATHON_VENUE_ID;
    const maxFeeBps = options.maxFeeBps ?? DEFAULT_MAX_FEE_BPS;
    const signature: Hex = options.signature ?? "0x";

    const txHash = await walletClient.writeContract({
        address: addresses.ProphecyCore,
        abi: ProphecyCoreABI,
        functionName: "sellNo",
        args: [
            params.marketId,
            params.sharesIn,
            params.minAmountOut,
            maxFeeBps,
            venueId,
            options.deadline ?? 0n,
            signature,
        ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: receiptTimeoutMs,
    });
    if (receipt.status !== "success") {
        throw new Error(`sellNo reverted — tx=${txHash}`);
    }

    return {
        txHash,
        blockNumber: receipt.blockNumber,
        amount: decodeTradeAmount(receipt, addresses.ProphecyCore, false),
        approvalTxHash: null,
        explorerUrl: `${publicClient.chain.blockExplorers?.default.url}/tx/${txHash}`,
    };
}
