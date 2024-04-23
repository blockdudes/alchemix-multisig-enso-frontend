import { Navigate } from "react-router-dom";
import { useActiveWalletConnectionStatus, useIsAutoConnecting , useConnectedWallets} from "thirdweb/react";


export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
    const wallets = useConnectedWallets();
    console.log("chekc 0",wallets)

    const isAutoConnecting = useIsAutoConnecting();

    console.log("check 1",isAutoConnecting)
    const walletStatus = useActiveWalletConnectionStatus();
  
    if (walletStatus !== 'connected') {
      console.log("check 2", useActiveWalletConnectionStatus())
      // Redirect to the Authentication page or another appropriate page
      return <Navigate to="/dashboard" replace />;
    }
  
    return children;
  };
  