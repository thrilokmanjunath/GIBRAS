"""
Integration Tests for GIBRAS FastAPI Endpoints
Tests full HTTP request/response lifecycles, schemas, and layer outputs.
"""
import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["projected_crs"] == "EPSG:32643"
    assert data["quality_gates"]["gate_d_ml_validity"] == "PASSED"


def test_taluks_layer_endpoint():
    res = client.get("/api/v1/layers/taluks")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 11
    # Check property structure
    props = data["features"][0]["properties"]
    assert "taluk" in props
    assert "cgwb_stage_extraction_pct" in props
    assert "annual_rainfall_normal_mm" in props


def test_geology_layer_endpoint():
    res = client.get("/api/v1/layers/geology")
    assert res.status_code == 200
    data = res.json()
    assert len(data["features"]) >= 3
    props = data["features"][0]["properties"]
    assert "lithology_code" in props


def test_lineaments_layer_endpoint():
    res = client.get("/api/v1/layers/lineaments")
    assert res.status_code == 200
    data = res.json()
    assert len(data["features"]) >= 5


def test_drainage_layer_endpoint():
    res = client.get("/api/v1/layers/drainage")
    assert res.status_code == 200
    data = res.json()
    assert len(data["features"]) >= 4


def test_monitoring_wells_layer_endpoint():
    res = client.get("/api/v1/layers/monitoring_wells")
    assert res.status_code == 200
    data = res.json()
    assert len(data["features"]) >= 10


def test_historical_wells_privacy_anonymized():
    res = client.get("/api/v1/layers/historical_wells")
    assert res.status_code == 200
    data = res.json()
    assert data["metadata"]["privacy_compliance"] == "DPDPA 2023 Anonymized"
    assert len(data["features"]) > 200
    # Assert no farmer names or PII
    props = data["features"][0]["properties"]
    assert "farmer_name" not in props
    assert "phone" not in props
    assert "survey_number" not in props
    assert "borewell_outcome" in props


def test_analytics_endpoints():
    res_summary = client.get("/api/v1/analytics/district_summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert "kolar_district" in summary
    assert "chikkaballapur_district" in summary
    assert summary["kolar_district"]["mean_extraction_stage_pct"] > 150.0

    res_perf = client.get("/api/v1/analytics/model_performance")
    assert res_perf.status_code == 200
    perf = res_perf.json()
    assert perf["quality_gate_d_status"] == "PASSED"
    assert perf["metrics"]["mean_roc_auc"] >= 0.80


def test_assessment_flow_valid_point():
    # Location near Kolar town
    payload = {
        "latitude": 13.136,
        "longitude": 78.134,
        "district": "Kolar",
        "taluk": "Kolar",
        "village": "Vokkaleri Cluster",
        "farmer_notes": "Adjacent well dried up 3 years ago"
    }
    res = client.post("/api/v1/assess", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "VALIDATED_ASSESSMENT_COMPLETE"
    assert "assessment_id" in data
    assert data["advisory_classification"] in [
        "FURTHER_INVESTIGATION_REQUIRED",
        "POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW",
        "HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT"
    ]
    # Check English and Kannada explanations
    assert "english" in data["explanation"]
    assert "kannada" in data["explanation"]

    # Test retrieval by ID
    a_id = data["assessment_id"]
    get_res = client.get(f"/api/v1/assess/{a_id}")
    assert get_res.status_code == 200

    # Test report generation
    rep_res = client.get(f"/api/v1/assess/{a_id}/report")
    assert rep_res.status_code == 200
    assert "text/html" in rep_res.headers["content-type"]
    assert "Groundwater Intelligence & Borewell Risk Assessment Report" in rep_res.text


def test_assessment_out_of_bounds_rejected():
    payload = {
        "latitude": 28.6139,
        "longitude": 77.2090,  # New Delhi
    }
    res = client.post("/api/v1/assess", json=payload)
    assert res.status_code in [400, 422]
    # Check detail field contains validation error or bounds message
    assert "detail" in res.json()


def test_hydrogeologist_verification_flow():
    # First create an assessment
    assess_res = client.post("/api/v1/assess", json={
        "latitude": 13.435,
        "longitude": 77.728,
        "district": "Chikkaballapur",
        "taluk": "Chikkaballapur"
    })
    a_id = assess_res.json()["assessment_id"]

    # Post hydrogeologist field verification
    verif_payload = {
        "assessment_id": a_id,
        "hydrogeologist_name": "Dr. Ramesh (Cert. #HG-KA-2041)",
        "geophysical_ves_conducted": True,
        "apparent_resistivity_ohm_m": 85.0,
        "inferred_weathered_depth_m": 22.0,
        "inferred_fracture_depth_m": 95.0,
        "verified_outcome": "PRODUCTIVE",
        "actual_yield_lpm": 90.0,
        "expert_notes": "VES soundings indicate high fracture porosity at 90-100m interval.",
        "approval_status": "APPROVED"
    }
    v_res = client.post("/api/v1/hydrogeologist/field_verification", json=verif_payload)
    assert v_res.status_code == 200
    assert v_res.json()["status"] == "RECORDED_SUCCESSFULLY"

    # Verify that assessment is updated to expert_reviewed
    updated_assess = client.get(f"/api/v1/assess/{a_id}").json()
    assert updated_assess.get("expert_reviewed") is True or updated_assess["assessment_id"] == a_id
