/**
 * Viem client helpers.
 *
 * These are convenience factories that wire up the Somnia testnet chain
 * definition to viem's createPublicClient / createWalletClient. They're
 * optional — app developers can always roll their own clients if they
 * want custom transports, middleware, etc.
 *
 * The SDK actions never call these internally; they accept a
 * PublicClient / WalletClient parameter so the caller stays in control
 * of transports, account, and chain selection.
 */
import {
    createPublicClient,
    createWalletClient,
    http,
    type Account,
    type Chain,
    type HttpTransportConfig,
    type PublicClient,
    type Transport,
    type WalletClient,
} from "viem";

import { somniaTestnet } from "../chains.js";

/**
 * Create a read-only public client for Somnia testnet.
 *
 * @param rpcUrl   - Optional custom RPC endpoint. Defaults to the public
 *                   Somnia RPC baked into the chain definition.
 * @param options  - Passthrough viem http transport options.
 * @returns A typed PublicClient pinned to Somnia testnet.
 *
 * @example
 *   const client = createSomniaPublicClient();
 *   const block = await client.getBlockNumber();
 */
export function createSomniaPublicClient(
    rpcUrl?: string,
    options?: HttpTransportConfig,
): PublicClient<Transport, Chain> {
    return createPublicClient({
        chain: somniaTestnet,
        transport: http(rpcUrl, options),
    });
}

/**
 * Create a wallet client backed by an explicit viem Account
 * (e.g. `privateKeyToAccount(...)` for scripts, or an injected
 * EIP-1193 account from wagmi in the browser).
 *
 * For browser apps, prefer using wagmi / RainbowKit hooks instead of
 * this helper — they handle connector state, account switching, etc.
 * This factory is primarily useful for Node.js scripts.
 *
 * @param account  - The signing account.
 * @param rpcUrl   - Optional custom RPC endpoint.
 * @param options  - Passthrough viem http transport options.
 * @returns A typed WalletClient pinned to Somnia testnet.
 */
export function createSomniaWalletClient(
    account: Account,
    rpcUrl?: string,
    options?: HttpTransportConfig,
): WalletClient<Transport, Chain, Account> {
    return createWalletClient({
        account,
        chain: somniaTestnet,
        transport: http(rpcUrl, options),
    });
}
