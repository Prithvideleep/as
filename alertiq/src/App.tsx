import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { TriageDrawerProvider } from "./context/TriageDrawerContext";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import InvestigationPage from "./pages/InvestigationPage";
import TopologyPage from "./pages/TopologyPage";
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <TriageDrawerProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/investigation" element={<InvestigationPage />} />
              <Route path="/topology" element={<TopologyPage />} />
              <Route path="/chat" element={<Navigate to="/?triage=1" replace />} />
              <Route path="/history" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </TriageDrawerProvider>
      </BrowserRouter>
    </AppProvider>
  );
}
