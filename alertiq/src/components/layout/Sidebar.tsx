import { Link, useLocation, matchPath, type Location } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Network,
  ShieldAlert,
} from "lucide-react";

const SIDEBAR_BG   = "#1C1C28";
const SIDEBAR_BORDER = "rgba(255,255,255,0.07)";
const ACTIVE_BG    = "rgba(235,89,40,0.15)";
const ACTIVE_COLOR = "#EB5928";
const IDLE_COLOR   = "rgba(255,255,255,0.55)";
const HOVER_BG     = "rgba(255,255,255,0.06)";
const HOVER_COLOR  = "rgba(255,255,255,0.9)";

const navItems = [
  { to: "/",              icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/investigation", icon: Search,          label: "Investigation" },
  { to: "/topology",      icon: Network,         label: "Topology"      },
] as const;

function navItemActive(location: Location, item: (typeof navItems)[number]): boolean {
  const path = item.to.split("?")[0];
  if (item.to === "/") return location.pathname === "/";
  return !!matchPath({ path, end: true }, location.pathname);
}

export default function Sidebar({
  mobileOpen = false,
  onNavigate,
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <aside
      className="sidebar"
      data-open={mobileOpen ? "true" : "false"}
      style={{
        backgroundColor: SIDEBAR_BG,
        borderRight: `1px solid ${SIDEBAR_BORDER}`,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 20px 18px",
          borderBottom: `1px solid ${SIDEBAR_BORDER}`,
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: ACTIVE_COLOR,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldAlert style={{ width: 18, height: 18, color: "#fff" }} />
        </div>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.3px" }}>
            AlertIQ
          </span>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
            SmartSwarm
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "4px 10px 8px" }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const { to, icon: Icon, label } = item;
          const active = navItemActive(location, item);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s, color 0.15s",
                color: active ? ACTIVE_COLOR : IDLE_COLOR,
                backgroundColor: active ? ACTIVE_BG : "transparent",
                borderLeft: active ? `3px solid ${ACTIVE_COLOR}` : "3px solid transparent",
              }}
              onClick={() => onNavigate?.()}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = HOVER_BG;
                  e.currentTarget.style.color = HOVER_COLOR;
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = active ? ACTIVE_BG : "transparent";
                el.style.color = active ? ACTIVE_COLOR : IDLE_COLOR;
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>v1.0.0</p>
      </div>
    </aside>
  );
}
