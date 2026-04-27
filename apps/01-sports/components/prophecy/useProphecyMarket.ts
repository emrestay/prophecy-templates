// 📋 COPY THIS FILE into your app at components/prophecy/useProphecyMarket.ts
//
// REQUIRES: a sibling `lib/config.ts` that exports `NETWORK`. See
//           apps/01-sports/lib/config.ts in the template repo for the
//           1-line file you need to copy alongside this one.
//
// What it does: subscribes to a single Prophecy market, polls every 5s,
//               returns market + live odds + user position. Handles the
//               post-resolution case where on-chain pools drain to 0 by
//               caching the last valid price.
"use client";

import {
  getMarket,
  getMarketStatus,
  getPrice,
  getUserPosition,
  somniaTestnet,
  type Market,
  type MarketPrice,
  type MarketStatusValue,
  type SharePosition,
} from "@prophecy-templates/sdk";
import { useEffect, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
// CUSTOMIZE: import NETWORK from your own config file. This lets you
// switch staging↔mainnet from one place instead of editing every widget.
import { NETWORK } from "@/lib/config";

export const prophecyClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

export interface ProphecyMarketState {
  market: Market | null;
  price: MarketPrice | null;
  status: MarketStatusValue | null;
  position: SharePosition | null;
  loading: boolean;
  error: string | null;
}

/**
 * Drop-in hook for any component that needs live Prophecy market data.
 * Polls every 5 seconds. Caches the last valid price so resolved markets
 * still show the final odds rather than 0%/0%.
 */
export function useProphecyMarket(
  marketId: bigint | null,
  userAddress?: `0x${string}`,
): ProphecyMarketState {
  const [state, setState] = useState<ProphecyMarketState>({
    market: null,
    price: null,
    status: null,
    position: null,
    loading: false,
    error: null,
  });
  const lastValidPrice = useRef<MarketPrice | null>(null);

  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;
    lastValidPrice.current = null;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [market, rawPrice] = await Promise.all([
          getMarket({ publicClient: prophecyClient, marketId: marketId!, options: { network: NETWORK } }),
          getPrice({ publicClient: prophecyClient, marketId: marketId!, options: { network: NETWORK } }),
        ]);

        if (rawPrice.yesPool > 0n || rawPrice.noPool > 0n) {
          lastValidPrice.current = rawPrice;
        }
        const price = lastValidPrice.current ?? rawPrice;
        const status = getMarketStatus(market);

        let position: SharePosition | null = null;
        if (userAddress) {
          try {
            position = await getUserPosition({
              publicClient: prophecyClient,
              marketId: marketId!,
              user: userAddress,
              options: { network: NETWORK },
            });
          } catch { /* user has no position yet */ }
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
