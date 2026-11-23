# GIBRAS Risk Register

| Risk ID | Category | Description | Likelihood | Impact | Mitigation Strategy | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **RSK-01** | Scientific / Public Welfare | Farmer spends ₹1.5 - ₹3 Lakhs drilling a dry borewell based on misconstrued system output. | Medium | Critical | Never display binary "Drill here" advice. Output explicit uncertainty bounds, failure probability, and mandatory advisory label: "Advisory only, not a drilling guarantee; requires field hydrogeological/geophysical verification". | Active |
| **RSK-02** | Data Integrity | Conflating synthetic test data with real ground observations in ML training. | Low | High | Strict isolation of `data/synthetic_test_only`. Automated unit tests audit training datasets to guarantee 0% synthetic sample leakage into production models. | Active |
| **RSK-03** | Geospatial Distortion | Calculating distances in unprojected WGS84 degrees resulting in inaccurate fracture/drainage proximity. | Medium | High | Enforce EPSG:32643 (UTM 43N) projection across all geospatial pipelines with automated unit tests asserting projected CRS. | Active |
| **RSK-04** | Privacy / Regulatory | Leaking farmer identities or private borewell ownership records. | Low | Critical | Adhere strictly to Digital Personal Data Protection Act (DPDPA 2023). Strip all PII (names, phone numbers, survey numbers). Maintain spatial anonymization on public endpoints. | Active |
| **RSK-05** | Overfitting / Spatial Leakage | Standard random K-Fold CV giving deceptively optimistic test scores across clustered borewells. | High | High | Implement spatial block cross-validation (Taluk-blocked and spatial grid cluster cross-validation) and temporal holdouts. | Active |
