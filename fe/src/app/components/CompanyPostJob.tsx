import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  X,
  Info,
  Accessibility,
  ArrowUp,
  Droplets,
  Monitor,
  Bell,
  Car,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { createJob, getCities, getCitiesByProvince, getSkills } from "../../lib/api";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

// Skills dimuat dari database /api/ref/skills

const DIVIDER = (
  <div
    style={{ height: 1, background: "var(--color-border)", margin: "24px 0" }}
  />
);

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
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
          maxWidth: 380, width: "100%",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center",
          animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: none; } }`}</style>
        <div style={{
          width: 56, height: 56, borderRadius: "var(--radius-full)",
          background: "#dcfce7", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
        }}>
          <CheckCircle2 size={28} color="var(--color-success)" strokeWidth={1.5} />
        </div>
        <div style={{
          fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700,
          color: "var(--color-text)", marginBottom: 8,
        }}>
          Lowongan Berhasil Diposting!
        </div>
        <div style={{
          fontSize: 14, color: "var(--color-text-muted)",
          lineHeight: 1.6, marginBottom: 24,
        }}>
          Lowongan kamu sudah aktif. AI Arcana akan segera mencocokkan kandidat terbaik secara otomatis.
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none", background: "var(--color-primary)",
            color: "white", fontSize: 14, fontWeight: 500,
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          Lihat Kandidat
        </button>
      </div>
    </div>
  );
}

const FACILITIES = [
  { id: "ramp", icon: Accessibility, label: "Ramp Tersedia" },
  { id: "lift", icon: ArrowUp, label: "Lift Aksesibel" },
  { id: "toilet", icon: Droplets, label: "Toilet Disabilitas" },
  { id: "screen", icon: Monitor, label: "Screen Reader di Komputer" },
  { id: "bell", icon: Bell, label: "Sistem Visual Alert" },
  { id: "car", icon: Car, label: "Parkir Disabilitas" },
];

export function CompanyPostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [dbSkillOptions, setDbSkillOptions] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    offeredSalary: "",
  });

  // State untuk cascade provinsi → kota
  const [provinces, setProvinces] = useState<string[]>([]);
  const [citiesForProvince, setCitiesForProvince] = useState<
    { city: string; minimum_wage: number }[]
  >([]);
  const [province, setProvince] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  // UMK info dari kota yang dipilih
  const umkData = citiesForProvince.find((c) => c.city === location);
  const umkValue = umkData?.minimum_wage ?? null;
  const umkLabel = umkData ? `UMK ${umkData.city} 2026` : null;

  // Load skill dari database saat mount
  useEffect(() => {
    getSkills()
      .then((data) => {
        const names: string[] = (data.skills || []).map((s: any) => s.name || s);
        setDbSkillOptions(names.sort());
      })
      .catch(() => setDbSkillOptions([]));
  }, []);

  // Load daftar provinsi saat mount (dari getCities ambil unique provinces)
  useEffect(() => {
    getCities()
      .then((data) => {
        const allCities: { city: string; province: string }[] =
          data.cities || [];
        const uniqueProvinces = [
          ...new Set(allCities.map((c) => c.province)),
        ].sort();
        setProvinces(uniqueProvinces);
      })
      .catch(() => {})
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Load kota saat province berubah
  useEffect(() => {
    if (!province) {
      setCitiesForProvince([]);
      setLocation("");
      return;
    }
    setLoadingCities(true);
    setLocation(""); // reset kota saat provinsi ganti
    getCitiesByProvince(province)
      .then((data) => {
        setCitiesForProvince(
          (Array.isArray(data) ? data : []).sort((a: any, b: any) =>
            a.city.localeCompare(b.city),
          ),
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

  const addSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !skills.includes(t)) setSkills((s) => [...s, t]);
    setSkillInput("");
    setSkillDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Judul lowongan wajib diisi");
      return;
    }
    if (!form.offeredSalary) {
      setError("Gaji yang ditawarkan wajib diisi");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createJob({
        title: form.title,
        description: form.description,
        requiredSkills: skills,
        offeredSalary: form.offeredSalary,
        location,
        officeConditions: checked,
      });
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal membuat lowongan");
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = dbSkillOptions.filter(
    (s) => !skills.includes(s) &&
      (skillInput === "" || s.toLowerCase().includes(skillInput.toLowerCase()))
  );

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px" }}>
      {showModal && <SuccessModal onClose={() => { setShowModal(false); navigate("/perusahaan/kandidat"); }} />}
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 26,
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: 4,
        }}
      >
        Posting Lowongan
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        Isi detail lowongan. AI kami akan otomatis mencocokkan kandidat terbaik.
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--color-border)",
        }}
      >
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
          Detail Lowongan
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
            Job Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            onFocus={() => setFocused("title")}
            onBlur={() => setFocused(null)}
            placeholder="Contoh: Staf Administrasi"
            style={inputStyle("title")}
          />
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
            Deskripsi Pekerjaan
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            onFocus={() => setFocused("desc")}
            onBlur={() => setFocused(null)}
            placeholder="Jelaskan tanggung jawab, lingkungan kerja, dan ekspektasi dari kandidat..."
            style={{
              ...inputStyle("desc"),
              resize: "vertical",
              lineHeight: 1.65,
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        {/* Skill dropdown */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: "var(--color-text)", marginBottom: 6,
            }}
          >
            Skill yang Dibutuhkan
          </label>

          {/* Selected skill chips */}
          {skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "4px 10px", borderRadius: "var(--radius-full)",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)", fontSize: 12, fontWeight: 600,
                  }}
                >
                  {s}
                  <X
                    size={11} strokeWidth={2.5} style={{ cursor: "pointer" }}
                    onClick={() => setSkills((p) => p.filter((x) => x !== s))}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Dropdown trigger */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex", alignItems: "center",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: `1.5px solid ${skillDropdownOpen || focused === "skill" ? "var(--color-primary)" : "var(--color-border)"}`,
                outline: skillDropdownOpen || focused === "skill" ? `3px solid var(--color-primary-light)` : "none",
                background: skillDropdownOpen || focused === "skill" ? "var(--color-surface)" : "var(--color-surface-raised)",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                gap: 8,
              }}
              onClick={() => { setSkillDropdownOpen((v) => !v); }}
            >
              <input
                id="company-skill"
                value={skillInput}
                onChange={(e) => { setSkillInput(e.target.value); setSkillDropdownOpen(true); }}
                onFocus={() => { setFocused("skill"); setSkillDropdownOpen(true); }}
                onBlur={() => { setFocused(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); if (skillInput.trim()) addSkill(skillInput); }
                  if (e.key === "Escape") setSkillDropdownOpen(false);
                }}
                placeholder={skills.length === 0 ? "Cari atau ketik skill..." : "Tambah skill lagi..."}
                style={{
                  border: "none", outline: "none", fontSize: 14,
                  flex: 1, fontFamily: "var(--font-body)",
                  background: "transparent", color: "var(--color-text)",
                  cursor: "text",
                }}
              />
              <ChevronDown
                size={14} color="var(--color-text-subtle)" strokeWidth={2}
                style={{ flexShrink: 0, transform: skillDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
              />
            </div>

            {/* Dropdown list */}
            {skillDropdownOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-primary)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-md)",
                  zIndex: 100, maxHeight: 220, overflowY: "auto" as const,
                }}
              >
                {/* Custom skill entry */}
                {skillInput.trim() && !SKILL_OPTIONS.map(s => s.toLowerCase()).includes(skillInput.trim().toLowerCase()) && (
                  <div
                    onMouseDown={(e) => { e.preventDefault(); addSkill(skillInput); }}
                    style={{
                      padding: "10px 14px", cursor: "pointer",
                      fontSize: 13, color: "var(--color-primary)", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 8,
                      borderBottom: "1px solid var(--color-border)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--color-primary-light)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 16 }}>+</span>
                    Tambah "{skillInput.trim()}"
                  </div>
                )}
                {filteredSkills.length === 0 && !skillInput.trim() ? (
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-subtle)" }}>
                    Semua skill sudah dipilih
                  </div>
                ) : filteredSkills.length === 0 && skillInput.trim() ? null : (
                  filteredSkills.map((s) => (
                    <div
                      key={s}
                      onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                      style={{
                        padding: "9px 14px", cursor: "pointer",
                        fontSize: 13, color: "var(--color-text)",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-raised)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-subtle)", marginTop: 6 }}>
            Pilih dari daftar atau ketik skill custom lalu tekan Enter
          </div>
        </div>

        {/* Gaji + Provinsi dalam grid 2 kolom */}
        <div
          style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}
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
              Gaji Ditawarkan
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  pointerEvents: "none",
                }}
              >
                Rp
              </span>
              <input
                type="text"
                value={form.offeredSalary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, offeredSalary: e.target.value }))
                }
                onFocus={() => setFocused("salary")}
                onBlur={() => setFocused(null)}
                placeholder="5.000.000"
                style={{ ...inputStyle("salary"), paddingLeft: 42 }}
              />
            </div>
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
              Provinsi
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              onFocus={() => setFocused("provinsi")}
              onBlur={() => setFocused(null)}
              style={selectStyle("provinsi")}
            >
              {loadingProvinces ? (
                <option>Memuat provinsi...</option>
              ) : (
                <>
                  <option value="">Pilih provinsi...</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Kota / Kabupaten full width */}
        <div style={{ marginTop: 16 }}>
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setFocused("loc")}
            onBlur={() => setFocused(null)}
            disabled={!province || loadingCities}
            style={{
              ...selectStyle("loc"),
              opacity: !province || loadingCities ? 0.5 : 1,
              cursor: !province || loadingCities ? "not-allowed" : "pointer",
            }}
          >
            <option value="">
              {!province
                ? "Pilih provinsi terlebih dahulu"
                : loadingCities
                  ? "Memuat kota..."
                  : "Pilih kota / kabupaten..."}
            </option>
            {citiesForProvince.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city}
              </option>
            ))}
          </select>
        </div>

        {/* UMK info chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary-light)",
            border: "1px solid rgba(18,116,122,0.2)",
            marginTop: 12,
          }}
        >
          <Info size={15} color="var(--color-primary)" strokeWidth={1.5} />
          <span
            style={{
              fontSize: 13,
              color: "var(--color-primary)",
              fontWeight: 600,
            }}
          >
            {umkLabel && umkValue != null
              ? `${umkLabel}: Rp ${umkValue.toLocaleString("id-ID")}`
              : location
                ? "Memuat data UMK..."
                : ""}
          </span>
        </div>

        {DIVIDER}

        {/* Facilities */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-subtle)",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Kondisi Fisik Kantor
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 16,
            }}
          >
            Fasilitas Aksesibilitas yang Tersedia
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}
          >
            {FACILITIES.map(({ id, icon: Icon, label }) => {
              const active = checked.includes(id);
              return (
                <div
                  key={id}
                  onClick={() =>
                    setChecked((p) =>
                      p.includes(id) ? p.filter((c) => c !== id) : [...p, id],
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: active
                      ? "var(--color-primary-light)"
                      : "var(--color-surface)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    userSelect: "none" as const,
                  }}
                >
                  {/* Icon badge */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "var(--radius-md)",
                      background: active
                        ? "var(--color-primary)"
                        : "var(--color-surface-raised)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    <Icon
                      size={18}
                      color={active ? "white" : "var(--color-text-subtle)"}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 600,
                      color: active
                        ? "var(--color-primary)"
                        : "var(--color-text-muted)",
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </span>

                  {/* Checkmark or empty circle */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "var(--radius-full)",
                      border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                      background: active ? "var(--color-primary)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {active && (
                      <span style={{ color: "white", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {error && (
          <div
            style={{
              marginTop: 20,
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
            onClick={handleSubmit}
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
            {saving ? "Memposting..." : "Posting & Mulai Matching"}
          </button>
        </div>
      </div>
    </div>
  );
}
