import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { somniaTestnet } from "@prophecy-templates/sdk";

// CUSTOMIZE: replace with your WalletConnect project ID from https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "prophecy-templates-dev";

export const wagmiConfig = getDefaultConfig({
  appName: "SportsBook",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [somniaTestnet],
  ssr: true,
});
