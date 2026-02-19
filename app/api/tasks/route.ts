import { NextResponse } from "next/server"
import { tasks, generateTaskId } from "@/lib/store"
import type { Task } from "@/lib/types"

export async function GET() {
  return NextResponse.json({ tasks })
}

export async function POST(request: Request) {
  const body = await request.json()
  const task: Task = {
    id: generateTaskId(),
    workerName: body.workerName,
    workerId: body.workerId,
    manholeId: body.manholeId,
    riskStatus: body.riskStatus,
    riskScore: body.riskScore,
    taskState: "Not Started",
    entryTime: null,
    exitTime: null,
    maxDurationMinutes: body.maxDurationMinutes || 30,
    supervisorId: body.supervisorId,
    supervisorName: body.supervisorName,
    sopCompleted: body.sopCompleted || false,
    overrideUsed: body.overrideUsed || false,
    overrideReason: body.overrideReason || null,
    assessment: body.assessment || null,
    createdAt: new Date().toISOString(),
  }
  tasks.push(task)
  return NextResponse.json({ task }, { status: 201 })
}
