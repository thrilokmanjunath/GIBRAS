# GIBRAS Technology & Scientific Roadmap

### Phase 1: Kolar & Chikkaballapur Baseline (Completed & Verified)
- [x] Full spatial database (PostGIS & DuckDB Spatial) for 11 taluks.
- [x] Curated Tier A/B datasets (CGWB monitoring wells, GSI lineaments, DEM 30m derivatives, drainage).
- [x] Multi-model predictive pipeline (Occurrence, Failure Risk, Quantile Yield, Depth Recommender, Seasonal Stress).
- [x] Spatial Block Cross-Validation (ROC-AUC 0.82, Brier 0.199).
- [x] Explicit safety abstention engine (`INSUFFICIENT_DATA_FOR_RELIABLE_PREDICTION`).
- [x] Bilingual Farmer Portal, Government Dashboard, and Hydrogeologist Desk.
- [x] Local native execution scripts (`./scripts/start_local.sh`) and Docker Compose configuration.

---

### Phase 2: Telemetry Ingestion & Artificial Recharge Tracking (Q3-Q4)
- **Live KSNDMC Telemetric Gauge Streams:** Ingest daily rainfall from 150+ automated weather stations across Kolar & Chikkaballapur to calculate real-time SPI drought indices.
- **KC Valley & HN Valley Treated Water Tracking:** Spatially map secondary/tertiary wastewater pipeline discharge into irrigation tanks and model groundwater recharge mounds in downstream alluvial pediplains.
- **Automated Piezometer Sync:** Connect to India-WRIS REST APIs for real-time telemetry from CGWB digital water level recorders (DWLR).

---

### Phase 3: Regional Geological Scaling across Karnataka (Year 2)
- **Geographic Expansion:** Extend GIBRAS to adjacent crystalline hard-rock districts:
  - Tumkur District (Pavagada, Madhugiri, Koratagere, Sira)
  - Chitradurga & Davanagere Districts
  - Hassan & Mandya crystalline pediplains
- **High-Resolution Geophysics Integration:** Ingest airborne electromagnetic (AEM) survey profiles from CGWB/NGRI where available.
- **Bhoomi / Raitha Bharosa Integration:** Mobile WhatsApp chatbot interface (Kannada audio & text) powered by lightweight open models for marginal farmers without smartphones.
