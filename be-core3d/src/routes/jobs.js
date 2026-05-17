const express = require('express');
const pool = require('../../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/jobs ────────────────────────────────────────────────────────────
// Publik - semua orang bisa lihat lowongan
router.get('/', async (req, res) => {
  try {
    const { location, title } = req.query;
    let query = `
      SELECT j.id, j.title, j.location, j.offered_salary, j.description, j.created_at,
             cp.company_name,
             jt.title AS job_title_category,
             COALESCE(
               (SELECT JSON_ARRAYAGG(skill) FROM job_required_skills WHERE job_id = j.id),
               JSON_ARRAY()
             ) AS required_skills
      FROM jobs j
      JOIN company_profiles cp ON cp.id = j.company_id
      LEFT JOIN job_titles jt ON jt.id = j.job_title_id
    `;
    const params = [];
    const conditions = [];

    if (location) {
      params.push(`%${location}%`);
      conditions.push(`j.location LIKE ?`);
    }
    if (title) {
      params.push(`%${title}%`);
      conditions.push(`j.title LIKE ?`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY j.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ jobs: rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengambil daftar lowongan' });
  }
});

// ── GET /api/jobs/verified-employers ─────────────────────────────────────────
// Publik — daftar perusahaan yang aktif memposting lowongan dari database
router.get('/verified-employers', async (req, res) => {
  try {
    // Ambil semua perusahaan yang punya minimal 1 lowongan
    const [companies] = await pool.query(`
      SELECT
        cp.id,
        cp.company_name,
        cp.location,
        cp.updated_at,
        COUNT(DISTINCT j.id) AS job_count,
        COUNT(DISTINCT a.candidate_id) AS total_applicants,
        SUM(CASE
          WHEN (SELECT COUNT(*) FROM candidate_disabilities cd WHERE cd.candidate_id = a.candidate_id) > 0
          THEN 1 ELSE 0
        END) AS disability_applicants,
        SUM(CASE WHEN a.wage_status = 'LAYAK' THEN 1 ELSE 0 END) AS layak_count
      FROM company_profiles cp
      JOIN jobs j ON j.company_id = cp.id
      LEFT JOIN applications a ON a.job_id = j.id
      GROUP BY cp.id, cp.company_name, cp.location, cp.updated_at
      HAVING job_count > 0
      ORDER BY total_applicants DESC, job_count DESC
    `);

    const result = await Promise.all(companies.map(async (c) => {
      const [jobs] = await pool.query(`
        SELECT j.offered_salary, cmw.minimum_wage
        FROM jobs j
        LEFT JOIN city_minimum_wages cmw ON cmw.city = j.location
        WHERE j.company_id = ?
      `, [c.id]);

      const layakJobs = jobs.filter(j => {
        const offered = parseInt(String(j.offered_salary).replace(/\D/g, '')) || 0;
        return offered >= (j.minimum_wage || 0);
      }).length;

      const wagePct = jobs.length > 0 ? Math.round((layakJobs / jobs.length) * 100) : 0;
      const disabilityCount = parseInt(c.disability_applicants) || 0;
      const complianceScore = Math.round(wagePct * 0.6 + (disabilityCount > 0 ? 100 : 0) * 0.4);

      const name = c.company_name || '';
      let industry = 'Lainnya';
      if (/teknologi|digital|software|IT|tech/i.test(name)) industry = 'Teknologi';
      else if (/manufaktur|industri|pabrik|produksi/i.test(name)) industry = 'Manufaktur';
      else if (/sehat|klinik|medis|rumah sakit|kesehatan/i.test(name)) industry = 'Kesehatan';
      else if (/edukasi|pendidikan|sekolah|universitas|belajar/i.test(name)) industry = 'Pendidikan';
      else if (/jasa|layanan|service|konsultan/i.test(name)) industry = 'Jasa';

      return {
        id: c.id, name: c.company_name, location: c.location, industry,
        jobCount: parseInt(c.job_count) || 0,
        totalApplicants: parseInt(c.total_applicants) || 0,
        disabilityCount, complianceScore,
        wageCompliant: wagePct === 100,
        joinedAt: c.updated_at,
      };
    }));

    const totalCompanies = result.length;
    const totalPlaced = result.reduce((s, c) => s + c.totalApplicants, 0);
    const wageCompliantCount = result.filter(c => c.wageCompliant).length;
    const wageCompliantPct = totalCompanies > 0 ? Math.round((wageCompliantCount / totalCompanies) * 100) : 0;

    res.json({ companies: result, stats: { totalCompanies, totalPlaced, wageCompliantPct } });
  } catch (err) {
    console.error('Verified employers error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil daftar perusahaan' });
  }
});

// ── GET /api/jobs/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [jobResult] = await pool.query(
      `SELECT j.id, j.title, j.description, j.location, j.offered_salary, j.created_at,
              cp.company_name, cp.id AS company_id,
              jt.title AS job_title_category
       FROM jobs j
       JOIN company_profiles cp ON cp.id = j.company_id
       LEFT JOIN job_titles jt ON jt.id = j.job_title_id
       WHERE j.id = ?`,
      [id]
    );

    if (jobResult.length === 0) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }

    const job = jobResult[0];

    const [skillsResult] = await pool.query(
      'SELECT skill FROM job_required_skills WHERE job_id = ?',
      [id]
    );

    const [accommodationsResult] = await pool.query(
      `SELECT jda.accommodation, dt.name AS disability_type, dt.id AS disability_type_id
       FROM job_disability_accommodations jda
       JOIN disability_types dt ON dt.id = jda.disability_type_id
       WHERE jda.job_id = ?`,
      [id]
    );

    res.json({
      job: {
        ...job,
        required_skills: skillsResult.map((r) => r.skill),
        disability_accommodations: accommodationsResult,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil detail lowongan' });
  }
});

// ── POST /api/jobs ───────────────────────────────────────────────────────────
// Hanya perusahaan
// Body: { title, description, location, offered_salary, job_title_id,
//         required_skills: [], office_conditions: [],
//         disability_accommodations: [{disability_type_id, accommodation}] }
router.post('/', authenticate, authorize('perusahaan'), async (req, res) => {
  const {
    title,
    description,
    location,
    offered_salary,
    job_title_id,
    required_skills,
    disability_accommodations,
  } = req.body;

  if (!title || !location) {
    return res.status(400).json({ error: 'Judul dan lokasi lowongan wajib diisi' });
  }

  const client = await pool.getConnection();
  try {
    await client.beginTransaction();

    // Dapatkan company_id dari user login
    const [companyResult] = await client.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) {
      await client.rollback();
      return res.status(403).json({
        error: 'Buat profil perusahaan terlebih dahulu sebelum posting lowongan',
      });
    }
    const companyId = companyResult[0].id;

    // Insert job
    const jobId = require('crypto').randomUUID();
    await client.query(
      `INSERT INTO jobs (id, company_id, job_title_id, title, description, location, offered_salary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [jobId, companyId, job_title_id || null, title, description || null, location, offered_salary || null]
    );

    // Insert required skills
    if (Array.isArray(required_skills) && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query(
          `INSERT IGNORE INTO job_required_skills (job_id, skill) VALUES (?, ?)`,
          [jobId, skill.trim()]
        );
      }
    }

    // Insert disability accommodations
    if (Array.isArray(disability_accommodations) && disability_accommodations.length > 0) {
      for (const da of disability_accommodations) {
        await client.query(
          `INSERT INTO job_disability_accommodations (job_id, disability_type_id, accommodation)
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE accommodation = VALUES(accommodation)`,
          [jobId, da.disability_type_id, da.accommodation]
        );
      }
    }

    await client.commit();
    res.status(201).json({ success: true, message: 'Lowongan berhasil dibuat', jobId });
  } catch (err) {
    await client.rollback();
    console.error(err.message);
    res.status(500).json({ error: 'Gagal membuat lowongan' });
  } finally {
    client.release();
  }
});

// ── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('perusahaan'), async (req, res) => {
  try {
    const [companyResult] = await pool.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) {
      return res.status(403).json({ error: 'Profil perusahaan tidak ditemukan' });
    }
    const companyId = companyResult[0].id;

    const [result] = await pool.query(
      'DELETE FROM jobs WHERE id = ? AND company_id = ?',
      [req.params.id, companyId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan atau bukan milik Anda' });
    }
    res.json({ success: true, message: 'Lowongan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus lowongan' });
  }
});

// ── GET /api/jobs/verified-employers ─────────────────────────────────────────
// Publik — daftar perusahaan yang aktif memposting lowongan dari database
router.get('/verified-employers', async (req, res) => {
  try {
    // Ambil semua perusahaan yang punya minimal 1 lowongan
    const [companies] = await pool.query(`
      SELECT
        cp.id,
        cp.company_name,
        cp.location,
        cp.updated_at,
        COUNT(DISTINCT j.id) AS job_count,
        COUNT(DISTINCT a.candidate_id) AS total_applicants,
        SUM(CASE
          WHEN (SELECT COUNT(*) FROM candidate_disabilities cd WHERE cd.candidate_id = a.candidate_id) > 0
          THEN 1 ELSE 0
        END) AS disability_applicants,
        SUM(CASE WHEN a.wage_status = 'LAYAK' THEN 1 ELSE 0 END) AS layak_count
      FROM company_profiles cp
      JOIN jobs j ON j.company_id = cp.id
      LEFT JOIN applications a ON a.job_id = j.id
      GROUP BY cp.id, cp.company_name, cp.location, cp.updated_at
      HAVING job_count > 0
      ORDER BY total_applicants DESC, job_count DESC
    `);

    // Hitung compliance score dan stats per perusahaan
    const result = await Promise.all(companies.map(async (c) => {
      // Cek wage compliance semua lowongan
      const [jobs] = await pool.query(`
        SELECT j.offered_salary, cmw.minimum_wage
        FROM jobs j
        LEFT JOIN city_minimum_wages cmw ON cmw.city = j.location
        WHERE j.company_id = ?
      `, [c.id]);

      const layakJobs = jobs.filter(j => {
        const offered = parseInt(String(j.offered_salary).replace(/\D/g, '')) || 0;
        return offered >= (j.minimum_wage || 0);
      }).length;

      const wagePct = jobs.length > 0 ? Math.round((layakJobs / jobs.length) * 100) : 0;
      const disabilityCount = parseInt(c.disability_applicants) || 0;
      const disabilityPct = Math.min(100, disabilityCount > 0 ? 100 : 0);
      const complianceScore = Math.round(wagePct * 0.6 + disabilityPct * 0.4);

      // Tentukan industri dari lokasi/nama (heuristic sederhana)
      const name = c.company_name || '';
      let industry = 'Lainnya';
      if (/teknologi|digital|software|IT|tech/i.test(name)) industry = 'Teknologi';
      else if (/manufaktur|industri|pabrik|produksi/i.test(name)) industry = 'Manufaktur';
      else if (/sehat|klinik|medis|rumah sakit|kesehatan/i.test(name)) industry = 'Kesehatan';
      else if (/edukasi|pendidikan|sekolah|universitas|belajar/i.test(name)) industry = 'Pendidikan';
      else if (/jasa|layanan|service|konsultan/i.test(name)) industry = 'Jasa';

      return {
        id: c.id,
        name: c.company_name,
        location: c.location,
        industry,
        jobCount: parseInt(c.job_count) || 0,
        totalApplicants: parseInt(c.total_applicants) || 0,
        disabilityCount,
        complianceScore,
        wageCompliant: wagePct === 100,
        joinedAt: c.updated_at,
      };
    }));

    // Summary stats
    const totalCompanies = result.length;
    const totalPlaced = result.reduce((s, c) => s + c.totalApplicants, 0);
    const wageCompliantCount = result.filter(c => c.wageCompliant).length;
    const wageCompliantPct = totalCompanies > 0 ? Math.round((wageCompliantCount / totalCompanies) * 100) : 0;

    res.json({
      companies: result,
      stats: {
        totalCompanies,
        totalPlaced,
        wageCompliantPct,
      }
    });
  } catch (err) {
    console.error('Verified employers error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil daftar perusahaan' });
  }
});

module.exports = router;

