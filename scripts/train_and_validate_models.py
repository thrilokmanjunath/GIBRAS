"""
GIBRAS Model Training, Spatial Validation, and Serialization Script
Executes spatial block cross-validation, verifies calibration, and serializes production models.
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd

from geospatial.feature_engineering.pipeline import FeatureEngineeringPipeline
from ml.evaluation.spatial_cv import evaluate_spatial_block_cv, audit_synthetic_leakage
from ml.failure_prediction.failure_model import BorewellFailureRiskModel
from ml.occurrence.occurrence_model import GroundwaterOccurrenceModel
from ml.yield_prediction.yield_model import BorewellYieldModel

ROOT_DIR = Path(__file__).resolve().parent.parent
CURATED_DIR = ROOT_DIR / "data" / "curated"
SAVED_MODELS_DIR = ROOT_DIR / "ml" / "saved_models"
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)


def train_and_validate():
    print("=== GIBRAS Machine Learning Training & Spatial Audit ===")

    # 1. Load Verified Curated Wells
    wells_parquet = CURATED_DIR / "historical_borewell_observations.parquet"
    if not wells_parquet.exists():
        raise FileNotFoundError(f"Missing curated dataset at {wells_parquet}")

    wells_df = pd.read_parquet(wells_parquet)
    print(f"[DATA] Loaded {len(wells_df)} verified borewell observations.")

    # 2. Strict Synthetic Leakage Audit
    audit_synthetic_leakage(wells_df)
    print("[AUDIT] 0% Synthetic Data Leakage verified. All samples are Tier A/B.")

    # 3. Extract Geospatial Feature Vectors
    pipeline = FeatureEngineeringPipeline()
    print("[PIPELINE] Extracting 22 geospatial and hydrogeological features...")
    features_list = []
    for _, row in wells_df.iterrows():
        feat = pipeline.extract_features_for_point(row["latitude"], row["longitude"])
        features_list.append(feat)

    # 4. Spatial Block Cross-Validation (Taluk-blocked)
    print("[EVAL] Running Taluk-Blocked Spatial Cross-Validation...")
    spatial_metrics = evaluate_spatial_block_cv(wells_df, features_list, BorewellFailureRiskModel)
    print("\n=== SPATIAL BLOCK CV RESULTS ===")
    for k, v in spatial_metrics.items():
        print(f"  {k}: {v}")

    # Check Quality Gate D Criteria
    assert spatial_metrics["mean_brier_score"] <= 0.22, f"Brier score {spatial_metrics['mean_brier_score']} exceeds 0.22"
    assert spatial_metrics["mean_ece"] < 0.20, f"ECE {spatial_metrics['mean_ece']} exceeds 0.20"
    assert spatial_metrics["mean_roc_auc"] >= 0.80, f"ROC-AUC {spatial_metrics['mean_roc_auc']} below 0.80"
    print("\n[GATE D] Passed Quality Gate D: Spatial calibration and performance benchmarks met!")

    # 5. Train Full Production Models
    print("\n[TRAIN] Training production Model A (Groundwater Occurrence)...")
    y_occurrence = np.array([1 if r["borewell_outcome"] in ["PRODUCTIVE", "INADEQUATE_YIELD"] else 0
                             for _, r in wells_df.iterrows()])
    occ_model = GroundwaterOccurrenceModel()
    occ_model.fit(features_list, y_occurrence)

    print("[TRAIN] Training production Model B (Borewell Failure Risk)...")
    y_failure = np.array([1 if r["borewell_outcome"] in ["DRY", "INADEQUATE_YIELD"] else 0
                          for _, r in wells_df.iterrows()])
    fail_model = BorewellFailureRiskModel()
    fail_model.fit(features_list, y_failure)

    print("[TRAIN] Training production Model C (Quantile Yield Regressor)...")
    y_yield = np.array([float(r["yield_lpm"] or 0.0) for _, r in wells_df.iterrows()])
    yield_model = BorewellYieldModel()
    yield_model.fit(features_list, y_yield)

    # 6. Serialize Production Artifacts
    joblib.dump(occ_model, SAVED_MODELS_DIR / "occurrence_model.joblib")
    joblib.dump(fail_model, SAVED_MODELS_DIR / "failure_model.joblib")
    joblib.dump(yield_model, SAVED_MODELS_DIR / "yield_model.joblib")

    # Save metrics artifact
    metrics_path = SAVED_MODELS_DIR / "validation_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(spatial_metrics, f, indent=2)

    print(f"\n[OK] Models serialized to: {SAVED_MODELS_DIR}")
    print(f"[OK] Validation metrics saved to: {metrics_path.name}")


if __name__ == "__main__":
    train_and_validate()
