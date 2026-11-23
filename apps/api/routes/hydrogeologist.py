"""
GIBRAS Hydrogeologist Expert Interface Routes
Enables certified hydrogeologists to review assessments, log Vertical Electrical Sounding (VES)
geophysical resistivity profiles, and record verified ground-truth drilling outcomes.
"""
import uuid
from fastapi import APIRouter, HTTPException

from apps.api.database import db_manager
from apps.api.models.api_schemas import FieldVerificationRequest

router = APIRouter(prefix="/api/v1/hydrogeologist", tags=["Hydrogeologist"])


@router.post("/field_verification")
def submit_field_verification(req: FieldVerificationRequest):
    """
    Submits a field hydrogeological verification report including VES resistivity data.
    """
    # Check that target assessment exists
    assessment = db_manager.get_assessment(req.assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    verification_id = str(uuid.uuid4())
    data = {
        "verification_id": verification_id,
        "assessment_id": req.assessment_id,
        "hydrogeologist_name": req.hydrogeologist_name,
        "geophysical_ves_conducted": req.geophysical_ves_conducted,
        "apparent_resistivity_ohm_m": req.apparent_resistivity_ohm_m,
        "inferred_weathered_depth_m": req.inferred_weathered_depth_m,
        "inferred_fracture_depth_m": req.inferred_fracture_depth_m,
        "verified_outcome": req.verified_outcome,
        "actual_yield_lpm": req.actual_yield_lpm,
        "expert_notes": req.expert_notes or "",
        "approval_status": req.approval_status,
    }
    db_manager.save_field_verification(data)

    return {
        "verification_id": verification_id,
        "assessment_id": req.assessment_id,
        "status": "RECORDED_SUCCESSFULLY",
        "message": f"Field verification logged by {req.hydrogeologist_name}. Assessment status updated to EXPERT_REVIEWED."
    }


@router.get("/verifications")
def list_verifications(limit: int = 50):
    return db_manager.list_field_verifications(limit=limit)


@router.get("/pending_reviews")
def list_pending_reviews(limit: int = 50):
    """
    Returns recent assessments that have not yet undergone expert hydrogeological review.
    """
    all_assess = db_manager.list_recent_assessments(limit=limit)
    pending = [a for a in all_assess if not a.get("expert_reviewed")]
    return pending
