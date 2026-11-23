import { NextResponse } from 'next/server'

export async function GET() {
  const summary = {
    kolar_district: {
      name: "Kolar",
      name_kannada: "ಕೋಲಾರ ಜಿಲ್ಲೆ",
      taluk_count: 6,
      total_area_sq_km: 3969.0,
      mean_extraction_stage_pct: 190.2,
      mean_annual_rainfall_mm: 738.0,
      overall_status: "OVER-EXPLOITED (Critical)",
      taluks: [
        { taluk: "Kolar", area_sq_km: 796.8, cgwb_stage_extraction_pct: 194.2, annual_rainfall_normal_mm: 744.0 },
        { taluk: "Bangarapet", area_sq_km: 542.4, cgwb_stage_extraction_pct: 182.6, annual_rainfall_normal_mm: 732.5 },
        { taluk: "Malur", area_sq_km: 648.2, cgwb_stage_extraction_pct: 208.4, annual_rainfall_normal_mm: 765.8 },
        { taluk: "Mulbagal", area_sq_km: 824.5, cgwb_stage_extraction_pct: 186.7, annual_rainfall_normal_mm: 720.0 },
        { taluk: "Srinivaspur", area_sq_km: 856.1, cgwb_stage_extraction_pct: 178.5, annual_rainfall_normal_mm: 748.2 },
        { taluk: "KGF (Robertsonpet)", area_sq_km: 301.0, cgwb_stage_extraction_pct: 191.0, annual_rainfall_normal_mm: 718.4 }
      ]
    },
    chikkaballapur_district: {
      name: "Chikkaballapur",
      name_kannada: "ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆ",
      taluk_count: 6,
      total_area_sq_km: 4244.0,
      mean_extraction_stage_pct: 180.4,
      mean_annual_rainfall_mm: 709.0,
      overall_status: "OVER-EXPLOITED (Critical)",
      taluks: [
        { taluk: "Chikkaballapur", area_sq_km: 638.5, cgwb_stage_extraction_pct: 188.4, annual_rainfall_normal_mm: 782.0 },
        { taluk: "Bagepalli", area_sq_km: 927.8, cgwb_stage_extraction_pct: 164.0, annual_rainfall_normal_mm: 655.4 },
        { taluk: "Chintamani", area_sq_km: 892.4, cgwb_stage_extraction_pct: 196.5, annual_rainfall_normal_mm: 710.2 },
        { taluk: "Gauribidanur", area_sq_km: 884.0, cgwb_stage_extraction_pct: 172.3, annual_rainfall_normal_mm: 692.6 },
        { taluk: "Gudibanda", area_sq_km: 234.6, cgwb_stage_extraction_pct: 168.1, annual_rainfall_normal_mm: 674.0 },
        { taluk: "Sidlaghatta", area_sq_km: 666.7, cgwb_stage_extraction_pct: 192.8, annual_rainfall_normal_mm: 738.5 }
      ]
    },
    ground_truth_inventory: {
      total_verified_borewells: 381,
      outcome_breakdown: {
        productive_count: 194,
        inadequate_yield_count: 112,
        dry_count: 75
      },
      failure_rate_pct: 49.1,
      verified_monitoring_stations: 13,
      capital_loss_prevented_inr: 38000000.0,
      capital_loss_prevented_formatted: "₹3.80 Crores"
    }
  }
  return NextResponse.json(summary)
}
