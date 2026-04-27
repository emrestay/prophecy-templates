// CUSTOMIZE: replace with your real data source (API, database, etc.)
// This is hardcoded fake data — swap it out for real match data in your app.

export type MatchStatus = "upcoming" | "live" | "finished";

export interface Match {
  id: string;
  league: string;
  leagueEmoji: string;
  home: { name: string; emoji: string };
  away: { name: string; emoji: string };
  kickoff: string; // ISO 8601
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  // CUSTOMIZE: domain the AI agent will search to resolve the market
  sourceUrl: string;
  // CUSTOMIZE: set marketId to pre-link this match to a deployed Prophecy market.
  // Leave as null to show a "Create Market" button in the UI.
  marketId: bigint | null;
}

export const MATCHES: Match[] = [
  {
    id: "m1",
    league: "Premier League",
    leagueEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    home: { name: "Arsenal", emoji: "🔴" },
    away: { name: "Man City", emoji: "🔵" },
    kickoff: "2026-05-10T15:00:00Z",
    status: "upcoming",
    sourceUrl: "bbc.com/sport/football",
    marketId: null,
  },
  {
    id: "m2",
    league: "La Liga",
    leagueEmoji: "🇪🇸",
    home: { name: "Real Madrid", emoji: "⚪" },
    away: { name: "Barcelona", emoji: "🔵🔴" },
    kickoff: "2026-05-04T19:00:00Z",
    status: "live",
    homeScore: 1,
    awayScore: 1,
    sourceUrl: "marca.com",
    marketId: null,
  },
  {
    id: "m3",
    league: "Bundesliga",
    leagueEmoji: "🇩🇪",
    home: { name: "Bayern Munich", emoji: "🔴" },
    away: { name: "Dortmund", emoji: "🟡" },
    kickoff: "2026-05-01T17:30:00Z",
    status: "finished",
    homeScore: 3,
    awayScore: 1,
    sourceUrl: "kicker.de",
    marketId: null,
  },
  {
    id: "m4",
    league: "Serie A",
    leagueEmoji: "🇮🇹",
    home: { name: "Inter Milan", emoji: "🔵⚫" },
    away: { name: "AC Milan", emoji: "🔴⚫" },
    kickoff: "2026-05-11T19:45:00Z",
    status: "upcoming",
    sourceUrl: "gazzetta.it",
    marketId: null,
  },
];
