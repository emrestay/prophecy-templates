# Prophecy Templates

Integration templates for the [Prophecy](https://prophecy.somnia.network) prediction market protocol on Somnia testnet. Built for hackathon participants who want to add on-chain prediction markets to their app in under an hour.

## What's here

| Template | Description | Live demo |
|----------|-------------|-----------|
| [`00-minimal`](apps/00-minimal) | API reference — raw create → trade → resolve → claim loop. Every SDK call visible in one file. **Start here.** | [demo →](https://prophecy-00-minimal.vercel.app) |
| [`01-sports`](apps/01-sports) | Sports scoreboard with embedded bet widgets. Shows how to add match-outcome markets to an existing sports UI. | [demo →](https://prophecy-01-sports.vercel.app) |

> `02-crypto-price` and `03-custom-event` are coming soon.

## How it works

Prophecy markets are created on **Somnia testnet**. An AI agent committee automatically resolves each market by reading a public URL you specify — no manual resolution needed.

```
You create a market  →  users trade YES/NO shares
→  AI agents read your source URL  →  market resolves automatically
→  winners claim their STT
```

## Quickstart

```bash
git clone https://github.com/somnia-network/prophecy-templates
cd prophecy-templates
npm install
```

### Run the API reference (00-minimal)

```bash
cp apps/00-minimal/.env.example apps/00-minimal/.env.local
npm run dev -w apps/00-minimal
# open http://localhost:3000
```

### Run the sports example (01-sports)

```bash
cp apps/01-sports/.env.example apps/01-sports/.env.local
npm run dev -w apps/01-sports
# open http://localhost:3001
```

You need some testnet STT to create markets and place bets. DM the Somnia DevRel team on Discord to get some.

## Integrating into your own app

The `components/prophecy/` folder inside each context template is the copy-paste library:

```
your-app/
└── components/
    └── prophecy/          ← copy this entire folder
        ├── useProphecyMarket.ts   hook — live market state, 5s polling
        ├── PredictionWidget.tsx   all-in-one odds + buy + claim widget
        ├── MarketCard.tsx         display-only odds card
        └── BetPanel.tsx           buy YES/NO panel
```

Then wire it up:

```tsx
import { PredictionWidget } from "@/components/prophecy/PredictionWidget";

// In your match card, event card, token row, etc:
<PredictionWidget marketId={yourMarketId} />
```

See each template's `INTEGRATION.md` for a step-by-step guide.

## Creating a market from your backend / script

```ts
import { createBinaryStringMarket } from "@prophecy-templates/sdk";

const result = await createBinaryStringMarket({
  walletClient,
  publicClient,
  question: "Will Arsenal beat Man City?",
  prompt: "Did Arsenal beat Man City in the Premier League on May 10 2026? Answer yes or no.",
  urls: ["bbc.com/sport/football"],   // public URL the AI agent will search
  winner: "yes",
  allowedResults: ["yes", "no"],
  resolveUrl: true,
  minAgreement: 1n,
  venueId: 54n,                       // Somnia hackathon venue
  stakeToken: zeroAddress,            // native STT
  initialLiquidityBase: 10n ** 17n,   // 0.1 STT initial liquidity
  tradingStartTs,
  tradingEndTs,
  resolutionStartTs,
  resolutionEndTs,
  callOptions: { network: "staging" },
});

console.log("marketId:", result.marketId);
```

## Repo structure

```
prophecy-templates/
├── packages/sdk/          shared viem wrapper around Prophecy contracts
├── apps/
│   ├── 00-minimal/        API reference (single-page Next.js app)
│   └── 01-sports/         sports context app
└── scripts/               venue deploy + market creation CLI helpers
```

## Contract addresses (Somnia testnet staging)

| Contract | Address |
|----------|---------|
| ProphecyCore | `0xf728B5B4DE53dc2F82cB3f37C5e007A1C43cA6f` |
| MultiOutcomeAIResolutionMarket | `0x6CF43Ca60D469a65fcBa6c56e8b0F11EBe55Cb5` |
| ProphecySettlement | `0xf7fDBAFab9f4D820985C523B7c7C29cC2d6E7079` |
| VenueRegistry | `0x2a48aa08208Ef17E33A20C1d3B0C56A53C7b39b7` |
| Hackathon Venue ID | `54` (signerless, no allowlist) |

## Resources

- [Somnia testnet explorer](https://shannon-explorer.somnia.network/)
- [Somnia Discord](https://discord.gg/somnia) — ask for testnet STT in #faucet
