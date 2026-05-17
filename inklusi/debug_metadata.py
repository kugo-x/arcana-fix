import pickle
from collections import Counter

with open("data/index/jobs_metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

# Cek keys di metadata
sample = metadata[0]
print("=== Keys di metadata ===")
print(list(sample.keys()))
print()
print("=== Isi sample entry ===")
for k, v in sample.items():
    print(f"  {k}: {repr(v)[:80]}")

print()
print("=== Disability types di metadata ===")
disability_types = [v.get("disability_type", "KOSONG") for v in metadata.values()]
for dt, count in Counter(disability_types).most_common():
    print(f"  {count:4d}x  '{dt}'")