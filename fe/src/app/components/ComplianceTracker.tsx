import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { getComplianceData } from "../../lib/api";

function ScoreArc({ score }: { score: number }) {
  const size = 140, stroke = 10;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "var(--color-primary)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: 11, color: "var(--color-text-subtle)", marginTop: 4, fontWeight: 500 }}>Skor</span>
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height: 10, borderRadius: "var(--radius-full)", background: "var(--color-border)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${width}%`, background: "var(--color-primary)", borderRadius: "var(--radius-full)", transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--color-surface)", borderRadius: 16,
  border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)",
};
const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.1em",
  textTransform: "uppercase", marginBottom: 20,
};

export function ComplianceTracker() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getComplianceData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const p = isMobile ? "20px 16px" : "32px 32px";
  const formatRp = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  if (loading) return (
    <div style={{ padding: p, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 10, color: "var(--color-text-muted)" }}>
      <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Memuat data kepatuhan...
    </div>
  );

  if (!data || !data.hasProfile) return (
    <div style={{ padding: p }}>
      <div style={{ ...card, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>Profil Perusahaan Belum Dibuat</div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20 }}>Buat profil perusahaan terlebih dahulu untuk melihat data kepatuhan.</div>
        <button onClick={() => navigate("/perusahaan/profil")} style={{ padding: "10px 24px", borderRadius: "var(--radius-full)", border: "none", background: "var(--color-primary)", color: "white", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>
          Lengkapi Profil
        </button>
      </div>
    </div>
  );

  const score: number = data.complianceScore ?? 0;
  const stats = data.stats ?? {};
  const jobs: any[] = data.jobs ?? [];
  const timeline: any[] = data.timeline ?? [];
  const scoreColor = score >= 80 ? "var(--color-success)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)";
  const statusLabel = score >= 80 ? "Patuh" : score >= 50 ? "Perlu Perhatian" : "Tidak Patuh";

  const disabilityFulfilled = stats.disabilityCandidates ?? 0;
  const disabilityRequired = stats.requiredDisability ?? 1;
  const disabilityPct = Math.min(100, Math.round((disabilityFulfilled / disabilityRequired) * 100));
  const wageLayak = stats.wageLayakJobs ?? 0;
  const totalJobs = stats.totalJobs ?? 0;

  return (
    <div style={{ padding: p, background: "var(--color-bg)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Dasbor Kepatuhan</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: isMobile ? 24 : 32, color: "var(--color-text)", margin: "0 0 8px", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
          Kepatuhan UU No. 8/2016
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.65 }}>
          Pantau status pemenuhan kuota disabilitas dan standar upah perusahaan Anda.
        </p>
      </div>

      {/* COMPLIANCE SCORE */}
      <div style={{ ...card, padding: isMobile ? 20 : 32, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: isMobile ? 20 : 48, alignItems: isMobile ? "center" : "stretch", flexDirection: isMobile ? "column" : "row" }}>
          <div style={{ flex: 3, display: "flex", gap: isMobile ? 16 : 32, alignItems: "center" }}>
            <ScoreArc score={score} />
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: isMobile ? 16 : 22, color: "var(--color-text)", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
                Status Kepatuhan Perusahaan
              </h2>
              {!isMobile && (
                <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7, margin: "0 0 16px", maxWidth: 400 }}>
                  Skor dihitung berdasarkan pemenuhan kuota disabilitas (UU No. 8/2016) dan kepatuhan upah UMP/UMK 2026.
                </p>
              )}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px",
                borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 700,
                background: score >= 80 ? "#dcfce7" : score >= 50 ? "#fef3c7" : "#fee2e2",
                color: scoreColor,
                border: `1px solid ${score >= 80 ? "#bbf7d0" : score >= 50 ? "#fde68a" : "#fecaca"}`,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: scoreColor, display: "inline-block" }} />
                {statusLabel}
              </span>
            </div>
          </div>
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Total Lowongan", value: `${totalJobs}`, unit: "lowongan", color: "var(--color-text)" },
              { label: "Kandidat Disabilitas", value: `${disabilityFulfilled}`, unit: "orang", color: "var(--color-primary)" },
              { label: "Lowongan Wage-Compliant", value: `${wageLayak}/${totalJobs}`, unit: "", color: "var(--color-warning)" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "var(--color-surface-raised)", borderRadius: "var(--radius-md)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>{stat.label}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: stat.color }}>{stat.value}</span>
                  {stat.unit && <span style={{ fontSize: 11, color: "var(--color-text-subtle)" }}>{stat.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KUOTA DISABILITAS */}
      <div style={{ ...card, padding: isMobile ? 20 : 32, marginBottom: 16 }}>
        <div style={SECTION_LABEL}>Pemenuhan Kuota Disabilitas</div>
        <div style={{ flex: 1, width: "100%" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 14 }}>Progress Kuota Saat Ini</div>
          <ProgressBar pct={disabilityPct} />
          <div style={{ marginTop: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>
              {disabilityFulfilled} dari {disabilityRequired} kandidat disabilitas dibutuhkan
            </span>
          </div>
          {disabilityFulfilled < disabilityRequired ? (
            <div style={{ fontSize: 13, color: "var(--color-warning)", fontWeight: 600, marginBottom: 10 }}>
              Perlu {disabilityRequired - disabilityFulfilled} rekrutmen disabilitas lagi
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--color-success)", fontWeight: 600, marginBottom: 10 }}>
              ✓ Kuota disabilitas terpenuhi
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--color-text-subtle)", lineHeight: 1.6 }}>
            Kewajiban 1% berdasarkan UU No. 8/2016 Pasal 53 untuk perusahaan swasta
          </div>
        </div>
        {disabilityFulfilled < disabilityRequired && (
          <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: "var(--radius-md)", background: "#fef3c7", border: "1px solid #fde68a", display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <AlertTriangle size={20} color="var(--color-warning)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
              Perusahaan Anda masih membutuhkan <strong>{disabilityRequired - disabilityFulfilled} rekrutmen disabilitas</strong> untuk memenuhi kewajiban hukum.
            </span>
            <button onClick={() => navigate("/perusahaan/post-job")} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "var(--radius-full)", border: "none", background: "var(--color-warning)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
              Buka Lowongan Baru
            </button>
          </div>
        )}
      </div>

      {/* WAGE COMPLIANCE TABLE */}
      <div style={{ ...card, padding: isMobile ? 20 : 32, marginBottom: 16 }}>
        <div style={SECTION_LABEL}>Kepatuhan Upah per Lowongan</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
          Status validasi gaji seluruh lowongan aktif terhadap UMP/UMK 2026
        </div>
        {jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-subtle)", fontSize: 14 }}>
            Belum ada lowongan yang diposting.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: isMobile ? 560 : "auto" }}>
              <div style={{ display: "flex", alignItems: "center", background: "var(--color-surface-raised)", borderRadius: "var(--radius-sm)", padding: "10px 16px", marginBottom: 4 }}>
                {["Posisi", "Lokasi", "Gaji", "UMK", "Selisih", "Status"].map((col, i) => (
                  <div key={col} style={{ flex: i === 0 ? 2 : 1, fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", textAlign: i > 1 ? "right" : "left" }}>
                    {col}
                  </div>
                ))}
              </div>
              {jobs.map((job: any, idx: number) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: idx < jobs.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{job.title}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--color-text)", fontWeight: 500 }}>{job.city}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>{formatRp(job.offered)}</div>
                  <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "var(--color-text-muted)" }}>{job.umk ? formatRp(job.umk) : "—"}</div>
                  <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 700, color: job.isLayak ? "var(--color-success)" : "var(--color-danger)" }}>
                    {job.umk ? `${job.isLayak ? "+" : "-"}${formatRp(Math.abs(job.diff))}` : "—"}
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, background: job.isLayak ? "#dcfce7" : "#fee2e2", color: job.isLayak ? "var(--color-success)" : "var(--color-danger)", border: `1px solid ${job.isLayak ? "#bbf7d0" : "#fecaca"}` }}>
                      {job.isLayak ? <CheckCircle2 size={11} strokeWidth={2.5} /> : <XCircle size={11} strokeWidth={2.5} />}
                      {job.isLayak ? "LAYAK" : "TIDAK"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {jobs.length > 0 && (
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              <strong style={{ color: "var(--color-success)" }}>{wageLayak} lowongan LAYAK</strong>
              {" · "}
              <strong style={{ color: "var(--color-danger)" }}>{totalJobs - wageLayak} lowongan TIDAK LAYAK</strong>
            </span>
          </div>
        )}
      </div>

      {/* TIMELINE */}
      <div style={{ ...card, padding: isMobile ? 20 : 32, marginBottom: 16 }}>
        <div style={SECTION_LABEL}>Riwayat Aktivitas</div>
        {timeline.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--color-text-subtle)", textAlign: "center", padding: "24px 0" }}>
            Belum ada aktivitas rekrutmen.
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--color-border)", borderRadius: 999 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {timeline.map((item: any, idx: number) => {
                const dotColor = item.type === "success" ? "var(--color-success)" : item.type === "warning" ? "var(--color-warning)" : "var(--color-border-strong)";
                return (
                  <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start", position: "relative" }}>
                    <div style={{ position: "absolute", left: -25, top: 3, width: 14, height: 14, borderRadius: "50%", background: dotColor, border: "2.5px solid var(--color-surface)", boxShadow: `0 0 0 2px ${dotColor}`, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-subtle)", fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.6, fontWeight: 500 }}>{item.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
