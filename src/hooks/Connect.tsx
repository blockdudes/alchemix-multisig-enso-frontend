import { ConnectButton } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { arbitrum, ethereum, optimism } from "thirdweb/chains";
import { useTheme } from "@/components/theme-provider";
import { client } from "@/utils/client";


const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  createWallet("com.trustwallet.app"),
];

export function Connect() {
  return (
    <div>
      <ConnectButton
        client={client}
        wallets={wallets}
        chains={[ethereum, arbitrum, optimism]}
        connectModal={{ size: "wide" }}
        theme={useTheme().theme}
      />
    </div>
  );
}
