import { NextResponse } from "next/server"
import { incidentLogs, overrideLogs, generateIncidentId } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ incidents: incidentLogs })
}

export async function POST(request: Request) {
  const body = await request.json()
  const incident = {
    id: generateIncidentId(),
    type: body.type,
    manholeId: body.manholeId,
    workerName: body.workerName,
    supervisorName: body.supervisorName,
    description: body.description,
    timestamp: new Date().toISOString(),
    taskId: body.taskId,
  }
  incidentLogs.push(incident)
  return NextResponse.json({ incident }, { status: 201 })
}
