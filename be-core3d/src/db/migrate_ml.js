/**
 * Migrasi: Tambah kolom ml_details ke tabel applications
 * dan ubah match_score dari INT ke FLOAT (untuk skor desimal dari ML).
 *
 * Jalankan: node src/db/migrate_ml.js
 */
require('dotenv').config();
const pool = require('../../config/db');

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Menjalankan migrasi ML...');

    // 1. Tambah kolom ml_details jika belum ada
    try {
      await connection.query(`
        ALTER TABLE applications
        ADD COLUMN ml_details JSON NULL
      `);
      console.log('✅ Kolom ml_details berhasil ditambahkan');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.message?.includes('Duplicate column')) {
        console.log('ℹ️  Kolom ml_details sudah ada, dilewati');
      } else {
        throw err;
      }
    }

    // 2. Ubah match_score ke FLOAT agar bisa simpan nilai desimal dari ML
    try {
      await connection.query(`
        ALTER TABLE applications
        MODIFY COLUMN match_score FLOAT DEFAULT 0
      `);
      console.log('✅ Tipe kolom match_score diubah ke FLOAT');
    } catch (err) {
      console.log('ℹ️  Tidak bisa mengubah match_score (mungkin sudah FLOAT):', err.message);
    }

    console.log('\n✅ Migrasi ML selesai!');
  } catch (err) {
    console.error('❌ Gagal menjalankan migrasi ML:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
