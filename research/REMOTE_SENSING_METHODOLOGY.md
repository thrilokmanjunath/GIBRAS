# Remote Sensing Methodology & Earth Observation Indicators

**Document Identifier:** GIBRAS-RES-04  
**Lead:** Remote Sensing Specialist  
**Sensors:** Sentinel-2 MSI (Multispectral), Sentinel-1 C-SAR (Synthetic Aperture Radar)  
**Scientific Guardrail:** Strictly surface boundary condition modeling. Zero subsurface water detection claims.

---

## 1. Sensor Specifications & Preprocessing

### Sentinel-2 MSI Level-2A (Bottom-of-Atmosphere Reflectance)
- **Spatial Resolution:** 10m (B2 Blue, B3 Green, B4 Red, B8 NIR) and 20m (B11 SWIR-1, B12 SWIR-2).
- **Cloud Masking:** Scene Classification Layer (SCL) filtering. Pixels classified as Cloud High/Medium Probability, Thin Cirrus, or Cloud Shadows are masked out.
- **Seasonal Compositing:** Median compositing over two critical agronomic seasons:
  1. *Kharif / Post-Monsoon Composite:* October 1 to November 30 (reflecting peak soil moisture and tank filling).
  2. *Zaid / Pre-Monsoon Dry Composite:* March 15 to May 15 (reflecting baseline groundwater-supported irrigated patches).

---

## 2. Spectral Indices & Formulations

1. **Normalized Difference Vegetation Index (NDVI):**
   $$\text{NDVI} = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}}} = \frac{\text{B8} - \text{B4}}{\text{B8} + \text{B4}}$$
   *Utility:* Distinguishes rainfed vs. perennial groundwater-irrigated crops (e.g. mulberry, mango orchards, vegetables).
2. **Normalized Difference Water Index (NDWI - McFeeters):**
   $$\text{NDWI} = \frac{\rho_{\text{Green}} - \rho_{\text{NIR}}}{\rho_{\text{Green}} + \rho_{\text{NIR}}} = \frac{\text{B3} - \text{B8}}{\text{B3} + \text{B8}}$$
   *Utility:* Delineates surface water bodies, lakes, and minor irrigation tanks.
3. **Modified Normalized Difference Water Index (MNDWI - Xu):**
   $$\text{MNDWI} = \frac{\rho_{\text{Green}} - \rho_{\text{SWIR1}}}{\rho_{\text{Green}} + \rho_{\text{SWIR1}}} = \frac{\text{B3} - \text{B11}}{\text{B3} + \text{B11}}$$
   *Utility:* Enhances open water bodies while suppressing built-up noise in semi-arid settings.
4. **Normalized Difference Moisture Index (NDMI):**
   $$\text{NDMI} = \frac{\rho_{\text{NIR}} - \rho_{\text{SWIR1}}}{\rho_{\text{NIR}} + \rho_{\text{SWIR1}}} = \frac{\text{B8} - \text{B11}}{\text{B8} + \text{B11}}$$
   *Utility:* Measures canopy water stress during pre-monsoon dry months.
5. **Bare Soil Index (BSI):**
   $$\text{BSI} = \frac{(\rho_{\text{SWIR1}} + \rho_{\text{Red}}) - (\rho_{\text{NIR}} + \rho_{\text{Blue}})}{(\rho_{\text{SWIR1}} + \rho_{\text{Red}}) + (\rho_{\text{NIR}} + \rho_{\text{Blue}})}$$
   *Utility:* Quantifies fallow ground and hardpan crusted soils.

---

## 3. Sentinel-1 C-SAR Surface Moisture & Roughness

- **Mode:** Interferometric Wide Swath (IW), Ground Range Detected (GRD), dual polarization ($\sigma^0_{\text{VV}}$, $\sigma^0_{\text{VH}}$).
- **Processing:** Radiometric calibration, speckle filtering (Lee 5x5), and Range-Doppler terrain correction using SRTM 30m DEM.
- **Cross-Ratio ($\text{VH}/\text{VV}$):** Sensitivity to vegetation volume scattering and near-surface volumetric soil moisture variations.

---

## 4. Fundamental Scientific Guardrails & Non-Negotiable Limits

1. **Depth of Penetration:** Optical radiation penetrates $<1\mu m$. C-band radar penetrates $\le 5\text{ cm}$ in dry soil. Satellite imagery **has zero penetration into the crystalline bedrock at 50–300 meters**.
2. **Vegetation Misinterpretation:** A green vegetative anomaly in May does not prove an abundant aquifer beneath that specific parcel; it frequently indicates intense extraction from an already depleted, over-stressed borewell.
3. **Role in GIBRAS:** Remote sensing provides **indirect environmental boundary layers** (evapotranspiration demand, surface wetness, tank cascade presence), not direct subterranean aquifer detection.
