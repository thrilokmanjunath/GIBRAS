"""
GIBRAS Geospatial Map Layer API Routes
Serves standards-compliant GeoJSON layers with metadata, sources, and legends.
"""
from pathlib import Path
import json
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/layers", tags=["Map Layers"])

CURATED_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "curated"


def _read_geojson(filename: str):
    filepath = CURATED_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"Layer file {filename} not found")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/taluks")
def get_taluk_boundaries():
    """Returns official 11 Taluk administrative boundaries of Kolar and Chikkaballapur."""
    data = _read_geojson("administrative_boundaries.geojson")
    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": "Survey of India / KSRSAC / OGD India",
            "crs": "EPSG:4326",
            "quality_tier": "A",
            "description": "Administrative boundaries with CGWB extraction stage % and annual rainfall normals",
        },
        "features": data["features"],
    }


@router.get("/geology")
def get_geological_formations():
    """Returns crystalline basement lithological units (PGC, Kolar Schist, Granites)."""
    data = _read_geojson("geological_formations.geojson")
    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": "Geological Survey of India (GSI) 1:50,000 / CGWB NAQUIM",
            "crs": "EPSG:4326",
            "quality_tier": "A",
            "description": "Hard-rock lithological units with mean weathered mantle thickness and specific yield",
        },
        "features": data["features"],
    }


@router.get("/lineaments")
def get_structural_lineaments():
    """Returns structural lineaments, shear zones, and faults."""
    data = _read_geojson("structural_lineaments.geojson")
    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": "GSI Bhukosh & CGWB NAQUIM Structural Interpretation",
            "crs": "EPSG:4326",
            "quality_tier": "A/B",
            "description": "Regional fracture traces, fault planes, and dyke swarms governing secondary permeability",
        },
        "features": data["features"],
    }


@router.get("/drainage")
def get_drainage_network():
    """Returns stream and river network (Palar, South Pennar, North Pennar)."""
    data = _read_geojson("drainage_network.geojson")
    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": "Survey of India / WRIS River Basin Atlas",
            "crs": "EPSG:4326",
            "quality_tier": "A",
            "description": "Dendritic stream orders indicating structural weak zones and recharge convergence",
        },
        "features": data["features"],
    }


@router.get("/monitoring_wells")
def get_cgwb_monitoring_wells():
    """Returns official CGWB and State groundwater monitoring stations."""
    data = _read_geojson("cgwb_monitoring_wells.geojson")
    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": "Central Ground Water Board (CGWB) & India-WRIS",
            "crs": "EPSG:4326",
            "quality_tier": "A",
            "description": "Piezometer and observation wells with recorded pre/post-monsoon levels and decadal trends",
        },
        "features": data["features"],
    }


@router.get("/historical_wells")
def get_historical_wells():
    """
    Returns verified historical exploratory and production borewells.
    PII and survey numbers are stripped in compliance with the Digital Personal Data Protection Act (DPDPA 2023).
    """
    data = _read_geojson("historical_borewell_observations.geojson")
    # Clean PII if any
    anonymized_features = []
    for f in data["features"]:
        props = f["properties"]
        clean_props = {
            "borewell_id": props.get("borewell_id"),
            "district": props.get("district"),
            "taluk": props.get("taluk"),
            "total_depth_m": props.get("total_depth_m"),
            "yield_lpm": props.get("yield_lpm"),
            "borewell_outcome": props.get("borewell_outcome"),
            "geological_formation": props.get("geological_formation"),
            "quality_tier": props.get("quality_tier"),
            "verification_status": props.get("verification_status"),
        }
        anonymized_features.append({
            "type": "Feature",
            "geometry": f["geometry"],
            "properties": clean_props,
        })

    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": "CGWB NAQUIM Exploratory Wells & RDPR Archive",
            "crs": "EPSG:4326",
            "quality_tier": "A/B",
            "privacy_compliance": "DPDPA 2023 Anonymized",
            "description": "Ground truth borewell performance records (Productive, Inadequate, Dry)",
        },
        "features": anonymized_features,
    }
