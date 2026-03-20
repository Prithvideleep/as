import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    </div>
  );
}
