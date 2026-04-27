# 00-minimal — Prophecy API reference app

The smallest possible Prophecy integration: connect wallet → create a market → trade YES/NO → claim. Every SDK call you'll ever need is on a single page.

> **Live demo**: <https://prophecy-templates-00-00-minimal.vercel.app>
>
> Connect MetaMask (Somnia testnet), create a market with default 10-min trading + 15-min resolution windows, place a few YES bets, wait for the AI committee to resolve, claim. The whole loop fits in one session.

## When to use this template

Read it like a tutorial. If you're new to Prophecy and want to understand the protocol surface in one screen, this is your reference. **Don't fork it for production** — it's deliberately UI-light and uses sensible defaults instead of letting the user tune everything.

If you already have an app and want to drop a bet widget into it, use [`01-sports`](../01-sports) instead — that one is structured around copy-paste components.

## Stack

- Next.js 15 (app router) + Tailwind 4
- wagmi 2 + viem 2 + RainbowKit
- `@prophecy-templates/sdk` (workspace package)

No backend, no database, no AI services, no off-chain indexer. All state comes from chain reads.

## Run it locally

```bash
# from the repo root
cp apps/00-minimal/.env.example apps/00-minimal/.env.local
npm run dev -w apps/00-minimal
# http://localhost:3000
```

You'll need testnet STT in your wallet. Get some by joining the [Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0).

## Environment variables

All `.env.local` values are optional — defaults work. You only need to set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if you want WalletConnect (most users connect via MetaMask injected and skip this).

```
NEXT_PUBLIC_PROPHECY_NETWORK=staging          # or "development"
NEXT_PUBLIC_PROPHECY_VENUE_ID=54              # signerless hackathon venue
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=         # optional
```

## What the app demonstrates

| File | What you'll learn |
|---|---|
| [`app/page.tsx`](./app/page.tsx) | The full flow — every SDK call lives here |
| [`hooks/useMarket.ts`](./hooks/useMarket.ts) | How to subscribe to a market (5 s polling, cached price for resolved markets) |
| [`lib/wagmi.ts`](./lib/wagmi.ts) | Minimal wagmi + RainbowKit setup against Somnia testnet |
| [`lib/config.ts`](./lib/config.ts) | The single source of truth for `NETWORK` and `VENUE_ID` |
| [`app/providers.tsx`](./app/providers.tsx) | The wrapper that gives the rest of the app access to wagmi |

The whole app is **under 500 lines of business logic**. You can read it end-to-end in 15 minutes.

## SDK calls used

```ts
import {
  createBinaryStringMarket,    // create a YES/NO market with a public URL source
  getCreateMarketCost,         // compute msg.value before sending the create tx
  getMarket,                   // read market state (timestamps, resolved, outcome)
  getPrice,                    // read live YES/NO odds + pool sizes
  getUserPosition,             // read a user's YES/NO share counts
  getMarketStatus,             // derive lifecycle state (PENDING / ACTIVE / ...)
  quoteBuy,                    // simulate "if I buy X STT, how many shares?"
  buyYes, buyNo,               // place a bet
  sellYes, sellNo,             // close part of a position
  claim,                       // collect winnings or refund (handles VOIDED too)
} from "@prophecy-templates/sdk";
```

Each one takes typed `walletClient` / `publicClient` arguments and returns typed data. No hidden globals, no setup ceremony.

## Customizing

Look for `// CUSTOMIZE: ...` comments in the source. The main knobs:

```ts
// lib/config.ts
export const NETWORK = "staging";              // staging or development
export const VENUE_ID = 54n;                   // your venue id
export const TRADING_DURATION_SEC = 60 * 10;   // 10 minutes
export const RESOLUTION_DURATION_SEC = 60 * 15;// 15 minutes
```

For longer windows (real product use, not demo), bump `TRADING_DURATION_SEC` to whatever your real event is — a sports match might want hours, a quarterly earnings call days.

## Deploy to Vercel

This template is already set up for Vercel monorepo deploys:

```bash
# from the repo root
vercel --cwd apps/00-minimal
```

The included `vercel.json` handles the workspace install + scoped build for you. Set the same env vars in the Vercel dashboard as your local `.env.local`.

## Common questions

**Why does my market always resolve VOIDED?**
You're probably on the deprecated V1 stack. Confirm `NETWORK=staging` and that you're on Somnia testnet (chain id 50312). The SDK pins V2 addresses by default — V1 contracts are still on chain but their off-chain runner pipeline doesn't service requests anymore.

**Why is the resolution window so long?**
The AI agent committee has up to 5 minutes to respond, and Somnia Reactivity adds a small batching delay. 15 minutes is a safe default. If agents respond faster, the market resolves early — the window is a max, not a min.

**Where do I get test STT?**
[Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0). DevRel sends faucet drops directly.

**Can I use a real ERC-20 as the stake token instead of native STT?**
Yes — pass an ERC-20 address as `stakeToken` instead of `zeroAddress`. You'll need to approve the token to ProphecyCore first. The signerless hackathon venue (`54`) accepts both.
