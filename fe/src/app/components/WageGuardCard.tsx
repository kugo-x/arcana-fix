interface WageGuardCardProps {
  umkLabel?: string;
  umkValue?: string;
  offeredValue?: string;
  status: "LAYAK" | "TIDAK LAYAK";
  selisih?: string;
}

export function WageGuardCard({
  umkLabel = "UMK Jakarta 2026",
  umkValue = "Rp 5.067.381",
  offeredValue = "Rp 4.500.000",
  status,
  selisih = "Rp 567.381",
}: WageGuardCardProps) {
  const isLayak = status === "LAYAK";

  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "var(--color-text)" }}>Smart Wage Guard</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, marginBottom: 18 }}>
        <div style={{ paddingRight: 20 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: 6 }}>{umkLabel}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{umkValue}</div>
        </div>
        <div style={{ background: "var(--color-border)" }} />
        <div style={{ paddingLeft: 20 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: 6 }}>Gaji Ditawarkan</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{offeredValue}</div>
        </div>
      </div>

      <div style={{
        width: "100%", padding: "12px 0", borderRadius: "var(--radius-full)",
        background: isLayak ? "#dcfce7" : "#fee2e2",
        textAlign: "center",
        fontSize: 14, fontWeight: 700,
        color: isLayak ? "var(--color-success)" : "var(--color-danger)",
        border: `1px solid ${isLayak ? "#bbf7d0" : "#fecaca"}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        marginBottom: 10,
      }}>
        {isLayak
          ? `✓ LAYAK — Memenuhi Standar UMP`
          : `✗ TIDAK LAYAK — Di bawah ${selisih} dari standar`
        }
      </div>

      <div style={{ fontSize: 12, color: "var(--color-text-subtle)", textAlign: "center" }}>
        Berdasarkan Peraturan Gubernur / UMP/UMK 2026
      </div>
    </div>
  );
}
