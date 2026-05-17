"""
InklusiKerja — Step 2: Embedding & FAISS Indexing (v3)
=======================================================
Fix dari v2:
  FIX 1: document_text di-generate ulang ke format natural language
          agar konsisten dengan query format di 03_recommendation_engine.py v3.
          (v2 pakai document_text pipe-separated dari CSV yang kurang optimal)
  FIX 2: int(level_rank) sekarang aman dari NaN
  FIX 3: Validasi kolom wajib di awal untuk catch error lebih awal

Jalankan: python 02_embedding.py
"""

import os
import json
import time
import pickle
import ast
import numpy as np
import pandas as pd
from pathlib import Path

# ─── CONFIG ───────────────────────────────────────────────────────────────────
PROCESSED_DIR = "data/processed"
INDEX_DIR     = "data/index"
os.makedirs(INDEX_DIR, exist_ok=True)

MODEL_OPTIONS = {
    "multilingual_minilm": {
        "name": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        "dim": 384,
        "notes": "Cepat, multilingual, cocok untuk prototyping.",
    },
    "indobert_semantic": {
        "name": "LazarusNLP/indobert-base-p2",
        "dim": 768,
        "notes": "Fine-tuned untuk semantic similarity Bahasa Indonesia. REKOMENDASI.",
    },
    "multilingual_mpnet": {
        "name": "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
        "dim": 768,
        "notes": "Lebih akurat dari MiniLM, masih multilingual.",
    },
}

SELECTED_MODEL = "models/finetuned"  # Ganti ke key di MODEL_OPTIONS jika tidak pakai finetuned

# Kolom wajib di jobs_processed.csv — validasi di awal sebelum proses
REQUIRED_COLUMNS = [
    "Jenis Disabilitas",
    "Kebutuhan Aksesibilitas",
    "Job Title",
    "Level",
    "Deskripsi Kualifikasi",
    "job_id",
    "skill_tags",
    "level_rank",
]


# ─── EMBEDDING ENGINE ─────────────────────────────────────────────────────────

class EmbeddingEngine:

    def __init__(self, model_key: str = SELECTED_MODEL):
        from sentence_transformers import SentenceTransformer

        if os.path.isdir(model_key):
            self.model_name = model_key
            self.dim = 384  # Sesuaikan jika model kamu berbeda dimensi
            print(f"🤖 Loading local fine-tuned model: {self.model_name}")
        else:
            model_cfg = MODEL_OPTIONS[model_key]
            self.model_name = model_cfg["name"]
            self.dim = model_cfg["dim"]
            print(f"🤖 Loading model: {self.model_name}")
            print(f"   Catatan: {model_cfg['notes']}")

        print(f"   Dimensi embedding: {self.dim}")
        self.model = SentenceTransformer(self.model_name)
        print("✅ Model berhasil dimuat!")

    def encode(
        self,
        texts: list[str],
        batch_size: int = 32,
        show_progress: bool = True,
        normalize: bool = True,
    ) -> np.ndarray:
        print(f"\n🔄 Encoding {len(texts)} dokumen...")
        start = time.time()
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=show_progress,
            convert_to_numpy=True,
            normalize_embeddings=normalize,
        )
        elapsed = time.time() - start
        print(f"✅ Selesai dalam {elapsed:.1f}s | Shape: {embeddings.shape}")
        return embeddings.astype(np.float32)

    def encode_single(self, text: str, normalize: bool = True) -> np.ndarray:
        vec = self.model.encode(
            [text],
            normalize_embeddings=normalize,
            convert_to_numpy=True,
        )
        return vec.astype(np.float32)


# ─── FAISS INDEX BUILDER ──────────────────────────────────────────────────────

class FAISSIndexBuilder:

    def __init__(self, dim: int):
        import faiss
        self.faiss = faiss
        self.dim = dim

    def build_flat_ip(self, embeddings: np.ndarray):
        index = self.faiss.IndexFlatIP(self.dim)
        index.add(embeddings)
        print(f"✅ IndexFlatIP dibangun | {index.ntotal} vektor | dim={self.dim}")
        return index

    def build_ivf_flat(self, embeddings: np.ndarray, nlist: int = None):
        import faiss
        if nlist is None:
            nlist = max(4, int(np.sqrt(len(embeddings))))
        quantizer = faiss.IndexFlatIP(self.dim)
        index = faiss.IndexIVFFlat(quantizer, self.dim, nlist, faiss.METRIC_INNER_PRODUCT)
        print(f"🔄 Training IVF index dengan {nlist} clusters...")
        index.train(embeddings)
        index.add(embeddings)
        index.nprobe = min(10, nlist)
        print(f"✅ IndexIVFFlat dibangun | {index.ntotal} vektor")
        return index

    def save(self, index, path: str):
        self.faiss.write_index(index, path)
        print(f"💾 Index disimpan → {path}")

    def load(self, path: str):
        index = self.faiss.read_index(path)
        print(f"📂 Index dimuat dari {path} | {index.ntotal} vektor")
        return index


# ─── METADATA STORE ───────────────────────────────────────────────────────────

class MetadataStore:

    def __init__(self, path: str):
        self.path = path
        self.data = {}

    @staticmethod
    def _parse_skill_tags(val) -> list[str]:
        """Parse skill_tags dari string ke list, handle semua format."""
        if isinstance(val, list):
            return val
        if pd.isna(val) or val == "" or val == "[]":
            return []
        try:
            return ast.literal_eval(str(val))
        except Exception:
            return []

    @staticmethod
    def _build_document_text(row: pd.Series) -> str:
        """
        FIX 1: Generate natural language document text untuk embedding.

        Format ini konsisten dengan query format di 03_recommendation_engine.py v3
        sehingga cosine similarity antara query dan dokumen lebih tinggi.

        Sebelumnya (v2): pakai document_text pipe-separated dari CSV
          → "posisi data analyst | jenis disabilitas tunanetra | level mid level | ..."
        Sekarang (v3): natural language
          → "Lowongan Data Analyst untuk Tunanetra level Mid level. ..."
        """
        disability  = row.get("Jenis Disabilitas", "")
        job_title   = row.get("Job Title", "")
        level       = row.get("Level", "")
        qualification = row.get("Deskripsi Kualifikasi", "")
        accessibility = row.get("Kebutuhan Aksesibilitas", "")

        skill_tags = MetadataStore._parse_skill_tags(row.get("skill_tags", []))

        text = (
            f"Lowongan pekerjaan {job_title} untuk penyandang {disability}. "
            f"Level: {level}. "
            f"Kualifikasi: {qualification} "
        )
        if skill_tags:
            text += f"Skill yang dibutuhkan: {', '.join(skill_tags)}. "
        if accessibility:
            text += f"Aksesibilitas yang disediakan: {accessibility}."
        return text

    def build_from_df(self, df: pd.DataFrame) -> list[str]:
        """
        Build metadata dan kembalikan list document text untuk di-embed.

        Return: list[str] — teks yang akan di-embed (format natural language)
        """
        texts_to_embed = []

        for idx, row in df.iterrows():
            skill_tags = self._parse_skill_tags(row.get("skill_tags", []))

            # FIX 2: level_rank aman dari NaN
            level_rank = row.get("level_rank", 1)
            level_rank = int(level_rank) if pd.notna(level_rank) else 1

            self.data[idx] = {
                "job_id"         : row["job_id"],
                "job_title"      : row["Job Title"],
                "disability_type": row["Jenis Disabilitas"],
                "level"          : row["Level"],
                "level_rank"     : level_rank,
                "qualification"  : row["Deskripsi Kualifikasi"],
                "accessibility"  : row["Kebutuhan Aksesibilitas"],
                "skill_tags"     : skill_tags,
            }

            # FIX 1: gunakan natural language text untuk embedding
            texts_to_embed.append(self._build_document_text(row))

        with_tags = sum(1 for v in self.data.values() if v["skill_tags"])
        print(f"✅ Metadata untuk {len(self.data)} pekerjaan siap")
        print(f"   → {with_tags} jobs memiliki skill_tags ({with_tags/len(self.data)*100:.0f}%)")

        return texts_to_embed

    def save(self):
        with open(self.path, "wb") as f:
            pickle.dump(self.data, f)
        print(f"💾 Metadata disimpan → {self.path}")

    def load(self):
        with open(self.path, "rb") as f:
            self.data = pickle.load(f)
        print(f"📂 Metadata dimuat: {len(self.data)} entri")
        return self.data

    def get(self, idx: int) -> dict:
        return self.data.get(idx, {})


# ─── MAIN BUILD PIPELINE ──────────────────────────────────────────────────────

def build_index():
    print("=" * 60)
    print("InklusiKerja — Embedding & FAISS Index Builder v3")
    print("=" * 60)

    # 1. Load processed data
    jobs_df = pd.read_csv(f"{PROCESSED_DIR}/jobs_processed.csv")
    print(f"\n📊 {len(jobs_df)} pekerjaan dimuat dari CSV")

    # FIX 3: Validasi kolom wajib sebelum proses
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in jobs_df.columns]
    if missing_cols:
        raise ValueError(
            f"❌ Kolom wajib tidak ditemukan di jobs_processed.csv: {missing_cols}\n"
            f"   Kolom yang ada: {jobs_df.columns.tolist()}"
        )
    print(f"   ✓ Semua kolom wajib tersedia")

    # Distribusi disability type
    print(f"\n   Distribusi Jenis Disabilitas:")
    for dt, count in jobs_df["Jenis Disabilitas"].value_counts().items():
        print(f"      {count:4d}x  {dt}")

    # 2. Inisialisasi embedding engine
    print()
    engine = EmbeddingEngine(model_key=SELECTED_MODEL)

    # 3. Build metadata dan dapatkan teks natural language untuk embedding
    store = MetadataStore(f"{INDEX_DIR}/jobs_metadata.pkl")
    texts_to_embed = store.build_from_df(jobs_df)

    # Preview format document text
    print(f"\n   Preview document text (baris pertama):")
    print(f"   {texts_to_embed[0][:120]}...")

    # 4. Encode semua dokumen dengan format natural language
    embeddings = engine.encode(texts_to_embed, batch_size=64)

    # 5. Simpan raw embeddings
    np.save(f"{INDEX_DIR}/job_embeddings.npy", embeddings)
    print(f"💾 Raw embeddings disimpan → {INDEX_DIR}/job_embeddings.npy")

    # 6. Build FAISS index
    builder = FAISSIndexBuilder(dim=engine.dim)
    index = builder.build_flat_ip(embeddings)
    builder.save(index, f"{INDEX_DIR}/jobs.faiss")

    # 7. Simpan metadata
    store.save()

    # 8. Simpan config
    config = {
        "model_name"       : engine.model_name,
        "embedding_dim"    : engine.dim,
        "total_jobs"       : len(jobs_df),
        "index_type"       : "IndexFlatIP",
        "normalized"       : True,
        "has_skill_tags"   : True,
        "document_format"  : "natural_language_v3",
    }
    with open(f"{INDEX_DIR}/config.json", "w") as f:
        json.dump(config, f, indent=2)

    print("\n" + "=" * 60)
    print("✅ Build selesai! Semua file tersimpan di data/index/")
    print("   → jobs.faiss          (FAISS vector index)")
    print("   → jobs_metadata.pkl   (metadata + skill_tags)")
    print("   → job_embeddings.npy  (raw embeddings)")
    print("   → config.json")
    print("\n➡️  Lanjut ke 03_recommendation_engine.py")


if __name__ == "__main__":
    build_index()