// 📋 COPY THIS FILE into your app at components/prophecy/BetPanel.tsx
//
// REQUIRES:
//   1. components/prophecy/useProphecyMarket.ts (the hook)
//   2. lib/config.ts exporting `NETWORK` and `VENUE_ID`
//   3. wagmi providers wrapped around your app
//
// Usage:
//   <BetPanel marketId={7090n} />
//
// What it does: standalone YES/NO buy panel + claim button. Use this
// when you want a smaller footprint than PredictionWidget (no header,
// no odds banner — just the actions).
"use client";

import { buyNo, buyYes, MarketStatus, Outcome } from "@prophecy-templates/sdk";
import { useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { prophecyClient, useProphecyMarket } from "./useProphecyMarket";
// CUSTOMIZE: import NETWORK and VENUE_ID from your own config.
import { NETWORK, VENUE_ID } from "@/lib/config";

type WC = Parameters<typeof buyYes>[0]["walletClient"];

/**
 * YES/NO buy panel + claim button for a Prophecy market.
 * Handles wallet connection state internally — just pass the marketId.
 *
 * @example
 * <BetPanel marketId={7090n} />
 */
export function BetPanel({ marketId }: { marketId: bigint }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { market, price, status, position } = useProphecyMarket(marketId, address);
  const [amount, setAmount] = useState("0.01");
  const [txStatus, setTxStatus] = useState<string | null>(null);

  if (!market || !price || status === null) return null;

  const canTrade = status === MarketStatus.ACTIVE;
  const canClaim =
    (status === MarketStatus.RESOLVED ||
      status === MarketStatus.SETTLED ||
      status === MarketStatus.VOIDED) &&
    position &&
    !position.claimed &&
    (position.yes > 0n || position.no > 0n);

  async function handleBuy(side: "YES" | "NO") {
    if (!walletClient) return;
    setTxStatus("Sending…");
    try {
      const amountWei = parseEther(amount);
      const params = {
        marketId,
        amountIn: amountWei,
        minSharesOut: 0n,
        stakeToken: zeroAddress,
      };
      const opts = { network: NETWORK, venueId: VENUE_ID };
      const wc = walletClient as WC;
      const result = side === "YES"
        ? await buyYes({ walletClient: wc, publicClient: prophecyClient, params, options: opts })
        : await buyNo({ walletClient: wc, publicClient: prophecyClient, params, options: opts });
      setTxStatus(`tx: ${result.txHash.slice(0, 10)}…`);
    } catch (e) {
      setTxStatus("Error: " + (e instanceof Error ? e.message.slice(0, 80) : String(e)));
    }
  }

  async function handleClaim() {
    if (!walletClient) return;
    setTxStatus("Claiming…");
    try {
      const { claim } = await import("@prophecy-templates/sdk");
      const result = await claim({
        walletClient: walletClient as WC,
        publicClient: prophecyClient,
        params: { marketId },
        options: { network: NETWORK },
      });
      setTxStatus(`Claimed! tx: ${result.txHash.slice(0, 10)}…`);
    } catch (e) {
      setTxStatus("Error: " + (e instanceof Error ? e.message.slice(0, 80) : String(e)));
    }
  }

  if (!walletClient) {
    return (
      <p className="text-xs text-gray-500 text-center">Connect wallet to bet</p>
    );
  }

  return (
    <div className="space-y-2 pt-1">
      {canTrade && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.001"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <span className="text-xs text-gray-400">STT</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBuy("YES")}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white rounded-lg py-1.5 text-sm font-medium transition-colors"
            >
              Buy YES
            </button>
            <button
              onClick={() => handleBuy("NO")}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-1.5 text-sm font-medium transition-colors"
            >
              Buy NO
            </button>
          </div>
        </>
      )}

      {canClaim && (
        <div>
          <p className="text-xs text-gray-400 mb-1">
            Your stake: {formatEther(position!.yes > 0n ? position!.yes : position!.no)} shares
          </p>
          <button
            onClick={handleClaim}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg py-1.5 text-sm font-medium transition-colors"
          >
            {market.outcome === Outcome.VOIDED ? "Claim Refund" : "Claim Winnings"}
          </button>
        </div>
      )}

      {txStatus && (
        <p className="text-xs text-gray-400 break-all">{txStatus}</p>
      )}
    </div>
  );
}
