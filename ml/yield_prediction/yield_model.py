"""
Model C: Expected Well Yield Range Estimation
Predicts post-drilling discharge (Litres Per Minute) with Quantile Gradient Boosting.
Provides 10th, 50th (median), and 90th percentile yield intervals.
"""
from typing import Dict, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler


class BorewellYieldModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = [
            "elevation_m", "slope_deg", "twi", "lineament_density_km_km2",
            "dist_to_lineament_m", "drainage_density_km_km2", "dist_to_stream_m",
            "rainfall_annual_normal_mm", "weathered_depth_mean_m",
            "gw_depth_pre_monsoon_m", "gw_seasonal_fluctuation_m",
            "cgwb_stage_extraction_pct"
        ]
        # Quantile regressors for 10th, 50th, and 90th percentiles
        self.q10 = GradientBoostingRegressor(loss="quantile", alpha=0.10, n_estimators=60, max_depth=4, random_state=42)
        self.q50 = GradientBoostingRegressor(loss="quantile", alpha=0.50, n_estimators=60, max_depth=4, random_state=42)
        self.q90 = GradientBoostingRegressor(loss="quantile", alpha=0.90, n_estimators=60, max_depth=4, random_state=42)
        self.is_fitted = False

    def _prepare_matrix(self, features_list: List[Dict[str, float]]) -> np.ndarray:
        matrix = []
        for feat in features_list:
            row = [float(feat.get(k, 0.0)) for k in self.feature_names]
            matrix.append(row)
        return np.array(matrix)

    def fit(self, features_list: List[Dict[str, float]], y_yield_lpm: np.ndarray):
        X = self._prepare_matrix(features_list)
        X_scaled = self.scaler.fit_transform(X)
        self.q10.fit(X_scaled, y_yield_lpm)
        self.q50.fit(X_scaled, y_yield_lpm)
        self.q90.fit(X_scaled, y_yield_lpm)
        self.is_fitted = True

    def predict_yield_range(self, features: Dict[str, float]) -> Tuple[float, float, float, str]:
        """
        Returns:
        - y_min (10th percentile): LPM
        - y_med (50th percentile): LPM
        - y_max (90th percentile): LPM
        - confidence_status: HIGH_CONFIDENCE, MODERATE_SPREAD, HIGH_UNCERTAINTY
        """
        if not self.is_fitted:
            # Baseline domain distribution in Kolar/Chikkaballapur hard rock
            dist_lin = features.get("dist_to_lineament_m", 1200.0)
            twi = features.get("twi", 7.0)
            if dist_lin < 500.0 and twi > 8.0:
                y_min, y_med, y_max = 45.0, 95.0, 160.0
                status = "MODERATE_SPREAD"
            elif dist_lin > 1500.0:
                y_min, y_med, y_max = 5.0, 25.0, 65.0
                status = "HIGH_UNCERTAINTY"
            else:
                y_min, y_med, y_max = 20.0, 60.0, 110.0
                status = "MODERATE_SPREAD"
            return round(y_min, 1), round(y_med, 1), round(y_max, 1), status

        X = self._prepare_matrix([features])
        X_scaled = self.scaler.transform(X)
        val_q10 = float(np.clip(self.q10.predict(X_scaled)[0], 0.0, 400.0))
        val_q50 = float(np.clip(self.q50.predict(X_scaled)[0], val_q10, 450.0))
        val_q90 = float(np.clip(self.q90.predict(X_scaled)[0], val_q50, 500.0))

        spread = val_q90 - val_q10
        if spread > 100.0:
            status = "HIGH_UNCERTAINTY"
        elif spread > 50.0:
            status = "MODERATE_SPREAD"
        else:
            status = "HIGH_CONFIDENCE"

        return round(val_q10, 1), round(val_q50, 1), round(val_q90, 1), status
