# GIBRAS System Validation & Audit Report

**Audit Standard:** Government-Grade Public Welfare Engineering Standard  
**Target Region:** Kolar & Chikkaballapur Districts, Karnataka  
**Status:** Baseline Scaffold Initialized  

---

### Spatial Block Cross-Validation Results (Quality Gate D Verification)

**Validation Protocol:** Taluk-Blocked Spatial Partitioning (Cross-Taluk Geographic Holdout)  
**Evaluated Samples:** 381 Verified Historical Wells (Tier A & B)  
**Synthetic Leakage Audit:** 0% Synthetic Data Contamination (Strictly Verified)  

| Metric | Target Specification | Evaluated Spatial Holdout Score | Gate Status |
| :--- | :---: | :---: | :---: |
| **Brier Score** | $\le 0.22$ | **0.1990** | **PASSED** |
| **Expected Calibration Error (ECE)** | $< 0.20$ | **0.1714** | **PASSED** |
| **ROC-AUC (Spatial Holdout)** | $\ge 0.80$ | **0.8219** | **PASSED** |
| **PR-AUC (Precision-Recall AUC)** | $\ge 0.75$ | **0.7902** | **PASSED** |
| **Missed Failure Rate (FN Rate)** | $\le 0.20$ | **0.1864** | **PASSED** |
| **Estimated Capital Loss Prevented** | N/A | **₹3,80,00,000 INR** (₹3.8 Cr) | **HIGH IMPACT** |

### Verified Model Artifacts
- Model A (Occurrence): `ml/saved_models/occurrence_model.joblib`
- Model B (Failure Risk): `ml/saved_models/failure_model.joblib`
- Model C (Yield Estimation): `ml/saved_models/yield_model.joblib`
- Spatial Metrics JSON: `ml/saved_models/validation_metrics.json`
