
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from "./pages/Transaction";
import { MainPage } from "./pages/MainPage";
import { ProtectedRoute } from "./providers/ProtectedRoute";
import GlobalStateProvider from "./context/store";



const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
};




const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/transaction" element={
              <Transaction />
            // <ProtectedRoute>
            // </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
