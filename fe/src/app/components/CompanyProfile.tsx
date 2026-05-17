import React, { useState, useEffect } from "react";
import { CheckCircle2, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import {
  saveCompanyProfile,
  getCompanyProfile,
  getCities,
  getCitiesByProvince,
} from "../../lib/api";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

const OFFICE_CONDITIONS = [
  "Ramp akses",
  "Lift aksesibel",
  "Toilet aksesibel",
  "Screen reader tersedia",
  "Visual alert",
  "Parkir disabilitas",
];

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center",
          animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: none; } }`}</style>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-full)",
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2
            size={28}
            color="var(--color-success)"
            strokeWidth={1.5}
          />
        </div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 8,
          }}
        >
          Profil Tersimpan!
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Data profil perusahaan berhasil disimpan dan akan terlihat oleh
          kandidat.
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--color-primary)",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Oke, Lanjut
        </button>
      </div>
    </div>
  );
}

export function CompanyProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [logoutHover, setLogoutHover] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeConditions, setOfficeConditions] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [citiesForProvince, setCitiesForProvince] = useState<string[]>([]);
  const [province, setProvince] = useState<string>("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [form, setForm] = useState({
    companyName: user?.name || "",
    location: "",
    industry: "",
    description: "",
  });

  useEffect(() => {
    async function load() {
      // Load cities dan profil secara paralel
      const [citiesResult, profileResult] = await Promise.allSettled([
        getCities(),
        getCompanyProfile(),
      ]);

      let cityProvinceMapLocal: Record<string, string> = {};

      if (citiesResult.status === "fulfilled") {
        const allCities: { city: string; province: string }[] =
          citiesResult.value.cities || [];
        // Daftar provinsi unik terurut
        const uniqueProvinces = [
          ...new Set(allCities.map((c) => c.province)),
        ].sort();
        setProvinces(uniqueProvinces);
        // Buat peta city → province
        allCities.forEach((c) => {
          cityProvinceMapLocal[c.city] = c.province;
        });
      }

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value;
        if (data.profile) {
          const p = data.profile;
          const savedLocation = p.location || "";
          setForm({
            companyName: p.company_name || p.name || "",
            location: savedLocation,
            industry: p.industry || "",
            description: p.description || "",
          });
          setOfficeConditions(p.office_conditions || []);
          // Restore province dari kota tersimpan
          if (savedLocation && cityProvinceMapLocal[savedLocation]) {
            setProvince(cityProvinceMapLocal[savedLocation]);
          }
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!province) {
      setCitiesForProvince([]);
      return;
    }
    setLoadingCities(true);
    getCitiesByProvince(province)
      .then((data) => {
        setCitiesForProvince(
          (Array.isArray(data) ? data : []).map((c: any) => c.city).sort(),
        );
      })
      .catch(() => setCitiesForProvince([]))
      .finally(() => setLoadingCities(false));
  }, [province]);

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    border: `1.5px solid ${focused === name ? "var(--color-primary)" : "var(--color-border)"}`,
    outline: focused === name ? `3px solid var(--color-primary-light)` : "none",
    outlineOffset: "0",
    background:
      focused === name ? "var(--color-surface)" : "var(--color-surface-raised)",
    boxSizing: "border-box" as const,
    fontFamily: "var(--font-body)",
    color: "var(--color-text)",
    transition: "border-color 0.15s, background 0.15s",
  });

  const selectStyle = (name: string): React.CSSProperties => ({
    ...inputStyle(name),
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 38,
  });

  const toggleCondition = (cond: string) => {
    setOfficeConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond],
    );
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      setError("Nama perusahaan wajib diisi");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveCompanyProfile({
        companyName: form.companyName,
        location: form.location,
        officeConditions,
      });
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          Memuat profil...
        </div>
      </div>
    );

  const gridCols = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px" }}>
      {showModal && <SuccessModal onClose={() => setShowModal(false)} />}

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: isMobile ? 22 : 26,
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: 4,
        }}
      >
        Profil Perusahaan
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        Informasi perusahaan yang akan terlihat oleh kandidat.
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: isMobile ? 16 : 24,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Informasi Dasar */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Informasi Perusahaan
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            Nama Perusahaan
          </label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) =>
              setForm((f) => ({ ...f, companyName: e.target.value }))
            }
            onFocus={() => setFocused("nama")}
            onBlur={() => setFocused(null)}
            placeholder="PT Contoh Indonesia"
            style={inputStyle("nama")}
          />
        </div>

        {/* Provinsi */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            Provinsi
          </label>
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setForm((f) => ({ ...f, location: "" })); // reset kota
            }}
            onFocus={() => setFocused("provinsi")}
            onBlur={() => setFocused(null)}
            style={selectStyle("provinsi")}
          >
            <option value="">Pilih provinsi...</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Kota + Industri dalam grid 2 kolom */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: 6,
              }}
            >
              Kota / Kabupaten
            </label>
            <select
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              onFocus={() => setFocused("kota")}
              onBlur={() => setFocused(null)}
              disabled={!province || loadingCities}
              style={{
                ...selectStyle("kota"),
                opacity: !province || loadingCities ? 0.5 : 1,
                cursor: !province || loadingCities ? "not-allowed" : "pointer",
              }}
            >
              <option value="">
                {!province
                  ? "Pilih provinsi dulu"
                  : loadingCities
                    ? "Memuat kota..."
                    : "Pilih kota / kabupaten..."}
              </option>
              {citiesForProvince.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: 6,
              }}
            >
              Industri
            </label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) =>
                setForm((f) => ({ ...f, industry: e.target.value }))
              }
              onFocus={() => setFocused("industri")}
              onBlur={() => setFocused(null)}
              placeholder="Teknologi, Keuangan, dll."
              style={inputStyle("industri")}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            Tentang Perusahaan
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            onFocus={() => setFocused("desc")}
            onBlur={() => setFocused(null)}
            placeholder="Ceritakan tentang visi, misi, dan budaya inklusif perusahaan kamu..."
            style={{
              ...inputStyle("desc"),
              resize: "vertical",
              lineHeight: 1.65,
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "var(--color-border)",
            margin: "24px 0",
          }}
        />

        {/* Fasilitas Aksesibilitas */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Fasilitas Aksesibilitas
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginBottom: 16,
          }}
        >
          Centang fasilitas yang tersedia di kantor kamu.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 10,
          }}
        >
          {OFFICE_CONDITIONS.map((cond) => {
            const checked = officeConditions.includes(cond);
            return (
              <div
                key={cond}
                onClick={() => toggleCondition(cond)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  border: `1.5px solid ${checked ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: checked
                    ? "var(--color-primary-light)"
                    : "var(--color-surface-raised)",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    flexShrink: 0,
                    border: `2px solid ${checked ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: checked
                      ? "var(--color-primary)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {checked && (
                    <CheckCircle2 size={11} color="white" strokeWidth={3} />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: checked ? 600 : 400,
                    color: checked
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {cond}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "#fee2e2",
              color: "var(--color-danger)",
              fontSize: 13,
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--color-primary)",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              opacity: saving ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.2s",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </div>

      {/* Logout button — mobile only, di paling bawah halaman */}
      {isMobile && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: `1.5px solid ${logoutHover ? "var(--color-danger)" : "var(--color-border)"}`,
              background: logoutHover ? "#fee2e2" : "var(--color-surface)",
              color: logoutHover ? "var(--color-danger)" : "var(--color-text-muted)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Keluar dari Akun
          </button>
        </div>
      )}
    </div>
  );
}
