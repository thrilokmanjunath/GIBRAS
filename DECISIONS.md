# GIBRAS Architecture Decision Records (ADR)

### ADR-001: Coordinate Reference Systems (CRS) Standardization
- **Context**: Kolar and Chikkaballapur districts lie in eastern Karnataka, between 77°45'E to 78°35'E and 12°45'N to 13°55'N. Direct metric operations (buffer, distance to lineaments/drainage, density) on WGS84 (EPSG:4326) introduce severe latitude-dependent metric distortion.
- **Decision**: All geospatial feature engineering, metric distances, buffer operations, and raster resampling will strictly execute in **EPSG:32643** (WGS 84 / UTM Zone 43N). Web presentation APIs and GeoJSON outputs will be reprojected to EPSG:4326 for client map consumption.
- **Status**: Accepted.

### ADR-002: Hard-Rock Hydrogeology Staged Inference Architecture
- **Context**: In granite-gneiss hard-rock aquifers of the Dharwar Craton, groundwater does not exist as a continuous regional water table. Secondary porosity (weathered regolith and discrete fractures/lineaments) governs storage and transmissivity. Point-wise borewell yield cannot be scientifically derived from satellite surface greenness alone.
- **Decision**: Follow a 4-tier staged inference:
  1. *Regional Hydrogeological Evidence & Aquifer Vulnerability* (CGWB, KSNDMC, SRTM DEM derivatives).
  2. *Groundwater Potential Occurrence* (calibrated multi-criteria probabilistic baseline).
  3. *Borewell Failure Risk Assessment* (explicitly conditioned on proximity to validated fractures and recorded local yield distribution).
  4. *Abstention Engine*: Return `INSUFFICIENT_DATA_FOR_RELIABLE_PREDICTION` whenever local observation density or fracture certainty is inadequate, preventing false optimism.
- **Status**: Accepted.

### ADR-003: Backend & Geospatial Tech Stack
- **Context**: Requirement for fast, reproducible, locally deployable monolithic application with geospatial query capabilities.
- **Decision**: Python 3 (FastAPI, Pydantic v2, SQLAlchemy 2.0 with GeoPandas, Shapely, PyProj, Rasterio, DuckDB for spatial analytics). PostgreSQL + PostGIS containerized via Docker Compose with fallback support for local spatial DuckDB/SQLite SpatiaLite if running without container. Next.js 14+ with Tailwind CSS, MapLibre GL JS, and dual English/Kannada i18n support.
- **Status**: Accepted.
