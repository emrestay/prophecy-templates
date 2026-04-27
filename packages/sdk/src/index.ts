/**
 * @prophecy-templates/sdk
 *
 * Thin wrapper around the Prophecy protocol. Re-exports:
 *   - chain definitions (viem)
 *   - contract addresses (staging + development)
 *   - ABIs (as-const, ready for viem)
 *   - shared types (Market, SharePosition, Outcome, ResolverType, …)
 *   - viem client factories (createSomniaPublicClient / createSomniaWalletClient)
 *   - action helpers (createMarket, buyYes / buyNo / sellYes / sellNo,
 *     resolve, claim, plus reads: getMarket, getPrice, getUserPosition)
 *
 * Designed for hackathon templates — minimal surface, no backend deps.
 */

export * from "./chains.js";
export * from "./addresses.js";
export * from "./abis/index.js";
export * from "./types/index.js";
export * from "./clients/index.js";
export * from "./actions/index.js";
