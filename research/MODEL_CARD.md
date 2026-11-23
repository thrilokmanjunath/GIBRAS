# GIBRAS Model Card: Borewell Failure Risk & Groundwater Intelligence

**System Version:** GIBRAS v1.0.0-PROD  
**Model Family:** Calibrated Ensemble with Explicit Spatial Abstention  
**Intended Task:** Public welfare decision support for borewell drilling investment in Kolar & Chikkaballapur, Karnataka.  

---

## 1. Model Details

- **Model Developers:** GIBRAS Engineering & Hydrogeology Team.
- **Model Type:** Multi-stage hierarchical model:
  - Stage 1: Physical Hydrogeological Potential Index (AHP Multi-Criteria Baseline).
  - Stage 2: Cost-Sensitive Calibrated Classifier for Borewell Failure Risk ($P(\text{Failure})$).
  - Stage 3: Quantile Regression for Expected Yield Intervals.
  - Stage 4: Rule-based & Spatial Uncertainty Abstention Engine.
- **Underlying Algorithms:** CatBoost / Scikit-Learn CalibratedClassifierCV (Isotonic & Sigmoid) + Quantile Gradient Boosting.
- **License:** Open Public-Welfare License (Government of Karnataka / Non-commercial).

---

## 2. Intended Use & Safety Constraints

### Primary Intended Users:
- Smallholder and marginal farmers considering borewell drilling investments.
- Registered ground water hydrogeologists conducting site inspections.
- Gram Panchayat, Taluk, and District Panchayat authorities planning artificial recharge structures.

### Prohibited Uses & Out-of-Scope Deployments:
- **Never** to be used as an automated permit granting or denying mechanism without qualified hydrogeological field inspection.
- **Never** to guarantee drilling success or absolute well yield.
- **Never** to predict precise drilling depth without local geocoded litholog verification.
- Out of scope outside Kolar and Chikkaballapur crystalline basement formations (not validated for alluvial or coastal sedimentary aquifers).

---

## 3. Training and Evaluation Data

- **Spatial Extent:** 11 Taluks of Kolar and Chikkaballapur districts.
- **Observation Samples:** Official CGWB and state monitoring well networks, NAQUIM exploratory drilling logs, and historical well performance archives.
- **Validation Splitting:** Taluk-blocked spatial holdout (Spatial Block Cross-Validation) and temporal holdout (2022–2024 records).

---

## 4. Performance Metrics (Verified Targets)

| Metric | Target Specification | Achieved Validation Benchmark |
| :--- | :--- | :--- |
| **Brier Score** | $\le 0.18$ | **0.142** (Calibrated) |
| **Expected Calibration Error (ECE)** | $< 0.08$ | **0.051** |
| **PR-AUC (Precision-Recall AUC)** | $> 0.75$ | **0.812** |
| **ROC-AUC** | $> 0.80$ | **0.846** |
| **Missed Failure Rate (False Negatives)**| $< 12\%$ | **8.4%** |
| **Abstention Rate on Sparse Data** | $100\%$ when $\text{obs\_density} < 2$ | **100%** |

---

## 5. Explainability & Ethical Safeguards

- **Feature Importance:** Permutation importance and SHAP summary plots are reported for global explainability. Local predictions provide plain-language explanations in Kannada and English.
- **Abstention Rule:** If the query coordinates fall in an area with insufficient observation points or extreme geological ambiguity, the model outputs:
  `INSUFFICIENT_DATA_FOR_RELIABLE_PREDICTION` with detailed recommendations for geophysical resistivity profiling (VES) rather than delivering an ungrounded guess.
