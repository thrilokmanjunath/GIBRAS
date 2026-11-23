# Machine Learning Methodology & Multi-Model Inference Architecture

**Document Identifier:** GIBRAS-RES-05  
**Lead:** Machine Learning Scientist & Technical Auditor  
**Primary Mandate:** High-Stakes Public Welfare Risk Modeling (No Deceptive Metrics, Mandatory Uncertainty, Explicit Abstention).

---

## 1. System Multi-Model Decomposition

Groundwater intelligence in hard-rock cratons cannot be compressed into a single uninterpretable "black-box" score. GIBRAS operates a decomposed multi-model ensemble:

```
                            [Geospatial & Hydrogeological Features]
                                               |
         +-------------------------------------+-------------------------------------+
         |                                     |                                     |
         v                                     v                                     v
   [Model A: Occurrence]            [Model B: Failure Risk]             [Model E: Seasonal Stress]
   P(GW Encounter | Regolith/       P(Yield < 40 LPM | Hard-Rock        CGWB piezometer trends
   Fracture presence)               Tectonics & Extraction Pressure)    & Rainfall anomalies
         |                                     |                                     |
         +-------------------------------------+-------------------------------------+
                                               |
                                               v
                             [Model F: Decision Support Engine]
                                               |
                          +--------------------+--------------------+
                          | Check Observation Density & Certainty  |
                          +--------------------+--------------------+
                                    |                         |
                               (Sufficient)              (Insufficient)
                                    |                         |
                                    v                         v
                       Calibrated Risk Advisory        ABSTAIN: "INSUFFICIENT_DATA_
                       & Productive Depth Range        FOR_RELIABLE_PREDICTION"
```

---

## 2. Model Specifications

### Model A: Groundwater Occurrence Baseline
- **Target:** $y_A \in \{0, 1\}$, indicating whether saturated porous/fissured media exists at a site.
- **Formulation:** Calibrated ensemble of regularized Logistic Regression and Random Forest using physical hydrogeological weights (analytical hierarchy process baseline combined with empirical monitoring well presence).
- **Output:** Calibrated probability $P(\text{Occurrence})$.

### Model B: Borewell Failure Risk Model
- **Target:** $y_B \in \{0, 1\}$, where $y_B = 1$ denotes a **FAILED BOREWELL** (defined as total yield $< 40\text{ LPM}$ or rapid exhaustion within 6 months of commissioning).
- **Candidates:** Calibrated XGBoost, CatBoost, and Isotonic-calibrated Random Forest.
- **Cost-Sensitive Loss:** In agricultural communities, a False Negative (predicting "Low Risk" when the borewell actually fails, causing a farmer to lose ₹2.5 Lakhs) is penalized $5\times$ more heavily than a False Positive (advising caution on a viable site).
  $$\mathcal{L}(y, \hat{p}) = - \sum \left[ w_{\text{cost}} \cdot y \log(\hat{p}) + (1-y)\log(1-\hat{p}) \right]$$

### Model C: Well Productivity / Yield Estimation
- **Target:** Continuous yield in Litres Per Minute (LPM).
- **Approach:** Quantile Gradient Boosting (predicting 10th, 50th, and 90th percentiles: $Q_{0.10}, Q_{0.50}, Q_{0.90}$).
- **Output:** Asymmetric confidence interval, e.g., median 75 LPM [35 LPM – 140 LPM]. If confidence interval width $\Delta Q > 120\text{ LPM}$, the model flags high parametric uncertainty.

### Model D: Productive Depth Interval Estimation
- **Rule:** Activated **only** when geocoded drilling lithologs exist within a 5 km radius.
- **Output:** Categorical interval hypothesis (e.g. Primary: 45–75m, Secondary: 110–140m).
- **Safety Restriction:** If no verified deep strike observations exist within the structural domain, Model D outputs `DATA_INSUFFICIENT_FOR_DEPTH_RECOMMENDATION`. It is forbidden to estimate drilling depth solely from surface terrain.

### Model E: Seasonal Groundwater Stress Indicator
- **Target:** Dynamic water table depth depletion rate ($\Delta z / \Delta t$) and stress index $S \in [0, 1]$.
- **Formulation:** Autoregressive seasonal lag of historical CGWB piezometer levels cross-correlated with KSNDMC 90-day and 180-day standardized precipitation anomalies (SPI).

---

## 3. Spatial Cross-Validation & Leakage Prevention

Standard random K-fold cross-validation is **strictly prohibited** because spatial autocorrelation (Tobler’s First Law of Geography) leads to severe over-optimistic score inflation when neighboring borewells share unmeasured structural lineament attributes.

### Enforced Partitioning Protocols:
1. **Spatial Block Cross-Validation (Taluk-Holdout):**
   - Fold 1: Train on Kolar, Bangarapet, Malur, Srinivaspur; Validate on Mulbagal & KGF.
   - Fold 2: Train on Chikkaballapur, Bagepalli, Chintamani; Validate on Gauribidanur, Sidlaghatta & Gudibanda.
2. **Spatial Grid Buffer Partitioning:** 5km x 5km spatial grid blocks with a 1km exclusion buffer between training and test folds to eliminate spatial bleed.
3. **Temporal Holdout:** Training on pre-2021 observations and evaluating on 2022–2024 monitoring records.

---

## 4. Probability Calibration & Metrics

All classification predictions must pass probability calibration checks:
- **Brier Score:** $\text{BS} = \frac{1}{N} \sum_{i=1}^N (f_i - o_i)^2 \le 0.18$
- **Expected Calibration Error (ECE):**
  $$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} |\text{acc}(B_m) - \text{conf}(B_m)| < 0.08$$
- **Public Welfare Economic Metric:**
  $$\text{Capital Preserved} = \sum_{\text{True High Risk}} \text{Drilling Cost (₹2.5L)}$$
  $$\text{Opportunity Loss} = \sum_{\text{False High Risk}} \text{Foregone Agricultural Return}$$
