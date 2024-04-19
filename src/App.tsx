import Navbar from "./components/header/Navbar";
import DesiredOutputCard from "./components/body/DesiredOutputCard";
import ClaimableRewardsCard from "./components/body/ClaimableRewardsCard";
import MetadataCard from "./components/body/MetadataCard";
import { Button } from "./components/ui/button";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";
import AuthenticationPage from "./components/body/AuthenticationPage";
import Footer from "./components/footer/Footer";
import { useActiveWalletConnectionStatus } from "thirdweb/react";


const metaData = [
  "ALCX bribed since last claim: 4000 ALCX",
  "ALCX buyback target: 2000 ALCX",
  "Treasury stablecoin + ETH Balance: 4000 ALCX",
  "Target Balance: 1.5M, Funding Target: 35k",
];

const App = () => {
  console.log(useActiveWalletConnectionStatus())
  return (
    <>
    {/* connected" | "disconnected" | "connecting"; */}
      {
        useActiveWalletConnectionStatus() === "connected" ? (
          <>
          <Navbar />
          <div className="flex flex-col ">
            <div className="flex flex-row gap-10 items-center justify-center ">
              <div className="m-5 flex flex-col gap-4 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                <MetadataCard text={metaData[0]} />
                <MetadataCard text={metaData[1]} />
              </div>
              <div className="m-5 flex flex-col gap-4 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                <MetadataCard text={metaData[2]} />
                <MetadataCard text={metaData[3]} />
              </div>
            </div>
            <div className="flex flex-row gap-10 items-start justify-center px-4">
              <ClaimableRewardsCard />
              <DesiredOutputCard />
            </div>
            <Button className="w-[100px] place-self-center">SWAP</Button>
          </div>
          </>
        ) : (
          <AuthenticationPage/>
        )
      }
      <Footer/>
    </>
  );
};

export default App;
