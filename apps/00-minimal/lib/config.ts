import type { ProphecyNetwork } from "@prophecy-templates/sdk";

// CUSTOMIZE: switch to "development" if you want the dev environment
export const NETWORK: ProphecyNetwork =
  (process.env.NEXT_PUBLIC_PROPHECY_NETWORK as ProphecyNetwork) ?? "staging";

// CUSTOMIZE: venue ID — 54 is the signerless hackathon venue on staging
export const VENUE_ID = BigInt(process.env.NEXT_PUBLIC_PROPHECY_VENUE_ID ?? "54");

// Trading window: 5 minutes after creation, open for 10 minutes
// CUSTOMIZE: adjust for your use case
export const TRADING_START_DELAY_SEC = 30; // seconds after now
export const TRADING_DURATION_SEC = 60 * 10; // 10 minutes
export const RESOLUTION_DURATION_SEC = 60 * 15; // 15 minutes (AI agent timeout is 5 min)
