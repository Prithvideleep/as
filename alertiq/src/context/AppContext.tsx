import { createContext, useContext, useState, type ReactNode } from "react";
import {
  incidents,
  incidentDetails,
  topologyData,
  type IncidentDetail,
  type TopologyData,
} from "../data/mockData";

interface AppContextType {
  selectedIncidentId: string;
  setSelectedIncidentId: (id: string) => void;
  incidentData: IncidentDetail;
  topologyForIncident: TopologyData;
  /** Pre-built context message to auto-send when opening Triage from Investigation */
  pendingChatContext: string | null;
  setPendingChatContext: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_ID = incidents[0].id;

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(DEFAULT_ID);
  const [pendingChatContext, setPendingChatContext] = useState<string | null>(null);

  const incidentData = incidentDetails[selectedIncidentId];
  const topologyForIncident = topologyData[selectedIncidentId];

  return (
    <AppContext.Provider
      value={{
        selectedIncidentId,
        setSelectedIncidentId,
        incidentData,
        topologyForIncident,
        pendingChatContext,
        setPendingChatContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
