"use client";

import {
  getCreateMarketCost,
  getMarket,
  getMarketStatus,
  getPrice,
  getUserPosition,
  quoteBuy,
  type Market,
  type MarketPrice,
  type MarketStatusValue,
  type SharePosition,
} from "@prophecy-templates/sdk";
import { useEffect, useRef, useState } from "react";
import { createPublicClient, http, zeroAddress } from "viem";
import { somniaTestnet } from "@prophecy-templates/sdk";
import { NETWORK } from "@/lib/config";

export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

export interface MarketState {
  market: Market | null;
  price: MarketPrice | null;
  status: MarketStatusValue | null;
  position: SharePosition | null;
  loading: boolean;
  error: string | null;
}

export function useMarket(marketId: bigint | null, userAddress?: `0x${string}`) {
  const [state, setState] = useState<MarketState>({
    market: null,
    price: null,
    status: null,
    position: null,
    loading: false,
    error: null,
  });
  // Cache the last price that had non-zero pools so resolved markets still show final odds
  const lastValidPrice = useRef<MarketPrice | null>(null);

  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;
    lastValidPrice.current = null;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [market, rawPrice] = await Promise.all([
          getMarket({ publicClient, marketId: marketId!, options: { network: NETWORK } }),
          getPrice({ publicClient, marketId: marketId!, options: { network: NETWORK } }),
        ]);

        if (rawPrice.yesPool > 0n || rawPrice.noPool > 0n) {
          lastValidPrice.current = rawPrice;
        }
        // For resolved markets use the last known price (pools are drained to 0 post-resolution)
        const price = lastValidPrice.current ?? rawPrice;

        // getMarketStatus is synchronous — takes a Market object
        const status = getMarketStatus(market);

        let position: SharePosition | null = null;
        if (userAddress) {
          try {
            position = await getUserPosition({
              publicClient,
              marketId: marketId!,
              user: userAddress,
              options: { network: NETWORK },
            });
          } catch { /* user has no position */ }
        }

        if (!cancelled) setState({ market, price, status, position, loading: false, error: null });
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: String(e) }));
      }
    }

    load();
    const interval = setInterval(load, 5_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [marketId, userAddress]);

  return state;
}

export async function fetchQuoteBuy(marketId: bigint, amountIn: bigint, side: "YES" | "NO") {
  return quoteBuy({ publicClient, marketId, amountIn, side, options: { network: NETWORK } });
}

export async function fetchCreateCost(urlCount: number): Promise<bigint> {
  return getCreateMarketCost({
    publicClient,
    liquidityBases: [INITIAL_LIQUIDITY],
    stakeToken: zeroAddress,
    urlCount: BigInt(urlCount),
    network: NETWORK,
  });
}

// CUSTOMIZE: adjust initial liquidity (in wei). 0.1 STT is good for demos.
export const INITIAL_LIQUIDITY = 10n ** 17n; // 0.1 STT
