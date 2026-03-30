import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAppContext } from "./AppContext";
import TriageDrawer from "../components/triage/TriageDrawer";
import { buildInvestigationTriageContextMessage } from "../lib/buildInvestigationTriageContextMessage";

interface TriageDrawerContextValue {
  openTriage: () => void;
  closeTriage: () => void;
  triageOpen: boolean;
}

const TriageDrawerContext = createContext<TriageDrawerContextValue | null>(null);

export function TriageDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { incidentData, setPendingChatContext } = useAppContext();

  const openTriage = useCallback(() => {
    if (pathname === "/investigation") {
      setPendingChatContext(buildInvestigationTriageContextMessage(incidentData));
    } else {
      setPendingChatContext(null);
    }
    setOpen(true);
  }, [pathname, incidentData, setPendingChatContext]);

  useEffect(() => {
    if (searchParams.get("triage") !== "1") return;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("triage");
        return p;
      },
      { replace: true }
    );
    openTriage();
  }, [searchParams, setSearchParams, openTriage]);

  const closeTriage = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openTriage, closeTriage, triageOpen: open }),
    [openTriage, closeTriage, open]
  );

  return (
    <TriageDrawerContext.Provider value={value}>
      {children}
      <TriageDrawer open={open} onClose={closeTriage} />
    </TriageDrawerContext.Provider>
  );
}

export function useTriageDrawer() {
  const ctx = useContext(TriageDrawerContext);
  if (!ctx) throw new Error("useTriageDrawer must be used within TriageDrawerProvider");
  return ctx;
}
