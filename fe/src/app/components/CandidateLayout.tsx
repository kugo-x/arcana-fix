import { Outlet, useNavigate, useLocation } from "react-router";
import { User, Search, BarChart2, LogOut, Calculator } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

const NAV_ITEMS = [
  { label: "Profil Saya", icon: User, path: "/kandidat/profile" },
  { label: "Cari Kerja", icon: Search, path: "/kandidat/jobs" },
  { label: "Hasil Matching", icon: BarChart2, path: "/kandidat/hasil" },
  { label: "Simulator Upah", icon: Calculator, path: "/kandidat/simulator-upah" },
];

// Bottom nav excludes Profile (profile accessible via top bar avatar)
const MOBILE_NAV = NAV_ITEMS.slice(1);

export function CandidateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
        {/* Mobile top header */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          boxShadow: "var(--shadow-xs)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="ARCANA Logo" style={{ height: 36, width: "auto", objectFit: "contain", display: "block" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.2px" }}>ARCANA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Profile avatar - click to go to profile */}
            <div
              onClick={() => navigate("/kandidat/profile")}
              style={{
                width: 34, height: 34, borderRadius: "var(--radius-full)",
                background: "var(--color-primary)", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                border: location.pathname === "/kandidat/profile" ? "2px solid var(--color-primary-dark)" : "2px solid transparent",
              }}
            >
              <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{initials}</span>
            </div>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                padding: "6px 12px",
                cursor: "pointer", color: "var(--color-text-muted)",
                fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 500,
              }}
            >
              <LogOut size={13} strokeWidth={1.5} />
              Keluar
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ marginTop: 56, marginBottom: 64, flex: 1, background: "var(--color-bg)" }}>
          <Outlet />
        </div>

        {/* Mobile bottom tab bar - no profile item */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          display: "flex", height: 64,
          boxShadow: "0 -1px 4px rgba(0,0,0,0.06)",
        }}>
          {MOBILE_NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path ||
              (path === "/kandidat/jobs" && location.pathname.startsWith("/kandidat/jobs/"));
            const shortLabel = label === "Cari Kerja" ? "Cari" :
              label === "Hasil Matching" ? "Matching" : "Simulator";
            return (
              <div
                key={path}
                onClick={() => navigate(path)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 3, cursor: "pointer",
                  borderTop: `2px solid ${active ? "var(--color-primary)" : "transparent"}`,
                  background: active ? "var(--color-primary-light)" : "transparent",
                  padding: "6px 2px 4px",
                  transition: "background 0.15s",
                }}
              >
                <Icon size={18} color={active ? "var(--color-primary)" : "var(--color-text-subtle)"} strokeWidth={1.5} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? "var(--color-primary)" : "var(--color-text-subtle)", lineHeight: 1 }}>
                  {shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      {/* ── SIDEBAR ── */}
      <div style={{
        width: 240, flexShrink: 0,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 40,
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xs)",
      }}>
        <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="ARCANA Logo" style={{ height: 44, width: "auto", objectFit: "contain", display: "block", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1 }}>ARCANA</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path ||
              (path === "/kandidat/jobs" && location.pathname.startsWith("/kandidat/jobs/"));
            return (
              <div
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 20px", cursor: "pointer",
                  borderLeft: `2px solid ${active ? "var(--color-primary)" : "transparent"}`,
                  background: active ? "var(--color-primary-light)" : "transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--color-surface-raised)"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}
              >
                <Icon size={17} color={active ? "var(--color-primary)" : "var(--color-text-muted)"} strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}>{label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{user?.name || "Kandidat"}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-subtle)", marginTop: 1 }}>Kandidat</div>
            </div>
          </div>
          <div
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 20px", cursor: "pointer",
              borderTop: "1px solid var(--color-border)",
              borderLeft: "2px solid transparent",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface-raised)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={17} color="var(--color-text-subtle)" strokeWidth={1.5} />
            <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>Keluar</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: 240, flex: 1, background: "var(--color-bg)", minHeight: "100vh" }}>
        <Outlet />
      </div>
    </div>
  );
}
