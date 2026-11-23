"""
GIBRAS Assessment API Routes
"""
from pathlib import Path
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from apps.api.database import db_manager
from apps.api.models.api_schemas import AssessmentRequest
from geospatial.feature_engineering.pipeline import FeatureEngineeringPipeline
from ml.decision_engine import DecisionSupportEngine

router = APIRouter(prefix="/api/v1/assess", tags=["Assessment"])

# Initialize pipeline and decision engine
feature_pipeline = FeatureEngineeringPipeline()
decision_engine = DecisionSupportEngine()


@router.post("", response_model=dict)
def evaluate_borewell_site(req: AssessmentRequest):
    """
    Evaluates groundwater occurrence, borewell failure risk, expected yield,
    and seasonal stress for a proposed borewell site.
    """
    try:
        # Extract 22 hydrogeological features
        features = feature_pipeline.extract_features_for_point(req.latitude, req.longitude)
        if req.village:
            features["village"] = req.village
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    # Evaluate with decision engine
    assessment = decision_engine.evaluate_site(features)

    # Attach metadata
    assessment["village"] = req.village or "Unspecified Parcel"
    assessment["farmer_notes"] = req.farmer_notes or ""

    # Flatten for DB record
    occ = assessment.get("groundwater_potential", {})
    fail = assessment.get("failure_risk_assessment", {})
    yld = assessment.get("expected_yield", {})
    dep = assessment.get("depth_interval", {})

    record = {
        "assessment_id": assessment["assessment_id"],
        "latitude": req.latitude,
        "longitude": req.longitude,
        "district": assessment["administrative"]["district"],
        "taluk": assessment["administrative"]["taluk"],
        "village": req.village or "",
        "advisory_classification": assessment["advisory_classification"],
        "groundwater_occurrence_prob": occ.get("occurrence_probability"),
        "failure_risk_prob": fail.get("failure_probability"),
        "risk_tier": fail.get("risk_tier", ""),
        "yield_min_lpm": yld.get("yield_range_lpm", [None, None])[0],
        "yield_med_lpm": yld.get("median_yield_lpm"),
        "yield_max_lpm": yld.get("yield_range_lpm", [None, None])[1],
        "depth_min_m": dep.get("recommended_min_depth_m"),
        "depth_max_m": dep.get("recommended_max_depth_m"),
        "uncertainty_level": assessment.get("uncertainty_level", "CALIBRATED"),
        "data_status": assessment["status"],
        "features": features,
    }
    # Save to local spatial store
    db_manager.save_assessment(record)

    return assessment


@router.get("/recent")
def list_recent_assessments(limit: int = 50):
    return db_manager.list_recent_assessments(limit=limit)


@router.get("/{assessment_id}")
def get_assessment(assessment_id: str):
    res = db_manager.get_assessment(assessment_id)
    if not res:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return res


@router.get("/{assessment_id}/report", response_class=HTMLResponse)
def get_assessment_report(assessment_id: str):
    data = db_manager.get_assessment(assessment_id)
    if not data:
        raise HTTPException(status_code=404, detail="Assessment not found")

    lat = data.get("latitude", "N/A")
    lon = data.get("longitude", "N/A")
    taluk = data.get("taluk", "N/A")
    district = data.get("district", "N/A")
    village = data.get("village", "N/A")
    advisory = data.get("advisory_classification", "N/A")
    fail_prob = data.get("failure_risk_prob")
    fail_pct = f"{fail_prob * 100:.1f}%" if fail_prob is not None else "N/A"
    risk_tier = data.get("risk_tier", "N/A")
    yield_med = data.get("yield_med_lpm")
    yield_str = f"{yield_med:.0f} LPM" if yield_med is not None else "N/A"
    depth_min = data.get("depth_min_m")
    depth_max = data.get("depth_max_m")
    depth_str = f"{depth_min:.0f}m - {depth_max:.0f}m" if depth_min is not None else "Site-specific VES Required"

    color_class = "#dc2626" if "HIGH_RISK" in advisory else ("#16a34a" if "POTENTIALLY_FAVOURABLE" in advisory else "#ca8a04")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GIBRAS Formal Assessment Report - {assessment_id[:8]}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 40px; background: #f9fafb; }}
    .container {{ max-width: 850px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }}
    .header {{ border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 24px; }}
    .title {{ font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }}
    .subtitle {{ font-size: 14px; color: #64748b; margin-top: 4px; }}
    .badge {{ display: inline-block; padding: 8px 16px; border-radius: 6px; color: #fff; font-weight: 700; background: {color_class}; margin: 16px 0; font-size: 15px; }}
    .grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }}
    .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; }}
    .card h4 {{ margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; }}
    .card .val {{ font-size: 20px; font-weight: 700; color: #0f172a; }}
    .section {{ margin-top: 24px; }}
    .section h3 {{ border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #0f172a; }}
    ul {{ padding-left: 20px; }}
    .disclaimer {{ background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-top: 32px; font-size: 13px; color: #92400e; }}
    .kannada {{ font-size: 15px; color: #334155; margin-top: 6px; font-style: italic; }}
    @media print {{ body {{ background: #fff; padding: 0; }} .container {{ box-shadow: none; border: none; }} }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Groundwater Intelligence & Borewell Risk Assessment Report</h1>
      <div class="subtitle">Government-Grade Decision Support Platform | Kolar & Chikkaballapur Districts, Karnataka</div>
      <div class="subtitle">Assessment ID: <code>{assessment_id}</code> | Timestamp: {data.get('created_at', '2026-11-23')}</div>
    </div>

    <div>
      <div class="badge">{advisory.replace('_', ' ')}</div>
    </div>

    <div class="grid">
      <div class="card">
        <h4>Location / ಸ್ಥಳ</h4>
        <div class="val">{village}, {taluk}</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Lat: {lat}, Lon: {lon} ({district} Dist)</div>
      </div>
      <div class="card">
        <h4>Failure Risk / ವಿಫಲತೆಯ ಅಪಾಯ</h4>
        <div class="val">{fail_pct}</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Risk Tier: {risk_tier}</div>
      </div>
      <div class="card">
        <h4>Expected Yield / ನಿರೀಕ್ಷಿತ ಇಳುವರಿ</h4>
        <div class="val">{yield_str}</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Discharge (Litres Per Minute)</div>
      </div>
      <div class="card">
        <h4>Recommended Depth / ಶಿಫಾರಸು ಆಳ</h4>
        <div class="val">{depth_str}</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Tectonically fractured zone</div>
      </div>
    </div>

    <div class="section">
      <h3>Recommended Action Plan / ಸಲಹೆ ಮತ್ತು ಕ್ರಮಗಳು</h3>
      <ul>
        <li><strong>Field Geophysical Survey:</strong> Conduct site-specific Vertical Electrical Sounding (VES) resistivity profiling by certified ground water hydrogeologists before committing capital.</li>
        <li><strong>Borewell Spacing:</strong> Maintain mandatory statutory spacing of at least 200 meters from existing functional irrigation or drinking borewells.</li>
        <li><strong>Drilling Ceiling:</strong> Do not drill beyond 200–220 meters into massive basement rock without verified fracture indications.</li>
        <li><strong>Water Conservation:</strong> Adopt drip or micro-irrigation systems to prolong aquifer longevity.</li>
      </ul>
      <div class="kannada">
        ಕಡ್ಡಾಯವಾಗಿ ಅಧಿಕೃತ ಜಲತಜ್ಞರಿಂದ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ಸಮೀಕ್ಷೆ ಮಾಡಿಸಿ. ಪಕ್ಕದ ಬಾವಿಯಿಂದ ಕನಿಷ್ಠ 200 ಮೀ ಅಂತರ ಕಾಪಾಡಿ. 200 ಮೀ ಆಳಕ್ಕಿಂತ ಹೆಚ್ಚು ಕೊರೆಯುವುದು ಅಧಿಕ ಆರ್ಥಿಕ ನಷ್ಟಕ್ಕೆ ಕಾರಣವಾಗಬಹುದು.
      </div>
    </div>

    <div class="disclaimer">
      <strong>Public Welfare Scientific Disclaimer:</strong><br>
      This assessment is an advisory tool developed to evaluate hydrogeological risk and prevent avoidable drilling debt among farmers. It does not constitute a drilling guarantee or a statutory permit. Groundwater occurrence in crystalline hard-rock is anisotropic and subject to discrete localized fractures.
    </div>
  </div>
</body>
</html>"""
    return HTMLResponse(content=html)
