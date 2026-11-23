"""
Model A: Groundwater Occurrence Baseline Model
Estimates the probability of encountering groundwater saturation in regolith/fractures.
"""
from typing import Dict, List, Optional
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


class GroundwaterOccurrenceModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = [
            "elevation_m", "slope_deg", "twi", "tpi_500m", "tri",
            "lineament_density_km_km2", "dist_to_lineament_m",
            "drainage_density_km_km2", "dist_to_stream_m",
            "rainfall_annual_normal_mm", "weathered_depth_mean_m",
            "specific_yield_est", "ndwi_post_monsoon"
        ]
        self.model = RandomForestClassifier(
            n_estimators=100, max_depth=6, min_samples_split=5,
            random_state=42, class_weight="balanced"
        )
        self.is_fitted = False

    def _prepare_matrix(self, features_list: List[Dict[str, float]]) -> np.ndarray:
        matrix = []
        for feat in features_list:
            row = [float(feat.get(k, 0.0)) for k in self.feature_names]
            matrix.append(row)
        return np.array(matrix)

    def fit(self, features_list: List[Dict[str, float]], y: np.ndarray):
        X = self._prepare_matrix(features_list)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_fitted = True

    def predict_occurrence_probability(self, features: Dict[str, float]) -> float:
        if not self.is_fitted:
            # Domain-weighted physical baseline (AHP-calibrated) if un-fitted
            # High TWI, gentle slope, proximity to lineament/stream, high rainfall
            twi_score = min(1.0, max(0.0, (features.get("twi", 7.0) - 4.0) / 10.0))
            slope_score = max(0.0, 1.0 - (features.get("slope_deg", 3.0) / 15.0))
            lin_score = max(0.0, 1.0 - (features.get("dist_to_lineament_m", 1000.0) / 2500.0))
            drain_score = max(0.0, 1.0 - (features.get("dist_to_stream_m", 1000.0) / 2000.0))
            prob = 0.30 * twi_score + 0.25 * lin_score + 0.25 * slope_score + 0.20 * drain_score
            return float(np.clip(prob, 0.05, 0.95))

        X = self._prepare_matrix([features])
        X_scaled = self.scaler.transform(X)
        probs = self.model.predict_proba(X_scaled)[0]
        # Class 1 is occurrence
        prob_val = float(probs[1]) if len(probs) > 1 else float(probs[0])
        return round(float(np.clip(prob_val, 0.02, 0.98)), 3)
