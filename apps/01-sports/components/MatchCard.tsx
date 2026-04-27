"use client";

import { createBinaryStringMarket, getCreateMarketCost } from "@prophecy-templates/sdk";
import { useState } from "react";
import { formatEther, zeroAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { NETWORK, RESOLUTION_DURATION_SEC, TRADING_DURATION_SEC, TRADING_START_DELAY_SEC, VENUE_ID } from "@/lib/config";
import { type Match } from "@/lib/matches";
import { prophecyClient } from "./prophecy/useProphecyMarket";
import { PredictionWidget } from "./prophecy/PredictionWidget";

// CUSTOMIZE: initial liquidity per market (0.1 STT)
const INITIAL_LIQUIDITY = 10n ** 17n;

type WC = Parameters<typeof createBinaryStringMarket>[0]["walletClient"];

export function MatchCard({ match }: { match: Match }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [marketId, setMarketId] = useState<bigint | null>(match.marketId);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);

  // Auto-generates a binary YES/NO question for this match
  // CUSTOMIZE: adjust the question/prompt template for your sport
  function matchQuestion() {
    return `Will ${match.home.name} beat ${match.away.name}?`;
  }
  function matchPrompt() {
    const date = new Date(match.kickoff).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    return `Did ${match.home.name} beat ${match.away.name} in the ${match.league} match on ${date}? Answer yes or no.`;
  }

  async function handleCreateMarket() {
    if (!walletClient) return;
    setCreating(true);
    setCreateStatus("Fetching cost…");
    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const kickoffSec = BigInt(Math.floor(new Date(match.kickoff).getTime() / 1000));

      // CUSTOMIZE: adjust match duration and buffer for your sport
      const MATCH_DURATION_SEC = 90n * 60n;   // 90 minutes (football)
      const RESULT_BUFFER_SEC  = 30n * 60n;   // 30 min buffer after full time
      const RESOLUTION_WINDOW_SEC = 60n * 60n; // 1 hour for agents to respond

      // Trading: open now until kickoff (or at least TRADING_START_DELAY_SEC from now)
      const tradingStartTs = now + BigInt(TRADING_START_DELAY_SEC);
      // For upcoming matches close trading at kickoff; for live matches use a short window
      const tradingEndTs = match.status === "live"
        ? now + BigInt(TRADING_DURATION_SEC)
        : kickoffSec > tradingStartTs ? kickoffSec : tradingStartTs + BigInt(TRADING_DURATION_SEC);
      // Agents resolve after match ends + buffer
      const resolutionStartTs = match.status === "live"
        ? tradingEndTs + BigInt(RESOLUTION_DURATION_SEC)
        : kickoffSec + MATCH_DURATION_SEC + RESULT_BUFFER_SEC;
      const resolutionEndTs = resolutionStartTs + RESOLUTION_WINDOW_SEC;

      const cost = await getCreateMarketCost({
        publicClient: prophecyClient,
        liquidityBases: [INITIAL_LIQUIDITY],
        stakeToken: zeroAddress,
        urlCount: 1n,
        network: NETWORK,
      });

      setCreateStatus(`Creating (${Number(formatEther(cost)).toFixed(3)} STT)…`);

      const result = await createBinaryStringMarket({
        walletClient: walletClient as WC,
        publicClient: prophecyClient,
        question: matchQuestion(),
        prompt: matchPrompt(),
        urls: [match.sourceUrl],
        winner: "yes",
        allowedResults: ["yes", "no"],
        resolveUrl: true,
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

      setMarketId(result.marketId);
      setCreateStatus(null);
    } catch (e) {
      setCreateStatus("Error: " + (e instanceof Error ? e.message.slice(0, 100) : String(e)));
    } finally {
      setCreating(false);
    }
  }

  function handleLinkManual() {
    try {
      setMarketId(BigInt(manualInput.trim()));
      setShowManual(false);
    } catch { /* invalid */ }
  }

  const kickoffLabel = new Date(match.kickoff).toLocaleString([], {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      {/* ── Match header ─────────────────────────────── */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs text-gray-500">{match.leagueEmoji} {match.league}</span>
        {match.status === "live" && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
        )}
        {match.status === "finished" && (
          <span className="text-xs font-medium text-gray-500">FT</span>
        )}
        {match.status === "upcoming" && (
          <span className="text-xs text-gray-500">{kickoffLabel}</span>
        )}
      </div>

      {/* ── Teams & score ────────────────────────────── */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-center">
            <div className="text-3xl mb-1">{match.home.emoji}</div>
            <div className="text-sm font-semibold text-white">{match.home.name}</div>
          </div>

          <div className="shrink-0 text-center min-w-[4rem]">
            {match.homeScore !== undefined && match.awayScore !== undefined ? (
              <div className="text-2xl font-bold text-white tabular-nums">
                {match.homeScore} – {match.awayScore}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">vs</div>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="text-3xl mb-1">{match.away.emoji}</div>
            <div className="text-sm font-semibold text-white">{match.away.name}</div>
          </div>
        </div>
      </div>

      {/* ── Prophecy prediction market ───────────────── */}
      {/* INTEGRATION POINT: copy everything below into your own match card */}
      <div className="border-t border-gray-700/60 bg-gray-900/40 px-4 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Prediction Market</span>
        </div>

        {marketId ? (
          <div className="space-y-3">
            <PredictionWidget marketId={marketId} />
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-600">Market #{marketId.toString()}</span>
              <button
                onClick={() => { setMarketId(null); setCreateStatus(null); }}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Unlink
              </button>
            </div>
          </div>
        ) : match.status === "finished" ? (
          <p className="text-xs text-gray-600 italic">Match finished — no market available</p>
        ) : (
          <div className="space-y-2">
            {/* Primary CTA: create a new market for this match */}
            <button
              onClick={handleCreateMarket}
              disabled={creating || !walletClient}
              className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
              {creating
                ? "Creating…"
                : walletClient
                ? `Create Market — "${matchQuestion()}"`
                : "Connect wallet to create market"}
            </button>

            {createStatus && (
              <p className="text-xs text-gray-400 break-all">{createStatus}</p>
            )}

            {/* Secondary: link existing market */}
            {!showManual ? (
              <button
                onClick={() => setShowManual(true)}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Already have a market ID? Link it →
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLinkManual()}
                  placeholder="Market ID (e.g. 7090)"
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleLinkManual}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
                >
                  Link
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
