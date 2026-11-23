import { NextResponse } from 'next/server'
import { assessmentsStore } from '../route'

export async function GET() {
  const list = []
  if (assessmentsStore) {
    for (const [id, a] of assessmentsStore.entries()) {
      list.push({
        assessment_id: a.assessment_id,
        created_at: a.created_at,
        district: a.administrative?.district || 'Kolar',
        taluk: a.administrative?.taluk || 'Kolar',
        village: a.village || '',
        advisory_classification: a.advisory_classification,
        failure_risk_prob: a.failure_risk_assessment?.failure_probability,
        risk_tier: a.failure_risk_assessment?.risk_tier,
        expert_reviewed: !!a.expert_reviewed
      })
    }
  }

  // Fallback sample demonstration items if store is empty on cold start
  if (list.length === 0) {
    list.push({
      assessment_id: "6ad55cef-4b75-45f9-b5d8-29574b07cb3d",
      created_at: new Date().toISOString(),
      district: "Kolar",
      taluk: "Kolar",
      village: "Vokkaleri Cluster",
      advisory_classification: "FURTHER_INVESTIGATION_REQUIRED",
      failure_risk_prob: 0.55,
      risk_tier: "HIGH_RISK",
      expert_reviewed: true
    })
    list.push({
      assessment_id: "38fa1b49-21cf-41c8-98e3-09419b48f902",
      created_at: new Date().toISOString(),
      district: "Chikkaballapur",
      taluk: "Chikkaballapur",
      village: "Nandi Swale",
      advisory_classification: "POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW",
      failure_risk_prob: 0.32,
      risk_tier: "LOW_RISK",
      expert_reviewed: false
    })
  }

  return NextResponse.json(list)
}
