import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronDown, Loader2, Users, MapPin, TrendingUp, FileText } from "lucide-react";
import { getCompanyCandidates } from "../../lib/api";
import { useIsMobile } from "../hooks/useIsMobile";

const AVATAR_COLORS = [
  "var(--color-primary)", "var(--color-primary-dark)", "var(--color-success)",
  "var(--color-warning)", "var(--color-danger)",
];

export function CompanyCandidates() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState("matchScore");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompanyCandidates();
        setCandidates(data.candidates || []);
      } catch (err) {
        console.error("Load candidates error:", err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = candidates
    .filter(c => !search || c.candidateName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "matchScore") return (b.matchScore || 0) - (a.matchScore || 0);
      return new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime();
    });

  const totalLayak = candidates.filter(c => c.wageStatus === "LAYAK").length;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((s, c) => s + (c.matchScore || 0), 0) / candidates.length)
    : 0;

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px", background: "var(--color-bg)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "var(--color-text)", margin: "0 0 6px" }}>
          Daftar Kandidat
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
          {loading ? "Memuat data..." : `${candidates.length} kandidat telah melamar lowongan kamu`}
        </p>
      </div>

      {/* Stats */}
      {!loading && candidates.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Kandidat", value: candidates.length, icon: Users, color: "var(--color-primary)" },
            { label: "Rata-rata Match", value: `${avgScore}%`, icon: TrendingUp, color: "var(--color-success)" },
            { label: "Upah Layak", value: `${totalLayak}/${candidates.length}`, icon: FileText, color: "var(--color-warning)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{
              background: "var(--color-surface)", borderRadius: "var(--radius-md)",
              padding: "16px 18px", boxShadow: "var(--shadow-xs)", border: "1px solid var(--color-border)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${color} 12%, white)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={color} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--color-text)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} color="var(--color-text-subtle)" strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Cari nama kandidat..."
            style={{
              width: "100%", padding: "10px 14px 10px 42px", borderRadius: "var(--radius-sm)", fontSize: 14,
              border: `1.5px solid ${searchFocused ? "var(--color-primary)" : "var(--color-border)"}`,
              outline: searchFocused ? `3px solid var(--color-primary-light)` : "none",
              background: searchFocused ? "var(--color-surface)" : "var(--color-surface-raised)",
              boxSizing: "border-box" as const,
              fontFamily: "var(--font-body)", color: "var(--color-text)", transition: "border-color 0.15s, background 0.15s",
            }} />
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: "10px 38px 10px 14px", borderRadius: "var(--radius-sm)", fontSize: 14,
            border: "1.5px solid var(--color-border)", background: "var(--color-surface-raised)",
            cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--color-text-muted)",
            appearance: "none", outline: "none", width: isMobile ? "100%" : "auto",
          }}>
            <option value="matchScore">Match Score Tertinggi</option>
            <option value="terbaru">Terbaru</option>
          </select>
          <ChevronDown size={14} color="var(--color-text-subtle)" strokeWidth={1.5} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 10, color: "var(--color-text-muted)" }}>
          <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Memuat kandidat...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--radius-full)", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Users size={28} color="var(--color-text-subtle)" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
            {candidates.length === 0 ? "Belum ada kandidat" : "Kandidat tidak ditemukan"}
          </div>
          <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            {candidates.length === 0
              ? "Kandidat akan muncul di sini setelah melamar lowongan kamu."
              : "Coba kata kunci lain."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c, idx) => {
            const isLayak = c.wageStatus === "LAYAK";
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const initials = (c.candidateName || "??").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
            const score = c.matchScore || 0;
            const scoreColor = score >= 80 ? "var(--color-success)" : score >= 60 ? "var(--color-warning)" : "var(--color-danger)";
            const scoreBg = score >= 80 ? "#dcfce7" : score >= 60 ? "#fef3c7" : "#fee2e2";

            return (
              <div key={c.candidateId} style={{
                background: "var(--color-surface)", borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)",
                transition: "box-shadow 0.2s, border-color 0.2s", overflow: "hidden",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--color-border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
              >
                {isMobile ? (
                  /* ── MOBILE CARD LAYOUT ── */
                  <div style={{ padding: "16px" }}>
                    {/* Row 1: Avatar + Name + Tags */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-full)", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{initials}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.candidateName}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {c.disabilityType && (
                            <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 11, fontWeight: 600 }}>
                              {c.disabilityType}
                            </span>
                          )}
                          {c.location && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 11 }}>
                              <MapPin size={9} strokeWidth={1.5} />{c.location}
                            </span>
                          )}
                          {c.jobTitle && (
                            <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 11 }}>
                              {c.jobTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Score + Wage + Button */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-border)" }}>
                      {/* Score circle */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: "var(--radius-full)",
                          background: scoreBg, border: `2px solid ${scoreColor}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{Math.round(score)}%</span>
                        </div>
                        <span style={{ fontSize: 9, color: scoreColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Match</span>
                      </div>


                      {/* Wage badge */}
                      <span style={{
                        padding: "5px 10px",
                        borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700,
                        background: isLayak ? "#dcfce7" : "#fee2e2",
                        color: isLayak ? "var(--color-success)" : "var(--color-danger)",
                        border: `1px solid ${isLayak ? "#bbf7d0" : "#fecaca"}`,
                        whiteSpace: "nowrap",
                      }}>
                        {isLayak ? "✓ Layak" : "✗ Tdk Layak"}
                      </span>

                      {/* Spacer */}
                      <div style={{ flex: 1 }} />

                      {/* Action button */}
                      <button onClick={() => navigate(`/perusahaan/laporan/${c.candidateId}`)} style={{
                        padding: "7px 14px", borderRadius: "var(--radius-md)",
                        border: `1.5px solid var(--color-primary)`,
                        background: "var(--color-primary)", color: "white",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: 5,
                        flexShrink: 0,
                      }}>
                        <FileText size={13} strokeWidth={1.5} />
                        Laporan
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── DESKTOP CARD LAYOUT ── */
                  <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Avatar */}
                    <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{initials}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}>{c.candidateName}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {c.disabilityType && (
                          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 12, fontWeight: 600 }}>
                            {c.disabilityType}
                          </span>
                        )}
                        {c.location && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12 }}>
                            <MapPin size={10} strokeWidth={1.5} />{c.location}
                          </span>
                        )}
                        {c.jobTitle && (
                          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 12 }}>
                            {c.jobTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: "var(--radius-full)",
                        background: scoreBg, border: `2px solid ${scoreColor}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}%</span>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--color-text-subtle)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Match</div>
                    </div>

                    {/* Wage badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        display: "block", textAlign: "center", padding: "6px 14px",
                        borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 700,
                        background: isLayak ? "#dcfce7" : "#fee2e2",
                        color: isLayak ? "var(--color-success)" : "var(--color-danger)",
                        border: `1px solid ${isLayak ? "#bbf7d0" : "#fecaca"}`,
                        whiteSpace: "nowrap",
                      }}>
                        {isLayak ? "✓ Layak" : "✗ Tidak Layak"}
                      </span>
                    </div>

                    {/* Action */}
                    <button onClick={() => navigate(`/perusahaan/laporan/${c.candidateId}`)} style={{
                      flexShrink: 0, padding: "8px 16px", borderRadius: "var(--radius-md)",
                      border: `1.5px solid var(--color-primary)`,
                      background: "var(--color-surface)", color: "var(--color-primary)",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary)"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                    >
                      <FileText size={14} strokeWidth={1.5} />
                      Lihat Laporan
                    </button>
                  </div>
                )}
              </div>

            );
          })}
        </div>
      )}
    </div>
  );
}
