"""
Model B: Borewell Failure Risk Classification Model
Predicts the probability of borewell failure (Yield < 40 LPM or dry hole).
Calibrated probability output with cost-sensitive optimization and explainability.
"""
from typing import Any, Dict, List, Tuple
import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import StandardScaler


class BorewellFailureRiskModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = [
            "elevation_m", "slope_deg", "twi", "tpi_500m", "tri",
            "lineament_density_km_km2", "dist_to_lineament_m", "dist_to_intersection_m",
            "drainage_density_km_km2", "dist_to_stream_m",
            "rainfall_annual_normal_mm", "monsoon_deficit_pct",
            "gw_depth_pre_monsoon_m", "gw_seasonal_fluctuation_m",
            "cgwb_stage_extraction_pct", "weathered_depth_mean_m",
            "specific_yield_est", "ndvi_pre_monsoon", "ndwi_post_monsoon"
        ]
        # Base estimator: Random Forest with cost-sensitive penalty on False Negatives
        base_rf = RandomForestClassifier(
            n_estimators=150,
            max_depth=5,
            min_samples_split=4,
            class_weight={0: 1.0, 1: 1.8},  # Cost-sensitive loss on failure misclassification
            random_state=42
        )
        self.model = CalibratedClassifierCV(estimator=base_rf, method="sigmoid", cv=5)
        self.is_fitted = False

    def _prepare_matrix(self, features_list: List[Dict[str, float]]) -> np.ndarray:
        matrix = []
        for feat in features_list:
            row = [float(feat.get(k, 0.0)) for k in self.feature_names]
            matrix.append(row)
        return np.array(matrix)

    def fit(self, features_list: List[Dict[str, float]], y_failure: np.ndarray):
        """
        y_failure: binary array where 1 = FAILED (Dry or Inadequate Yield < 40 LPM), 0 = PRODUCTIVE
        """
        X = self._prepare_matrix(features_list)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y_failure)
        self.is_fitted = True

    def predict_failure_probability(self, features: Dict[str, float]) -> Tuple[float, str, List[Dict[str, Any]]]:
        """
        Returns:
        - failure_probability: Calibrated float [0.0 to 1.0]
        - risk_tier: LOW, MODERATE, HIGH, CRITICAL_RISK
        - top_factors: list of dominant contributing physical risk factors
        """
        if not self.is_fitted:
            # Hydrogeological domain heuristic if un-fitted
            # High extraction stage (>180%), distant from lineament (>1500m), steep slope (>8 deg)
            dist_lin = features.get("dist_to_lineament_m", 1200.0)
            stage_pct = features.get("cgwb_stage_extraction_pct", 185.0)
            gw_depth = features.get("gw_depth_pre_monsoon_m", 50.0)
            slope = features.get("slope_deg", 4.0)

            risk_score = 0.40  # baseline hard-rock over-exploited risk
            if dist_lin > 1000.0:
                risk_score += 0.20
            if stage_pct > 180.0:
                risk_score += 0.15
            if gw_depth > 50.0:
                risk_score += 0.12
            if slope > 6.0:
                risk_score += 0.10
            failure_prob = float(np.clip(risk_score, 0.10, 0.92))
        else:
            X = self._prepare_matrix([features])
            X_scaled = self.scaler.transform(X)
            probs = self.model.predict_proba(X_scaled)[0]
            failure_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])

        failure_prob = round(float(failure_prob), 3)

        # Categorize
        if failure_prob < 0.30:
            risk_tier = "LOW_RISK"
        elif failure_prob < 0.55:
            risk_tier = "MODERATE_RISK"
        elif failure_prob < 0.75:
            risk_tier = "HIGH_RISK"
        else:
            risk_tier = "CRITICAL_FAILURE_RISK"

        # Generate top physical explanatory factors
        factors = self._generate_explanations(features, failure_prob)

        return failure_prob, risk_tier, factors

    def _generate_explanations(self, features: Dict[str, float], failure_prob: float) -> List[Dict[str, Any]]:
        factors = []
        # Extraction pressure
        stage = features.get("cgwb_stage_extraction_pct", 185.0)
        if stage > 180.0:
            factors.append({
                "factor": "Aquifer Over-Exploitation",
                "impact": "INCREASES_RISK",
                "description": f"Taluk groundwater draft stage is {stage:.1f}%, leading to severe regional head dewatering.",
                "kannada": f"ತಾಲ್ಲೂಕಿನ ಅಂತರ್ಜಲ ಬಳಕೆ ಪ್ರಮಾಣ {stage:.1f}% ರಷ್ಟಿದ್ದು, ಅತಿಯಾದ ಹೊರತೆಗೆಯುವಿಕೆಯಿಂದ ಅಪಾಯ ಹೆಚ್ಚಿದೆ."
            })

        # Lineament proximity
        dist_lin = features.get("dist_to_lineament_m", 1000.0)
        if dist_lin > 1000.0:
            factors.append({
                "factor": "Fracture Remoteness",
                "impact": "INCREASES_RISK",
                "description": f"Site is {dist_lin:.0f}m from mapped tectonic lineaments; low secondary permeability in crystalline rock.",
                "kannada": f"ಸ್ಥಳವು ಮುಖ್ಯ ಶಿಲಾಬಿರುಕುಗಳಿಂದ {dist_lin:.0f} ಮೀಟರ್ ದೂರದಲ್ಲಿದ್ದು, ನೀರಿನ ಸಂಗ್ರಹ ಕಡಿಮೆ ಇರಬಹುದು."
            })
        else:
            factors.append({
                "factor": "Fracture Proximity",
                "impact": "DECREASES_RISK",
                "description": f"Site is within {dist_lin:.0f}m of mapped structural lineament; favorable secondary fracture permeability.",
                "kannada": f"ಸ್ಥಳವು {dist_lin:.0f} ಮೀಟರ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಶಿಲಾಬಿರುಕನ್ನು ಹೊಂದಿದ್ದು, ಅಂತರ್ಜಲ ಪ್ರವೇಶಕ್ಕೆ ಅನುಕೂಲಕರವಾಗಿದೆ."
            })

        # Piezometric depth
        gw_depth = features.get("gw_depth_pre_monsoon_m", 48.0)
        if gw_depth > 45.0:
            factors.append({
                "factor": "Deep Regional Water Table",
                "impact": "INCREASES_RISK",
                "description": f"Pre-monsoon static water level at nearest monitoring well is {gw_depth:.1f} m bgl.",
                "kannada": f"ಹತ್ತಿರದ ವೀಕ್ಷಣಾ ಬಾವಿಯಲ್ಲಿ ಬೇಸಿಗೆ ನೀರಿನ ಮಟ್ಟ {gw_depth:.1f} ಮೀ ಆಳದಲ್ಲಿದೆ."
            })

        # Topographic Wetness
        twi = features.get("twi", 7.0)
        if twi > 8.0:
            factors.append({
                "factor": "Valley Infiltration Potential",
                "impact": "DECREASES_RISK",
                "description": f"Topographic wetness index ({twi:.2f}) indicates surface drainage convergence and enhanced recharge.",
                "kannada": f"ಭೂಪ್ರದೇಶ ತೇವಾಂಶ ಸೂಚ್ಯಂಕ ({twi:.2f}) ಕಣಿವೆ ತಗ್ಗು ಪ್ರದೇಶವನ್ನು ಸೂಚಿಸುತ್ತಿದ್ದು ಮರುಪೂರಣಕ್ಕೆ ಸಹಾಯಕ."
            })

        return factors
