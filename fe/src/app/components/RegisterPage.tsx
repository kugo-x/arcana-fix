import React, { useState } from "react";
import { useNavigate } from "react-router";
import { User, Building2, Eye, EyeOff } from "lucide-react";
import { register } from "../../lib/api";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

function BrandPanel() {
  return (
    <div style={{
      width: "50%", flexShrink: 0,
      background: "var(--color-primary)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "64px 56px", position: "relative", overflow: "hidden", minHeight: "100vh",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "300px 300px",
      }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.1 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: -200 + i * 80, top: -40, width: 1, height: "160%", background: "white", transform: "rotate(20deg)", transformOrigin: "top center" }} />
        ))}
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="Arcana Logo" style={{ height: 72, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.7, fontStyle: "italic", margin: 0, fontFamily: "var(--font-body)" }}>
          "Kami tidak hanya menghubungkan orang dengan kerja — kami memastikan keadilan hukum terjadi di setiap kontrak kerja."
        </p>
        <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10, opacity: 0.2 }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "white" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [role, setRole] = useState<"kandidat" | "perusahaan" | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 14,
    border: `1.5px solid ${focused === name ? "var(--color-primary)" : "var(--color-border)"}`,
    outline: focused === name ? `3px solid var(--color-primary-light)` : "none",
    outlineOffset: "0px",
    background: focused === name ? "var(--color-surface)" : "var(--color-surface-raised)",
    boxSizing: "border-box" as const,
    fontFamily: "var(--font-body)", color: "var(--color-text)",
    transition: "border-color 0.15s, background 0.15s",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { setError("Pilih peran terlebih dahulu"); return; }
    if (!nama.trim()) { setError("Nama lengkap wajib diisi"); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter"); return; }
    setError(null);
    setLoading(true);
    try {
      const data = await register(email, password, nama, role);
      setUser({ id: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role });
      navigate(role === "kandidat" ? "/kandidat/profile" : "/perusahaan/post-job");
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      {!isMobile && <BrandPanel />}
      <div style={{ flex: 1, background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "32px 20px" : "48px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24, justifyContent: "center" }}>
              <img src="/logo.png" alt="Arcana Logo" style={{ height: 52, width: "auto", objectFit: "contain" }} />
            </div>
          )}
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 24 : 32, fontWeight: 700, color: "var(--color-text)", margin: "0 0 6px" }}>Buat Akun</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 28, fontSize: 14 }}>Pilih peranmu untuk memulai.</p>

          {/* Role selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {([
              { key: "kandidat" as const, label: "Saya Pencari Kerja", icon: <User size={26} strokeWidth={1.5} /> },
              { key: "perusahaan" as const, label: "Saya Perusahaan", icon: <Building2 size={26} strokeWidth={1.5} /> },
            ]).map(({ key, label, icon }) => {
              const selected = role === key;
              return (
                <button key={key} type="button" onClick={() => setRole(key)} style={{
                  position: "relative", padding: "20px 12px 16px", borderRadius: "var(--radius-md)",
                  border: `${selected ? "2px" : "1.5px"} solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: selected ? "var(--color-primary-light)" : "var(--color-surface)",
                  cursor: "pointer", textAlign: "center",
                  boxShadow: selected ? `0 0 0 3px var(--color-primary-light)` : "none",
                  outline: "none", transition: "all 0.15s",
                }}>
                  {selected && <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)" }} />}
                  <div style={{ color: selected ? "var(--color-primary)" : "var(--color-text-subtle)", marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--color-primary)" : "var(--color-text-muted)" }}>{label}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>Nama Lengkap</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)}
                onFocus={() => setFocused("nama")} onBlur={() => setFocused(null)}
                placeholder="Nama lengkap kamu" style={inputStyle("nama")} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                placeholder="kamu@email.com" style={inputStyle("email")} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  placeholder="Minimal 8 karakter" style={{ ...inputStyle("password"), paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-subtle)", display: "flex" }}>
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "#fee2e2", color: "var(--color-danger)", fontSize: 13, border: "1px solid #fecaca" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !role} style={{
              width: "100%", padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none",
              background: role && !loading ? "var(--color-primary)" : "var(--color-border-strong)",
              color: "white", fontSize: 14, fontWeight: 500,
              cursor: role && !loading ? "pointer" : "not-allowed",
              fontFamily: "var(--font-body)", transition: "background 0.15s",
            }}>
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
            Sudah punya akun?{" "}
            <span onClick={() => navigate("/login")} style={{ color: "var(--color-primary)", cursor: "pointer", fontWeight: 600 }}>Masuk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
