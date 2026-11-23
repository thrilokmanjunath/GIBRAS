"""
GIBRAS Spatial Index & Vector Query Engine
Strict Projected CRS: EPSG:32643 (UTM Zone 43N)
Calculates metric distances, spatial density, and point-in-polygon queries.
"""
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import geopandas as gpd
import numpy as np
from shapely.geometry import Point
from shapely.strtree import STRtree

CURATED_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "curated"
METRIC_CRS = "EPSG:32643"
DISPLAY_CRS = "EPSG:4326"


class SpatialVectorEngine:
    def __init__(self, curated_dir: Optional[Path] = None):
        self.curated_dir = curated_dir or CURATED_DIR
        self._load_layers()

    def _load_layers(self):
        # 1. Administrative Boundaries
        admin_path = self.curated_dir / "administrative_boundaries.geojson"
        self.admin_gdf = gpd.read_file(admin_path).to_crs(METRIC_CRS)
        self.admin_4326 = self.admin_gdf.to_crs(DISPLAY_CRS)

        # 2. Geological Formations
        geol_path = self.curated_dir / "geological_formations.geojson"
        self.geol_gdf = gpd.read_file(geol_path).to_crs(METRIC_CRS)

        # 3. Structural Lineaments
        lin_path = self.curated_dir / "structural_lineaments.geojson"
        self.lin_gdf = gpd.read_file(lin_path).to_crs(METRIC_CRS)
        self.lin_tree = STRtree(self.lin_gdf.geometry.values)

        # 4. Drainage Network
        drain_path = self.curated_dir / "drainage_network.geojson"
        self.drain_gdf = gpd.read_file(drain_path).to_crs(METRIC_CRS)
        self.drain_tree = STRtree(self.drain_gdf.geometry.values)

        # 5. Monitoring Wells
        cgwb_path = self.curated_dir / "cgwb_monitoring_wells.geojson"
        self.cgwb_gdf = gpd.read_file(cgwb_path).to_crs(METRIC_CRS)
        self.cgwb_tree = STRtree(self.cgwb_gdf.geometry.values)

    def point_to_metric(self, lon: float, lat: float) -> Point:
        """Converts WGS84 (lon, lat) to EPSG:32643 metric Point geometry."""
        pt = gpd.GeoSeries([Point(lon, lat)], crs=DISPLAY_CRS).to_crs(METRIC_CRS).iloc[0]
        return pt

    def query_taluk(self, metric_point: Point) -> Optional[Dict[str, Any]]:
        """Finds containing taluk and returns administrative attributes."""
        matched = self.admin_gdf[self.admin_gdf.contains(metric_point)]
        if not matched.empty:
            row = matched.iloc[0]
            return {
                "district": row["district"],
                "taluk": row["taluk"],
                "taluk_code": row["taluk_code"],
                "annual_rainfall_normal_mm": float(row["annual_rainfall_normal_mm"]),
                "cgwb_stage_extraction_pct": float(row["cgwb_stage_extraction_pct"]),
                "cgwb_category": row["cgwb_category"],
            }
        # If slightly outside polygon boundary, find nearest taluk within 5km
        distances = self.admin_gdf.distance(metric_point)
        min_idx = distances.idxmin()
        if distances[min_idx] <= 5000.0:
            row = self.admin_gdf.loc[min_idx]
            return {
                "district": row["district"],
                "taluk": row["taluk"],
                "taluk_code": row["taluk_code"],
                "annual_rainfall_normal_mm": float(row["annual_rainfall_normal_mm"]),
                "cgwb_stage_extraction_pct": float(row["cgwb_stage_extraction_pct"]),
                "cgwb_category": row["cgwb_category"],
            }
        return None

    def query_geology(self, metric_point: Point) -> Dict[str, Any]:
        """Finds underlying hard-rock lithological formation."""
        matched = self.geol_gdf[self.geol_gdf.contains(metric_point)]
        if not matched.empty:
            row = matched.iloc[0]
            return {
                "lithology_code": row["lithology_code"],
                "formation_name": row["formation_name"],
                "primary_aquifer_type": row["primary_aquifer_type"],
                "weathered_depth_mean_m": float(row["weathered_depth_mean_m"]),
                "specific_yield_est": float(row["specific_yield_est"]),
            }
        # Default to Peninsular Gneissic Complex (regional bedrock default)
        return {
            "lithology_code": "PGC",
            "formation_name": "Peninsular Gneissic Complex",
            "primary_aquifer_type": "WEATHERED_FRACTURED_GNEISS",
            "weathered_depth_mean_m": 18.5,
            "specific_yield_est": 0.035,
        }

    def query_structural_metrics(self, metric_point: Point) -> Dict[str, float]:
        """
        Calculates:
        - dist_to_lineament_m: Euclidean distance to nearest fracture line in meters.
        - lineament_density_km_km2: Lineament length inside a 2.5km radius kernel.
        """
        nearest_geom_idx = self.lin_tree.nearest(metric_point)
        nearest_line = self.lin_gdf.geometry.iloc[nearest_geom_idx]
        dist_m = float(metric_point.distance(nearest_line))

        # Kernel density in 2500m buffer
        kernel_area_km2 = np.pi * (2.5 ** 2)  # ~19.63 km²
        kernel_buffer = metric_point.buffer(2500.0)
        intersecting_lines = self.lin_gdf[self.lin_gdf.intersects(kernel_buffer)]
        total_len_m = 0.0
        for geom in intersecting_lines.geometry:
            clipped = geom.intersection(kernel_buffer)
            total_len_m += clipped.length

        density_km_km2 = (total_len_m / 1000.0) / kernel_area_km2

        # Distance to intersection: approximation of fracture intersection favorability
        dist_xlin_m = max(dist_m * 1.35, 120.0)

        return {
            "dist_to_lineament_m": round(dist_m, 2),
            "lineament_density_km_km2": round(float(density_km_km2), 3),
            "dist_to_intersection_m": round(float(dist_xlin_m), 2),
        }

    def query_drainage_metrics(self, metric_point: Point) -> Dict[str, float]:
        """
        Calculates:
        - dist_to_stream_m: Distance to nearest drainage stream in meters.
        - drainage_density_km_km2: Stream length inside 2.0km buffer.
        """
        nearest_geom_idx = self.drain_tree.nearest(metric_point)
        nearest_stream = self.drain_gdf.geometry.iloc[nearest_geom_idx]
        dist_m = float(metric_point.distance(nearest_stream))

        # Kernel density in 2000m buffer
        kernel_area_km2 = np.pi * (2.0 ** 2)  # ~12.57 km²
        kernel_buffer = metric_point.buffer(2000.0)
        intersecting_streams = self.drain_gdf[self.drain_gdf.intersects(kernel_buffer)]
        total_len_m = 0.0
        for geom in intersecting_streams.geometry:
            clipped = geom.intersection(kernel_buffer)
            total_len_m += clipped.length

        density_km_km2 = (total_len_m / 1000.0) / kernel_area_km2

        return {
            "dist_to_stream_m": round(dist_m, 2),
            "drainage_density_km_km2": round(float(density_km_km2), 3),
        }

    def query_monitoring_station_context(self, metric_point: Point) -> Dict[str, Any]:
        """
        Finds the nearest CGWB monitoring well and local observation density within 5 km.
        """
        nearest_geom_idx = self.cgwb_tree.nearest(metric_point)
        nearest_well = self.cgwb_gdf.iloc[nearest_geom_idx]
        dist_m = float(metric_point.distance(nearest_well.geometry))

        # Observation density inside 5km
        buffer_5km = metric_point.buffer(5000.0)
        wells_in_radius = self.cgwb_gdf[self.cgwb_gdf.intersects(buffer_5km)]
        obs_density = len(wells_in_radius)

        return {
            "nearest_station_code": nearest_well["station_code"],
            "nearest_station_name": nearest_well["station_name"],
            "dist_to_station_m": round(dist_m, 2),
            "station_pre_monsoon_mgl": float(nearest_well["pre_monsoon_depth_mgl"]),
            "station_post_monsoon_mgl": float(nearest_well["post_monsoon_depth_mgl"]),
            "station_decadal_trend_m_per_year": float(nearest_well["decadal_trend_m_per_year"]),
            "obs_well_density_5km": int(obs_density),
        }
