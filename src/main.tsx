import { ThemeProvider } from "@/components/theme-provider"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThirdwebProvider } from "thirdweb/react";
import GlobalStateProvider from "../src/context/store.jsx"
import { Toaster } from "./components/ui/toaster.tsx"


ReactDOM.createRoot(document.getElementById('root')!).render(
  <GlobalStateProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ThirdwebProvider >
        <App />
        <Toaster />
      </ThirdwebProvider>
    </ThemeProvider>
  </GlobalStateProvider>

)
