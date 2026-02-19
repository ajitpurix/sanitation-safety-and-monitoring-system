import { NextResponse } from "next/server"
import { tasks, alerts, incidentLogs, generateAlertId, generateIncidentId } from "@/lib/store"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const { action } = body as { action: string }

  if (action === "enter") {
    task.taskState = "Inside"
    task.entryTime = new Date().toISOString()
  } else if (action === "exit") {
    task.taskState = "Completed"
    task.exitTime = new Date().toISOString()
    // Resolve any alerts for this task
    alerts.forEach((a) => {
      if (a.taskId === id) a.resolved = true
    })
  } else if (action === "emergency") {
    const alert = {
      id: generateAlertId(),
      taskId: id,
      workerName: task.workerName,
      manholeId: task.manholeId,
      type: "time-exceeded" as const,
      message: `EMERGENCY: Worker ${task.workerName} has exceeded safe duration in manhole ${task.manholeId}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    }
    alerts.push(alert)

    const incident = {
      id: generateIncidentId(),
      type: "emergency" as const,
      manholeId: task.manholeId,
      workerName: task.workerName,
      supervisorName: task.supervisorName,
      description: `Worker exceeded maximum safe duration of ${task.maxDurationMinutes} minutes`,
      timestamp: new Date().toISOString(),
      taskId: id,
    }
    incidentLogs.push(incident)
  } else {
    // Generic field update
    Object.assign(task, body)
  }

  return NextResponse.json({ task })
}
