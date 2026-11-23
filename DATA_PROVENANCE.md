# GIBRAS Data Provenance & Lineage Catalog

Every dataset integrated into GIBRAS must possess verifiable lineage, formal quality tiering, and documented processing steps.

### Quality Classification Schema
- **Class A**: Official and independently verifiable government data (CGWB, IMD, Survey of India, ISRO/Bhuvan, KSRSAC, India-WRIS).
- **Class B**: Official government data with partial coverage, missing metadata, or unverified secondary aggregations.
- **Class C**: Peer-reviewed scientific literature and third-party research datasets with documented methodologies.
- **Class D**: Unverified crowdsourced or field-reported farmer observations.
- **Class E**: Synthetic test data (strictly restricted to test harnesses and automated CI suites).

---

### Dataset Inventory (Initial Catalog)

| Dataset ID | Name | Provider / Source | Quality Tier | Spatial Coverage | CRS | Temporal Coverage | Acquisition Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **DS-01** | Administrative Boundaries (Districts, Taluks) | Survey of India / KSRSAC / Open Data Karnataka | A | Kolar & Chikkaballapur (11 Taluks) | EPSG:4326 / EPSG:32643 | 2021-2024 | Acquired / Curated |
| **DS-02** | CGWB Dynamic Groundwater Resources & National Aquifer Mapping (NAQUIM) | Central Ground Water Board (CGWB), Ministry of Jal Shakti | A | Kolar & Chikkaballapur District Reports | Tabular / Spatial | 2017-2024 | Acquired / Curated |
| **DS-03** | Long-term Rainfall & Drought Indices | India Meteorological Department (IMD) / KSNDMC | A | 1991-2024 (Monthly & Annual Normals) | Station / Taluk | Historical (30 yrs) | Acquired / Curated |
| **DS-04** | Digital Elevation Model (SRTM / Copernicus 30m) | USGS / Copernicus Land Monitoring | A | Kolar & Chikkaballapur Bounding Box | EPSG:4326 to EPSG:32643 | 30m spatial resolution | Acquired / Curated |
| **DS-05** | Geological Formations & Lineaments | Geological Survey of India (GSI) / CGWB NAQUIM | A/B | Granites, Gneisses, Schists (Kolar Schist Belt) | EPSG:4326 | Regional hard-rock structures | Acquired / Curated |
| **DS-06** | Hydrogeological Monitoring Station Observation Wells | CGWB / India-WRIS Ground Water Monitoring Wells | A | Permanent piezometers & dug/bore monitoring wells | Point coordinates | 2015-2024 Pre/Post-monsoon | Acquired / Curated |
| **DS-07** | Unit Test Fixture Data | Internal Test Suite | E (Synthetic) | Test boundary mocks | EPSG:32643 | Synthetic | Isolated in `data/synthetic_test_only` |
