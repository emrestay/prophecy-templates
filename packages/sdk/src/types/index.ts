/**
 * Shared TypeScript types for the Prophecy SDK.
 *
 * Keeps the enum → number mapping in one place and exposes readable
 * interfaces for the struct shapes returned by on-chain reads.
 */
import type { Address } from "viem";

/**
 * Market outcome values as recorded by ProphecyCore.
 * Mirrors the uint8 `outcome` field on MarketCore.
 */
export const Outcome = {
    NO: 0,
    YES: 1,
    VOIDED: 2,
} as const;
export type OutcomeValue = (typeof Outcome)[keyof typeof Outcome];

/**
 * Lifecycle status of a market (derived on-chain by ProphecyCore).
 * Matches the MarketStatus enum in IProphecyCore.sol.
 */
export const MarketStatus = {
    PENDING: 0,
    ACTIVE: 1,
    CLOSED: 2,
    RESOLVED: 3,
    VOIDED: 4,
    SETTLED: 5,
} as const;
export type MarketStatusValue = (typeof MarketStatus)[keyof typeof MarketStatus];

/**
 * Resolver type values — must match the registered type on each resolver contract.
 * Hackathon templates use MULTI_OUTCOME (AI-driven resolution via MOM).
 * CREATOR (manual resolution) is documented but dormant on Somnia testnet
 * staging + development as of 2026-04-24.
 */
export const ResolverType = {
    NONE: 0,
    ON_CHAIN: 1,
    AI: 2,
    CREATOR: 3,
    MULTI_OUTCOME: 4,
} as const;
export type ResolverTypeValue = (typeof ResolverType)[keyof typeof ResolverType];

/**
 * Side of a trade. `true` = YES, `false` = NO.
 * Matches the `sideYes` argument used by the ProphecyCore Trade event.
 */
export type TradeSide = "YES" | "NO";

/**
 * Readable form of the ProphecyCore.MarketCore struct.
 * All big numbers are kept as bigint for precision.
 */
export interface Market {
    marketId: bigint;
    name: string;
    creator: Address;
    /** The resolver contract that registered this market — MultiOutcomeAIResolutionMarket on staging. */
    resolver: Address;
    /** address(0) for native-token markets. */
    stakeToken: Address;
    tradingStartTs: bigint;
    tradingEndTs: bigint;
    resolutionStartTs: bigint;
    resolutionEndTs: bigint;
    resolved: boolean;
    outcome: OutcomeValue;
    totalYesShares: bigint;
    totalNoShares: bigint;
    totalShares: bigint;
    participantCount: bigint;
    initialLiquidityBase: bigint;
    /** Per-market LP trading fee in basis points (locked at creation). */
    feeBps: bigint;
}

/**
 * A user's position in a market.
 * `claimed` is true once the user has withdrawn winnings via settlement.
 */
export interface SharePosition {
    yes: bigint;
    no: bigint;
    claimed: boolean;
}

/**
 * Instantaneous CPMM spot prices for a market.
 *
 * For a binary CPMM the YES share price in stake-token units is
 *   yesPrice = noPool / (yesPool + noPool)
 * and symmetrically for NO. Both are returned as 18-decimal bigints
 * (0 → 100 % NO, 1e18 → 100 % YES).
 */
export interface MarketPrice {
    yesPool: bigint;
    noPool: bigint;
    /** 0n — 1e18, YES probability in 1e18 fixed point. */
    yesPrice: bigint;
    /** 0n — 1e18, NO probability in 1e18 fixed point. */
    noPrice: bigint;
}
