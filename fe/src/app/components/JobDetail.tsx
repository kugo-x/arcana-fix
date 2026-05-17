import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { MapPin, Briefcase, Building2, CheckCircle2, ArrowLeft, Loader2, ShieldCheck, X } from "lucide-react";
import { getJobById, applyAndMatch } from "../../lib/api";
import { useIsMobile } from "../hooks/useIsMobile";

function ApplySuccessModal({ onClose, onViewResult }: { onClose: () => void; onViewResult: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-lg)",
        padding: "32px 28px", maxWidth: 400, width: "100%",
        boxShadow: "var(--shadow-lg)", textAlign: "center",
        animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: none; } }`}</style>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}>
          <X size={20} color="var(--color-text-subtle)" strokeWidth={1.5} />
        </button>
        <div style={{ width: 60, height: 60, borderRadius: "var(--radius-full)", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={30} color="var(--color-success)" strokeWidth={1.5} />
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>
          Lamaran Terkirim!
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.65, marginBottom: 24 }}>
          Lamaranmu berhasil dikirim. Sistem telah menghitung tingkat kecocokan profilmu dengan lowongan ini.
        </div>
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <button onClick={onViewResult} style={{
            width: "100%", padding: "11px", borderRadius: "var(--radius-md)", border: "none",
            background: "var(--color-primary)", color: "white", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}>
            Lihat Hasil Kecocokan
          </button>
          <button onClick={onClose} style={{
            width: "100%", padding: "11px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)",
            background: "transparent", color: "var(--color-text-muted)", fontSize: 14, fontWeight: 500,
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}>
            Kembali ke Lowongan
          </button>
        </div>
      </div>
    </div>
  );
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getJobById(id);
        setJob(data.job);
      } catch (err) {
        console.error("Load job error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Auto-trigger apply if ?action=apply is in URL
  useEffect(() => {
    if (searchParams.get("action") === "apply" && job && !applying && !showModal) {
      handleApply();
    }
  }, [job]);

  const handleApply = async () => {
    if (!id) return;
    setApplyError(null);
    setApplying(true);
    try {
      await applyAndMatch(id);
      setShowModal(true);
    } catch (err: any) {
      setApplyError(err.message || "Gagal melamar. Pastikan profil sudah dilengkapi.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div style={{ padding: "32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 10, color: "var(--color-text-muted)" }}>
      <Loader2 size={20} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Memuat detail lowongan...
    </div>
  );

  if (!job) return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>Lowongan tidak ditemukan</div>
      <button onClick={() => navigate("/kandidat/jobs")} style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 600 }}>
        ← Kembali ke daftar lowongan
      </button>
    </div>
  );

  const companyName = job.company_name || job.companyName || "Perusahaan";
  const skills: string[] = job.required_skills || job.requiredSkills || [];
  const salary = (() => {
    const raw = job.offered_salary || job.offeredSalary;
    const num = parseInt(String(raw).replace(/\D/g, ""));
    return num ? `Rp ${num.toLocaleString("id-ID")} / bulan` : "Gaji kompetitif";
  })();

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px", background: "var(--color-bg)", minHeight: "100vh" }}>
      {showModal && (
        <ApplySuccessModal
          onClose={() => setShowModal(false)}
          onViewResult={() => navigate("/kandidat/hasil")}
        />
      )}

      {/* Back button */}
      <button onClick={() => navigate("/kandidat/jobs")} style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none",
        color: "var(--color-primary)", cursor: "pointer", fontFamily: "var(--font-body)",
        fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 20,
      }}>
        <ArrowLeft size={15} strokeWidth={2} /> Kembali ke Lowongan
      </button>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Job header card */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: isMobile ? 20 : 28, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "var(--radius-md)",
                background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ color: "white", fontSize: 18, fontWeight: 700 }}>
                  {companyName.replace(/^(PT|CV|UD)\s*/i, "").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 4 }}>{companyName}</div>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "var(--color-text)", margin: 0, lineHeight: 1.25 }}>
                  {job.title}
                </h1>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 13 }}>
                <MapPin size={13} strokeWidth={1.5} />{job.location}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: "var(--radius-full)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", fontSize: 13 }}>
                <Briefcase size={13} strokeWidth={1.5} />Full-time
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 13, fontWeight: 600 }}>
                <ShieldCheck size={13} strokeWidth={1.5} />Ramah Disabilitas
              </span>
            </div>

            <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--color-primary)", marginBottom: 20 }}>{salary}</div>

            {job.description && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Deskripsi Pekerjaan</div>
                <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.75, margin: 0 }}>{job.description}</p>
              </div>
            )}
          </div>

          {/* Skills required */}
          {skills.length > 0 && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: isMobile ? 20 : 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>Skill yang Dibutuhkan</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((s: string) => (
                  <span key={s} style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 13, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Accommodations */}
          {(job.disability_accommodations || job.disabilityAccommodations || []).length > 0 && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: isMobile ? 20 : 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>Akomodasi Disabilitas</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(job.disability_accommodations || job.disabilityAccommodations).map((acc: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircle2 size={16} color="var(--color-success)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{acc.accommodation || acc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky action card */}
        <div style={{
          background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: 24,
          boxShadow: "var(--shadow-md)", border: "1px solid var(--color-border)",
          position: isMobile ? "static" : "sticky", top: 24,
        }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}>
            Tertarik dengan posisi ini?
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
            Lamar sekarang atau cek dulu seberapa cocok profilmu dengan lowongan ini.
          </div>

          {applyError && (
            <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "#fee2e2", color: "var(--color-danger)", fontSize: 13, border: "1px solid #fecaca", marginBottom: 14 }}>
              {applyError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={handleApply} disabled={applying} style={{
              width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "none",
              background: applying ? "var(--color-border-strong)" : "var(--color-primary)",
              color: "white", fontSize: 14, fontWeight: 600,
              cursor: applying ? "not-allowed" : "pointer", fontFamily: "var(--font-body)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s",
            }}>
              {applying ? (
                <><Loader2 size={16} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />Memproses...</>
              ) : "Lamar Sekarang"}
            </button>
            <button onClick={() => navigate("/kandidat/hasil")} style={{
              width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--color-primary)",
              background: "transparent", color: "var(--color-primary)",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-light)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Lihat Hasil Kecocokan
            </button>
          </div>

          <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--color-primary-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Building2 size={15} color="var(--color-primary)" strokeWidth={1.5} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{companyName}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{job.location} · Perusahaan Terverifikasi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
