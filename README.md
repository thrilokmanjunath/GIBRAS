# Groundwater Intelligence & Borewell Risk Assessment System (GIBRAS)

> **A scientifically defensible, geospatially intelligent, locally deployable decision-support platform for Kolar and Chikkaballapur districts, Karnataka, India.**

[![Phase](https://img.shields.io/badge/Phase-Execution-blue)](#)
[![Geospatial-CRS](https://img.shields.io/badge/CRS-EPSG%3A32643%20UTM43N-green)](#)
[![Public-Welfare](https://img.shields.io/badge/Initiative-Public%20Welfare%20Engineering-orange)](#)

---

## 1. Project Mission & Overview

In the semi-arid hard-rock terrain of eastern Karnataka (Kolar and Chikkaballapur districts), farmers routinely invest ₹1.5 to ₹3.5 Lakhs drilling borewells down to 300–450+ meters (1000–1500 ft) into crystalline basement rocks (Granites, Peninsular Gneissic Complex, and the Kolar Schist Belt). With groundwater extraction stages exceeding 180–200% ("Over-Exploited" categorization by CGWB), failure rates routinely exceed 60–70%, leading to catastrophic debt traps and rural distress.

**GIBRAS** is built as an engineering platform to evaluate proposed borewell drilling locations by integrating:
- Official geological formations, lineament density, and fracture traces (GSI, CGWB NAQUIM).
- Digital elevation models (Copernicus/SRTM DEM 30m), slope, aspect, and Topographic Wetness Index (TWI).
- Watershed, drainage density, and stream network buffers.
- 30-year rainfall normals, seasonal monsoon deviations, and rainfall anomalies (IMD, KSNDMC).
- Official monitoring well records (CGWB/India-WRIS piezometer water levels).
- Rigorous statistical failure probability models with spatial cross-validation and explicit abstention.
- Mobile-first, bilingual interface (English and Kannada / ಕನ್ನಡ) designed for field farmers, hydrogeologists, and government authorities.

---

## 2. Repository Layout

```text
gibras/
├── apps/
│   ├── api/             # FastAPI backend with spatial and risk engine endpoints
│   └── web/             # Next.js 14+ / React application with MapLibre GL
├── geospatial/          # Vector/raster processing, terrain derivatives, projection
├── ml/                  # Occurrence, failure risk, calibration, and abstention pipelines
├── data/                # Strict tiered data layers (raw, interim, processed, curated)
├── database/            # PostGIS schemas, migrations, and seeds
├── research/            # Scientific hydrogeology reviews, GIS/RS/ML methodologies
├── tests/               # Unit, geospatial, ML validation, integration, and E2E tests
├── deployment/          # Docker Compose configurations, systemd services, local setup
├── PROJECT_STATUS.md    # Live quality gate tracking
├── IMPLEMENTATION_LOG.md# Detailed turn-by-turn engineering log
├── DATA_PROVENANCE.md   # Class A through E data lineage registry
├── DECISIONS.md         # Architecture Decision Records (ADRs)
├── RISK_REGISTER.md     # Risk assessment and mitigation matrix
└── VALIDATION_REPORT.md # Verification metrics, Brier scores, spatial CV results
```

---

## 3. Local Quickstart

### Prerequisites
- Python 3.11+ (recommended 3.12+)
- Node.js 18+ and npm
- Docker & Docker Compose (optional, but recommended for PostGIS)

### Running with Docker Compose
```bash
docker compose up -d --build
```
- API Documentation: `http://localhost:8000/docs`
- Web Dashboard: `http://localhost:3000`

### Native Local Execution
```bash
# 1. Set up Python backend environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r apps/api/requirements.txt

# 2. Start Backend
uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Start Frontend
cd apps/web && npm install && npm run dev
```
