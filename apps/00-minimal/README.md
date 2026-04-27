# 00-minimal — Prophecy Hello World

The smallest possible Prophecy integration: create a market, place a YES/NO
bet, resolve it manually, claim winnings.

**Status**: placeholder — to be scaffolded by the Cursor agent. See the
root `AGENTS.md` for instructions.

## Target UX

A single-page Next.js app:

1. "Connect Wallet" button (RainbowKit or wagmi's `useConnect`)
2. "Create Market" form — title, description, resolution deadline, initial liquidity
3. Market card — title, YES/NO prices, pool sizes
4. Buy YES / Buy NO buttons
5. As owner: "Resolve YES" / "Resolve NO" buttons (visible only pre-resolution)
6. Post-resolution: "Claim Winnings" button

No backend, no database, no AI. Pure chain reads/writes.

## Stack target

- Next.js 15 (app router)
- wagmi 2 + viem 2
- RainbowKit (or ConnectKit) for wallet UI
- Tailwind 4 for styling
- `@prophecy-templates/sdk` for contract bindings

## What the agent should produce

See `AGENTS.md` at the repo root — specifically "Step 3: Scaffold
00-minimal".
