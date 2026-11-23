"""
Standardized Borewell Observation & Ground Truth Schema
Implementing Section 4.1 & 4.2 of GIBRAS Master Directive.
"""
from datetime import date
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class BorewellOutcome(str, Enum):
    DRY = "DRY"
    INADEQUATE_YIELD = "INADEQUATE_YIELD"
    PRODUCTIVE = "PRODUCTIVE"
    SUSTAINABLE_WITH_MONITORING = "SUSTAINABLE_WITH_MONITORING"
    UNKNOWN = "UNKNOWN"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class EvidenceQualityTier(str, Enum):
    TIER_A = "A"  # Official and independently verifiable (CGWB, SGWD, India-WRIS)
    TIER_B = "B"  # Official but incomplete or requiring spatial interpolation
    TIER_C = "C"  # Documented research / third-party published study
    TIER_D = "D"  # Field-reported / crowdsourced, unverified
    TIER_E = "E"  # Synthetic test fixture (STRICTLY PROHIBITED FROM REAL MODEL TRAINING)


class VerificationStatus(str, Enum):
    VERIFIED_OFFICIAL = "VERIFIED_OFFICIAL"
    FIELD_VERIFIED = "FIELD_VERIFIED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    REJECTED = "REJECTED"


class FractureInterval(BaseModel):
    from_depth_m: float = Field(..., ge=0.0, le=1000.0)
    to_depth_m: float = Field(..., ge=0.0, le=1000.0)
    yield_strike_lpm: Optional[float] = Field(None, ge=0.0)

    @model_validator(mode="after")
    def validate_interval(self):
        if self.to_depth_m < self.from_depth_m:
            raise ValueError(f"to_depth_m ({self.to_depth_m}) must be >= from_depth_m ({self.from_depth_m})")
        return self


class BorewellObservation(BaseModel):
    borewell_id: str = Field(..., description="Unique alphanumeric identifier (e.g. CGWB-KAR-KOL-001)")
    latitude: float = Field(..., ge=12.5, le=14.2, description="WGS84 latitude within Kolar/Chikkaballapur bounds")
    longitude: float = Field(..., ge=77.5, le=78.7, description="WGS84 longitude within Kolar/Chikkaballapur bounds")
    district: str = Field(..., description="Kolar or Chikkaballapur")
    taluk: str = Field(..., description="Taluk administrative name")
    village: Optional[str] = Field(None, description="Village name if recorded")
    drilling_date: Optional[date] = Field(None, description="Recorded date of drilling completion")
    total_depth_m: float = Field(..., gt=0.0, le=600.0, description="Total drilled depth in meters bgl")
    weathered_zone_depth_m: Optional[float] = Field(None, ge=0.0, le=100.0, description="Depth of saprolite/weathered mantle")
    geological_formation: str = Field(..., description="Lithological host rock (e.g. Granitic Gneiss, Amphibolite)")
    fracture_intervals: List[FractureInterval] = Field(default_factory=list, description="Recorded fracture strikes")
    water_strike_depth_m: Optional[float] = Field(None, ge=0.0, le=600.0, description="Depth of primary water strike")
    static_water_level_m: Optional[float] = Field(None, ge=0.0, le=300.0, description="Resting piezometric head m bgl")
    pumping_water_level_m: Optional[float] = Field(None, ge=0.0, le=400.0, description="Dynamic head under pumping")
    yield_lpm: Optional[float] = Field(None, ge=0.0, description="Recorded discharge in Litres Per Minute")
    pumping_test_duration_hrs: Optional[float] = Field(None, ge=0.0, le=72.0, description="Duration of aquifer yield test")
    drawdown_m: Optional[float] = Field(None, ge=0.0, le=300.0, description="Pumping drawdown in meters")
    recovery_measurements: Optional[dict] = Field(default=None, description="Aquifer recovery time-drawdown observations")
    pre_monsoon_level_m: Optional[float] = Field(None, ge=0.0, le=250.0, description="May/June water level")
    post_monsoon_level_m: Optional[float] = Field(None, ge=0.0, le=250.0, description="November/December water level")
    borewell_outcome: BorewellOutcome = Field(..., description="Taxonomy outcome")
    outcome_definition: str = Field(..., description="Formal operational criteria used to assign the outcome label")
    observation_date: date = Field(..., description="Timestamp of outcome audit")
    evidence_source: str = Field(..., description="Originating document, agency, or survey ID")
    quality_tier: EvidenceQualityTier = Field(..., description="Class A, B, C, D, or E")
    verification_status: VerificationStatus = Field(default=VerificationStatus.PENDING_VERIFICATION)

    @field_validator("district")
    @classmethod
    def validate_district(cls, v: str) -> str:
        v_clean = v.strip().title()
        if v_clean not in ["Kolar", "Chikkaballapur", "Chikkaballapura"]:
            raise ValueError(f"District must be Kolar or Chikkaballapur, received '{v}'")
        return "Chikkaballapur" if v_clean == "Chikkaballapura" else v_clean

    @model_validator(mode="after")
    def validate_yield_and_outcome(self):
        # A well must never be marked SUSTAINABLE_WITH_MONITORING if only drilled without pumping test or monitoring
        if self.borewell_outcome == BorewellOutcome.SUSTAINABLE_WITH_MONITORING:
            if self.pre_monsoon_level_m is None and self.pumping_test_duration_hrs is None:
                raise ValueError(
                    "Cannot classify well as SUSTAINABLE_WITH_MONITORING without verified multi-season water level or pumping test"
                )
        # Check yield vs outcome consistency if yield is recorded
        if self.yield_lpm is not None and self.yield_lpm < 15.0:
            if self.borewell_outcome in [BorewellOutcome.PRODUCTIVE, BorewellOutcome.SUSTAINABLE_WITH_MONITORING]:
                raise ValueError(f"Yield {self.yield_lpm} LPM is inadequate; cannot be labelled {self.borewell_outcome}")
        return self
