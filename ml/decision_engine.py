"""
Model F: Unified Decision-Support & Abstention Engine
Integrates Models A, B, C, D, E with explicit spatial uncertainty and safety abstention.
Enforces Master Directive Section 1, 7, and 18 rules.
"""
from typing import Any, Dict, List, Optional
import uuid

from ml.depth_estimation.depth_model import ProductiveDepthRecommender
from ml.failure_prediction.failure_model import BorewellFailureRiskModel
from ml.occurrence.occurrence_model import GroundwaterOccurrenceModel
from ml.sustainability.stress_model import SeasonalGroundwaterStressModel
from ml.yield_prediction.yield_model import BorewellYieldModel


class DecisionSupportEngine:
    def __init__(
        self,
        occurrence_model: Optional[GroundwaterOccurrenceModel] = None,
        failure_model: Optional[BorewellFailureRiskModel] = None,
        yield_model: Optional[BorewellYieldModel] = None,
        depth_model: Optional[ProductiveDepthRecommender] = None,
        stress_model: Optional[SeasonalGroundwaterStressModel] = None,
    ):
        self.occurrence_model = occurrence_model or GroundwaterOccurrenceModel()
        self.failure_model = failure_model or BorewellFailureRiskModel()
        self.yield_model = yield_model or BorewellYieldModel()
        self.depth_model = depth_model or ProductiveDepthRecommender()
        self.stress_model = stress_model or SeasonalGroundwaterStressModel()

    def evaluate_site(
        self,
        features: Dict[str, Any],
        nearby_logs: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end evaluation for a proposed borewell site.
        Enforces data sufficiency checks and explicit uncertainty abstention.
        """
        assessment_id = str(uuid.uuid4())
        lat = features["latitude"]
        lon = features["longitude"]
        taluk = features.get("taluk", "Unknown")
        district = features.get("district", "Unknown")

        # 1. Quality & Data Sufficiency Audit
        obs_density = features.get("obs_well_density_5km", 0)
        dist_lin = features.get("dist_to_lineament_m", 1200.0)

        # Check for Abstention condition
        if obs_density == 0 and dist_lin > 4000.0:
            return {
                "assessment_id": assessment_id,
                "status": "INSUFFICIENT_DATA_FOR_RELIABLE_PREDICTION",
                "coordinates": {"latitude": lat, "longitude": lon},
                "administrative": {"district": district, "taluk": taluk},
                "advisory_classification": "FURTHER_INVESTIGATION_REQUIRED",
                "groundwater_occurrence_probability": None,
                "failure_risk_probability": None,
                "expected_yield_range_lpm": None,
                "depth_interval_recommendation": None,
                "uncertainty_level": "CRITICAL_SPARSE_DATA",
                "scientific_explanation": (
                    "No verified ground observations exist within 5km radius, and site is remote from mapped "
                    "structural lineaments. The system abstains from generating speculative predictions to prevent "
                    "avoidable farmer expenditure."
                ),
                "kannada_explanation": (
                    "ಈ ಸ್ಥಳದ 5 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಅಧಿಕೃತ ಬಾವಿ ದಾಖಲೆಗಳಿಲ್ಲ ಮತ್ತು ಮುಖ್ಯ ಬಿರುಕುಗಳಿಂದ ದೂರವಿದೆ. "
                    "ರೈತರ ಆರ್ಥಿಕ ನಷ್ಟ ತಡೆಯಲು ವ್ಯವಸ್ಥೆಯು ಊಹಾತ್ಮಕ ಸಲಹೆ ನೀಡುವುದನ್ನು ತಡೆಹಿಡಿದಿದೆ. "
                    "ಭೂಭೌತ (ರೆಸಿಸ್ಟಿವಿಟಿ) ಸಮೀಕ್ಷೆ ಕಡ್ಡಾಯವಾಗಿದೆ."
                ),
                "recommended_actions": [
                    "Conduct site-specific Vertical Electrical Sounding (VES) resistivity survey by certified hydrogeologist.",
                    "Verify local tank cascade and watershed structures.",
                    "Do NOT proceed with drilling based on water-divining or ungrounded estimates."
                ],
                "kannada_recommended_actions": [
                    "ಅಧಿಕೃತ ಜಲವಿಜ್ಞಾನಿಗಳಿಂದ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ಭೂಭೌತ ಸಮೀಕ್ಷೆ ಮಾಡಿಸಿ.",
                    "ಸ್ಥಳೀಯ ಕೆರೆ ಮತ್ತು ಜಲಾನಯನ ಪರಿಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
                    "ನೀರಿನ ಕೋಲು (ವಾಟರ್ ಡಿವೈನಿಂಗ್) ಅಥವಾ ಊಹೆಯ ಮೇಲೆ ನೇರವಾಗಿ ಕೊರೆಯಬೇಡಿ."
                ],
                "legal_disclaimer": "This is a public-welfare advisory tool, not a drilling guarantee or statutory permit."
            }

        # 2. Model A: Groundwater Occurrence
        p_occurrence = self.occurrence_model.predict_occurrence_probability(features)

        # 3. Model B: Failure Risk
        p_failure, failure_tier, risk_factors = self.failure_model.predict_failure_probability(features)

        # 4. Model C: Yield Range (Quantile intervals)
        y_min, y_med, y_max, yield_status = self.yield_model.predict_yield_range(features)

        # 5. Model D: Productive Depth Interval
        depth_info = self.depth_model.estimate_depth_interval(features, nearby_logs)

        # 6. Model E: Seasonal Groundwater Stress
        stress_info = self.stress_model.evaluate_seasonal_stress(features)

        # 7. Action Classification
        # 3 Controlled Categories:
        # - FURTHER_INVESTIGATION_REQUIRED
        # - POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW
        # - HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT
        if p_failure >= 0.65 or stress_info["stress_level"] == "CRITICAL_GROUNDWATER_STRESS":
            advisory_class = "HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT"
            action_summary = "High probability of borewell failure or inadequate yield. Drilling is not recommended without rigorous hydrogeological review."
            kannada_summary = "ಕೊರೆತ ಬಾವಿ ವಿಫಲವಾಗುವ ಅಥವಾ ಕಡಿಮೆ ನೀರು ಬರುವ ಹೆಚ್ಚಿನ ಅಪಾಯವಿದೆ. ಜಲವಿಜ್ಞಾನಿಗಳ ತಪಾಸಣೆಯಿಲ್ಲದೆ ಕೊರೆಯಲು ಶಿಫಾರಸು ಮಾಡಲಾಗುವುದಿಲ್ಲ."
        elif p_failure < 0.38 and p_occurrence >= 0.60 and dist_lin < 600.0:
            advisory_class = "POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW"
            action_summary = "Hydrogeological factors indicate favorable structural setting. Field geophysical verification still required."
            kannada_summary = "ಶಿಲಾಬಿರುಕು ಮತ್ತು ಜಲವಿಜ್ಞಾನ ಪರಿಸ್ಥಿತಿ ಅನುಕೂಲಕರವಾಗಿದೆ. ಆದರೂ ಸ್ಥಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಜಲತಜ್ಞರ ಅನುಮೋದನೆ ಅಗತ್ಯ."
        else:
            advisory_class = "FURTHER_INVESTIGATION_REQUIRED"
            action_summary = "Mixed hydrogeological signals. Moderate uncertainty requires on-site resistivity profiling."
            kannada_summary = "ಮಿಶ್ರ ಪರಿಸ್ಥಿತಿ ಕಂಡುಬಂದಿದೆ. ಮಧ್ಯಮ ಮಟ್ಟದ ಅನಿಶ್ಚಿತತೆ ಇರುವುದರಿಂದ ಸ್ಥಳದಲ್ಲೇ ರೆಸಿಸ್ಟಿವಿಟಿ ಪರೀಕ್ಷೆ ಅಗತ್ಯ."

        # Consolidated Result
        return {
            "assessment_id": assessment_id,
            "status": "VALIDATED_ASSESSMENT_COMPLETE",
            "coordinates": {"latitude": lat, "longitude": lon},
            "administrative": {
                "district": district,
                "taluk": taluk,
                "taluk_code": features.get("taluk_code", "N/A"),
                "cgwb_stage_extraction_pct": features.get("cgwb_stage_extraction_pct"),
            },
            "advisory_classification": advisory_class,
            "groundwater_potential": {
                "occurrence_probability": round(p_occurrence, 3),
                "occurrence_category": "HIGH" if p_occurrence > 0.65 else ("MODERATE" if p_occurrence > 0.40 else "LOW"),
            },
            "failure_risk_assessment": {
                "failure_probability": round(p_failure, 3),
                "risk_tier": failure_tier,
                "cost_warning": "Potential avoidable drilling loss: ₹1,50,000 - ₹3,00,000 INR" if p_failure >= 0.50 else None,
                "contributing_factors": risk_factors,
            },
            "expected_yield": {
                "median_yield_lpm": y_med,
                "yield_range_lpm": [y_min, y_max],
                "confidence_status": yield_status,
                "units": "Litres Per Minute (LPM)",
            },
            "depth_interval": depth_info,
            "seasonal_stress": stress_info,
            "explanation": {
                "english": action_summary,
                "kannada": kannada_summary,
            },
            "recommended_actions": [
                "Engage a certified hydrogeologist to perform Vertical Electrical Sounding (VES).",
                "Ensure minimum 200-meter statutory spacing from any existing functional borewell.",
                "Adopt micro-irrigation (drip/sprinkler) to prolong aquifer life.",
            ],
            "kannada_recommended_actions": [
                "ಸರ್ಕಾರದ ಮಾನ್ಯತೆ ಪಡೆದ ಜಲವಿಜ್ಞಾನಿಗಳಿಂದ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ಸಮೀಕ್ಷೆ ಮಾಡಿಸಿ.",
                "ಪಕ್ಕದ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಕೊರೆತ ಬಾವಿಯಿಂದ ಕನಿಷ್ಠ 200 ಮೀಟರ್ ಅಂತರವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಕಾಪಾಡಿ.",
                "ಅಂತರ್ಜಲ ಉಳಿಸಲು ಹನಿ ಅಥವಾ ತುಂತುರು ನೀರಾವರಿ ಪದ್ಧತಿಯನ್ನು ಮಾತ್ರ ಬಳಸಿ.",
            ],
            "evidence_sources": [
                "CGWB NAQUIM Hard-Rock Aquifer Assessment",
                "GSI Bhukosh 1:50,000 Lithology & Structural Lineaments",
                "IMD 30-Year Rainfall Normals",
                "Survey of India / WRIS Monitoring Wells"
            ],
            "legal_disclaimer": "This is a public-welfare advisory tool, not a drilling guarantee or statutory permit."
        }
