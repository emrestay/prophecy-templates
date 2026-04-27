/**
 * Creates a new venue on the Prophecy VenueRegistry.
 *
 * Emre runs this once to stand up the signerless "Hackathon Public Venue"
 * that every template defaults to. Hackathon builders who want their own
 * venue (to collect their own fees, gate by NFT, etc.) can also run this
 * with their own OPERATOR_PRIVATE_KEY.
 *
 * Usage:
 *   1. Copy .env.example to .env in the repo root and set OPERATOR_PRIVATE_KEY.
 *      Use a disposable testnet wallet with ~0.5 STT for gas.
 *   2. Run: npm run deploy:venue
 *   3. Copy the emitted venueId into every app's .env.local as
 *      NEXT_PUBLIC_PROPHECY_VENUE_ID.
 *
 * What this does:
 *   - Calls VenueRegistry.createVenue(address(0), true)
 *       - signer = 0x0  → signerless venue (no EIP-712 permit required
 *                          per consumeGenericPermit in VenueRegistry.sol)
 *       - active = true → open for market creation immediately
 *   - Default fees are applied automatically by the contract:
 *       - venueFeeBps   = 300  (3% trade fee, paid to venue owner)
 *       - venueRewardBps = 100 (1% settlement reward, paid to venue owner)
 *     Change later with setVenueFeeBps / setVenueRewardBps if needed.
 *
 * The caller becomes the venue owner. Only the owner can update fees,
 * transfer ownership, or flip active → inactive.
 */
import {
    createPublicClient,
    createWalletClient,
    decodeEventLog,
    http,
    zeroAddress,
    type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
    VenueRegistryABI,
    getAddresses,
    somniaTestnet,
    type ProphecyNetwork,
} from "@prophecy-templates/sdk";

function parsePrivateKey(raw: string | undefined): Hex {
    if (!raw) {
        throw new Error(
            "OPERATOR_PRIVATE_KEY is not set. Copy .env.example to .env and fill it in.",
        );
    }
    const trimmed = raw.trim();
    const normalized = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
        throw new Error(
            "OPERATOR_PRIVATE_KEY must be a 32-byte hex string (with or without 0x prefix).",
        );
    }
    return normalized as Hex;
}

function parseNetwork(raw: string | undefined): ProphecyNetwork {
    if (!raw || raw === "staging") return "staging";
    if (raw === "development") return "development";
    throw new Error(
        `Unknown network "${raw}". Set NEXT_PUBLIC_PROPHECY_NETWORK to "staging" or "development".`,
    );
}

async function main() {
    const network = parseNetwork(process.env.NEXT_PUBLIC_PROPHECY_NETWORK);
    const privateKey = parsePrivateKey(process.env.OPERATOR_PRIVATE_KEY);
    const rpcUrl =
        process.env.NEXT_PUBLIC_SOMNIA_RPC_URL ??
        somniaTestnet.rpcUrls.default.http[0];

    const addresses = getAddresses(network);
    const account = privateKeyToAccount(privateKey);

    const transport = http(rpcUrl);
    const publicClient = createPublicClient({ chain: somniaTestnet, transport });
    const walletClient = createWalletClient({
        account,
        chain: somniaTestnet,
        transport,
    });

    console.log("────────────────────────────────────────────────────────");
    console.log(" Creating Prophecy venue (signerless)");
    console.log("────────────────────────────────────────────────────────");
    console.log(` network:        ${network}`);
    console.log(` rpc:            ${rpcUrl}`);
    console.log(` operator:       ${account.address}`);
    console.log(` venueRegistry:  ${addresses.VenueRegistry}`);
    console.log(` signer:         ${zeroAddress} (signerless)`);
    console.log(` active:         true`);
    console.log(` default fees:   300 bps trade  /  100 bps settlement reward`);
    console.log("────────────────────────────────────────────────────────");

    const balance = await publicClient.getBalance({ address: account.address });
    console.log(` balance:        ${balance} wei`);
    if (balance === 0n) {
        throw new Error(
            "Operator wallet has zero STT balance. Fund it before running this script.",
        );
    }

    console.log("\n→ sending createVenue tx...");
    const txHash = await walletClient.writeContract({
        address: addresses.VenueRegistry,
        abi: VenueRegistryABI,
        functionName: "createVenue",
        args: [zeroAddress, true],
    });
    console.log(`  tx sent: ${txHash}`);

    console.log("→ waiting for confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status !== "success") {
        throw new Error(`createVenue tx reverted (block ${receipt.blockNumber})`);
    }

    let venueId: bigint | undefined;
    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== addresses.VenueRegistry.toLowerCase()) {
            continue;
        }
        try {
            const decoded = decodeEventLog({
                abi: VenueRegistryABI,
                data: log.data,
                topics: log.topics,
            });
            if (decoded.eventName === "VenueCreated") {
                venueId = decoded.args.venueId;
                break;
            }
        } catch {
            continue;
        }
    }

    if (venueId === undefined) {
        throw new Error(
            "createVenue succeeded but VenueCreated event was not found in logs.",
        );
    }

    console.log("\n✅ Venue created");
    console.log(`   venueId:       ${venueId}`);
    console.log(`   tx:            ${txHash}`);
    console.log(`   block:         ${receipt.blockNumber}`);
    console.log(`   gas used:      ${receipt.gasUsed}`);
    console.log(
        `\n   explorer:      ${somniaTestnet.blockExplorers.default.url}/tx/${txHash}`,
    );

    console.log("\n👉 Paste this into each app's .env.local:");
    console.log(`   NEXT_PUBLIC_PROPHECY_VENUE_ID=${venueId}`);
}

main().catch((err) => {
    console.error("\n❌ Failed to create venue:");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
