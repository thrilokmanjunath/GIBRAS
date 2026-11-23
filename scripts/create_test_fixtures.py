"""
Synthetic Test Fixture Generator (Class E Data)
STRICT WARNING: This dataset is synthetic and for test harnesses ONLY.
It must NEVER be ingested into production training pipelines.
"""
from pathlib import Path
import pandas as pd
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent.parent
TEST_DATA_DIR = ROOT_DIR / "data" / "synthetic_test_only"
TEST_DATA_DIR.mkdir(parents=True, exist_ok=True)

def generate_synthetic_test_fixtures():
    np.random.seed(999)
    synthetic_records = []
    for i in range(25):
        synthetic_records.append({
            "borewell_id": f"SYNTH-TEST-{i:03d}",
            "district": "Kolar",
            "taluk": "Kolar",
            "village": "Synthetic Village",
            "drilling_date": "2024-01-01",
            "total_depth_m": 150.0,
            "weathered_zone_depth_m": 15.0,
            "geological_formation": "Synthetic Granite",
            "water_strike_depth_m": 80.0,
            "static_water_level_m": 40.0,
            "yield_lpm": 50.0,
            "pumping_test_duration_hrs": 4.0,
            "drawdown_m": 10.0,
            "pre_monsoon_level_m": 45.0,
            "post_monsoon_level_m": 35.0,
            "borewell_outcome": "PRODUCTIVE",
            "outcome_definition": "Synthetic test definition",
            "evidence_source": "MOCK_UNIT_TEST_FIXTURE",
            "quality_tier": "E", # Explicitly Class E
            "verification_status": "PENDING_VERIFICATION",
            "latitude": 13.13 + float(np.random.normal(0, 0.01)),
            "longitude": 78.13 + float(np.random.normal(0, 0.01)),
        })
    df = pd.DataFrame(synthetic_records)
    out_path = TEST_DATA_DIR / "synthetic_mock_wells.parquet"
    df.to_parquet(out_path, index=False)
    print(f"[OK] Synthetic mock fixture created at: {out_path.name} (Quality Tier E)")

if __name__ == "__main__":
    generate_synthetic_test_fixtures()
