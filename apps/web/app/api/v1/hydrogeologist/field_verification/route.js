import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { assessmentsStore } from '../../assess/route'

export async function POST(request) {
  try {
    const body = await request.json()
    const { assessment_id, hydrogeologist_name, verified_outcome } = body

    if (assessmentsStore && assessmentsStore.has(assessment_id)) {
      const a = assessmentsStore.get(assessment_id)
      a.expert_reviewed = true
      a.verified_outcome = verified_outcome
      assessmentsStore.set(assessment_id, a)
    }

    return NextResponse.json({
      verification_id: crypto.randomUUID(),
      assessment_id,
      status: "RECORDED_SUCCESSFULLY",
      message: `Field verification logged by ${hydrogeologist_name || 'Hydrogeologist'}. Assessment status updated to EXPERT_REVIEWED.`
    })
  } catch (err) {
    return NextResponse.json({ error: "Verification failed", detail: err.message }, { status: 500 })
  }
}
