import Navbar from "./components/header/Navbar";
import DesiredOutputCard from "./components/body/DesiredOutputCard";
import ClaimableRewardsCard from "./components/body/ClaimableRewardsCard";
import MetadataCard from "./components/body/MetadataCard";
import { Button } from "./components/ui/button";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";
import AuthenticationPage from "./components/body/AuthenticationPage";
import Footer from "./components/footer/Footer";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { useState } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";


const metaData = [
  "ALCX bribed since last claim: 4000 ALCX",
  "ALCX buyback target: 2000 ALCX",
  "Treasury stablecoin + ETH Balance: 4000 ALCX",
  "Target Balance: 1.5M, Funding Target: 35k",
];


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PremiumButton from "./components/ui/PremiumButton";

const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

const MainPage = () => {
  const [totalValue, setTotalValue] = useState(0);

  return (
    <>
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
                <ClaimableRewardsCard totalValue={totalValue} setTotalValue={setTotalValue} />
                <DesiredOutputCard totalBalance={totalValue || 0} />
              </div>
            </div>
            <div className="flex justify-center">
          <PremiumButton onClick={() => console.log("clicked")} label="Swap"  />

            </div>
          </>
        ) : (
          <AuthenticationPage />
        )
      }
    </>
  )
}

const Transaction = () => {
  return (
    <>
      <Navbar />
      <div className="">
        <h1>Welcome to transaction page</h1>
      </div>
    </>
  )
}

const App = () => {
  const [totalValue, setTotalValue] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<RedirectToDashboard />} />
        <Route path="/dashboard" element={<MainPage />} />
          <Route path="/transaction" element={<Transaction />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
