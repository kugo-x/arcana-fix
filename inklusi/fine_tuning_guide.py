
"""
InklusiKerja — Fine-Tuning Guide
==================================
Kapan perlu fine-tuning:
  - Silhouette score < 0.3
  - Banyak rekomendasi tidak relevan secara manual review
  - Model terlalu generik, tidak mengerti konteks disabilitas

Pendekatan fine-tuning:

1. CONTRASTIVE LEARNING (Siamese Network)
   ─────────────────────────────────────
   Buat pasangan (anchor, positive, negative):
   - anchor:   profil kandidat
   - positive: pekerjaan yang cocok (sama disability_type, skill overlap)
   - negative: pekerjaan yang tidak cocok (beda disability_type)
   
   Gunakan: MultipleNegativesRankingLoss dari sentence-transformers

2. DATA PAIRS GENERATION
   ─────────────────────
   Dari dataset kita, otomatis buat training pairs:
"""

from sentence_transformers import SentenceTransformer, losses, InputExample
from torch.utils.data import DataLoader
import pandas as pd
import random

def generate_training_pairs(jobs_df, kandidat_df, n_pairs=1000):
    pairs = []
    
    for _, kandidat in kandidat_df.iterrows():
        k_disability = kandidat["disability_type"]
        k_query = kandidat["query_text"]
        
        # Positive pairs: pekerjaan yang cocok dengan disabilitas kandidat
        positive_jobs = jobs_df[
            jobs_df["Jenis Disabilitas"].str.lower().str.contains(
                k_disability.lower().split("(")[0].strip(), na=False
            )
        ]
        
        # Negative pairs: pekerjaan yang TIDAK cocok
        negative_jobs = jobs_df[
            ~jobs_df["Jenis Disabilitas"].str.lower().str.contains(
                k_disability.lower().split("(")[0].strip(), na=False
            )
        ]
        
        if positive_jobs.empty or negative_jobs.empty:
            continue
        
        # Sample pairs
        for _ in range(3):
            pos = positive_jobs.sample(1).iloc[0]
            neg = negative_jobs.sample(1).iloc[0]
            
            # Positive pair (label=1)
            pairs.append(InputExample(
                texts=[k_query, pos["document_text"]],
                label=1.0
            ))
            
            # Negative pair (label=0)
            pairs.append(InputExample(
                texts=[k_query, neg["document_text"]],
                label=0.0
            ))
    
    random.shuffle(pairs)
    return pairs[:n_pairs]


def fine_tune_model(model_name: str, training_pairs, output_dir: str = "models/finetuned"):
    model = SentenceTransformer(model_name)
    
    train_dataloader = DataLoader(training_pairs, shuffle=True, batch_size=16)
    
    # CosineSimilarityLoss untuk labeled pairs
    train_loss = losses.CosineSimilarityLoss(model)
    
    # Atau gunakan MultipleNegativesRankingLoss untuk triplet tanpa negatif eksplisit:
    # train_loss = losses.MultipleNegativesRankingLoss(model)
    
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=3,
        warmup_steps=100,
        output_path=output_dir,
        show_progress_bar=True,
    )
    
    print(f"✅ Fine-tuned model disimpan → {output_dir}")
    return model


# Jalankan fine-tuning:
# jobs_df = pd.read_csv("data/processed/jobs_processed.csv")
# kandidat_df = pd.read_csv("data/processed/kandidat_processed.csv")
# pairs = generate_training_pairs(jobs_df, kandidat_df, n_pairs=2000)
# model = fine_tune_model("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", pairs)
