import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, ChevronDown, Loader2, Briefcase, Clock, Building2 } from "lucide-react";
import { getJobs } from "../../lib/api";
import { useIsMobile } from "../hooks/useIsMobile";

const AVATAR_COLORS = [
  "var(--color-primary)", "var(--color-primary-dark)", "var(--color-success)",
  "var(--color-warning)", "var(--color-danger)",
];

const LOCATIONS = ["Semua Lokasi", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Medan", "Semarang", "Makassar", "Bekasi", "Depok", "Tangerang"];

export function CandidateJobs() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("Semua Lokasi");
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobs();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Load jobs error:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch =
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      j.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase());
    const matchLoc = locationFilter === "Semua Lokasi" || j.location === locationFilter;
    return matchSearch && matchLoc;
  });

  const getCompanyName = (job: any) => job.company_name || job.companyName || "Perusahaan";
  const getSalary = (job: any) => {
    const raw = job.offered_salary || job.offeredSalary;
    const num = parseInt(String(raw).replace(/\D/g, ""));
    return num ? `Rp ${num.toLocaleString("id-ID")} / bulan` : "Gaji kompetitif";
  };
  const getSkills = (job: any): string[] => job.required_skills || job.requiredSkills || [];

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px", background: "var(--color-bg)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "var(--color-text)", margin: "0 0 6px" }}>
          Cari Kerja
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
          Temukan lowongan yang sesuai dengan kemampuan dan kebutuhanmu.
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} color="var(--color-text-subtle)" strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Cari posisi, perusahaan..."
            style={{
              width: "100%", padding: "11px 14px 11px 42px", borderRadius: "var(--radius-sm)", fontSize: 14,
              border: `1.5px solid ${searchFocused ? "var(--color-primary)" : "var(--color-border)"}`,
              outline: searchFocused ? `3px solid var(--color-primary-light)` : "none",
              background: searchFocused ? "var(--color-surface)" : "var(--color-surface-raised)",
              boxSizing: "border-box" as const,
              fontFamily: "var(--font-body)", color: "var(--color-text)", transition: "border-color 0.15s, background 0.15s",
            }} />
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={{
            padding: "11px 40px 11px 14px", borderRadius: "var(--radius-sm)", fontSize: 14,
            border: "1.5px solid var(--color-border)", background: "var(--color-surface-raised)",
            cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--color-text-muted)",
            appearance: "none", outline: "none", width: isMobile ? "100%" : "auto",
          }}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <ChevronDown size={14} color="var(--color-text-subtle)" strokeWidth={1.5} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Stats bar */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Menampilkan <strong style={{ color: "var(--color-text)" }}>{filtered.length}</strong> lowongan
          </span>
          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 12, fontWeight: 600 }}>
            Semua Aksesibel
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 10, color: "var(--color-text-muted)" }}>
          <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Memuat lowongan...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Briefcase size={28} color="var(--color-text-subtle)" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
            {jobs.length === 0 ? "Belum ada lowongan" : "Lowongan tidak ditemukan"}
          </div>
          <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            {jobs.length === 0 ? "Perusahaan belum memposting lowongan. Coba lagi nanti." : "Coba ubah kata kunci atau filter lokasi."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map((job, idx) => {
            const hovered = hoveredCard === job.id;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const companyName = getCompanyName(job);
            const initials = companyName.replace(/^(PT|CV|UD)\s*/i, "").slice(0, 2).toUpperCase();
            const salary = getSalary(job);
            const skills = getSkills(job);

            return (
              <div
                key={job.id}
                onMouseEnter={() => setHoveredCard(job.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: "var(--color-surface)", borderRadius: "var(--radius-lg)",
                  border: `1px solid ${hovered ? "var(--color-border-strong)" : "var(--color-border)"}`,
                  borderTop: `3px solid ${hovered ? "var(--color-primary)" : "var(--color-border)"}`,
                  boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
                  transition: "all 0.2s", overflow: "hidden", display: "flex", flexDirection: "column",
                }}
              >
                {/* Card header */}
                <div style={{ padding: "20px 20px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "var(--radius-md)",
                      background: avatarColor, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{initials}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500, marginBottom: 3 }}>{companyName}</div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.25 }}>{job.title}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500 }}>
                      <MapPin size={11} strokeWidth={1.5} />{job.location}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500 }}>
                      <Building2 size={11} strokeWidth={1.5} />Full-time
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 12, fontWeight: 600 }}>
                      Aksesibel
                    </span>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {skills.slice(0, 3).map((s: string) => (
                        <span key={s} style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12, border: "1px solid var(--color-border)" }}>{s}</span>
                      ))}
                      {skills.length > 3 && (
                        <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-subtle)", fontSize: 12 }}>+{skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Salary */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--color-primary)" }}>{salary}</div>
                  </div>
                </div>

                {/* Card footer */}
                <div style={{ padding: "0 20px 20px", marginTop: "auto", display: "flex", gap: 10 }}>
                  <button
                    onClick={() => navigate(`/kandidat/jobs/${job.id}`)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "var(--radius-md)",
                      border: `1.5px solid var(--color-primary)`,
                      background: "var(--color-surface)", color: "var(--color-primary)",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-body)", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-light)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface)"; }}
                  >
                    Cek Kecocokan
                  </button>
                  <button
                    onClick={() => navigate(`/kandidat/jobs/${job.id}?action=apply`)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "var(--radius-md)",
                      border: "none", background: "var(--color-primary)",
                      color: "white", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "var(--font-body)", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-dark)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--color-primary)"; }}
                  >
                    Lamar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
