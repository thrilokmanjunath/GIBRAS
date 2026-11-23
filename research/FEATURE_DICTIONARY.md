# GIBRAS Feature Dictionary & Schema Definitions

**Document Identifier:** GIBRAS-RES-06  
**Version:** 1.0.0  
**Feature Store Scope:** Kolar & Chikkaballapur Hard-Rock Spatial Predictors  

---

| Feature Name | Type | Physical Units | Valid Range | Source Dataset | Hydrogeological Significance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `elevation_m` | Float | meters a.s.l. | 600.0 – 1450.0 | SRTM / Copernicus DEM 30m | Orographic position and regional catchment elevation. |
| `slope_deg` | Float | degrees | 0.0 – 65.0 | DEM 3x3 Horn derivative | Steeper slopes ($>10^\circ$) facilitate runoff; $<3^\circ$ pediplains favor infiltration. |
| `aspect_deg` | Float | degrees | 0.0 – 360.0 | DEM derivative | Solar insolation and structural strike correlation. |
| `twi` | Float | dimensionless | 2.5 – 22.0 | Catchment Flow Accumulation | Topographic Wetness Index; high values identify convergence hollows and valleys. |
| `tpi_500m` | Float | meters | -50.0 to +50.0 | DEM neighborhood kernel | Topographic Position Index (Negative = valleys/swales; Positive = ridges). |
| `tri` | Float | meters | 0.0 – 45.0 | DEM 3x3 standard | Terrain Ruggedness Index; surface structural heterogeneity. |
| `drainage_density_km_km2` | Float | $\text{km}/\text{km}^2$ | 0.0 – 5.5 | Stream Network Buffer | Inverse infiltration indicator; high density implies impermeable rock matrix. |
| `dist_to_stream_m` | Float | meters | 0.0 – 15000.0 | Hydrographic STRtree | Euclidean distance to nearest stream or drainage channel. |
| `lineament_density_km_km2`| Float | $\text{km}/\text{km}^2$ | 0.0 – 3.8 | GSI / Bhukosh structural layer| Structural secondary porosity intensity. |
| `dist_to_lineament_m` | Float | meters | 0.0 – 12000.0 | Lineament vector index | Distance to mapped fracture trace; $<150\text{m}$ indicates structural favorability. |
| `dist_to_intersection_m`| Float | meters | 0.0 – 15000.0 | Structural intersection points| Loci of intense stress shattering and high fracture permeability. |
| `lithology_code` | Categorical| string | PGC, GNT, SCH, DYK | GSI 1:50k Geology | Lithological unit (Peninsular Gneiss, Granite, Schist, Dolerite Dyke). |
| `aquifer_type` | Categorical| string | WEATHERED, FRACTURED, MIXED | CGWB NAQUIM | Principal target aquifer horizon. |
| `rainfall_annual_normal_mm`| Float | mm/year | 550.0 – 1050.0 | IMD 30-Year Normals | Long-term replenishment baseline. |
| `monsoon_deficit_pct` | Float | % departure | -75.0 to +120.0 | KSNDMC Seasonal Rain | Dynamic short-term drought stress. |
| `gw_depth_pre_monsoon_m` | Float | m bgl | 5.0 – 150.0 | CGWB / WRIS Monitoring Wells | Baseline seasonal static water level. |
| `gw_depth_post_monsoon_m`| Float | m bgl | 2.0 – 120.0 | CGWB / WRIS Monitoring Wells | Water table recharge recovery. |
| `gw_seasonal_fluctuation_m`| Float| meters | -15.0 to +35.0 | Derived ($Pre - Post$) | Dynamic seasonal head response. |
| `gw_extraction_stage_pct`| Float | % of recharge | 85.0 – 240.0 | CGWB Dynamic Assessment | Taluk-level extraction intensity ($>100\%$ indicates over-exploitation). |
| `ndvi_pre_monsoon` | Float | dimensionless | -0.2 to +0.85 | Sentinel-2 L2A BOA | Vegetative vigor in dry season (proxy for irrigation extraction). |
| `ndwi_post_monsoon` | Float | dimensionless | -0.6 to +0.95 | Sentinel-2 L2A BOA | Surface water retention and tank filling indicator. |
| `obs_well_density_5km` | Integer | count | 0 – 35 | CGWB / State registry | Number of verified observation wells within 5km radius (Certainty metric). |
