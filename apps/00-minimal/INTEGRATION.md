# Integrating Prophecy from Scratch

This guide is for developers building a **new app from zero** with Prophecy as the prediction market layer. If you already have a UI and just want to drop in a bet widget, see [`01-sports/INTEGRATION.md`](../01-sports/INTEGRATION.md) instead — that one is structured around copy-paste components.

## What you're building

A Next.js + wagmi + viem app where users:

1. Connect a wallet (RainbowKit handles MetaMask, WalletConnect, etc.)
2. Create a Prophecy market by filling a form (question + URL + windows)
3. Trade YES/NO shares while trading is open
4. See AI-driven resolution (or VOIDED if agents disagree)
5. Claim winnings or a refund

This template's [`app/page.tsx`](./app/page.tsx) is the full reference. Read through it once before continuing — it's intentionally short.

## The 4-step adapt-to-your-app recipe

### 1. Install dependencies

```bash
npm install \
  next@^15.3.1 react@^19.0.0 \
  wagmi@^2.14.11 viem@^2.21.0 \
  @rainbow-me/rainbowkit@^2.2.4 \
  @tanstack/react-query@^5.67.3
```

Then add the SDK. If you're forking this monorepo, it's already a workspace:

```json
"dependencies": {
  "@prophecy-templates/sdk": "*"
}
```

If you're starting standalone, copy the `packages/sdk` folder into your project and reference it locally:

```json
"dependencies": {
  "@prophecy-templates/sdk": "file:./packages/sdk"
}
```

### 2. Wrap your app in providers

Copy [`app/providers.tsx`](./app/providers.tsx) and [`lib/wagmi.ts`](./lib/wagmi.ts) verbatim. Then in your root layout:

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

The provider wires up wagmi + RainbowKit + react-query for the entire tree.

### 3. Read market state with the hook

[`hooks/useMarket.ts`](./hooks/useMarket.ts) is a 100-line drop-in for "subscribe to a Prophecy market". Use it anywhere you want live odds:

```tsx
import { useAccount } from "wagmi";
import { useMarket } from "@/hooks/useMarket";

function MyMarketCard({ marketId }: { marketId: bigint }) {
  const { address } = useAccount();
  const { market, price, status, position, error } = useMarket(marketId, address);

  if (error) return <p>Error: {error}</p>;
  if (!market || !price) return <p>Loading…</p>;

  return (
    <div>
      <p>{market.name}</p>
      <p>YES: {((Number(price.yesPrice) / 1e18) * 100).toFixed(1)}%</p>
      <p>NO:  {((Number(price.noPrice)  / 1e18) * 100).toFixed(1)}%</p>
    </div>
  );
}
```

Polling cadence is 5 seconds. Adjust at the top of `useMarket.ts` if you need tighter — Somnia produces 200 ms blocks but your RPC will rate-limit if you're aggressive.

### 4. Wire up the actions

Place a bet:

```ts
import { buyYes } from "@prophecy-templates/sdk";
import { parseEther, zeroAddress } from "viem";
import { useWalletClient } from "wagmi";

const { data: walletClient } = useWalletClient();

await buyYes({
  walletClient,
  publicClient,
  params: {
    marketId,
    amountIn: parseEther("0.01"),  // 0.01 STT
    minSharesOut: 0n,              // accept any slippage in demo
    stakeToken: zeroAddress,       // native STT
  },
  options: { network: "staging", venueId: 54n },
});
```

`buyNo`, `sellYes`, `sellNo`, and `claim` follow the same pattern. Every async SDK call returns a typed `{ txHash, ... }` object — no string-typing, no manual decoding.

Create a market:

```ts
import { createBinaryStringMarket } from "@prophecy-templates/sdk";

const { marketId } = await createBinaryStringMarket({
  walletClient,
  publicClient,
  question: "Will it snow in NYC on Dec 25?",
  prompt:   "Did snow accumulate measurably in New York City on December 25 2026? Answer yes or no.",
  urls:     ["weather.com/weather/today/l/NYC"],
  winner: "yes",
  allowedResults: ["yes", "no"],
  resolveUrl: true,
  minAgreement: 1n,
  venueId: 54n,
  stakeToken: zeroAddress,
  initialLiquidityBase: 10n ** 17n,   // 0.1 STT seed
  tradingStartTs,
  tradingEndTs,
  resolutionStartTs,
  resolutionEndTs,
  callOptions: { network: "staging" },
});
```

The contract-level cost (initial liquidity + AI committee deposit + subscription top-up) is computed by `getCreateMarketCost` — call that first if you want to display the cost to the user before they sign.

## What to design around

### Resolution can be VOIDED — handle it

Roughly 1 in 30 markets on staging void because the AI committee can't agree on the URL's content. Your UI must surface this:

```tsx
import { Outcome } from "@prophecy-templates/sdk";

if (market.resolved) {
  if (market.outcome === Outcome.VOIDED) {
    return <button onClick={handleClaim}>Claim refund</button>;
  }
  return <button onClick={handleClaim}>Claim winnings</button>;
}
```

The same `claim()` SDK call handles both — your UI just changes the label.

### Resolution windows are real time

Unlike Polymarket-style manual resolvers, Prophecy's AI committee fires automatically at `resolutionStartTs`. Set your windows generously: at least 15 minutes after `tradingEndTs` to give the committee its 5-minute timeout plus retry headroom.

For demos, use 10 + 15 minutes. For real events (sports match, earnings call), set `tradingEndTs` to the start of the event and `resolutionStartTs` to whenever the result is reliably published.

### Pick a public URL the agent can actually fetch

The `urls` array is what the AI committee reads to determine the outcome. Constraints:

- Must be a public domain. No `localhost`, no Cloudflare-protected pages, no APIs requiring auth.
- The page must contain the answer in plain text by `resolutionStartTs`. If you're betting on a sports match, point at a results page that updates after the final whistle, not a live ticker.
- Use a few URLs (2-3) for redundancy. The `minAgreement` parameter tells the contract how many sources need to agree.

Bad URL examples:
- `localhost:3000/api/result` — not reachable from the agent network
- `your-internal-tool.notion.site/xxx` — auth-walled
- `bbc.com/news/live/...` — content shifts during the match, agent might read different things

Good URL examples:
- `bbc.com/sport/football/match/...` — final score posted after FT
- `coingecko.com/en/coins/bitcoin` — current price always there
- `weather.gov/...` — official daily forecast / record

## Don't do this

| ❌ Don't | Why |
|---|---|
| Call `CreatorResolvedMarket` directly | Not registered as a resolver on Somnia — your tx will revert |
| Hardcode addresses inline in components | Use `getAddresses(network)` from the SDK so a redeploy doesn't break you silently |
| Skip the `// CUSTOMIZE:` comments when copying | They mark every value the integrator needs to think about |
| Build a backend to track market state | Somnia is fast (200 ms blocks) — chain reads are fine for the templates' polling rate |
| Put an operator private key in the frontend | Wallet connectors handle user signing. Operator keys belong in scripts only |

## Going to production

This template is deliberately minimal. Before shipping a real product:

- Add a real notification system for "your market resolved" / "your bet won"
- Cache market reads (react-query / swr) instead of re-fetching every 5s globally
- Add an indexer if you want to display "all markets I've ever participated in" — chain-only reads scale poorly past a few markets per user
- Audit your trade UX for slippage protection (we set `minSharesOut: 0n` for simplicity — that's not safe for production)
- Decide on a stake token strategy (native STT for testnet/demos, an ERC-20 for production)

## See also

- [`apps/00-minimal/app/page.tsx`](./app/page.tsx) — the canonical reference, single file
- [`apps/01-sports/INTEGRATION.md`](../01-sports/INTEGRATION.md) — drop-in components for an existing UI
- [`packages/sdk/src/actions/`](../../packages/sdk/src/actions/) — every SDK action's source, fully typed and commented
- [Prophecy docs](https://prophecy.somnia.network) — protocol concepts, fees, market lifecycle
- [Somnia Hacks Telegram](https://t.me/+s_oRMnGpOyQ3ODQ0) — testnet STT and integrator support
