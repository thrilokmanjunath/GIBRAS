"""
Unit & Integration Tests for Geospatial Engine & Feature Pipeline
Asserts strict CRS standards (EPSG:32643) and physical bounds.
"""
import pytest
from shapely.geometry import Point
from geospatial.feature_engineering.pipeline import FeatureEngineeringPipeline
from geospatial.vector.spatial_index import SpatialVectorEngine, METRIC_CRS


def test_metric_crs_standardization():
    engine = SpatialVectorEngine()
    assert engine.admin_gdf.crs.to_string() == METRIC_CRS
    assert engine.geol_gdf.crs.to_string() == METRIC_CRS
    assert engine.lin_gdf.crs.to_string() == METRIC_CRS
    assert engine.drain_gdf.crs.to_string() == METRIC_CRS
    assert engine.cgwb_gdf.crs.to_string() == METRIC_CRS


def test_point_reprojection_to_utm43n():
    engine = SpatialVectorEngine()
    pt = engine.point_to_metric(78.134, 13.136)
    assert isinstance(pt, Point)
    # UTM 43N coordinates around Kolar should have Easting ~800,000m - 850,000m, Northing ~1,400,000m - 1,550,000m
    assert 700000.0 <= pt.x <= 950000.0
    assert 1350000.0 <= pt.y <= 1600000.0


def test_feature_pipeline_valid_point():
    pipeline = FeatureEngineeringPipeline()
    feat = pipeline.extract_features_for_point(13.136, 78.134)

    assert feat["district"] == "Kolar"
    assert feat["taluk"] == "Kolar"
    assert 650.0 <= feat["elevation_m"] <= 1450.0
    assert 0.0 <= feat["slope_deg"] <= 50.0
    assert 2.0 <= feat["twi"] <= 20.0
    assert feat["dist_to_lineament_m"] >= 0.0
    assert feat["dist_to_stream_m"] >= 0.0
    assert feat["rainfall_annual_normal_mm"] > 500.0
    assert feat["obs_well_density_5km"] >= 0


def test_out_of_bounds_rejection():
    pipeline = FeatureEngineeringPipeline()
    # Coordinates in Delhi/Himalayas should raise ValueError
    with pytest.raises(ValueError) as excinfo:
        pipeline.extract_features_for_point(28.6139, 77.2090)
    assert "outside Kolar/Chikkaballapur geographic domain" in str(excinfo.value)
