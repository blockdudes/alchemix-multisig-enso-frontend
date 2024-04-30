import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";
import { arbitrum, ethereum, optimism } from "thirdweb/chains";
import { useTheme } from "@/components/theme-provider";


const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_KEY,
  });


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
      theme={useTheme().theme}/>
    </div>
  );
}
