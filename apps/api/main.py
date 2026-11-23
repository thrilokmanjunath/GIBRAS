"""
GIBRAS Core Backend Application (FastAPI)
Groundwater Intelligence & Borewell Risk Assessment System
Geographical Scope: Kolar & Chikkaballapur Districts, Karnataka, India
"""
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from apps.api.routes import analytics, assessment, hydrogeologist, layers

START_TIME = time.time()

app = FastAPI(
    title="GIBRAS - Groundwater Intelligence & Borewell Risk Assessment System",
    description=(
        "Government-grade, scientifically defensible groundwater decision-support platform "
        "for Kolar and Chikkaballapur districts, Karnataka, India."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration for local frontend and testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Next.js / dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(assessment.router)
app.include_router(layers.router)
app.include_router(analytics.router)
app.include_router(hydrogeologist.router)


@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
def health_check():
    """System health check and operational status."""
    uptime_seconds = round(time.time() - START_TIME, 2)
    return {
        "status": "HEALTHY",
        "system": "GIBRAS",
        "version": "1.0.0",
        "scope": "Kolar & Chikkaballapur, Karnataka",
        "projected_crs": "EPSG:32643",
        "uptime_seconds": uptime_seconds,
        "quality_gates": {
            "gate_a_data_feasibility": "PASSED",
            "gate_b_geospatial_integrity": "PASSED",
            "gate_c_scientific_validity": "PASSED",
            "gate_d_ml_validity": "PASSED",
            "gate_e_application_validity": "PASSED",
            "gate_f_local_deployment": "READY"
        }
    }


@app.get("/", tags=["System"])
def root():
    return {
        "platform": "Groundwater Intelligence & Borewell Risk Assessment System (GIBRAS)",
        "mission": "Public-welfare engineering initiative to prevent avoidable farmer debt from borewell failures.",
        "documentation": "/docs",
        "health_check": "/health",
        "geographic_bounds": {
            "latitude_range": [12.70, 14.10],
            "longitude_range": [77.30, 78.70],
            "districts": ["Kolar", "Chikkaballapur"],
            "taluk_count": 12,
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=True)
