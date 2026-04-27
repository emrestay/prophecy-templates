# Integrating Prophecy into Your Sports App

This guide walks you through grafting Prophecy prediction markets onto an existing sports (or any event-based) app. The `components/prophecy/` folder in this template is the copy-paste library — everything else is context to show how it fits together.

> **Live demo**: <https://prophecy-templates-00-01-sports.vercel.app> — connect a wallet, create a market against a real match, place a bet.

## What this template shows

A football scoreboard with a Prophecy prediction market embedded in every match card. Users can:
- Create a YES/NO market for any upcoming or live match with one click
- See live odds update every 5 seconds
- Buy YES or NO shares with STT
- Claim winnings (or a refund if the market voids) after the match

The scoreboard data is hardcoded. The prediction market data is live on Somnia testnet.

## What to copy into your own app

### 1. The `components/prophecy/` folder

```
components/prophecy/
├── useProphecyMarket.ts   hook — live market state, 5s polling
├── PredictionWidget.tsx   all-in-one odds + buy + claim widget
├── MarketCard.tsx         display-only odds card (no wallet needed)
└── BetPanel.tsx           standalone buy YES/NO panel
```

Copy the entire folder into your project. Every file has a `📋 COPY THIS FILE` header at the top with its target path and dependency list — read those before you start.

> **Required sibling file**: `lib/config.ts` exporting `NETWORK` and `VENUE_ID`. The widgets import from `@/lib/config` to keep environment switches (staging↔mainnet) in one place. Copy [`apps/01-sports/lib/config.ts`](./lib/config.ts) alongside the components — it's six lines.

### 2. The SDK

The `components/prophecy/` files import from `@prophecy-templates/sdk`. Copy the SDK alongside them:

```
packages/sdk/          ← copy the whole folder
```

Then add it as a local dependency in your `package.json`:

```json
"dependencies": {
  "@prophecy-templates/sdk": "file:../../packages/sdk"
}
```

Or if you're using npm workspaces (like this repo), use `"*"` and let the workspace resolver handle it.

### 3. npm packages

Your `package.json` needs these:

```json
"dependencies": {
  "viem": "^2.21.0",
  "wagmi": "^2.14.11",
  "@rainbow-me/rainbowkit": "^2.2.4",
  "@tanstack/react-query": "^5.67.3"
}
```

### 4. Wagmi + RainbowKit provider setup

Wrap your app in the wallet providers. See `apps/01-sports/app/providers.tsx` for the exact setup — it's the standard RainbowKit boilerplate targeting Somnia testnet.

### 5. Tailwind v4

This template uses Tailwind 4. Your `postcss.config.mjs` must use `@tailwindcss/postcss`:

```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

And your `globals.css` must start with:

```css
@import "tailwindcss";
```

## What to adapt

### Network and venue ID

These live in `lib/config.ts` — one place, every widget reads from it:

```ts
// lib/config.ts
import type { ProphecyNetwork } from "@prophecy-templates/sdk";

// CUSTOMIZE: switch to "development" for the dev environment
export const NETWORK: ProphecyNetwork =
  (process.env.NEXT_PUBLIC_PROPHECY_NETWORK as ProphecyNetwork) ?? "staging";

// CUSTOMIZE: venue ID — 54 is the signerless hackathon venue on staging
export const VENUE_ID = BigInt(process.env.NEXT_PUBLIC_PROPHECY_VENUE_ID ?? "54");
```

`venueId = 54` is the pre-deployed signerless hackathon venue. Use it directly — no on-chain setup required, no operator key, no EIP-712 signing.

### The prediction question

In `MatchCard.tsx`, the question and resolution prompt are generated from your match data:

```ts
// CUSTOMIZE: adjust the question/prompt template for your sport
function matchQuestion() {
  return `Will ${match.home.name} beat ${match.away.name}?`;
}
function matchPrompt() {
  // This is what AI agents use to find the result
  return `Did ${match.home.name} beat ${match.away.name} in the ${match.league} match on ${date}? Answer yes or no.`;
}
```

The `prompt` field is what the Somnia AI agent committee reads to resolve the market. Make it unambiguous: a clear yes/no question with enough context to identify the specific event.

### The source URL

The `sourceUrl` field in your match data is where agents look for the result:

```ts
// lib/matches.ts
{ sourceUrl: "bbc.com/sport/football" }
```

This must be a **public internet domain** (not localhost, not a private URL). Agents independently fetch this URL to find the outcome. Use a sports news site, a results API, or any public page that will contain the result after the match ends.

### Market timing

Trading windows are calculated from kickoff time in `MatchCard.tsx`:

```ts
// CUSTOMIZE: adjust match duration and buffer for your sport
const MATCH_DURATION_SEC = 90n * 60n;   // 90 minutes (football)
const RESULT_BUFFER_SEC  = 30n * 60n;   // 30 min buffer after full time
const RESOLUTION_WINDOW_SEC = 60n * 60n; // 1 hour for agents to respond
```

For a basketball game, you might use `48n * 60n` for `MATCH_DURATION_SEC`. For a 5-day cricket match, adjust accordingly.

### Initial liquidity

```ts
// CUSTOMIZE: initial liquidity per market (0.1 STT)
const INITIAL_LIQUIDITY = 10n ** 17n;
```

This is the STT you put in as seed liquidity when creating the market. Higher liquidity means tighter initial odds but costs more to create.

## Where to hook in your real data

The match data lives in `lib/matches.ts` as a hardcoded array. Replace it with your real data source:

```ts
// Replace this:
export const matches: Match[] = [ /* hardcoded */ ];

// With something like:
export async function getMatches(): Promise<Match[]> {
  const res = await fetch("https://your-sports-api.com/matches");
  return res.json();
}
```

Each match needs these fields for the integration to work:

```ts
type Match = {
  id: string;
  status: "upcoming" | "live" | "finished";
  kickoff: string;          // ISO date string
  home: { name: string; emoji: string };
  away: { name: string; emoji: string };
  league: string;
  sourceUrl: string;        // public URL agents will fetch for results
  marketId?: bigint | null; // link to existing market, if any
  // ...optional score fields
};
```

## Using PredictionWidget directly

The simplest integration: if you already have a `marketId` from a market you created elsewhere, drop the widget into any component:

```tsx
import { PredictionWidget } from "@/components/prophecy/PredictionWidget";

// Inside your match card, event card, token row, etc.:
<PredictionWidget marketId={8028n} />
```

That's it. The widget handles live polling, wallet detection, buy/sell, and claiming.

## Creating markets from your code

To create a market programmatically (outside of the UI button):

```ts
import { createBinaryStringMarket, getCreateMarketCost } from "@prophecy-templates/sdk";
import { prophecyClient } from "@/components/prophecy/useProphecyMarket";
import { zeroAddress } from "viem";

const cost = await getCreateMarketCost({
  publicClient: prophecyClient,
  liquidityBases: [10n ** 17n],
  stakeToken: zeroAddress,
  urlCount: 1n,
  network: "staging",
});

const result = await createBinaryStringMarket({
  walletClient,          // from useWalletClient()
  publicClient: prophecyClient,
  question: "Will Arsenal beat Man City?",
  prompt: "Did Arsenal beat Man City in the Premier League on May 10 2026? Answer yes or no.",
  urls: ["bbc.com/sport/football"],
  winner: "yes",
  allowedResults: ["yes", "no"],
  resolveUrl: true,
  minAgreement: 1n,
  venueId: 54n,
  stakeToken: zeroAddress,
  initialLiquidityBase: 10n ** 17n,
  tradingStartTs,
  tradingEndTs,
  resolutionStartTs,
  resolutionEndTs,
  callOptions: { network: "staging" },
});

console.log("marketId:", result.marketId);
```

## Market lifecycle

Once created, markets go through these states:

| State | What it means |
|-------|---------------|
| Pending | Market registered, moderation in progress |
| Active | Trading window open — users can buy/sell |
| Closed | Trading closed, waiting for AI agents |
| Resolved | Agents agreed on YES or NO |
| Voided | Agents couldn't reach consensus — all stakes refundable |
| Settled | Claims have been processed |

**Always handle Voided** — it's a legitimate outcome on staging (~1 in 30 markets). `PredictionWidget` already shows a "Claim Refund" button for voided markets.

## Don't do this

| ❌ Don't | Why |
|---|---|
| Call `CreatorResolvedMarket` directly | Not registered as a resolver on Somnia — your tx will revert |
| Edit hardcoded values inside `components/prophecy/` files | All env-dependent values come from `lib/config.ts`. Edit one place |
| Skip the VOIDED branch in your UI | ~3% of markets void when AI agents disagree. `PredictionWidget` already handles it; don't strip the logic out |
| Pass an internal/auth-walled URL as your `prompt` source | Agents need to fetch it from the public internet. Use a sports news site, results API, or any open page |
| Resolve trading windows tighter than 5 minutes | The AI committee timeout alone is 5 min — leave at least 15 minutes between `tradingEndTs` and `resolutionEndTs` |
| Build a backend to track market state | Somnia's 200 ms blocks make chain-only polling fast enough. Add an indexer only if you need cross-market views per user |

## Getting testnet STT

You need STT to create markets and place bets. Join the **[Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0)** and ask — the DevRel team sends faucet drops directly.

- [Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0) — testnet STT, hackathon support
- [Somnia testnet explorer](https://shannon-explorer.somnia.network)
- [Prophecy docs](https://prophecy.somnia.network) — protocol concepts and lifecycle
