// import { useActiveWalletConnectionStatus } from "thirdweb/react";
// import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Transaction } from "./pages/Transaction";
import { MainPage } from "./pages/MainPage";
import { ProtectedRoute } from "./providers/ProtectedRoute";
import GlobalStateProvider from "./context/store";

interface BaseMetadata {
  key: string;
}

interface SingleValueMetadata extends BaseMetadata {
  value: string;
}

interface MultipleValueMetadata extends BaseMetadata {
  values: Array<{ label: string; value: string }>;
}

interface MetadataItem {
  key: string;
  value?: string;
  subValues?: { label: string; value: string }[];
}

interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
}

interface AssetChanges {
  [token: string]: {
    amount: number;
    rawAmount: bigint;
  };
}

interface EnsoTx {
  data: string;
  to: string;
  value: string;
  assetChanges: {
    claim: AssetChanges;
    claimAndSwap: AssetChanges;
  };
}

const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null;
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/transaction"
            element={
              <Transaction />
              // <ProtectedRoute>
              // </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
