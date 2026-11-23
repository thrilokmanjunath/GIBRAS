# Geospatial Engineering Methodology & Spatial Processing Pipeline

**Document Identifier:** GIBRAS-RES-03  
**Lead:** Senior Geospatial Engineering Specialist  
**Standardized Projected CRS:** EPSG:32643 (WGS 84 / UTM Zone 43N)  
**Geographic Domain:** Bounding Box [12.75°N, 77.70°E] to [13.98°N, 78.60°E]  

---

## 1. Projected Coordinate System & Geometric Standards

To eliminate severe metric distortions caused by degree-based planar calculations at ~13° North latitude, all geospatial operations follow strict rules:
1. **Metric Processing CRS:** `EPSG:32643` (UTM Zone 43N, Central Meridian 75°E). Scale factor at central meridian is 0.9996, keeping distortion below 0.1% across Kolar and Chikkaballapur.
2. **Web Interchange & Display CRS:** `EPSG:4326` (WGS 84) and `EPSG:3857` (Pseudo-Mercator) for GeoJSON payloads and MapLibre tile services.
3. **Automated Assertion:** Any geospatial utility calculating distance ($d$), area ($A$), or density ($\rho$) without explicitly asserting `crs.to_epsg() == 32643` will fail unit test execution.

---

## 2. Terrain Derivatives Extraction (from 30m DEM)

Digital Elevation Models (SRTM 30m / Copernicus GLO-30) are reprojected to EPSG:32643 using bilinear resampling with grid cell resolution $\Delta x = \Delta y = 30.0\text{ m}$.

### Mathematical Formulations:
1. **Slope ($\beta$, degrees & radians):**
   $$\tan \beta = \sqrt{\left(\frac{\partial z}{\partial x}\right)^2 + \left(\frac{\partial z}{\partial y}\right)^2}$$
   Calculated using 3x3 Horn’s window algorithm.
2. **Topographic Wetness Index (TWI):**
   $$\text{TWI} = \ln\left(\frac{\alpha}{\tan \beta + \epsilon}\right)$$
   Where $\alpha$ is the specific catchment area ($m^2/m$ of contour width) derived via multiple flow direction (MFD) or D8 accumulation, and $\epsilon = 0.001$ prevents division by zero in flat depressions.
3. **Topographic Position Index (TPI):**
   $$\text{TPI} = z_0 - \bar{z}_R$$
   Where $z_0$ is local elevation and $\bar{z}_R$ is mean elevation in a circular window of radius $R = 500\text{ m}$, classifying ridges ($>+1$), valley bottoms ($<-1$), and flat plains ($\approx 0$).
4. **Terrain Ruggedness Index (TRI):**
   $$\text{TRI} = \sqrt{\sum_{i=1}^8 (z_i - z_0)^2}$$

---

## 3. Hydrographic & Structural Lineament Feature Extraction

### Drainage Features:
1. **Drainage Density ($D_d$, $\text{km}/\text{km}^2$):**
   $$D_d = \frac{\sum L_{\text{streams}}}{A_{\text{cell}}}$$
   Evaluated over a regular 500m moving kernel. High drainage density indicates low infiltration capacity and high surface runoff, inversely correlating with groundwater recharge potential.
2. **Euclidean Stream Distance ($d_{\text{stream}}$, meters):**
   Calculated via high-performance raster distance transform or spatial index (STRtree / R-tree) against stream vectors.

### Lineament & Structural Features:
1. **Lineament Density ($L_d$, $\text{km}/\text{km}^2$):**
   $$L_d = \frac{\sum L_{\text{fractures}}}{A_{\text{cell}}}$$
   Concentration of faults, shears, and quartz/pegmatite reefs.
2. **Distance to Lineaments ($d_{\text{lin}}$) & Intersections ($d_{\text{xlin}}$):**
   Fracture intersections represent loci of maximum hydraulic conductivity in crystalline rocks. Points within 50–150m of lineaments receive elevated structural favorability scoring.

---

## 4. Quality Assurance & Spatial Integrity Protocols

- **Geometric Validity:** All ingested polygons must pass `shapely.validation.make_valid()`. `geom.is_valid` is enforced on 100% of boundary geometries.
- **Topological Consistency:** No sliver gaps or overlaps between contiguous taluk polygons.
- **Raster-Vector Alignment:** Raster extents and affine transformation matrices are validated before cell-wise overlay operations.
