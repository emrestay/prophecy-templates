// COPY THIS FILE into your app at components/prophecy/MarketCard.tsx
"use client";

import { MarketStatus, Outcome } from "@prophecy-templates/sdk";
import { useProphecyMarket } from "./useProphecyMarket";

function pct(price: bigint): string {
  return ((Number(price) / 1e18) * 100).toFixed(1) + "%";
}

const STATUS_LABEL: Record<number, string> = {
  0: "PENDING",
  1: "ACTIVE",
  2: "CLOSED",
  3: "RESOLVED",
  4: "VOIDED",
  5: "SETTLED",
};

const STATUS_COLOR: Record<number, string> = {
  0: "text-gray-400",
  1: "text-green-400",
  2: "text-yellow-400",
  3: "text-blue-400",
  4: "text-red-400",
  5: "text-blue-400",
};

/**
 * Displays live market odds, status, and outcome for a Prophecy market.
 * Drop this anywhere you want to show a prediction market widget.
 *
 * @example
 * <MarketCard marketId={7090n} userAddress={address} />
 */
export function MarketCard({
  marketId,
  userAddress,
}: {
  marketId: bigint;
  userAddress?: `0x${string}`;
}) {
  const { market, price, status, position, loading, error } = useProphecyMarket(marketId, userAddress);

  if (loading && !market) {
    return <p className="text-xs text-gray-500 animate-pulse">Loading market…</p>;
  }
  if (error) {
    return <p className="text-xs text-red-400">Market error: {error.slice(0, 80)}</p>;
  }
  if (!market || !price || status === null) return null;

  const statusLabel = STATUS_LABEL[status] ?? String(status);
  const statusColor = STATUS_COLOR[status] ?? "text-gray-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-400 truncate">{market.name}</p>
        <span className={`text-xs font-medium shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-lg p-2 text-center border ${
          market.resolved && market.outcome === Outcome.YES
            ? "bg-green-700/40 border-green-500/60"
            : "bg-green-950/40 border-green-800/40"
        }`}>
          <p className="text-xs text-green-400">YES</p>
          <p className="text-lg font-bold text-green-300">{pct(price.yesPrice)}</p>
        </div>
        <div className={`rounded-lg p-2 text-center border ${
          market.resolved && market.outcome === Outcome.NO
            ? "bg-red-700/40 border-red-500/60"
            : "bg-red-950/40 border-red-800/40"
        }`}>
          <p className="text-xs text-red-400">NO</p>
          <p className="text-lg font-bold text-red-300">{pct(price.noPrice)}</p>
        </div>
      </div>

      {market.resolved && (
        <p className="text-xs text-center text-blue-300">
          Resolved:{" "}
          <strong>
            {market.outcome === Outcome.YES ? "YES ✅" : market.outcome === Outcome.NO ? "NO ❌" : "VOIDED 🔁"}
          </strong>
        </p>
      )}

      {status === MarketStatus.VOIDED && !market.resolved && (
        <p className="text-xs text-red-400 text-center">Voided — refund available</p>
      )}

      {position && (position.yes > 0n || position.no > 0n) && (
        <p className="text-xs text-gray-500">
          Your shares: {Number(position.yes) / 1e18} YES · {Number(position.no) / 1e18} NO
          {position.claimed ? " (claimed)" : ""}
        </p>
      )}
    </div>
  );
}
