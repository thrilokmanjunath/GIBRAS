"""
GIBRAS Spatial Block Cross-Validation & Scientific Audit Suite
Enforces:
1. 0% Synthetic Data Leakage Audit
2. Taluk-Blocked Spatial Cross-Validation (Eliminating spatial autocorrelation bleed)
3. Brier Score & Expected Calibration Error (ECE)
4. Public-Welfare Economic Metrics (Capital Loss Prevention)
"""
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss, precision_recall_curve, auc, roc_auc_score, confusion_matrix


def audit_synthetic_leakage(df: pd.DataFrame) -> bool:
    """
    Audits the training dataset to ensure NO synthetic fixtures (Class E) have leaked in.
    Returns True if clean; raises ValueError if contaminated.
    """
    if "quality_tier" in df.columns:
        leaked = df[df["quality_tier"] == "E"]
        if not leaked.empty:
            raise ValueError(
                f"FATAL AUDIT FAILURE: Found {len(leaked)} synthetic (Class E) samples in training dataset!"
            )
    return True


def compute_expected_calibration_error(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
    """
    Computes Expected Calibration Error (ECE) across probability bins.
    """
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    n = len(y_true)

    for i in range(n_bins):
        bin_mask = (y_prob >= bins[i]) & (y_prob < bins[i + 1])
        if np.sum(bin_mask) > 0:
            bin_acc = np.mean(y_true[bin_mask])
            bin_conf = np.mean(y_prob[bin_mask])
            ece += (np.sum(bin_mask) / n) * np.abs(bin_acc - bin_conf)

    return float(ece)


def evaluate_spatial_block_cv(
    wells_df: pd.DataFrame,
    features_list: List[Dict[str, float]],
    model_class
) -> Dict[str, float]:
    """
    Performs Spatial Block Cross-Validation across Taluk boundaries.
    """
    audit_synthetic_leakage(wells_df)

    y_failure = np.array([1 if row["borewell_outcome"] in ["DRY", "INADEQUATE_YIELD"] else 0
                          for _, row in wells_df.iterrows()])

    taluks = wells_df["taluk"].unique()
    # Split taluks into 3 spatial holdout groups
    group_1 = taluks[:4]
    group_2 = taluks[4:8]
    group_3 = taluks[8:]

    brier_scores = []
    eces = []
    roc_aucs = []
    pr_aucs = []
    missed_failures = []
    capital_saved_total = 0.0

    groups = [group_1, group_2, group_3]
    for i, test_taluks in enumerate(groups):
        test_mask = wells_df["taluk"].isin(test_taluks).values
        train_mask = ~test_mask

        train_feats = [features_list[j] for j in range(len(features_list)) if train_mask[j]]
        test_feats = [features_list[j] for j in range(len(features_list)) if test_mask[j]]

        y_train = y_failure[train_mask]
        y_test = y_failure[test_mask]

        if len(np.unique(y_test)) < 2:
            continue

        clf = model_class()
        clf.fit(train_feats, y_train)

        test_probs = []
        for feat in test_feats:
            prob, _, _ = clf.predict_failure_probability(feat)
            test_probs.append(prob)
        test_probs = np.array(test_probs)

        # Metrics
        bs = brier_score_loss(y_test, test_probs)
        ece = compute_expected_calibration_error(y_test, test_probs)
        roc = roc_auc_score(y_test, test_probs)

        precision, recall, _ = precision_recall_curve(y_test, test_probs)
        pr = auc(recall, precision)

        # High-risk threshold at 0.50
        y_pred = (test_probs >= 0.50).astype(int)
        cm = confusion_matrix(y_test, y_pred)
        # cm = [[TN, FP], [FN, TP]]
        fn = cm[1][0] if len(cm) > 1 else 0
        tp = cm[1][1] if len(cm) > 1 else 0
        total_failures = np.sum(y_test == 1)
        missed_failure_rate = (fn / total_failures) if total_failures > 0 else 0.0

        brier_scores.append(bs)
        eces.append(ece)
        roc_aucs.append(roc)
        pr_aucs.append(pr)
        missed_failures.append(missed_failure_rate)

        # True Positives: Failed wells successfully identified -> saves ₹2.5L each
        capital_saved_total += float(tp * 250000)

    return {
        "mean_brier_score": round(float(np.mean(brier_scores)), 4),
        "mean_ece": round(float(np.mean(eces)), 4),
        "mean_roc_auc": round(float(np.mean(roc_aucs)), 4),
        "mean_pr_auc": round(float(np.mean(pr_aucs)), 4),
        "mean_missed_failure_rate": round(float(np.mean(missed_failures)), 4),
        "total_capital_loss_prevented_inr": capital_saved_total,
    }
