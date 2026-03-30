import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Bot, Menu, X } from "lucide-react";
import { useTriageDrawer } from "../../context/TriageDrawerContext";
import Sidebar from "./Sidebar";

const FAB_ACCENT = "#EB5928";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openTriage, triageOpen } = useTriageDrawer();

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {/*
        overflow:hidden here — each page is responsible for its own scroll.
        Chat needs a fixed-height flex column; other pages get a scrollable wrapper.
      */}
      <main className="app-main">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              borderRadius: 10,
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {mobileOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
            Menu
          </button>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-primary)" }}>AlertIQ</div>
          <div style={{ width: 64 }} />
        </div>
        <Outlet />
      </main>

      {!triageOpen && (
        <button
          type="button"
          aria-label="Open triage assistant"
          aria-haspopup="dialog"
          onClick={openTriage}
          style={{
            position: "fixed",
            zIndex: 280,
            right: "max(20px, env(safe-area-inset-right))",
            bottom: "max(20px, env(safe-area-inset-bottom))",
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: FAB_ACCENT,
            color: "#fff",
            boxShadow: "0 6px 24px rgba(235,89,40,0.45), 0 2px 8px rgba(0,0,0,0.2)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.boxShadow = "0 8px 28px rgba(235,89,40,0.5), 0 4px 12px rgba(0,0,0,0.22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(235,89,40,0.45), 0 2px 8px rgba(0,0,0,0.2)";
          }}
        >
          <Bot style={{ width: 28, height: 28 }} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}
