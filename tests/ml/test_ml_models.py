"""
Unit Tests for GIBRAS ML Models, Calibration, and Decision Support Engine
"""
import pytest
import numpy as np
import pandas as pd
from ml.occurrence.occurrence_model import GroundwaterOccurrenceModel
from ml.failure_prediction.failure_model import BorewellFailureRiskModel
from ml.yield_prediction.yield_model import BorewellYieldModel
from ml.depth_estimation.depth_model import ProductiveDepthRecommender
from ml.sustainability.stress_model import SeasonalGroundwaterStressModel
from ml.decision_engine import DecisionSupportEngine
from ml.evaluation.spatial_cv import audit_synthetic_leakage


@pytest.fixture
def sample_feature_vector():
    return {
        "latitude": 13.136,
        "longitude": 78.134,
        "district": "Kolar",
        "taluk": "Kolar",
        "taluk_code": "KAR_KOL_01",
        "elevation_m": 780.0,
        "slope_deg": 3.2,
        "aspect_deg": 280.0,
        "twi": 8.5,
        "tpi_500m": -1.2,
        "tri": 2.1,
        "lineament_density_km_km2": 0.45,
        "dist_to_lineament_m": 350.0,
        "dist_to_intersection_m": 420.0,
        "drainage_density_km_km2": 0.85,
        "dist_to_stream_m": 220.0,
        "lithology_code": "PGC",
        "formation_name": "Peninsular Gneissic Complex",
        "primary_aquifer_type": "WEATHERED_FRACTURED_GNEISS",
        "weathered_depth_mean_m": 18.5,
        "specific_yield_est": 0.035,
        "rainfall_annual_normal_mm": 744.0,
        "monsoon_deficit_pct": -14.0,
        "nearest_station_code": "CGWB_KOL_01",
        "dist_to_station_m": 3200.0,
        "gw_depth_pre_monsoon_m": 48.5,
        "gw_depth_post_monsoon_m": 38.2,
        "gw_seasonal_fluctuation_m": 10.3,
        "cgwb_stage_extraction_pct": 194.2,
        "cgwb_category": "OVER-EXPLOITED",
        "obs_well_density_5km": 3,
        "ndvi_pre_monsoon": 0.28,
        "ndwi_post_monsoon": 0.05,
        "bsi_pre_monsoon": 0.22,
    }


def test_synthetic_leakage_audit_clean():
    clean_df = pd.DataFrame([{"id": 1, "quality_tier": "A"}, {"id": 2, "quality_tier": "B"}])
    assert audit_synthetic_leakage(clean_df) is True


def test_synthetic_leakage_audit_contaminated():
    bad_df = pd.DataFrame([{"id": 1, "quality_tier": "A"}, {"id": 2, "quality_tier": "E"}])
    with pytest.raises(ValueError) as exc:
        audit_synthetic_leakage(bad_df)
    assert "FATAL AUDIT FAILURE" in str(exc.value)


def test_occurrence_model_bounds(sample_feature_vector):
    model = GroundwaterOccurrenceModel()
    prob = model.predict_occurrence_probability(sample_feature_vector)
    assert 0.0 <= prob <= 1.0


def test_failure_model_bounds_and_explanations(sample_feature_vector):
    model = BorewellFailureRiskModel()
    prob, tier, factors = model.predict_failure_probability(sample_feature_vector)
    assert 0.0 <= prob <= 1.0
    assert tier in ["LOW_RISK", "MODERATE_RISK", "HIGH_RISK", "CRITICAL_FAILURE_RISK"]
    assert len(factors) > 0
    # Assert Kannada and English keys present in factors
    assert "description" in factors[0]
    assert "kannada" in factors[0]


def test_yield_quantile_ordering(sample_feature_vector):
    model = BorewellYieldModel()
    y_min, y_med, y_max, status = model.predict_yield_range(sample_feature_vector)
    assert y_min <= y_med <= y_max
    assert y_min >= 0.0
    assert status in ["HIGH_CONFIDENCE", "MODERATE_SPREAD", "HIGH_UNCERTAINTY"]


def test_decision_engine_evaluation(sample_feature_vector):
    engine = DecisionSupportEngine()
    result = engine.evaluate_site(sample_feature_vector)
    assert result["status"] == "VALIDATED_ASSESSMENT_COMPLETE"
    assert result["advisory_classification"] in [
        "FURTHER_INVESTIGATION_REQUIRED",
        "POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW",
        "HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT"
    ]
    assert "english" in result["explanation"]
    assert "kannada" in result["explanation"]
    assert len(result["recommended_actions"]) > 0
    assert len(result["kannada_recommended_actions"]) > 0


def test_decision_engine_abstention_on_sparse_data(sample_feature_vector):
    engine = DecisionSupportEngine()
    sparse_vector = dict(sample_feature_vector)
    # Set zero observations within 5km and far away from any lineament
    sparse_vector["obs_well_density_5km"] = 0
    sparse_vector["dist_to_lineament_m"] = 5500.0

    result = engine.evaluate_site(sparse_vector)
    assert result["status"] == "INSUFFICIENT_DATA_FOR_RELIABLE_PREDICTION"
    assert result["advisory_classification"] == "FURTHER_INVESTIGATION_REQUIRED"
    assert result["groundwater_occurrence_probability"] is None
    assert result["failure_risk_probability"] is None
    assert "abstains from generating speculative predictions" in result["scientific_explanation"]
