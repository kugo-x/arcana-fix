import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, ArrowRight, CheckCircle, Loader2, MapPin, Briefcase, Users } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { getVerifiedEmployers } from "../../lib/api";

const FILTERS = ["Semua", "Teknologi", "Manufaktur", "Kesehatan", "Pendidikan", "Jasa", "Lainnya"];

function SmallBadge() {
  const size = 32, cx = size / 2, cy = size / 2;
  const r = size * 0.42;
  const oct = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => {
    const rad = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`;
  }).join(" ");
  const innerR = r * 0.78;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={oct} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="var(--color-primary)" />
      <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif">✓</text>
    </svg>
  );
}

function CompanyCard({ company }: { company: any }) {
  const [hovered, setHovered] = useState(false);
  const initials = company.name.replace(/^(PT|CV|UD)\s*/i, "").slice(0, 2).toUpperCase();
  const joinedYear = company.joinedAt ? new Date(company.joinedAt).getFullYear() : 2026;
  const joinedMonth = company.joinedAt ? new Date(company.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "2026";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: 24,
        border: `1px solid ${hovered ? "var(--color-border-strong)" : "var(--color-border)"}`,
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "all 0.2s ease", cursor: "pointer",
        display: "flex", flexDirection: "column" as const, gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ width: 52, height: 52, borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>{initials}</span>
        </div>
        <SmallBadge />
      </div>

      {/* Name + Industry */}
      <div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 6, lineHeight: 1.3 }}>{company.name}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          <span style={{ display: "inline-block", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)" }}>
            {company.industry}
          </span>
          {company.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)" }}>
              <MapPin size={10} strokeWidth={1.5} />{company.location}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "var(--color-surface-raised)", borderRadius: "var(--radius-md)", padding: "12px 14px", display: "flex", flexDirection: "column" as const, gap: 7, border: "1px solid var(--color-border)" }}>
        {[
          { label: "Lowongan aktif", value: `${company.jobCount} lowongan`, icon: Briefcase },
          { label: "Kandidat disabilitas", value: `${company.disabilityCount} orang`, icon: Users },
          { label: "Compliance Score", value: `${company.complianceScore}%`, icon: null },
          { label: "Bergabung", value: joinedMonth, icon: null },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Wage badge */}
      {company.wageCompliant && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "#dcfce7", border: "1px solid #bbf7d0", fontSize: 12, fontWeight: 600, color: "var(--color-success)", alignSelf: "flex-start" as const }}>
          <CheckCircle size={11} strokeWidth={2.5} /> 100% Wage-Compliant
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--color-primary)", fontSize: 13, fontWeight: 600, marginTop: "auto" }}>
        Lihat Profil <ArrowRight size={14} />
      </div>
    </div>
  );
}

export function VerifiedEmployers() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCompanies: 0, totalPlaced: 0, wageCompliantPct: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVerifiedEmployers()
      .then(data => {
        setCompanies(data.companies || []);
        setStats(data.stats || { totalCompanies: 0, totalPlaced: 0, wageCompliantPct: 0 });
      })
      .catch(() => { setCompanies([]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "Semua"
    ? companies
    : companies.filter(c => c.industry === activeFilter);

  // Industri yang benar-benar ada di data
  const availableFilters = ["Semua", ...FILTERS.slice(1).filter(f => companies.some(c => c.industry === f))];

  return (
    <div style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: isMobile ? "0 16px" : "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, background: "var(--color-primary)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={16} color="white" strokeWidth={1.5} />
            </div>
            <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontSize: isMobile ? 17 : 20, fontWeight: 700, letterSpacing: "-0.2px" }}>Arcana</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/login")} style={{ padding: isMobile ? "7px 12px" : "8px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-body)" }}>
              Masuk
            </button>
            {!isMobile && (
              <button onClick={() => navigate("/register")} style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--color-primary)", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-body)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-dark)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--color-primary)"; }}>
                Registrasi
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "var(--color-surface)", padding: isMobile ? "48px 20px 40px" : "72px 40px 56px", textAlign: "center", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--color-primary-light)", borderRadius: "var(--radius-full)", padding: "6px 14px", marginBottom: 20, border: "1px solid rgba(18,116,122,0.2)" }}>
            <CheckCircle size={13} color="var(--color-primary)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>Komunitas Employer Inklusif Indonesia</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: isMobile ? 28 : 48, letterSpacing: isMobile ? "-0.5px" : "-1px", lineHeight: 1.1, marginBottom: 16 }}>
            Perusahaan yang Berkomitmen<br />pada Inklusi
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
            Mereka telah memenuhi standar rekrutmen inklusif dan keadilan upah berbasis UU No. 8/2016.
          </p>

          {/* Stats dari database */}
          <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 24 : 56, flexWrap: "wrap" as const }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: 14 }}>
                <Loader2 size={16} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Memuat data...
              </div>
            ) : [
              { value: String(stats.totalCompanies), label: "Perusahaan Terdaftar" },
              { value: String(stats.totalPlaced), label: "Kandidat Diproses" },
              { value: `${stats.wageCompliantPct}%`, label: "Wage-Compliant" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 24 : 32, fontWeight: 700, color: "var(--color-primary)", letterSpacing: "-1px" }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: isMobile ? "24px 16px 0" : "36px 40px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" as const }}>
          {availableFilters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: isMobile ? "7px 16px" : "8px 20px", borderRadius: "var(--radius-full)",
              border: activeFilter === f ? "none" : "1.5px solid var(--color-border)",
              background: activeFilter === f ? "var(--color-primary)" : "var(--color-surface)",
              color: activeFilter === f ? "white" : "var(--color-text-muted)",
              cursor: "pointer", fontSize: isMobile ? 13 : 14, fontWeight: activeFilter === f ? 600 : 500,
              fontFamily: "var(--font-body)", transition: "all 0.15s",
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* COMPANY GRID */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: isMobile ? "24px 16px 60px" : "32px 40px 72px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, gap: 10, color: "var(--color-text-muted)" }}>
            <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
            Memuat daftar perusahaan...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)", fontSize: 15 }}>
            {companies.length === 0
              ? "Belum ada perusahaan yang terdaftar. Jadilah yang pertama!"
              : "Belum ada perusahaan di kategori ini."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 16 : 20 }}>
            {filtered.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <section style={{ background: "var(--color-surface)", padding: isMobile ? "56px 20px" : "72px 40px", textAlign: "center", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text)", fontSize: isMobile ? 28 : 36, letterSpacing: "-0.5px", marginBottom: 14 }}>
            Daftarkan Perusahaan Anda
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Bergabunglah dengan komunitas employer inklusif Indonesia.
          </p>
          <button onClick={() => navigate("/register")} style={{ height: 50, padding: "0 32px", borderRadius: "var(--radius-full)", background: "var(--color-primary)", color: "white", border: "none", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "var(--shadow-md)", transition: "background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-dark)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-primary)"; }}>
            Mulai Sekarang
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--color-text)", padding: isMobile ? "24px 16px" : "28px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 14 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, background: "var(--color-primary)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={14} color="white" strokeWidth={1.5} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600 }}>Arcana</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privasi", "Ketentuan", "Kontak"].map(link => (
              <span key={link} style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", cursor: "pointer", fontWeight: 500 }}>{link}</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 Arcana</span>
        </div>
      </footer>
    </div>
  );
}
