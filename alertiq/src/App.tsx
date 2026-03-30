import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import InvestigationPage from "./pages/InvestigationPage";
import TopologyPage from "./pages/TopologyPage";
import ChatPage from "./pages/ChatPage";
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/investigation" element={<InvestigationPage />} />
            <Route path="/topology" element={<TopologyPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/history" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
