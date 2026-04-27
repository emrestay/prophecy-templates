"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  buyYes,
  buyNo,
  claim,
  createBinaryStringMarket,
  getCreateMarketCost,
  MarketStatus,
  Outcome,
  type MarketStatusValue,
} from "@prophecy-templates/sdk";
import React, { type ReactNode, useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { INITIAL_LIQUIDITY, publicClient, useMarket } from "@/hooks/useMarket";
import {
  NETWORK,
  RESOLUTION_DURATION_SEC,
  TRADING_DURATION_SEC,
  TRADING_START_DELAY_SEC,
  VENUE_ID,
} from "@/lib/config";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function pct(price: bigint): string {
  return ((Number(price) / 1e18) * 100).toFixed(1) + "%";
}

function statusLabel(s: MarketStatusValue | null): string {
  if (s === null) return "—";
  return (
    ["PENDING", "ACTIVE", "CLOSED", "RESOLVED", "VOIDED", "SETTLED"][s] ?? String(s)
  );
}

function statusColor(s: MarketStatusValue | null): string {
  if (s === MarketStatus.ACTIVE) return "text-green-400";
  if (s === MarketStatus.RESOLVED || s === MarketStatus.SETTLED) return "text-blue-400";
  if (s === MarketStatus.VOIDED) return "text-red-400";
  if (s === MarketStatus.CLOSED) return "text-yellow-400";
  return "text-gray-400";
}

function outcomeLabel(o: number): string {
  return o === Outcome.YES ? "YES ✅" : o === Outcome.NO ? "NO ❌" : "VOIDED 🔁";
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function MarketCard({
  marketId,
  userAddress,
  walletClientData,
}: {
  marketId: bigint;
  userAddress?: `0x${string}`;
  walletClientData: ReturnType<typeof useWalletClient>["data"];
}) {
  const { market, price, status, position, loading, error } = useMarket(marketId, userAddress);
  const [buyAmount, setBuyAmount] = useState("0.01");
  const [txStatus, setTxStatus] = useState<string | null>(null);

  async function sendTx(fn: () => Promise<{ txHash: `0x${string}` }>) {
    if (!walletClientData) return;
    setTxStatus("Sending…");
    try {
      const result = await fn();
      setTxStatus(`tx: ${result.txHash.slice(0, 10)}…`);
    } catch (e) {
      setTxStatus("Error: " + (e instanceof Error ? e.message.slice(0, 80) : String(e)));
    }
  }

  type WC = Parameters<typeof buyYes>[0]["walletClient"];

  async function handleBuy(side: "YES" | "NO") {
    if (!walletClientData) return;
    const amountWei = parseEther(buyAmount);
    const wc = walletClientData as WC;
    sendTx(() =>
      side === "YES"
        ? buyYes({
            walletClient: wc,
            publicClient,
            params: { marketId, amountIn: amountWei, minSharesOut: 0n, stakeToken: zeroAddress },
            options: { network: NETWORK, venueId: VENUE_ID },
          })
        : buyNo({
            walletClient: wc,
            publicClient,
            params: { marketId, amountIn: amountWei, minSharesOut: 0n, stakeToken: zeroAddress },
            options: { network: NETWORK, venueId: VENUE_ID },
          }),
    );
  }

  async function handleClaim() {
    if (!walletClientData) return;
    sendTx(() =>
      claim({
        walletClient: walletClientData as WC,
        publicClient,
        params: { marketId },
        options: { network: NETWORK },
      }),
    );
  }

  if (loading && !market) return <p className="text-gray-400">Loading market…</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!market || !price) return null;

  const hasWallet: boolean = walletClientData != null;
  const canTrade = status === MarketStatus.ACTIVE;
  const canClaim =
    (status === MarketStatus.RESOLVED ||
      status === MarketStatus.SETTLED ||
      status === MarketStatus.VOIDED) &&
    position &&
    !position.claimed &&
    (position.yes > 0n || position.no > 0n);

  const resolvedBadge = market.resolved ? (
    <div className="bg-blue-950/40 border border-blue-700/50 rounded-lg p-3 text-center">
      <p className="text-sm text-blue-300">
        Resolved: <strong>{outcomeLabel(market.outcome)}</strong>
      </p>
    </div>
  ) : null;

  const voidedInfo = status === MarketStatus.VOIDED && !market.resolved ? (
    <div className="bg-red-950/40 border border-red-700/50 rounded-lg p-3 text-sm text-red-300">
      Market voided — AI agents could not reach consensus. All stakes are refundable.
    </div>
  ) : null;

  return (
    <div className="border border-gray-700 rounded-xl p-5 space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Market #{marketId.toString()}</p>
            <h2 className="font-semibold text-white leading-snug">{market.name}</h2>
          </div>
          <span className={`text-sm font-medium shrink-0 ${statusColor(status)}`}>
            {statusLabel(status)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-950/40 border border-green-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-400 mb-1">YES</p>
            <p className="text-2xl font-bold text-green-300">{pct(price.yesPrice)}</p>
          </div>
          <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-red-400 mb-1">NO</p>
            <p className="text-2xl font-bold text-red-300">{pct(price.noPrice)}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {resolvedBadge}
        {voidedInfo}
        {position && (position.yes > 0n || position.no > 0n) && (
          <div className="text-xs text-gray-400 space-y-0.5">
            <p>Your position: {formatEther(position.yes)} YES shares · {formatEther(position.no)} NO shares</p>
            {position.claimed && <p className="text-gray-500">Already claimed ✓</p>}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {canTrade && hasWallet && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.001"
                step="0.01"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-28 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-sm text-gray-400">STT</span>
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
        )}
        {canClaim && hasWallet && (
          <button
            onClick={handleClaim}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Claim Settlement
          </button>
        )}
        {txStatus && (
          <p className="text-xs text-gray-400 break-all">{txStatus}</p>
        )}
      </div>
      <div className="text-xs text-gray-600 space-y-0.5 border-t border-gray-800 pt-3">
        <p>Trading: {new Date(Number(market.tradingStartTs) * 1000).toLocaleTimeString()} → {new Date(Number(market.tradingEndTs) * 1000).toLocaleTimeString()}</p>
        <p>Resolution ends: {new Date(Number(market.resolutionEndTs) * 1000).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Create Market Form
// ─────────────────────────────────────────────

function CreateMarketForm({
  walletClientData,
  onCreated,
}: {
  walletClientData: ReturnType<typeof useWalletClient>["data"];
  onCreated: (marketId: bigint) => void;
}) {
  // CUSTOMIZE: change defaults to fit your use case
  const [question, setQuestion] = useState("Did the 2024 US presidential election take place?");
  const [prompt, setPrompt] = useState("Did the 2024 United States presidential election take place? Answer yes or no.");
  const [sourceUrl, setSourceUrl] = useState("en.wikipedia.org");
  const [yesValue, setYesValue] = useState("yes");
  const [noValue, setNoValue] = useState("no");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!walletClientData) return;
    setSubmitting(true);
    setStatus("Fetching creation cost…");

    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const tradingStartTs = now + BigInt(TRADING_START_DELAY_SEC);
      const tradingEndTs = tradingStartTs + BigInt(TRADING_DURATION_SEC);
      const resolutionStartTs = tradingEndTs;
      const resolutionEndTs = tradingEndTs + BigInt(RESOLUTION_DURATION_SEC);

      const cost = await getCreateMarketCost({
        publicClient,
        liquidityBases: [INITIAL_LIQUIDITY],
        stakeToken: zeroAddress,
        urlCount: 1n,
        network: NETWORK,
      });

      setStatus(`Creating market (cost: ${Number(formatEther(cost)).toFixed(4)} STT)…`);

      const result = await createBinaryStringMarket({
        walletClient: walletClientData as Parameters<typeof createBinaryStringMarket>[0]["walletClient"],
        publicClient,
        question,
        prompt,
        urls: [sourceUrl],
        winner: yesValue,
        allowedResults: [yesValue, noValue],
        resolveUrl: true,       // CUSTOMIZE: true = agent searches the domain; false = scrapes URL directly
        minAgreement: 1n,
        venueId: VENUE_ID,
        stakeToken: zeroAddress,
        initialLiquidityBase: INITIAL_LIQUIDITY,
        tradingStartTs,
        tradingEndTs,
        resolutionStartTs,
        resolutionEndTs,
        callOptions: { network: NETWORK },
      });

      setStatus(`Market created! eventId=${result.eventId} marketId=${result.marketId}`);
      onCreated(result.marketId);
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message.slice(0, 120) : String(e)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Question</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          placeholder="Did X happen?"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Agent prompt</label>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          placeholder="Prompt sent to AI agent"
        />
        <p className="text-xs text-gray-500 mt-1">Used by the AI agent to find the answer on the source domain.</p>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Source domain</label>
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          placeholder="e.g. en.wikipedia.org"
        />
        <p className="text-xs text-gray-500 mt-1">Domain the AI agent searches. Use a human-readable site, not a JSON API.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">YES value</label>
          <input
            value={yesValue}
            onChange={(e) => setYesValue(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            placeholder="yes"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">NO value</label>
          <input
            value={noValue}
            onChange={(e) => setNoValue(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            placeholder="no"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Trading opens {TRADING_START_DELAY_SEC}s after creation · open for {TRADING_DURATION_SEC / 60} min · AI resolves within {RESOLUTION_DURATION_SEC / 60} min
      </p>

      <button
        type="submit"
        disabled={submitting || !walletClientData}
        className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
      >
        {submitting ? "Creating…" : "Create Market"}
      </button>

      {status && (
        <p className="text-xs text-gray-400 break-all">{status}</p>
      )}
    </form>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function Page() {
  const { address, isConnected } = useAccount();
  const { data: walletClientData } = useWalletClient();
  const [marketIds, setMarketIds] = useState<bigint[]>([]);
  const [manualId, setManualId] = useState("");

  function addMarket(id: bigint) {
    setMarketIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
  }

  function loadManualId() {
    const id = manualId.trim();
    if (!id) return;
    try { addMarket(BigInt(id)); } catch { /* invalid */ }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Prophecy Minimal</h1>
          <p className="text-xs text-gray-500 mt-0.5">Somnia Testnet · Venue #{VENUE_ID.toString()}</p>
        </div>
        <ConnectButton />
      </div>

      {/* Create form — only shown when connected */}
      {isConnected && (
        <section className="border border-gray-700 rounded-xl p-5 space-y-3">
          <h2 className="font-medium text-white">Create a market</h2>
          <CreateMarketForm
            walletClientData={walletClientData}
            onCreated={addMarket}
          />
        </section>
      )}

      {!isConnected && (
        <div className="text-center py-12 text-gray-500">
          Connect your wallet to create markets and place bets.
        </div>
      )}

      {/* Load existing market by ID */}
      <section className="space-y-2">
        <p className="text-sm text-gray-400">Load market by ID</p>
        <div className="flex gap-2">
          <input
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadManualId()}
            placeholder="e.g. 7034"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={loadManualId}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Load
          </button>
        </div>
      </section>

      {/* Market cards */}
      {marketIds.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-medium text-white">Markets</h2>
          {marketIds.map((id) => (
            <MarketCard
              key={id.toString()}
              marketId={id}
              userAddress={address}
              walletClientData={walletClientData}
            />
          ))}
        </section>
      )}
    </main>
  );
}
