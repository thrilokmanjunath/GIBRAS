# GIBRAS Data Provenance & Lineage Catalog

Every dataset integrated into GIBRAS must possess verifiable lineage, formal quality tiering, and documented processing steps.

### Quality Classification Schema
- **Class A**: Official and independently verifiable government data (CGWB, IMD, Survey of India, ISRO/Bhuvan, KSRSAC, India-WRIS).
- **Class B**: Official government data with partial coverage, missing metadata, or unverified secondary aggregations.
- **Class C**: Peer-reviewed scientific literature and third-party research datasets with documented methodologies.
- **Class D**: Unverified crowdsourced or field-reported farmer observations.
- **Class E**: Synthetic test data (strictly restricted to test harnesses and automated CI suites).

---

### Dataset Inventory (Verified Catalog with Lineage & Cryptographic Hashes)

| Dataset ID | Name | Provider / Source | Quality Tier | Records / Features | SHA256 Checksum | CRS | Acquisition & Lineage |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **DS-01** | Administrative Boundaries | Survey of India / KSRSAC / OGD India | A | 12 Taluk polygons | `ccb37cc29d54f8643a51f02fa809579103bb9847bd25f566d83bc1406357006b` | EPSG:4326 / EPSG:32643 | Curated from 2021-2024 Administrative Gazette |
| **DS-02** | Geological Formations | GSI Bhukosh / CGWB NAQUIM | A | 3 Major Lithological Groups | `67cbac50cd8c26a34a371f30bdddebf77fca8b6fbd4931f03b56a3cfd2cd1336` | EPSG:4326 / EPSG:32643 | Dharwar Craton PGC, Kolar Schist, Granites |
| **DS-03** | Structural Lineaments & Shears | GSI / CGWB Structural Mapping | A/B | 7 Regional Shears / Faults | `83df9c001225f1449c134b8bd72919e7fbeedd952a995ff2e3b11b6a1783a3bb` | EPSG:4326 / EPSG:32643 | Lineament lengths, azimuths, shear kinematics |
| **DS-04** | Drainage Streams & Basins | Survey of India / WRIS Basin Atlas | A | 6 River systems | `1016e0f4c4ae79f0f4008581c3869f403e08056f86cbcb4a96100ceccda190ee` | EPSG:4326 / EPSG:32643 | Palar, North & South Pennar channels |
| **DS-05** | CGWB Ground Water Monitoring Wells | Central Ground Water Board / India-WRIS | A | 13 Monitoring Stations | `466a5989531eab0fa0d99a3305b98217264354b8b6e819731efbef1c66a13ad7` | EPSG:4326 / EPSG:32643 | Pre/Post-monsoon water levels & decadal trends |
| **DS-06** | Historical Verified Borewells | CGWB NAQUIM & RDPR Archive | A (257) / B (66) | 323 Verified Wells | `bb7071c058325b1ac41e9a137c4ec2a9aaa16bc2d73f1dd3f684e72d64dcbe73` | EPSG:4326 / EPSG:32643 | Productive (180), Inadequate (84), Dry (59) |
| **DS-07** | Unit Test Synthetic Fixture | Test Harness Mock | E (Synthetic) | 25 Mocks | Isolated in `data/synthetic_test_only/` | EPSG:4326 | **QUARANTINED - NEVER USED FOR MODEL TRAINING** |
