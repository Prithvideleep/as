import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Bot, Menu, X, LayoutDashboard } from "lucide-react";
import { useTriageDrawer } from "../../context/TriageDrawerContext";
import Sidebar from "./Sidebar";
import optumLogo from "../../assets/optum-logo.svg";

const FAB_ACCENT = "#EB5928";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openTriage, triageOpen } = useTriageDrawer();

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── Global top bar — full width ──────────────────────────────── */}
      <div
        className="app-topbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px",
          height: 52,
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
        }}
      >
        {/* Optum logo */}
        <img
          src={optumLogo}
          alt="Optum"
          style={{ height: 28, width: "auto", flexShrink: 0, objectFit: "contain" }}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 24, backgroundColor: "var(--color-border)", flexShrink: 0 }} />

        {/* Page title — centred */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            padding: "5px 18px",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            backgroundColor: "var(--color-bg-primary)",
            maxWidth: 280,
            margin: "0 auto",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Alert IQ Dashboard
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", flexShrink: 0 }}>
          <button
            type="button"
            title="Dashboard tools (placeholder)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "#6366F1",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <LayoutDashboard style={{ width: 16, height: 16 }} />
          </button>

          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
            Admin
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                flexShrink: 0,
              }}
            >
              U
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
              User
            </span>
          </div>
        </div>
      </div>

      {/* ── Body row: sidebar + main ─────────────────────────────────── */}
      <div className="app-body">
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
