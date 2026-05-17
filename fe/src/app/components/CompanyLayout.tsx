import { Outlet, useNavigate, useLocation } from "react-router";
import { Building2, FilePlus, Users, LogOut, Scale, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

const NAV_ITEMS = [
  { label: "Profil Perusahaan", icon: Building2, path: "/perusahaan/profil" },
  { label: "Posting Lowongan", icon: FilePlus, path: "/perusahaan/post-job" },
  { label: "Daftar Kandidat", icon: Users, path: "/perusahaan/kandidat" },
  { label: "Kepatuhan UU", icon: Scale, path: "/perusahaan/compliance" },
  { label: "Badge & Sertifikat", icon: Award, path: "/perusahaan/badge" },
];

// Bottom nav excludes Profile (profile accessible via top bar avatar)
const MOBILE_NAV = NAV_ITEMS.slice(1, 5);

export function CompanyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "PH";

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
            <img src="/logo.png" alt="Arcana Logo" style={{ height: 36, width: "auto", objectFit: "contain", display: "block" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.2px" }}>ARCANA</span>
          </div>
          {/* Profile avatar - click to go to profile */}
          <div
            onClick={() => navigate("/perusahaan/profil")}
            style={{
              width: 34, height: 34, borderRadius: "var(--radius-full)",
              background: "var(--color-primary)", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              border: location.pathname === "/perusahaan/profil" ? "2px solid var(--color-primary-dark)" : "2px solid transparent",
            }}
          >
            <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{initials}</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ marginTop: 56, marginBottom: 64, flex: 1, background: "var(--color-bg)", minHeight: "calc(100vh - 120px)" }}>
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
              (path === "/perusahaan/kandidat" && location.pathname.startsWith("/perusahaan/laporan"));
            const shortLabel = label === "Posting Lowongan" ? "Posting" :
              label === "Daftar Kandidat" ? "Kandidat" :
              label === "Kepatuhan UU" ? "Kepatuhan" : "Badge";
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
        {/* Logo */}
        <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="Arcana Logo" style={{ height: 44, width: "auto", objectFit: "contain", display: "block", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1 }}>ARCANA</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path ||
              (path === "/perusahaan/kandidat" && location.pathname.startsWith("/perusahaan/laporan"));
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
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Bottom — avatar + user info + logout icon */}
        <div style={{ borderTop: "1px solid var(--color-border)", padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Perusahaan"}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-subtle)", marginTop: 1 }}>Perusahaan</div>
            </div>
            {/* Icon-only logout button */}
            <button
              onClick={handleLogout}
              title="Keluar"
              style={{
                width: 32, height: 32, borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "var(--color-danger)";
                (e.currentTarget.querySelector('svg') as SVGElement | null)?.setAttribute('color', 'var(--color-danger)');
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--color-border)";
                (e.currentTarget.querySelector('svg') as SVGElement | null)?.setAttribute('color', 'var(--color-text-subtle)');
              }}
            >
              <LogOut size={15} color="var(--color-text-subtle)" strokeWidth={1.5} />
            </button>
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
