"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"
import { Clock, User, MapPin, Play, Square, AlertTriangle } from "lucide-react"

function getRiskBadgeClasses(status: string) {
  if (status === "SAFE") return "bg-safe text-safe-foreground hover:bg-safe/90"
  if (status === "CAUTION") return "bg-caution text-caution-foreground hover:bg-caution/90"
  return "bg-danger text-danger-foreground hover:bg-danger/90"
}

function getStateBadgeClasses(state: string) {
  if (state === "Completed") return "bg-safe/10 text-safe border-safe/20"
  if (state === "Inside") return "bg-primary/10 text-primary border-primary/20"
  return "bg-muted text-muted-foreground border-border"
}

function LiveTimer({ entryTime, maxMinutes }: { entryTime: string; maxMinutes: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(entryTime).getTime()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [entryTime])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const exceeded = minutes >= maxMinutes

  return (
    <div className={`flex items-center gap-1 font-mono text-sm font-bold ${exceeded ? "text-danger animate-pulse" : "text-primary"}`}>
      <Clock className="h-4 w-4" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      {exceeded && <span className="ml-1 text-xs">(EXCEEDED)</span>}
    </div>
  )
}

interface TaskCardProps {
  task: Task
  onMarkEntered: (id: string) => void
  onMarkExited: (id: string) => void
  onTriggerEmergency: (id: string) => void
}

export function TaskCard({ task, onMarkEntered, onMarkExited, onTriggerEmergency }: TaskCardProps) {
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)

  // Auto-trigger emergency when time exceeded
  const checkTimeExceeded = useCallback(() => {
    if (task.taskState === "Inside" && task.entryTime && !emergencyTriggered) {
      const start = new Date(task.entryTime).getTime()
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const minutes = Math.floor(elapsed / 60)
      if (minutes >= task.maxDurationMinutes) {
        setEmergencyTriggered(true)
        onTriggerEmergency(task.id)
      }
    }
  }, [task, emergencyTriggered, onTriggerEmergency])

  useEffect(() => {
    if (task.taskState !== "Inside") return
    const interval = setInterval(checkTimeExceeded, 5000)
    return () => clearInterval(interval)
  }, [task.taskState, checkTimeExceeded])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-foreground">{task.manholeId}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getRiskBadgeClasses(task.riskStatus)}>{task.riskStatus}</Badge>
            <Badge variant="outline" className={getStateBadgeClasses(task.taskState)}>
              {task.taskState}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-foreground">{task.workerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Manhole: {task.manholeId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Max safe duration: {task.maxDurationMinutes} min</span>
          </div>
          {task.overrideUsed && (
            <div className="flex items-center gap-2 text-caution">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Override used</span>
            </div>
          )}
        </div>

        {task.taskState === "Inside" && task.entryTime && (
          <LiveTimer entryTime={task.entryTime} maxMinutes={task.maxDurationMinutes} />
        )}

        <div className="flex items-center gap-2 pt-1">
          {task.taskState === "Not Started" && (
            <Button size="sm" onClick={() => onMarkEntered(task.id)} className="gap-1">
              <Play className="h-3 w-3" />
              Mark Worker Entered
            </Button>
          )}
          {task.taskState === "Inside" && (
            <>
              <Button size="sm" onClick={() => onMarkExited(task.id)} variant="default" className="gap-1">
                <Square className="h-3 w-3" />
                Mark Exited Safely
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onTriggerEmergency(task.id)}
                className="gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                Emergency
              </Button>
            </>
          )}
          {task.taskState === "Completed" && (
            <span className="text-sm font-medium text-safe">Task Completed</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
