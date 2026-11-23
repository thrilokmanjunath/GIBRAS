# Government Data Source Inventory & Legal Access Catalog

**Document Identifier:** GIBRAS-RES-02  
**Role:** Government Data Acquisition Specialist  
**Coverage:** Kolar & Chikkaballapur Districts, Karnataka, India  
**Audited Compliance:** Indian Open Government Data (OGD) Platform India, Survey of India Map Policy, CGWB Data Sharing Protocol, Copernicus Open Access.

---

## 1. Authoritative Institutional Data Sources

| ID | Institution / Portal | Dataset Name | Geographic & Spatial Specs | Temporal Window | Access / Licensing | Acquisition Strategy & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DS-01** | **Survey of India / KSRSAC / OGD India** | Administrative Boundaries (Districts, Taluks, Hoblis) | Vector GeoJSON/Shapefile (1:50,000 scale) | 2021-2024 Administrative Gazette | Open Government Data License (India) | Direct verified GeoJSON ingestion. CRS: EPSG:4326, projected to EPSG:32643. |
| **DS-02** | **Central Ground Water Board (CGWB) & India-WRIS** | National Aquifer Mapping (NAQUIM) & Water Level Monitoring Wells | Hydrogeological lithology logs, piezometer readings (Kolar & Chikkaballapur) | 2014 – 2024 (Pre/Post Monsoon) | National Water Informatics Centre (NWIC) Public API / CGWB Annual Reports | Point shapefiles & structured tabular observations with official station codes (e.g. W14829, W15021). |
| **DS-03** | **India Meteorological Department (IMD) / KSNDMC** | High-Resolution Gridded Rainfall (0.25° x 0.25°) & District Daily Normals | Daily precipitation, seasonal totals, rainfall departure % | 1991 – 2024 (30-yr climatology) | Non-commercial public research license / KSNDMC Open Portal | NetCDF / CSV ingestion, station aggregation across 11 taluks. |
| **DS-04** | **NASA / USGS / Copernicus Land Monitoring** | SRTM 1-ArcSecond (30m) & Copernicus DEM GLO-30 | 30m Digital Elevation Model tiles (N12E077, N13E077, N13E078) | Continuous global mission | Open Access (Creative Commons / NASA Public Domain) | GeoTIFF tiles stitched and reprojected to EPSG:32643 for terrain analysis. |
| **DS-05** | **Geological Survey of India (GSI) / Bhukosh** | 1:50,000 Lithology, Structural Lineaments & Faults | Vector lithology contacts, shear zones, dolerite dykes | Systematic National Geochemical & Geological Mapping | Open Access GSI Bhukosh WFS/Shapefile | Vector lines and polygons categorized by lithology class and structural kinematics. |
| **DS-06** | **European Space Agency (ESA) / Copernicus Data Space** | Sentinel-2 L2A Multispectral Surface Reflectance | 10m/20m B2, B3, B4, B8, B11, B12 bands | 2020 – 2024 Seasonal Cloud-Free Composites | Copernicus Open Access Policy | Automated spectral indices computation (NDVI, NDWI, MNDWI, BSI). |
| **DS-07** | **Minor Irrigation & Groundwater Directorate Karnataka** | Dynamic Groundwater Resource Estimation (GWRE) | Taluk-wise net annual availability, existing gross draft, stage of extraction % | Periodic 2017, 2020, 2022, 2023 assessments | Public Government Gazette | Integrated into taluk administrative baseline attributes. |

---

## 2. Controlled Quality Classification Matrix

Every dataset received into the pipeline is assigned a strict quality badge:
- **Tier A (Official Verified):** Direct download from primary government/space agency source with cryptographic SHA256 checksum and official metadata.
- **Tier B (Official Incomplete):** Official data requiring interpolation, spatial cleaning, or containing non-critical missing timestamps.
- **Tier C (Documented Research):** Published literature models (e.g. IISc hydrogeological studies, CGWB peer-reviewed monographs).
- **Tier D (Field Crowdsourced):** Unverified farmer reports.
- **Tier E (Synthetic Test):** Strictly quarantined unit test fixtures.

---

## 3. Formal Data Request Templates
For restricted granular borehole logs (e.g. lithological drill logs from CGWB exploratory wells beyond public summaries), formal request templates are drafted in `docs/GOVERNMENT_DATA_REQUESTS.md` addressing:
- The Regional Director, CGWB South Western Region, Bhujal Bhavan, Bengaluru.
- The Director, Ground Water Directorate, Bengaluru.
