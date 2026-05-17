import { useNavigate, useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, DollarSign, Download, Loader2, ArrowLeft } from "lucide-react";
import { getCandidateReport } from "../../lib/api";
import { useIsMobile } from "../hooks/useIsMobile";

function ScoreRing({ score }: { score: number }) {
  const size = 100, stroke = 8;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-primary-light)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-primary)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: "var(--color-primary)", lineHeight: 1 }}>{score}%</span>
      </div>
    </div>
  );
}

const INSTRUCTIONS = [
  { num: "01", title: "Pasang Ramp di Pintu Utama", desc: "Kemiringan maksimal 1:12, lebar minimal 90cm, pegangan di kedua sisi." },
  { num: "02", title: "Sediakan Kursi Ergonomis Adjustable", desc: "Ketinggian 40–55cm, sandaran lumbar, armrest dapat disesuaikan di workstation kandidat." },
  { num: "03", title: "Install Software NVDA di Komputer Kerja", desc: "Unduh gratis di nvaccess.org. Konfigurasi bahasa Indonesia tersedia. Setup ~30 menit." },
];

export function CompanyReport() {
  const navigate = useNavigate();
  const { id: candidateId } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!candidateId) return;
      try {
        const res = await getCandidateReport(candidateId);
        setData(res);
      } catch (err) {
        console.error("Load report error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [candidateId]);

  const handleDownloadPDF = () => {
    const summary = data?.summary || {};
    const matchResult = data?.matchResult || {};
    const candidateProfile = data?.candidateProfile || {};
    const name = summary.candidateName || candidateProfile.name || "Kandidat";
    const disability = summary.disabilityType || candidateProfile.disabilityType || "—";
    const score = summary.matchScore || matchResult.matchScore || 0;
    const matchedSkills = matchResult.matchedSkills || [];
    const gapSkills = matchResult.gapSkills || [];
    const isLayak = (summary.wageStatus || matchResult.wageStatus) === "LAYAK";
    const umkLabel = matchResult.umkLabel || "UMK 2026";
    const umkValue = matchResult.umkValue || 0;
    const offeredSalary = matchResult.offeredSalary || 0;
    const formatRp = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Laporan Kandidat - ${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; line-height: 1.6; }
  h1 { font-size: 22px; font-weight: 700; color: #12747a; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #12747a; padding-bottom: 16px; margin-bottom: 24px; }
  .badge { background: #e8f4f5; color: #12747a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .score { font-size: 48px; font-weight: 800; color: #12747a; line-height: 1; }
  .section { margin-bottom: 24px; padding: 16px; border: 1px solid #e5e4e1; border-radius: 8px; }
  .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin: 3px; }
  .tag-match { background: #e8f4f5; color: #12747a; }
  .tag-gap { background: #fef3c7; color: #ca8a04; }
  .wage-box { padding: 12px; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; }
  .layak { background: #dcfce7; color: #16a34a; }
  .tidak { background: #fee2e2; color: #dc2626; }
  .instr { display: flex; gap: 12px; margin-bottom: 12px; }
  .instr-num { font-size: 28px; font-weight: 800; color: #cde; min-width: 40px; }
  .instr-content h4 { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
  .instr-content p { font-size: 12px; color: #6b7280; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e4e1; padding-top: 12px; text-align: center; font-size: 11px; color: #9ca3af; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div style="font-size:11px;color:#9ca3af;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Arcana · Laporan Layak</div>
    <h1>${name}</h1>
    <span class="badge">${disability}</span>
  </div>
  <div style="text-align:center;">
    <div class="score">${score}%</div>
    <div style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Kecocokan</div>
  </div>
</div>

<div class="section">
  <h2>Skill Match</h2>
  ${matchedSkills.length > 0 ? `<div style="margin-bottom:10px;"><div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:6px;">Skill Cocok</div>${matchedSkills.map((s: string) => `<span class="tag tag-match">✓ ${s}</span>`).join("")}</div>` : ""}
  ${gapSkills.length > 0 ? `<div><div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:6px;">Skill Kurang</div>${gapSkills.map((s: string) => `<span class="tag tag-gap">! ${s}</span>`).join("")}</div>` : ""}
</div>

<div class="section">
  <h2>Smart Wage Guard</h2>
  <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
    <div><div style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">${umkLabel}</div><div style="font-size:18px;font-weight:700;">${umkValue ? formatRp(umkValue) : "—"}</div></div>
    <div style="text-align:right;"><div style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Gaji Ditawarkan</div><div style="font-size:18px;font-weight:700;">${offeredSalary ? formatRp(offeredSalary) : "—"}</div></div>
  </div>
  <div class="wage-box ${isLayak ? "layak" : "tidak"}">${isLayak ? "✓ LAYAK — Memenuhi Standar UMP/UMK" : "✗ TIDAK LAYAK — Di bawah standar UMP/UMK"}</div>
</div>

<div class="section">
  <h2>Instruksi Teknis Modifikasi Kantor</h2>
  ${INSTRUCTIONS.map(i => `<div class="instr"><div class="instr-num">${i.num}</div><div class="instr-content"><h4>${i.title}</h4><p>${i.desc}</p></div></div>`).join("")}
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;margin-top:12px;font-size:12px;color:#ca8a04;font-weight:700;">⚡ Estimasi biaya modifikasi: Rp 2.500.000 – Rp 8.000.000</div>
</div>

<div class="footer">
  Laporan dibuat oleh Arcana · ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · Berdasarkan UMP/UMK 2026 · Peraturan Gubernur
</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Izinkan popup di browser untuk mengunduh laporan."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  if (loading) return (
    <div style={{ padding: "32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 10, color: "var(--color-text-muted)" }}>
      <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Memuat laporan...
    </div>
  );

  const summary = data?.summary || {};
  const matchResult = data?.matchResult || {};
  const candidateProfile = data?.candidateProfile || {};

  const name = summary.candidateName || candidateProfile.name || "Kandidat";
  const disability = summary.disabilityType || candidateProfile.disabilityType || "—";
  const score = summary.matchScore || matchResult.matchScore || 0;
  const matchedSkills = matchResult.matchedSkills || candidateProfile.skills?.slice(0, 3) || [];
  const gapSkills = matchResult.gapSkills || [];
  const isLayak = (summary.wageStatus || matchResult.wageStatus) === "LAYAK";
  const umkLabel = matchResult.umkLabel || "UMK 2026";
  const umkValue = matchResult.umkValue || 0;
  const offeredSalary = matchResult.offeredSalary || 0;
  const wageGap = matchResult.wageGap || 0;
  const formatRp = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px" }} ref={printRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button onClick={() => navigate("/perusahaan/kandidat")} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "var(--color-primary)", fontSize: 13, cursor: "pointer",
            padding: 0, fontFamily: "var(--font-body)", marginBottom: 8, fontWeight: 600,
          }}>
            <ArrowLeft size={14} strokeWidth={2} /> Kembali ke Daftar Kandidat
          </button>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Laporan Layak</h1>
        </div>
        <button onClick={handleDownloadPDF} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: "var(--radius-md)",
          border: `1.5px solid var(--color-primary)`,
          background: "var(--color-surface)", color: "var(--color-primary)",
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface)"; e.currentTarget.style.color = "var(--color-primary)"; }}
        >
          <Download size={16} strokeWidth={1.5} /> Unduh Laporan PDF
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        {/* Left: Candidate Summary */}
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: isMobile ? 20 : 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--color-text)", margin: "0 0 10px" }}>{name}</h2>
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 13, fontWeight: 600 }}>{disability}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <ScoreRing score={score} />
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Tingkat Kecocokan</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>Skill Match</div>
            {matchedSkills.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, marginBottom: 8 }}>Skill Cocok</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {matchedSkills.map((s: string) => (
                    <span key={s} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 12, fontWeight: 600 }}>
                      <CheckCircle2 size={11} strokeWidth={2} />{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {gapSkills.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, marginBottom: 8 }}>Skill Kurang</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {gapSkills.map((s: string) => (
                    <span key={s} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "#fef3c7", color: "var(--color-warning)", fontSize: 12, fontWeight: 600, border: "1px solid #fde68a" }}>
                      <span style={{ fontSize: 11 }}>!</span>{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Instructions + Wage Guard */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--color-primary-light)", borderRadius: "var(--radius-lg)", padding: isMobile ? 20 : 24, boxShadow: "var(--shadow-sm)", border: "1px solid rgba(18,116,122,0.2)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600, color: "var(--color-text)", margin: "0 0 20px" }}>Instruksi Teknis Modifikasi Kantor</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {INSTRUCTIONS.map(({ num, title, desc }) => (
                <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: "rgba(18,116,122,0.25)", lineHeight: 1, flexShrink: 0, width: 36 }}>
                    {num}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--radius-md)", background: "#fef3c7", border: "1px solid #fde68a", marginTop: 16 }}>
              <DollarSign size={15} color="var(--color-warning)" strokeWidth={1.5} />
              <span style={{ fontSize: 13, color: "var(--color-warning)", fontWeight: 700 }}>Estimasi biaya modifikasi: Rp 2.500.000 – Rp 8.000.000</span>
            </div>
          </div>

          {/* Wage Guard */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: isMobile ? 20 : 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600, color: "var(--color-text)", margin: "0 0 16px" }}>Smart Wage Guard</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", marginBottom: 14 }}>
              <div style={{ paddingRight: 16 }}>
                <div style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>{umkLabel}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{umkValue ? formatRp(umkValue) : "—"}</div>
              </div>
              <div style={{ background: "var(--color-border)" }} />
              <div style={{ paddingLeft: 16 }}>
                <div style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Gaji Ditawarkan</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{offeredSalary ? formatRp(offeredSalary) : "—"}</div>
              </div>
            </div>
            <div style={{
              padding: "11px", borderRadius: "var(--radius-full)", textAlign: "center",
              background: isLayak ? "#dcfce7" : "#fee2e2",
              color: isLayak ? "var(--color-success)" : "var(--color-danger)",
              fontSize: 13, fontWeight: 700, marginBottom: 6,
              border: `1px solid ${isLayak ? "#bbf7d0" : "#fecaca"}`,
            }}>
              {isLayak ? "✓ LAYAK — Memenuhi Standar UMP/UMK" : `✗ TIDAK LAYAK — Di bawah ${wageGap ? formatRp(wageGap) : "standar"}`}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-subtle)", textAlign: "center" }}>Berdasarkan UMP/UMK 2026 · Peraturan Gubernur</div>
          </div>
        </div>
      </div>
    </div>
  );
}
