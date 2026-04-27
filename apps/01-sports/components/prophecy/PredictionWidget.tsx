// 📋 COPY THIS FILE into your app at components/prophecy/PredictionWidget.tsx
//
// REQUIRES:
//   1. components/prophecy/useProphecyMarket.ts (the hook)
//   2. lib/config.ts exporting `NETWORK` and `VENUE_ID` (see template repo)
//   3. wagmi providers wrapped around your app (see app/providers.tsx)
//
// Usage:
//   import { PredictionWidget } from "@/components/prophecy/PredictionWidget";
//   <PredictionWidget marketId={7090n} />
//
// What it does: all-in-one prediction market widget — live odds, YES/NO
// buy buttons, and a Claim button after resolution. Handles the VOIDED
// branch (~3% of markets on staging) — same Claim button refunds users
// when AI agents can't reach consensus.
"use client";

import { buyNo, buyYes, claim, MarketStatus, Outcome } from "@prophecy-templates/sdk";
import { useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { prophecyClient, useProphecyMarket } from "./useProphecyMarket";
// CUSTOMIZE: import NETWORK and VENUE_ID from your own config.
// Keeps environment switches (staging↔mainnet) in one place.
import { NETWORK, VENUE_ID } from "@/lib/config";

type WC = Parameters<typeof buyYes>[0]["walletClient"];

function pct(price: bigint) {
  return ((Number(price) / 1e18) * 100).toFixed(1) + "%";
}

const STATUS_LABEL: Record<number, string> = {
  0: "Pending", 1: "Active", 2: "Closed", 3: "Resolved", 4: "Voided", 5: "Settled",
};
const STATUS_COLOR: Record<number, string> = {
  0: "text-gray-400 bg-gray-800", 1: "text-green-300 bg-green-900/60",
  2: "text-yellow-300 bg-yellow-900/60", 3: "text-blue-300 bg-blue-900/60",
  4: "text-red-300 bg-red-900/60", 5: "text-blue-300 bg-blue-900/60",
};

/**
 * All-in-one Prophecy prediction market widget.
 * Shows live odds, buy buttons, and claim after resolution.
 *
 * @example
 * <PredictionWidget marketId={7090n} />
 */
export function PredictionWidget({ marketId }: { marketId: bigint }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { market, price, status, position, loading, error } = useProphecyMarket(marketId, address);
  const [amount, setAmount] = useState("0.01");
  const [txStatus, setTxStatus] = useState<string | null>(null);

  if (loading && !market) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
        <span className="text-xs text-gray-500">Loading market…</span>
      </div>
    );
  }
  if (error) {
    return <p className="text-xs text-red-400">Error: {error.slice(0, 80)}</p>;
  }
  if (!market || !price || status === null) return null;

  const canTrade = status === MarketStatus.ACTIVE;
  const canClaim =
    (status === MarketStatus.RESOLVED ||
      status === MarketStatus.SETTLED ||
      status === MarketStatus.VOIDED) &&
    position && !position.claimed &&
    (position.yes > 0n || position.no > 0n);

  async function handleBuy(side: "YES" | "NO") {
    if (!walletClient) return;
    setTxStatus("Sending…");
    try {
      const params = { marketId, amountIn: parseEther(amount), minSharesOut: 0n, stakeToken: zeroAddress };
      const opts = { network: NETWORK, venueId: VENUE_ID };
      const wc = walletClient as WC;
      const result = side === "YES"
        ? await buyYes({ walletClient: wc, publicClient: prophecyClient, params, options: opts })
        : await buyNo({ walletClient: wc, publicClient: prophecyClient, params, options: opts });
      setTxStatus(`Done · tx ${result.txHash.slice(0, 10)}…`);
    } catch (e) {
      setTxStatus("Error: " + (e instanceof Error ? e.message.slice(0, 80) : String(e)));
    }
  }

  async function handleClaim() {
    if (!walletClient) return;
    setTxStatus("Claiming…");
    try {
      const result = await claim({
        walletClient: walletClient as WC,
        publicClient: prophecyClient,
        params: { marketId },
        options: { network: NETWORK },
      });
      setTxStatus(`Claimed · tx ${result.txHash.slice(0, 10)}…`);
    } catch (e) {
      setTxStatus("Error: " + (e instanceof Error ? e.message.slice(0, 80) : String(e)));
    }
  }

  return (
    <div className="space-y-3">
      {/* Header: market name + status */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-200 leading-snug">{market.name}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[status] ?? "text-gray-400 bg-gray-800"}`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {/* Odds */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-lg p-3 text-center border ${
          market.resolved && market.outcome === Outcome.YES
            ? "bg-green-700/50 border-green-500"
            : "bg-green-950/40 border-green-800/40"
        }`}>
          <p className="text-xs text-green-400 mb-0.5">YES</p>
          <p className="text-xl font-bold text-green-300">{pct(price.yesPrice)}</p>
        </div>
        <div className={`rounded-lg p-3 text-center border ${
          market.resolved && market.outcome === Outcome.NO
            ? "bg-red-700/50 border-red-500"
            : "bg-red-950/40 border-red-800/40"
        }`}>
          <p className="text-xs text-red-400 mb-0.5">NO</p>
          <p className="text-xl font-bold text-red-300">{pct(price.noPrice)}</p>
        </div>
      </div>

      {/* Outcome banner */}
      {market.resolved && (
        <div className="rounded-lg bg-blue-950/50 border border-blue-700/40 py-2 text-center">
          <p className="text-sm text-blue-300">
            Resolved:{" "}
            <strong>
              {market.outcome === Outcome.YES ? "YES ✅" : market.outcome === Outcome.NO ? "NO ❌" : "VOIDED 🔁"}
            </strong>
          </p>
        </div>
      )}
      {status === MarketStatus.VOIDED && !market.resolved && (
        <p className="text-xs text-red-400 text-center">Voided — all stakes refundable</p>
      )}

      {/* Position */}
      {position && (position.yes > 0n || position.no > 0n) && (
        <p className="text-xs text-gray-500">
          Your shares: {formatEther(position.yes)} YES · {formatEther(position.no)} NO
          {position.claimed && " · claimed ✓"}
        </p>
      )}

      {/* Trade */}
      {canTrade && (
        walletClient ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="number" min="0.001" step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-gray-400">STT</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBuy("YES")}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                Buy YES
              </button>
              <button
                onClick={() => handleBuy("NO")}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                Buy NO
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-1">Connect wallet to place a bet</p>
        )
      )}

      {/* Claim */}
      {canClaim && walletClient && (
        <button
          onClick={handleClaim}
          className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
        >
          {market.outcome === Outcome.VOIDED ? "Claim Refund" : "Claim Winnings"}
        </button>
      )}

      {txStatus && <p className="text-xs text-gray-400 break-all">{txStatus}</p>}
    </div>
  );
}
