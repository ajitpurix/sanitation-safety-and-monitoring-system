"use client"

import type { Alert } from "@/lib/types"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface AlertPanelProps {
  alerts: Alert[]
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const activeAlerts = alerts.filter((a) => !a.resolved)
  const resolvedAlerts = alerts.filter((a) => a.resolved)

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-safe" />
        <p className="text-sm font-medium text-foreground">No Active Alerts</p>
        <p className="text-xs text-muted-foreground">All operations running normally</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4 animate-pulse"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">EMERGENCY ALERT</p>
            <p className="text-sm text-foreground">{alert.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
      {resolvedAlerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 opacity-60"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-safe" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resolved</p>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
