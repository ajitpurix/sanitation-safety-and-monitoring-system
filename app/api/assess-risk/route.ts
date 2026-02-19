import { NextResponse } from "next/server"
import type { RiskStatus } from "@/lib/types"

export async function POST(request: Request) {
  const body = await request.json()
  const { manholeId, lastCleanedDate, isRaining, pastIncidentCount } = body as {
    manholeId: string
    lastCleanedDate: string
    isRaining: boolean
    pastIncidentCount: number
  }

  if (!manholeId || !lastCleanedDate) {
    return NextResponse.json({ error: "Manhole ID and last cleaned date are required" }, { status: 400 })
  }

  let riskScore = 0
  const reasons: string[] = []

  // Rain check: +30
  if (isRaining) {
    riskScore += 30
    reasons.push("Active rainfall increases flooding and toxic gas risk (+30)")
  }

  // Last cleaned > 30 days: +20
  const lastCleaned = new Date(lastCleanedDate)
  const now = new Date()
  const daysSinceCleaned = Math.floor((now.getTime() - lastCleaned.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceCleaned > 30) {
    riskScore += 20
    reasons.push(`Last cleaned ${daysSinceCleaned} days ago - debris buildup risk (+20)`)
  } else {
    reasons.push(`Last cleaned ${daysSinceCleaned} days ago - within acceptable range`)
  }

  // Past incidents > 0: +40
  if (pastIncidentCount > 0) {
    riskScore += 40
    reasons.push(`${pastIncidentCount} past incident(s) at this location - high risk history (+40)`)
  } else {
    reasons.push("No past incidents at this location")
  }

  // Determine risk status
  let riskStatus: RiskStatus
  if (riskScore < 40) {
    riskStatus = "SAFE"
    reasons.push("Overall assessment: SAFE for entry with standard precautions")
  } else if (riskScore <= 70) {
    riskStatus = "CAUTION"
    reasons.push("Overall assessment: CAUTION - proceed with enhanced safety measures")
  } else {
    riskStatus = "NOT ALLOWED"
    reasons.push("Overall assessment: NOT ALLOWED - entry is too dangerous without override")
  }

  return NextResponse.json({
    manholeId,
    lastCleanedDate,
    isRaining,
    pastIncidentCount,
    riskScore,
    riskStatus,
    reasons,
  })
}
