/**
 * createMarket — register a Prophecy market via MultiOutcomeAIResolutionMarket.
 *
 * This is the canonical market creation path per the Prophecy docs:
 *   "All markets are created through the MultiOutcomeAIResolutionMarket
 *    contract." — references/prophecy-docs/concepts/overview.md
 *
 * The helper supports three shapes:
 *
 *   1. `createMarket(...)` — full multi-outcome API. Pass `params` and
 *      `options[]` exactly as the contract expects, for cases where you
 *      want more than one market per event.
 *   2. `createBinaryNumberMarket(...)` — shorthand for YES/NO markets
 *      resolved by a numeric threshold (e.g. "Will BTC > $200k?"). One
 *      URL, one condition, one option.
 *   3. `createBinaryStringMarket(...)` — shorthand for YES/NO markets
 *      resolved by a string match (e.g. "Will Bernie Sanders win?").
 *
 * Flow:
 *   1. (ERC20 only) ensure the caller has approved ProphecyCore to pull
 *      initialLiquidityBase of the stake token.
 *   2. Call `getCreateMarketCost(...)` to compute `msg.value` (covers
 *      initial liquidity for native markets + AI agent deposits +
 *      subscription top-up + 5% buffer).
 *   3. Submit `createMultiOutcomeMarket(params, options)` via a
 *      signerless venue (empty bytes for `venueSignature`). Non-signerless
 *      venues must build an EIP-712 CreateMarketPermit — see
 *      `references/prophecy-docs/developers/integrating-with-a-venue.md`.
 *   4. Decode the `MultiOutcomeEventCreated` event to return the
 *      `eventId` and all assigned `marketIds`.
 *
 * Hackathon venue (id 54) is signerless, so builders don't need any
 * EIP-712 signing to use this helper as-is.
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
    type PublicClient,
    type Transport,
    type WalletClient,
} from "viem";

import {
    ERC20ABI,
    MultiOutcomeAIResolutionMarketABI,
} from "../abis/index.js";
import { getAddresses, type ProphecyNetwork } from "../addresses.js";

/** Result shape of the MOM contract — `resultType` enum. */
export const ResultType = {
    NUMBER: 0,
    STRING: 1,
} as const;
export type ResultType = (typeof ResultType)[keyof typeof ResultType];

/** A single condition compared against the AI result. */
export interface OptionCondition {
    /** Comparison operator: `==`, `!=`, `>`, `>=`, `<`, `<=` (for NUMBER) or `==`, `!=` (for STRING). */
    operatorStr: string;
    /** Numeric value (NUMBER result type). Use `0n` for STRING conditions. */
    numValue: bigint;
    /** String value (STRING result type). Use `""` for NUMBER conditions. */
    strValue: string;
}

/** A single market option. For a binary YES/NO market, pass exactly one option. */
export interface OptionInput {
    /** Display name (e.g. "Yes", "Lewis Hamilton"). */
    name: string;
    /** For NUMBER results, conditions are AND'd. For STRING results, they are OR'd. */
    conditions: OptionCondition[];
    /** Initial liquidity seeded into this option's pool, in base units. */
    initialLiquidityBase: bigint;
}

/** Parameters for the outer event (shared by all option markets within it). */
export interface MultiOutcomeParams {
    /** The question shown to users — e.g. "Who will win the Grand Prix?" */
    eventName: string;
    /** Prompt sent to the AI agent — e.g. "What is the current BTC price in USD?" */
    prompt: string;
    /** Public data source URLs the agent will consult. */
    urls: string[];
    /** Minimum number of sources that must agree. 1 ≤ minAgreement ≤ urls.length. */
    minAgreement: bigint;
    /** Whether the agent should resolve URL content (fetch full page) or just use the prompt. */
    resolveUrl: boolean;
    /** Number of independent AI sources queried per URL. */
    numSources: number;
    /** NUMBER (0) or STRING (1). */
    resultType: ResultType;
    /** Allowed agent return values (STRING type only). Can be a superset of option names. */
    stringOptions: string[];
    /** Venue id — use 54 for the hackathon signerless venue. */
    venueId: bigint;
    /** EIP-712 CreateMarketPermit signature, or `"0x"` for signerless venues. */
    venueSignature: `0x${string}`;
    /** Collateral token address. Use `zeroAddress` for native STT. */
    stakeToken: Address;
    /** Unix seconds when trading opens. Must be > block.timestamp. */
    tradingStartTs: bigint;
    /** Unix seconds when trading closes. */
    tradingEndTs: bigint;
    /** Unix seconds when the resolution window opens. */
    resolutionStartTs: bigint;
    /** Unix seconds when the resolution window closes. */
    resolutionEndTs: bigint;
    /** EIP-712 permit deadline. `0n` = no deadline (signerless venues typically use 0). */
    deadline: bigint;
}

export interface CreateMarketOptions {
    /** "staging" (default) or "development". */
    network?: ProphecyNetwork;
    /** Override the computed msg.value. Usually you should let the SDK call getCreateMarketCost. */
    msgValue?: bigint;
    /** Skip the ERC20 allowance bump. Useful if the caller already approved maxUint256. */
    skipApproval?: boolean;
    /** Transaction receipt polling timeout in ms. Defaults to 60_000. */
    receiptTimeoutMs?: number;
}

export interface CreateMarketResult {
    /** Transaction hash of the createMultiOutcomeMarket call. */
    txHash: Hash;
    /** Block number containing the tx. */
    blockNumber: bigint;
    /** The assigned event id. */
    eventId: bigint;
    /** Market ids — one per `options[]` entry. For a binary market, length == 1. */
    marketIds: readonly bigint[];
    /** Convenience: `marketIds[0]` (the common case for binary markets). */
    marketId: bigint;
    /** Total msg.value forwarded (from getCreateMarketCost unless overridden). */
    msgValuePaid: bigint;
    /** ERC20 approval tx hash, if one was submitted. */
    approvalTxHash: Hash | null;
    /** Block explorer URL for the market creation tx. */
    explorerUrl: string;
}

/**
 * Compute `msg.value` for a market creation. Wraps the view-only
 * `MultiOutcomeAIResolutionMarket.getCreateMarketCost` which accounts
 * for initial liquidity (native only) + AI agent deposits + Somnia
 * Reactivity subscription top-up + 5% buffer.
 *
 * @example
 *   const cost = await getCreateMarketCost({
 *     publicClient,
 *     liquidityBases: [10n ** 17n],
 *     stakeToken: zeroAddress,
 *     urlCount: 1n,
 *   });
 */
export async function getCreateMarketCost({
    publicClient,
    liquidityBases,
    stakeToken,
    urlCount,
    network = "staging",
}: {
    publicClient: PublicClient<Transport, Chain>;
    liquidityBases: readonly bigint[];
    stakeToken: Address;
    urlCount: bigint;
    network?: ProphecyNetwork;
}): Promise<bigint> {
    const addresses = getAddresses(network);
    return await publicClient.readContract({
        address: addresses.MultiOutcomeAIResolutionMarket,
        abi: MultiOutcomeAIResolutionMarketABI,
        functionName: "getCreateMarketCost",
        args: [liquidityBases, stakeToken, urlCount],
    });
}

/**
 * Full-fidelity market creation. Use this if you need multi-outcome
 * events or non-default market shapes. For YES/NO markets, prefer
 * `createBinaryNumberMarket` or `createBinaryStringMarket`.
 *
 * @example
 *   const result = await createMarket({
 *     walletClient,
 *     publicClient,
 *     params: {
 *       eventName: "Will BTC hit $200k by end of 2026?",
 *       prompt: "What is the current price of Bitcoin in USD? Return just the number.",
 *       urls: ["https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"],
 *       minAgreement: 1n,
 *       resolveUrl: false,
 *       numSources: 1,
 *       resultType: ResultType.NUMBER,
 *       stringOptions: [],
 *       venueId: 54n,
 *       venueSignature: "0x",
 *       stakeToken: zeroAddress,
 *       tradingStartTs: BigInt(now + 60),
 *       tradingEndTs:   BigInt(now + 86400),
 *       resolutionStartTs: BigInt(now + 86400),
 *       resolutionEndTs:   BigInt(now + 86700),
 *       deadline: 0n,
 *     },
 *     options: [
 *       {
 *         name: "Yes",
 *         conditions: [{ operatorStr: ">=", numValue: 200000n, strValue: "" }],
 *         initialLiquidityBase: 10n ** 17n,
 *       },
 *     ],
 *   });
 */
export async function createMarket({
    walletClient,
    publicClient,
    params,
    options,
    callOptions = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    params: MultiOutcomeParams;
    options: readonly OptionInput[];
    callOptions?: CreateMarketOptions;
}): Promise<CreateMarketResult> {
    if (options.length === 0) {
        throw new Error("createMarket requires at least one option.");
    }
    const network = callOptions.network ?? "staging";
    const addresses = getAddresses(network);
    const account = walletClient.account;
    const receiptTimeoutMs = callOptions.receiptTimeoutMs ?? 60_000;
    const isNative = params.stakeToken === zeroAddress;

    // ── 1. Approve ERC20 collateral if needed ──
    let approvalTxHash: Hash | null = null;
    if (!isNative && !callOptions.skipApproval) {
        const totalLiquidity = options.reduce(
            (sum, o) => sum + o.initialLiquidityBase,
            0n,
        );
        const allowance = await publicClient.readContract({
            address: params.stakeToken,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [account.address, addresses.ProphecyCore],
        });
        if (allowance < totalLiquidity) {
            approvalTxHash = await walletClient.writeContract({
                address: params.stakeToken,
                abi: erc20Abi,
                functionName: "approve",
                args: [addresses.ProphecyCore, maxUint256],
            });
            await publicClient.waitForTransactionReceipt({
                hash: approvalTxHash,
                timeout: receiptTimeoutMs,
            });
        }
    }

    // ── 2. Compute msg.value via getCreateMarketCost (unless overridden) ──
    const msgValue = callOptions.msgValue ?? (await getCreateMarketCost({
        publicClient,
        liquidityBases: options.map((o) => o.initialLiquidityBase),
        stakeToken: params.stakeToken,
        urlCount: BigInt(params.urls.length),
        network,
    }));

    // ── 3. Submit createMultiOutcomeMarket ──
    const txHash = await walletClient.writeContract({
        address: addresses.MultiOutcomeAIResolutionMarket,
        abi: MultiOutcomeAIResolutionMarketABI,
        functionName: "createMultiOutcomeMarket",
        args: [
            {
                eventName: params.eventName,
                prompt: params.prompt,
                urls: params.urls,
                minAgreement: params.minAgreement,
                resolveUrl: params.resolveUrl,
                numSources: params.numSources,
                resultType: params.resultType,
                stringOptions: params.stringOptions,
                venueId: params.venueId,
                venueSignature: params.venueSignature,
                stakeToken: params.stakeToken,
                tradingStartTs: params.tradingStartTs,
                tradingEndTs: params.tradingEndTs,
                resolutionStartTs: params.resolutionStartTs,
                resolutionEndTs: params.resolutionEndTs,
                deadline: params.deadline,
            },
            options.map((o) => ({
                name: o.name,
                conditions: o.conditions.map((c) => ({
                    operatorStr: c.operatorStr,
                    numValue: c.numValue,
                    strValue: c.strValue,
                })),
                initialLiquidityBase: o.initialLiquidityBase,
            })),
        ],
        value: msgValue,
    });

    // ── 4. Wait for receipt, decode MultiOutcomeEventCreated ──
    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: receiptTimeoutMs,
    });
    if (receipt.status !== "success") {
        throw new Error(
            `createMarket reverted — tx=${txHash} gasUsed=${receipt.gasUsed}.`,
        );
    }

    let eventId: bigint | null = null;
    let marketIds: readonly bigint[] | null = null;
    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== addresses.MultiOutcomeAIResolutionMarket.toLowerCase()) continue;
        try {
            const decoded = decodeEventLog({
                abi: MultiOutcomeAIResolutionMarketABI,
                data: log.data,
                topics: log.topics,
            });
            if (decoded.eventName === "MultiOutcomeEventCreated") {
                const args = decoded.args as { eventId: bigint; marketIds: readonly bigint[] };
                eventId = args.eventId;
                marketIds = args.marketIds;
                break;
            }
        } catch {
            /* skip non-matching logs */
        }
    }

    if (eventId === null || marketIds === null) {
        throw new Error(
            `createMarket succeeded on-chain but MultiOutcomeEventCreated was not found in logs — tx=${txHash}`,
        );
    }

    const explorerUrl = `${publicClient.chain.blockExplorers?.default.url}/tx/${txHash}`;

    return {
        txHash,
        blockNumber: receipt.blockNumber,
        eventId,
        marketIds,
        marketId: marketIds[0]!,
        msgValuePaid: msgValue,
        approvalTxHash,
        explorerUrl,
    };
}

/**
 * Shorthand for a YES/NO market resolved by a numeric threshold.
 *
 * Example: "Will BTC close above $200k?" — the AI agent fetches the BTC
 * price from `urls`, the contract compares it with `operatorStr + threshold`,
 * and if the condition holds the market resolves YES (otherwise NO).
 *
 * @example
 *   const result = await createBinaryNumberMarket({
 *     walletClient,
 *     publicClient,
 *     question: "Will BTC hit $200k by end of 2026?",
 *     prompt: "What is the current price of Bitcoin in USD? Return just the number.",
 *     urls: ["https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"],
 *     operatorStr: ">=",
 *     threshold: 200000n,
 *     venueId: 54n,
 *     tradingStartTs: BigInt(now + 60),
 *     tradingEndTs:   BigInt(now + 180),
 *     resolutionStartTs: BigInt(now + 180),
 *     resolutionEndTs:   BigInt(now + 480),
 *     stakeToken: zeroAddress,
 *     initialLiquidityBase: 10n ** 17n,
 *   });
 */
export async function createBinaryNumberMarket({
    walletClient,
    publicClient,
    question,
    prompt,
    urls,
    operatorStr,
    threshold,
    yesOptionName = "Yes",
    venueId,
    venueSignature = "0x",
    stakeToken,
    initialLiquidityBase,
    tradingStartTs,
    tradingEndTs,
    resolutionStartTs,
    resolutionEndTs,
    deadline = 0n,
    minAgreement,
    resolveUrl = false,
    numSources = 1,
    callOptions = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    /** Human-readable question for UIs. */
    question: string;
    /** Prompt passed to the AI agent (should ask for a single number). */
    prompt: string;
    /** Public data source URLs. */
    urls: string[];
    /** Comparison operator — one of `==`, `!=`, `>`, `>=`, `<`, `<=`. */
    operatorStr: string;
    /** Numeric threshold the AI result is compared against (already scaled). */
    threshold: bigint;
    /** Display name for the YES option. Defaults to "Yes". */
    yesOptionName?: string;
    venueId: bigint;
    venueSignature?: `0x${string}`;
    stakeToken: Address;
    initialLiquidityBase: bigint;
    tradingStartTs: bigint;
    tradingEndTs: bigint;
    resolutionStartTs: bigint;
    resolutionEndTs: bigint;
    deadline?: bigint;
    /** Minimum agreeing sources. Defaults to `urls.length` (unanimous). */
    minAgreement?: bigint;
    resolveUrl?: boolean;
    numSources?: number;
    callOptions?: CreateMarketOptions;
}): Promise<CreateMarketResult> {
    return createMarket({
        walletClient,
        publicClient,
        params: {
            eventName: question,
            prompt,
            urls,
            minAgreement: minAgreement ?? BigInt(urls.length),
            resolveUrl,
            numSources,
            resultType: ResultType.NUMBER,
            stringOptions: [],
            venueId,
            venueSignature,
            stakeToken,
            tradingStartTs,
            tradingEndTs,
            resolutionStartTs,
            resolutionEndTs,
            deadline,
        },
        options: [
            {
                name: yesOptionName,
                conditions: [{ operatorStr, numValue: threshold, strValue: "" }],
                initialLiquidityBase,
            },
        ],
        callOptions,
    });
}

/**
 * Shorthand for a YES/NO market where the AI returns a string that
 * must match `winner`. Example: "Will Bernie Sanders win the election?"
 *
 * `stringOptions` should enumerate every valid agent return value
 * (including the losing candidates), and `winner` must be one of them.
 *
 * @example
 *   const result = await createBinaryStringMarket({
 *     walletClient,
 *     publicClient,
 *     question: "Will Bernie Sanders win the 2026 election?",
 *     prompt: "Who won the 2026 US presidential election? Return the exact name.",
 *     urls: ["https://www.bbc.co.uk/news/election/2026/results"],
 *     winner: "Bernie Sanders",
 *     allowedResults: ["Bernie Sanders", "Donald Trump", "Kamala Harris"],
 *     venueId: 54n,
 *     tradingStartTs: ..., tradingEndTs: ...,
 *     resolutionStartTs: ..., resolutionEndTs: ...,
 *     stakeToken: zeroAddress,
 *     initialLiquidityBase: 10n ** 17n,
 *   });
 */
export async function createBinaryStringMarket({
    walletClient,
    publicClient,
    question,
    prompt,
    urls,
    winner,
    allowedResults,
    venueId,
    venueSignature = "0x",
    stakeToken,
    initialLiquidityBase,
    tradingStartTs,
    tradingEndTs,
    resolutionStartTs,
    resolutionEndTs,
    deadline = 0n,
    minAgreement,
    resolveUrl = false,
    numSources = 1,
    callOptions = {},
}: {
    walletClient: WalletClient<Transport, Chain, Account>;
    publicClient: PublicClient<Transport, Chain>;
    question: string;
    prompt: string;
    urls: string[];
    /** The string value that resolves YES. Must appear in `allowedResults`. */
    winner: string;
    /** All string values the agent is allowed to return. */
    allowedResults: string[];
    venueId: bigint;
    venueSignature?: `0x${string}`;
    stakeToken: Address;
    initialLiquidityBase: bigint;
    tradingStartTs: bigint;
    tradingEndTs: bigint;
    resolutionStartTs: bigint;
    resolutionEndTs: bigint;
    deadline?: bigint;
    minAgreement?: bigint;
    resolveUrl?: boolean;
    numSources?: number;
    callOptions?: CreateMarketOptions;
}): Promise<CreateMarketResult> {
    if (!allowedResults.includes(winner)) {
        throw new Error(
            `winner "${winner}" must appear in allowedResults=${JSON.stringify(allowedResults)}.`,
        );
    }
    return createMarket({
        walletClient,
        publicClient,
        params: {
            eventName: question,
            prompt,
            urls,
            minAgreement: minAgreement ?? BigInt(urls.length),
            resolveUrl,
            numSources,
            resultType: ResultType.STRING,
            stringOptions: allowedResults,
            venueId,
            venueSignature,
            stakeToken,
            tradingStartTs,
            tradingEndTs,
            resolutionStartTs,
            resolutionEndTs,
            deadline,
        },
        options: [
            {
                name: winner,
                conditions: [{ operatorStr: "==", numValue: 0n, strValue: winner }],
                initialLiquidityBase,
            },
        ],
        callOptions,
    });
}
