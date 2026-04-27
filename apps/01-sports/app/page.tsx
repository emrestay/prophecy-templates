"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MATCHES } from "@/lib/matches";
import { MatchCard } from "@/components/MatchCard";

export default function Page() {
  const live = MATCHES.filter((m) => m.status === "live");
  const upcoming = MATCHES.filter((m) => m.status === "upcoming");
  const finished = MATCHES.filter((m) => m.status === "finished");

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚽ SportsBook</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Prediction markets powered by{" "}
            <span className="text-purple-400 font-medium">Prophecy</span> · Somnia Testnet
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* How it works */}
      <div className="rounded-xl bg-purple-950/30 border border-purple-800/30 px-4 py-3 text-sm text-gray-300 space-y-1">
        <p className="font-medium text-purple-300">How it works</p>
        <p className="text-xs text-gray-400">
          Connect your wallet, then click <strong className="text-white">Create Market</strong> on any match. An AI agent will resolve the bet automatically at the end of the trading window.
        </p>
      </div>

      {live.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Live Now</h2>
          </div>
          {live.map((m) => <MatchCard key={m.id} match={m} />)}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h2>
          {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
        </section>
      )}

      {finished.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Finished</h2>
          {finished.map((m) => <MatchCard key={m.id} match={m} />)}
        </section>
      )}
    </main>
  );
}
