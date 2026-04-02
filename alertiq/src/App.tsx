import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { TriageDrawerProvider } from "./context/TriageDrawerContext";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import IncidentsPage from "./pages/IncidentsPage";
import HistoryPage from "./pages/HistoryPage";
import AlertDetailsPage from "./pages/AlertDetailsPage";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";
import ChangesPage from "./pages/ChangesPage";
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
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/alert-details" element={<AlertDetailsPage />} />
              <Route path="/incident-details" element={<IncidentDetailsPage />} />
              <Route path="/changes" element={<ChangesPage />} />
              <Route path="/investigation" element={<InvestigationPage />} />
              <Route path="/topology" element={<TopologyPage />} />
              <Route path="/chat" element={<Navigate to="/?triage=1" replace />} />
            </Route>
          </Routes>
        </TriageDrawerProvider>
      </BrowserRouter>
    </AppProvider>
  );
}
