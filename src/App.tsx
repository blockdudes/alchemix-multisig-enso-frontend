import { ThemeProvider } from "@/components/theme-provider";
import DashboardPage from "./components/body/DashboardPage";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <DashboardPage></DashboardPage>
      </ThemeProvider>
    </>
  );
}

export default App;
