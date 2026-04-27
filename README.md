# Prophecy Templates

Integration templates for the [Prophecy](https://prophecy.somnia.network) prediction market protocol on Somnia. Add on-chain YES/NO markets to your app in under an hour — no backend, no auth system, no manual resolution.

> **Live demos** (Somnia testnet — connect a wallet, try them):
>
> | Template | Demo |
> |---|---|
> | `00-minimal` — single-page API reference | <https://prophecy-templates-00-00-minimal.vercel.app> |
> | `01-sports` — embedded bet widgets in a fake scoreboard | <https://prophecy-templates-00-01-sports.vercel.app> |

---

## What you get

| Template | When to use it | What you copy |
|---|---|---|
| **[`00-minimal`](apps/00-minimal)** | "I want a working create → trade → claim loop in one screen so I can read every SDK call." | The whole app — read it like a tutorial. |
| **[`01-sports`](apps/01-sports)** | "I already have an app and want to drop in `<PredictionWidget marketId={...} />` per item." | The `components/prophecy/` folder + `lib/config.ts`. |

> `02-crypto-price` and `03-custom-event` are on the roadmap.

## How Prophecy resolves a market (no manual resolve needed)

```
1. you create a market with a public URL (e.g. bbc.com/sport/football)
2. users trade YES/NO shares during the trading window
3. trading window closes → AI agent committee on Somnia reads the URL
4. agents reach consensus → market resolves YES, NO, or VOIDED
5. winners (or all participants if VOIDED) call claim() to collect
```

No oracles to wire up, no manual button to press. The "AI agents fetch this URL" step is what makes Prophecy different from every other prediction market protocol.

---

## Get started in 5 minutes

### 1. Install MetaMask + add Somnia testnet

```
Network name:  Somnia Testnet
RPC URL:       https://dream-rpc.somnia.network
Chain ID:      50312
Currency:      STT
Explorer:      https://shannon-explorer.somnia.network
```

### 2. Get testnet STT

Join the **[Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0)** and ask for testnet STT in the chat. The DevRel team sends some directly. ~1 STT is enough to create a market and place a few bets.

### 3. Try a demo first (no clone needed)

Open one of the live demos above, connect MetaMask, and run through the flow. This is the fastest way to understand the lifecycle before reading code.

### 4. Clone and run locally

```bash
git clone https://github.com/somnia-network/prophecy-templates
cd prophecy-templates
npm install

# pick an app and run it
cp apps/00-minimal/.env.example apps/00-minimal/.env.local
npm run dev -w apps/00-minimal     # http://localhost:3000

# or
cp apps/01-sports/.env.example apps/01-sports/.env.local
npm run dev -w apps/01-sports      # http://localhost:3001
```

Both apps work out of the box — the defaults point at the staging Prophecy stack on Somnia testnet.

---

## Integration paths — pick the one that matches your app

### Path A — "I'm starting from scratch"

Take `apps/00-minimal/app/page.tsx` as your reference and adapt it. Every Prophecy SDK call you'll ever need is on a single screen there. Copy patterns, not files.

### Path B — "I have an existing UI, I just want a bet widget"

Drop the four files from `apps/01-sports/components/prophecy/` into your app:

```
components/prophecy/
├── useProphecyMarket.ts    hook — live market state, 5s polling
├── PredictionWidget.tsx    all-in-one (odds + buy + claim)
├── BetPanel.tsx            standalone buy/claim panel
└── MarketCard.tsx          read-only odds card
```

Then render anywhere:

```tsx
import { PredictionWidget } from "@/components/prophecy/PredictionWidget";

<PredictionWidget marketId={7090n} />
```

The widget handles wallet detection, polling, optimistic UI, and the VOIDED-refund branch automatically. See [`apps/01-sports/INTEGRATION.md`](apps/01-sports/INTEGRATION.md) for the full step-by-step.

### Path C — "I'll write my own UI, I just want the SDK"

Use `packages/sdk` directly. The viem-level surface is small:

```ts
import {
  createBinaryStringMarket,
  buyYes, buyNo, sellYes, sellNo,
  claim,
  getMarket, getPrice, getUserPosition,
  quoteBuy, quoteSell,
} from "@prophecy-templates/sdk";
```

Each one takes a `walletClient` (or `publicClient` for reads) and returns typed data. No hidden state, no singletons.

---

## Creating a market from code

```ts
import { createBinaryStringMarket } from "@prophecy-templates/sdk";
import { zeroAddress } from "viem";

const result = await createBinaryStringMarket({
  walletClient,
  publicClient,
  question: "Will Arsenal beat Man City?",
  prompt:   "Did Arsenal beat Man City in the Premier League on May 10 2026? Answer yes or no.",
  urls:     ["bbc.com/sport/football"],   // public URL agents will read
  winner: "yes",
  allowedResults: ["yes", "no"],
  resolveUrl: true,
  minAgreement: 1n,
  venueId: 54n,                // Somnia hackathon venue (signerless)
  stakeToken: zeroAddress,     // native STT
  initialLiquidityBase: 10n ** 17n,   // 0.1 STT seed
  tradingStartTs,
  tradingEndTs,
  resolutionStartTs,
  resolutionEndTs,
  callOptions: { network: "staging" },
});

console.log("market id:", result.marketId);
```

The `prompt` is what the AI agent committee actually reads — make it unambiguous. The `urls` array is where they go to find the answer.

---

## Don't do this

| ❌ Don't | ✅ Do |
|---|---|
| Call `CreatorResolvedMarket` directly | Use `MultiOutcomeAIResolutionMarket` (manual resolve isn't registered as a resolver on Somnia) |
| Hardcode contract addresses in your app | Import from `@prophecy-templates/sdk` — addresses live in one place |
| Hide the VOIDED state in the UI | Show a "Claim refund" button — ~3% of markets void when agents disagree |
| Build a backend to track market state | Read directly from chain — Somnia is fast enough (200 ms blocks) |
| Use a localhost or private URL as a `prompt` source | Use a public domain — agents need to be able to fetch it |
| Pass a private key into a frontend | Use wagmi + a wallet connector. Operator keys belong in scripts only |

---

## Repo structure

```
prophecy-templates/
├── packages/sdk/             viem wrapper around the Prophecy contracts
├── apps/
│   ├── 00-minimal/           single-page API reference
│   └── 01-sports/            context app + components/prophecy/ library
└── scripts/                  CLI helpers (deploy a venue, create a market, smoke tests)
```

## Contract addresses (Somnia testnet — staging)

These are the addresses the SDK pins to. You normally won't need them directly.

| Contract | Address |
|---|---|
| ProphecyCore (V2) | `0xf728450d64Cc9771AFC27f8ec1F5cb2E28F8dBC5` |
| ProphecySettlement (V2) | `0xf7fDBA61564c1A32AC97B42670FDf914560E8b4b` |
| MultiOutcomeAIResolutionMarket (V2) | `0x6CF43C78b1450407Bf26333fe15e2f7d318d4675` |
| OnChainEventMarket (V2) | `0xCcBea22CB6941f5c674be8d1700020776446444A` |
| VenueRegistry | `0x2a48aa2986e4bdaBFae1C7366C72168cF4772F56` |
| Hackathon Venue ID | `54` (signerless, no allowlist) |

---

## Resources

- **[Prophecy docs](https://prophecy.somnia.network)** — protocol concepts, market lifecycle, fees
- **[Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0)** — testnet STT, support, hackathon updates
- **[Somnia testnet explorer](https://shannon-explorer.somnia.network)** — track your transactions
- **[Somnia main docs](https://docs.somnia.network)** — chain-level documentation

Found a bug or have a feature request? Open an issue, or ping us in the Telegram.
