"""
GIBRAS Pydantic API Request/Response Schemas
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AssessmentRequest(BaseModel):
    latitude: float = Field(..., ge=12.5, le=14.3, description="WGS84 latitude")
    longitude: float = Field(..., ge=77.3, le=78.8, description="WGS84 longitude")
    district: Optional[str] = Field(None, description="Kolar or Chikkaballapur")
    taluk: Optional[str] = Field(None, description="Taluk name")
    village: Optional[str] = Field(None, description="Village or survey parcel")
    farmer_notes: Optional[str] = Field(None, description="Farmer notes or historical attempts")


class FieldVerificationRequest(BaseModel):
    assessment_id: str = Field(..., description="Target assessment ID to verify")
    hydrogeologist_name: str = Field(..., description="Licensed hydrogeologist identifier")
    geophysical_ves_conducted: bool = Field(default=False)
    apparent_resistivity_ohm_m: Optional[float] = Field(None, ge=1.0, le=10000.0)
    inferred_weathered_depth_m: Optional[float] = Field(None, ge=0.0, le=100.0)
    inferred_fracture_depth_m: Optional[float] = Field(None, ge=0.0, le=400.0)
    verified_outcome: str = Field(..., description="DRY, INADEQUATE_YIELD, PRODUCTIVE, SUSTAINABLE_WITH_MONITORING")
    actual_yield_lpm: Optional[float] = Field(None, ge=0.0)
    expert_notes: Optional[str] = Field(None)
    approval_status: str = Field(default="APPROVED", description="APPROVED, REJECTED, NEEDS_MORE_SURVEY")
