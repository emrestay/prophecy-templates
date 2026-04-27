/**
 * Prophecy protocol contract addresses on Somnia testnet.
 *
 * Two environments are tracked:
 *   - "staging"     — the environment hackathon templates target by default
 *   - "development" — alternative environment, may be wiped/upgraded without notice
 *
 * Addresses mirrored from:
 *   prophecy-protocol-contracts/deployments/somnia-testnet/{env}/addresses.json
 *
 * ── HISTORY (read this before changing any address) ──────────────────────
 * 2026-04-26: Re-pointed to **V2 stack**. Initial Faz-2 smoke runs targeted
 *   the V1 contracts (`ProphecyCore=0xADE3…`, `MOM=0x931d…`, etc.) and every
 *   market voided. Cross-checking the live `social-frontend/lib/network-config.ts`
 *   plus the Prophecy public API (`/v0/markets?status=RESOLVED`) showed
 *   29/30 recent markets resolved YES/NO — but every one of them was created
 *   against the V2 contracts. The V1 stack still exists on chain, but its
 *   agent-dispatch path is no longer serviced (likely because the off-chain
 *   runners or Prophecy backend were migrated to V2 only). Lesson: pin to
 *   the same addresses Prophecy Social uses, not to whatever "looks newest"
 *   in `addresses.json`. The V1 entries are kept as a `_deprecated` block
 *   for diagnostics and for reading historical data — do not call them.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { Address } from "viem";

export type ProphecyNetwork = "staging" | "development";

export interface ProphecyAddresses {
  /** ProphecyCoreV2 — central CPMM, market registration, trading. */
  ProphecyCore: Address;
  /** ProphecySettlementV2 — claims and payouts after resolution. */
  ProphecySettlement: Address;
  /** VenueRegistry — same proxy is shared by V1 and V2 stacks. */
  VenueRegistry: Address;
  /** OnChainEventMarketV2 — event/condition store that MOM delegates to. */
  OnChainEventMarket: Address;
  /**
   * MultiOutcomeAIResolutionMarketV2 — canonical resolver. All new markets
   * go through this. AI committee fetches URL sources, posts on-chain.
   */
  MultiOutcomeAIResolutionMarket: Address;
  /** AgentModerationStrategyV2 — pre-market moderation agent. */
  AgentModerationStrategy: Address;
  /** ERC20 stake token used by Prophecy Social on this env (e.g. PST). */
  StakeToken: Address;
  /** ERC-4337 paymaster — kept for reference, templates do not use gasless. */
  VenuePaymaster: Address;
  /**
   * Deprecated V1 contracts. Still deployed but the off-chain agent
   * pipeline does not service them — markets created here will VOID.
   * Listed only for read-only diagnostics on historical data.
   */
  _deprecated: {
    ProphecyCoreV1: Address;
    ProphecySettlementV1: Address;
    OnChainEventMarketV1: Address;
    MultiOutcomeAIResolutionMarketV1: Address;
    /** Single-outcome predecessor of MOM. Never re-enabled. */
    AIResolutionMarket: Address;
    /**
     * Manual-resolution resolver. NOT registered as a resolver in the
     * shared VenueRegistry on either env — `createMarket(...)` reverts.
     * Kept for the day Prophecy might wire it up.
     */
    CreatorResolvedMarket: Address;
    /** ERC20 used by V1 development testing. */
    LOLToken: Address;
  };
}

export const ADDRESSES: Record<ProphecyNetwork, ProphecyAddresses> = {
  staging: {
    // ── V2 stack (canonical, what Prophecy Social uses) ──
    ProphecyCore: "0xf728450d64Cc9771AFC27f8ec1F5cb2E28F8dBC5",
    ProphecySettlement: "0xf7fDBA61564c1A32AC97B42670FDf914560E8b4b",
    OnChainEventMarket: "0xCcBea22CB6941f5c674be8d1700020776446444A",
    MultiOutcomeAIResolutionMarket: "0x6CF43C78b1450407Bf26333fe15e2f7d318d4675",
    AgentModerationStrategy: "0xbC5fa02818E74Fc2394D0Bc517Ba1E4F3C71BaD6",
    // ── shared across V1 + V2 ──
    VenueRegistry: "0x2a48aa2986e4bdaBFae1C7366C72168cF4772F56",
    VenuePaymaster: "0x678D5cBdc74Fe4e587f36E110b2805751B40695F",
    // ── stake token Prophecy Social uses on staging (PST) ──
    StakeToken: "0x8B4d9C48c8dF7b5B19333A5B5EDC02234Fbb455D",
    _deprecated: {
      ProphecyCoreV1: "0xADE3766da0bDc24d7E03cd4A3c3430E92766E157",
      ProphecySettlementV1: "0x2FF1149D4278b64e07132Ac502019E86f9739D90",
      OnChainEventMarketV1: "0xd8d46f16813354BE89464AAea1AA49C855049151",
      MultiOutcomeAIResolutionMarketV1: "0x931dB6CE7afE5a2FAAEA13Ce108ac418F8Eacd9F",
      AIResolutionMarket: "0x738BA2e5618fD0aAa0Edafd783A6E0825989637b",
      CreatorResolvedMarket: "0x7eeEaAFeb5fD7dC885Ead958cd2309C92a1AE01A",
      LOLToken: "0x91a197A72A6AbC83140739b8DDAbE8e7cb9186e1",
    },
  },
  development: {
    // ── V2 stack ──
    ProphecyCore: "0xA05bcA103EF96A47140cb8b68e7b3d158BA868D6",
    ProphecySettlement: "0xc96Cb465511D65A4c4E69D44A4Bc3E8d21B18EEc",
    OnChainEventMarket: "0x19e9F620C53161b27f4C6FB1079430e39e97D46a",
    MultiOutcomeAIResolutionMarket: "0x3168cFA4f8ac9D77e7CF27Bc3fE1EB4B55BE9539",
    AgentModerationStrategy: "0x44Ea0908A6667a2Cc6b881AfCf32695F3B6Df903",
    // ── shared across V1 + V2 ──
    VenueRegistry: "0x23Db80999fA10EbF8BCB3A706324D983f51f1721",
    VenuePaymaster: "0x5B14865D0F45dC777860D1726058Ea7d9e55bD3d",
    // No public stake token pinned for development; reuse the V1 LOLToken
    // until the Prophecy team confirms a V2 dev stake token.
    StakeToken: "0x65E217B4601867118810F8e1373E66A580f2e40E",
    _deprecated: {
      ProphecyCoreV1: "0x632bb2082D341C883b03C0527d1310bCC5eD52A1",
      ProphecySettlementV1: "0xda5DCB0109cA77D1786059ff0ceB9470aA23E8e9",
      OnChainEventMarketV1: "0x513f325a64009cF6fC2b14A7Bcf4fe88a585eE6f",
      MultiOutcomeAIResolutionMarketV1: "0x941B690b6Ef2D07dcD21D08c08Bd4063F3B35335",
      AIResolutionMarket: "0xF3a36C68e655d022F97877eD5e3335D71D5b05a1",
      CreatorResolvedMarket: "0x000898c452870293Db05E973D4637723587BB5D0",
      LOLToken: "0x65E217B4601867118810F8e1373E66A580f2e40E",
    },
  },
};

export function getAddresses(network: ProphecyNetwork = "staging"): ProphecyAddresses {
  return ADDRESSES[network];
}
