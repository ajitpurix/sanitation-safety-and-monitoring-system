import { NextResponse } from "next/server"
import { overrideLogs, incidentLogs, generateOverrideId, generateIncidentId } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ overrides: overrideLogs })
}

export async function POST(request: Request) {
  const body = await request.json()
  const override = {
    id: generateOverrideId(),
    supervisorName: body.supervisorName,
    supervisorId: body.supervisorId,
    time: new Date().toISOString(),
    manholeId: body.manholeId,
    reason: body.reason,
  }
  overrideLogs.push(override)

  // Also log as incident
  const incident = {
    id: generateIncidentId(),
    type: "override" as const,
    manholeId: body.manholeId,
    workerName: body.workerName || "N/A",
    supervisorName: body.supervisorName,
    description: `Safety override used: ${body.reason}`,
    timestamp: new Date().toISOString(),
    taskId: body.taskId || "N/A",
  }
  incidentLogs.push(incident)

  return NextResponse.json({ override }, { status: 201 })
}
