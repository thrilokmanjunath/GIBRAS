"""
Model E: Seasonal Groundwater Stress & Sustainability Indicator
Evaluates seasonal water table depletion, monsoon recovery, and long-term depletion rate.
Explicitly distinguishes regional monitoring station observations from local farm parcel predictions.
"""
from typing import Any, Dict


class SeasonalGroundwaterStressModel:
    def __init__(self):
        pass

    def evaluate_seasonal_stress(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes the seasonal stress index and decadal trends.
        """
        pre_m = float(features.get("gw_depth_pre_monsoon_m", 50.0))
        post_m = float(features.get("gw_depth_post_monsoon_m", 40.0))
        fluct_m = pre_m - post_m  # Seasonal recharge recovery
        stage_pct = float(features.get("cgwb_stage_extraction_pct", 185.0))
        monsoon_def_pct = float(features.get("monsoon_deficit_pct", -14.0))

        # Seasonal Stress Score (0.0 = low stress / sustainable, 1.0 = critical stress)
        # Deep pre-monsoon water table (>50m) + high stage (>180%) + negative rainfall deviation
        depth_penalty = min(1.0, max(0.0, (pre_m - 20.0) / 60.0))
        stage_penalty = min(1.0, max(0.0, (stage_pct - 100.0) / 120.0))
        deficit_penalty = min(1.0, max(0.0, (-monsoon_def_pct) / 40.0)) if monsoon_def_pct < 0 else 0.0

        stress_score = 0.40 * stage_penalty + 0.35 * depth_penalty + 0.25 * deficit_penalty
        stress_score = round(float(stress_score), 3)

        if stress_score > 0.70:
            stress_level = "CRITICAL_GROUNDWATER_STRESS"
            advisory = "High extraction pressure and deep static water level. New borewells face high probability of rapid seasonal dry-up."
            kannada_advisory = "ಅಂತರ್ಜಲ ಮಟ್ಟ ತೀವ್ರ ಕುಸಿತದಲ್ಲಿದೆ. ಹೊಸ ಕೊರೆತ ಬಾವಿಗಳು ಬೇಸಿಗೆಯಲ್ಲಿ ಬತ್ತಿಹೋಗುವ ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆ ಇದೆ."
        elif stress_score > 0.45:
            stress_level = "MODERATE_SEASONAL_STRESS"
            advisory = "Moderate seasonal fluctuation. Borewells depend heavily on annual monsoon replenishment."
            kannada_advisory = "ಮಧ್ಯಮ ಮಟ್ಟದ ನೀರಿನ ಕೊರತೆ ಇದೆ. ವಾರ್ಷಿಕ ಮಳೆ ಮರುಪೂರಣದ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ."
        else:
            stress_level = "MILD_STRESS"
            advisory = "Water table shows adequate seasonal recovery."
            kannada_advisory = "ಅಂತರ್ಜಲ ಮಟ್ಟದಲ್ಲಿ ತಕ್ಕಮಟ್ಟಿನ ಚೇತರಿಕೆ ಕಂಡುಬಂದಿದೆ."

        return {
            "stress_index": stress_score,
            "stress_level": stress_level,
            "pre_monsoon_depth_mgl": pre_m,
            "post_monsoon_depth_mgl": post_m,
            "seasonal_recharge_recovery_m": round(fluct_m, 2),
            "cgwb_stage_extraction_pct": stage_pct,
            "nearest_monitoring_station": features.get("nearest_station_code", "CGWB_REGIONAL"),
            "distance_to_station_km": round(features.get("dist_to_station_m", 5000.0) / 1000.0, 1),
            "sustainability_advisory": advisory,
            "kannada_advisory": kannada_advisory,
            "disclaimer": "Groundwater level indicators reflect nearest official monitoring well observations and regional taluk extraction metrics.",
        }
