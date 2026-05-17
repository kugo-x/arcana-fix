const express = require("express");
const pool = require("../../config/db");

const router = express.Router();

// ── GET /api/ref/disability-types ────────────────────────────────────────────
// Publik - daftar semua tipe disabilitas (untuk dropdown di form)
router.get("/disability-types", async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id, name, description, accessibility_needs FROM disability_types ORDER BY id",
    );
    res.json({ disability_types: result });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data tipe disabilitas" });
  }
});

// ── GET /api/ref/job-titles ──────────────────────────────────────────────────
// Publik - daftar semua job title (untuk dropdown di form posting lowongan)
router.get("/job-titles", async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id, title FROM job_titles ORDER BY title",
    );
    res.json({ job_titles: result });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data job title" });
  }
});

// ── GET /api/ref/skills ──────────────────────────────────────────────────────
router.get("/skills", async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id, name FROM skills ORDER BY name",
    );
    res.json({ skills: result });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data skills" });
  }
});

// ── GET /api/ref/umk ─────────────────────────────────────────────────────────
// Publik - daftar UMK per kota 2026 (dari database)
// Opsional: filter by ?city=Jakarta
router.get("/umk", async (req, res) => {
  try {
    const { city } = req.query;
    let query = "SELECT city, province, minimum_wage FROM city_minimum_wages";
    const params = [];
    if (city) {
      query += " WHERE city = ?";
      params.push(city);
    }
    query += " ORDER BY city ASC";
    const [result] = await pool.query(query, params);
    res.json({
      umk_2026: result.map((r) => ({
        city: r.city,
        province: r.province,
        value: r.minimum_wage,
        label: `UMK ${r.city} 2026`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data UMK" });
  }
});

// ── GET /api/ref/cities ───────────────────────────────────────────────────────
// Publik - semua kota dengan province & minimum_wage (untuk dropdown)
router.get("/cities", async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT city, province, minimum_wage FROM city_minimum_wages ORDER BY city ASC",
    );
    res.json({ cities: result });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data kota" });
  }
});

module.exports = router;
