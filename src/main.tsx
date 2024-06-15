import { ThemeProvider } from "@/components/theme-provider";
// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThirdwebProvider } from "thirdweb/react";
import GlobalStateProvider from "../src/context/store.jsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { SWRConfig } from "swr";
function localStorageProvider(){
  // When initializing, we restore the data from `localStorage` into a map.
  const map: any = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'))
 
  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()))
    localStorage.setItem('app-cache', appCache)
  })
  console.log(`datamappp`,map)
  // We still use the map for write & read for performance.
  return map
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GlobalStateProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ThirdwebProvider>
      <SWRConfig value={{ provider: localStorageProvider }}>
  <App/>
</SWRConfig>
        <Toaster />
      </ThirdwebProvider>
    </ThemeProvider>
  </GlobalStateProvider>,
);
