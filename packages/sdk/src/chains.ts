/**
 * Somnia chain definitions for viem.
 *
 * Somnia testnet chainId = 50312 (~200ms blocks).
 * All Prophecy template contracts are currently deployed on testnet.
 */
import { defineChain } from "viem";

export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
      webSocket: ["wss://dream-rpc.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://somnia-testnet.socialscan.io",
    },
  },
  testnet: true,
});
