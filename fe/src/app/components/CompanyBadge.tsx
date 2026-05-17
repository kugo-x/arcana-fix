import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Clock, Circle, Download, FileDown, Linkedin, MessageCircle, Lock, Loader2 } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { getBadgeStatus } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

function BadgeSVG({ size = 200, greyed = false }: { size?: number; greyed?: boolean }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.42;
  const oct = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => {
    const rad = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`;
  }).join(" ");
  const dotR = r + size * 0.07;
  const dots = Array.from({ length: 24 }, (_, i) => {
    const rad = (i * 15 * Math.PI) / 180;
    return { x: cx + dotR * Math.cos(rad), y: cy + dotR * Math.sin(rad) };
  });
  const innerR = r * 0.78;
  const ribbonY = cy + r * 0.55;
  const ribbonH = size * 0.14;
  const filter = greyed ? "grayscale(1) opacity(0.35)" : "none";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter }}>
      <defs>
        <radialGradient id="badgeGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a9ca2" />
          <stop offset="100%" stopColor="#12747a" />
        </radialGradient>
        <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy={size * 0.02} stdDeviation={size * 0.03} floodColor="#12747a" floodOpacity="0.3" />
        </filter>
      </defs>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={size * 0.013} fill="#12747a" opacity={0.25} />)}
      <polygon points={oct} fill="none" stroke="#12747a" strokeWidth={size * 0.018} opacity={0.45} />
      <circle cx={cx} cy={cy} r={innerR} fill="url(#badgeGrad)" filter="url(#badgeShadow)" />
      <g transform={`translate(${cx - size * 0.18}, ${cy - size * 0.22}) scale(${size / 200})`}>
        <circle cx={36} cy={14} r={10} fill="rgba(255,255,255,0.95)" />
        <path d="M18 44c0-10 8-18 18-18s18 8 18 18" fill="rgba(255,255,255,0.95)" />
        <path d="M46 24 L62 30 L62 42 C62 50 54 56 54 56 C54 56 46 50 46 42 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
        <path d="M50 38 l3 3 6-6" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path
        d={`M${cx - innerR * 0.75},${ribbonY} L${cx + innerR * 0.75},${ribbonY} L${cx + innerR * 0.75},${ribbonY + ribbonH} L${cx},${ribbonY + ribbonH + size * 0.04} L${cx - innerR * 0.75},${ribbonY + ribbonH} Z`}
        fill="#0d5459"
      />
      <text x={cx} y={ribbonY + ribbonH * 0.65} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize={size * 0.065} fill="white" letterSpacing="1">
        INKLUSIF 2026
      </text>
    </svg>
  );
}

function Certificate({ companyName, certNumber }: { companyName: string; certNumber: string }) {
  const W = 620, H = 400, pad = 28;
  return (
    <svg id="certificate-svg" width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", maxWidth: W, margin: "0 auto" }}>
      <defs>
        <pattern id="diagLines" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="#12747a" strokeWidth="1" opacity="0.03" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="white" rx={12} />
      <rect width={W} height={H} fill="url(#diagLines)" rx={12} />
      <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} fill="none" stroke="#12747a" strokeWidth={2} rx={8} opacity={0.6} />
      <text x={W / 2} y={pad + 32} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize={13} fill="#12747a" letterSpacing="3">Arcana</text>
      <text x={W / 2} y={pad + 58} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={10} fill="#9ca3af" letterSpacing="2" fontWeight="600">SERTIFIKAT KEPATUHAN INKLUSIF</text>
      <text x={W / 2} y={H / 2 - 42} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={13} fill="#9ca3af" fontStyle="italic">Diberikan kepada</text>
      <text x={W / 2} y={H / 2 - 8} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={28} fontWeight="700" fill="#1a1a1a">{companyName}</text>
      <text x={W / 2} y={H / 2 + 20} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={12} fill="#6b7280">
        Telah memenuhi standar rekrutmen inklusif dan kepatuhan upah
      </text>
      <text x={W / 2} y={H / 2 + 36} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={12} fill="#6b7280">
        berdasarkan UU No. 8 Tahun 2016 tentang Penyandang Disabilitas.
      </text>
      <line x1={pad + 48} y1={H - pad - 52} x2={pad + 148} y2={H - pad - 52} stroke="#e5e4e1" strokeWidth={1} />
      <text x={pad + 98} y={H - pad - 38} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={10} fill="#9ca3af">Berlaku hingga: 31 Des 2026</text>
      <g transform={`translate(${W / 2 - 22}, ${H - pad - 72})`}>
        <BadgeSVG size={44} />
      </g>
      <line x1={W - pad - 148} y1={H - pad - 52} x2={W - pad - 48} y2={H - pad - 52} stroke="#e5e4e1" strokeWidth={1} />
      <text x={W - pad - 98} y={H - pad - 38} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={10} fill="#9ca3af">No. Sertifikat: {certNumber}</text>
    </svg>
  );
}

function AnimatedBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 8, borderRadius: "var(--radius-full)", background: "var(--color-border)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-primary)", borderRadius: "var(--radius-full)", transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

export function CompanyBadge() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showEmbed, setShowEmbed] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [badgeData, setBadgeData] = useState<any>(null);
  const certRef = React.useRef<SVGSVGElement>(null);

  useEffect(() => {
    getBadgeStatus()
      .then(setBadgeData)
      .catch(() => setBadgeData(null))
      .finally(() => setLoading(false));
  }, []);

  const card: React.CSSProperties = {
    background: "var(--color-surface)", borderRadius: "var(--radius-lg)",
    border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)",
  };
  const p = isMobile ? "20px 16px" : "32px 32px";

  if (loading) return (
    <div style={{ padding: p, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 10, color: "var(--color-text-muted)" }}>
      <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Memuat status badge...
    </div>
  );

  const BADGE_EARNED: boolean = badgeData?.badgeEarned ?? false;
  const COMPANY_NAME: string = badgeData?.companyName || user?.name || "Perusahaan Anda";
  const CERT_NUMBER: string = badgeData?.certNumber || "ARC-2026-XXXXX";
  const complianceScore: number = badgeData?.complianceScore ?? 0;
  const requirements: { label: string; done: boolean }[] = badgeData?.requirements ?? [
    { label: "Minimal 1 rekrutmen disabilitas aktif", done: false },
    { label: "Semua lowongan aktif wage-compliant (≥ UMK)", done: false },
    { label: `Compliance Score minimal 80% — saat ini: ${complianceScore}%`, done: false },
    { label: "Profil perusahaan 100% lengkap", done: false },
  ];
  const fulfilledCount: number = badgeData?.fulfilledCount ?? 0;
  const totalRequirements: number = badgeData?.totalRequirements ?? 4;
  const progressPct = Math.round((fulfilledCount / totalRequirements) * 100);

  // Fungsi unduh PNG — render SVG sertifikat ke canvas lalu download
  const downloadAsPng = async () => {
    setDownloading("png");
    try {
      const svgEl = document.getElementById("certificate-svg") as unknown as SVGSVGElement;
      if (!svgEl) return;
      const W = 620, H = 400;
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = W * 2; canvas.height = H * 2;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(2, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, W, H);
        URL.revokeObjectURL(url);
        const link = document.createElement("a");
        link.download = `Sertifikat-Arcana-${CERT_NUMBER}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setDownloading(null);
      };
      img.onerror = () => setDownloading(null);
      img.src = url;
    } catch { setDownloading(null); }
  };

  // Fungsi unduh PDF — buka print dialog browser dengan sertifikat
  const downloadAsPdf = async () => {
    setDownloading("pdf");
    try {
      const svgEl = document.getElementById("certificate-svg") as unknown as SVGSVGElement;
      if (!svgEl) { setDownloading(null); return; }
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1240; canvas.height = 800;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1240, 800);
        ctx.drawImage(img, 0, 0, 1240, 800);
        URL.revokeObjectURL(url);
        const imgData = canvas.toDataURL("image/png");
        const win = window.open("", "_blank");
        if (!win) { setDownloading(null); return; }
        win.document.write(`<!DOCTYPE html>
<html><head><title>Sertifikat Arcana - ${CERT_NUMBER}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  img { width: 100%; max-width: 900px; height: auto; display: block; }
  @media print {
    @page { size: A4 landscape; margin: 10mm; }
    body { padding: 0; }
  }
</style></head>
<body>
  <img src="${imgData}" alt="Sertifikat Arcana" />
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); window.close(); }, 500);
    };
  </script>
</body></html>`);
        win.document.close();
        setDownloading(null);
      };
      img.onerror = () => setDownloading(null);
      img.src = url;
    } catch { setDownloading(null); }
  };

  const embedCode = `<a href="https://arcana.id/verify/${CERT_NUMBER}" target="_blank" rel="noopener">
  <img src="https://arcana.id/badge/${CERT_NUMBER}.png"
       alt="Verified Inclusive Employer" width="120" />
</a>`;

  return (
    <div style={{ padding: p, background: "var(--color-bg)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Penghargaan</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: isMobile ? 24 : 30, color: "var(--color-text)", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          Badge & Sertifikat
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
          Tunjukkan komitmen inklusivitas perusahaan Anda kepada dunia.
        </p>
      </div>

      {/* STATUS BADGE */}
      <div style={{ ...card, padding: isMobile ? 20 : 32, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: isMobile ? 0 : 40, alignItems: "flex-start", flexDirection: isMobile ? "column" : "row" }}>

          {/* Badge Showcase */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: isMobile ? "100%" : "auto", flex: isMobile ? undefined : "0 0 auto", paddingBottom: isMobile ? 20 : 0, borderBottom: isMobile ? "1px solid var(--color-border)" : "none" }}>
            <div style={{ position: "relative" }}>
              <BadgeSVG size={isMobile ? 140 : 176} greyed={!BADGE_EARNED} />
              {!BADGE_EARNED && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Lock size={20} color="var(--color-text-subtle)" strokeWidth={1.5} />
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Belum Terbuka</span>
                </div>
              )}
            </div>
            {BADGE_EARNED ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17, color: "var(--color-text)", marginBottom: 4 }}>{COMPANY_NAME}</div>
                <div style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>Verified Inclusive Employer 2026</div>
                <div style={{ fontSize: 12, color: "var(--color-text-subtle)", marginTop: 4 }}>Diterbitkan: 1 Januari 2026</div>
              </div>
            ) : (
              <div style={{ textAlign: "center", maxWidth: 200 }}>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>Penuhi semua syarat untuk membuka badge resmi ini</div>
              </div>
            )}
          </div>

          {!isMobile && <div style={{ width: 1, background: "var(--color-border)", alignSelf: "stretch", flexShrink: 0 }} />}

          {/* Requirements */}
          <div style={{ flex: 1, width: "100%", paddingTop: isMobile ? 20 : 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 16, fontFamily: "var(--font-heading)" }}>Syarat Mendapatkan Badge</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {requirements.map((req, i) => {
                const Icon = req.done ? CheckCircle2 : (complianceScore > 0 && !req.done ? Clock : Circle);
                const color = req.done ? "var(--color-success)" : "var(--color-border-strong)";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <Icon size={17} color={color} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: req.done ? "var(--color-text)" : "var(--color-text-muted)", lineHeight: 1.5 }}>{req.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>{fulfilledCount} dari {totalRequirements} syarat terpenuhi</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{progressPct}%</span>
              </div>
              <AnimatedBar pct={progressPct} />
            </div>
            <div style={{ marginTop: 16 }}>
              {BADGE_EARNED ? (
                <button style={{ width: "100%", height: 44, borderRadius: "var(--radius-full)", border: "none", background: "var(--color-primary)", color: "white", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  Klaim Badge Sekarang 🎉
                </button>
              ) : (
                <button onClick={() => navigate("/perusahaan/compliance")} style={{ width: "100%", height: 44, borderRadius: "var(--radius-full)", border: `1.5px solid var(--color-primary)`, background: "transparent", color: "var(--color-primary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary)"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-primary)"; }}>
                  Perbaiki Compliance Score →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SERTIFIKAT (hanya jika badge earned) */}
      {BADGE_EARNED && (
        <div style={{ ...card, padding: isMobile ? 20 : 28, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Sertifikat Resmi</div>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 16 }}>
            <Certificate companyName={COMPANY_NAME} certNumber={CERT_NUMBER} />
          </div>
          <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
            <button
              onClick={downloadAsPng}
              disabled={downloading === "png"}
              style={{ flex: 1, height: 44, borderRadius: "var(--radius-full)", cursor: downloading === "png" ? "wait" : "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--color-primary)", color: "white", border: "none", opacity: downloading === "png" ? 0.7 : 1 }}
            >
              <Download size={15} strokeWidth={1.8} />
              {downloading === "png" ? "Mengunduh..." : "Unduh PNG"}
            </button>
            <button
              onClick={downloadAsPdf}
              disabled={downloading === "pdf"}
              style={{ flex: 1, height: 44, borderRadius: "var(--radius-full)", cursor: downloading === "pdf" ? "wait" : "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--color-surface)", color: "var(--color-text)", border: "1.5px solid var(--color-border)", opacity: downloading === "pdf" ? 0.7 : 1 }}
            >
              <FileDown size={15} strokeWidth={1.8} />
              {downloading === "pdf" ? "Mengunduh..." : "Unduh PDF"}
            </button>
          </div>
        </div>
      )}

      {/* SHARE */}
      <div style={{ ...card, padding: isMobile ? 20 : 28, background: "var(--color-surface-raised)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 16, fontFamily: "var(--font-heading)" }}>Bagikan Badge Kamu</div>
        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row", marginBottom: 12 }}>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://arcana.id/verify/" + CERT_NUMBER)}&title=${encodeURIComponent("Kami adalah Perusahaan Inklusif Terverifikasi oleh Arcana 2026!")}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, height: 44, borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#0077b5", color: "white", border: "none", textDecoration: "none" }}>
            <Linkedin size={15} strokeWidth={1.8} /> Bagikan di LinkedIn
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent("Kami adalah Perusahaan Inklusif Terverifikasi oleh Arcana! 🎉\nLihat sertifikat kami: https://arcana.id/verify/" + CERT_NUMBER)}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, height: 44, borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#25d366", color: "white", border: "none", textDecoration: "none" }}>
            <MessageCircle size={15} strokeWidth={1.8} /> Bagikan via WhatsApp
          </a>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-subtle)", margin: 0, textAlign: "center" }}>
          Setiap kali badge dibagikan, Arcana otomatis memverifikasi keasliannya.
        </p>
      </div>
    </div>
  );
}
