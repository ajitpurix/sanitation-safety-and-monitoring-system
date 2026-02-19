"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { AlertPanel } from "@/components/alert-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, AlertTriangle, CheckCircle2, Clock, MapPin, User } from "lucide-react"
import type { Task, Alert, IncidentLog } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getRiskBadgeClasses(status: string) {
  if (status === "SAFE") return "bg-safe text-safe-foreground hover:bg-safe/90"
  if (status === "CAUTION") return "bg-caution text-caution-foreground hover:bg-caution/90"
  return "bg-danger text-danger-foreground hover:bg-danger/90"
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
    else if (user.role !== "admin") router.push("/dashboard")
  }, [user, router])

  const { data: tasksData } = useSWR<{ tasks: Task[] }>(
    user ? "/api/tasks" : null,
    fetcher,
    { refreshInterval: 3000 }
  )
  const { data: alertsData } = useSWR<{ alerts: Alert[] }>(
    user ? "/api/alerts" : null,
    fetcher,
    { refreshInterval: 3000 }
  )
  const { data: incidentsData } = useSWR<{ incidents: IncidentLog[] }>(
    user ? "/api/incidents" : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const tasks = tasksData?.tasks || []
  const alerts = alertsData?.alerts || []
  const incidents = incidentsData?.incidents || []

  const activeTasks = tasks.filter((t) => t.taskState === "Inside")
  const completedTasks = tasks.filter((t) => t.taskState === "Completed")
  const activeAlerts = alerts.filter((a) => !a.resolved)

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Admin Control Room
          </h2>
          <p className="text-sm text-muted-foreground">
            Read-only overview of all sanitation operations and incidents
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-caution/10">
              <Users className="h-5 w-5 text-caution" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeTasks.length}</p>
              <p className="text-xs text-muted-foreground">Workers Inside</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-safe/10">
              <CheckCircle2 className="h-5 w-5 text-safe" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tasks Overview */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-lg font-semibold text-foreground">All Tasks</h3>
            {tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No tasks recorded</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks
                  .slice()
                  .reverse()
                  .map((task) => (
                    <Card key={task.id}>
                      <CardContent className="flex flex-col gap-2 py-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{task.manholeId}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskBadgeClasses(task.riskStatus)}>
                              {task.riskStatus}
                            </Badge>
                            <Badge variant="outline">{task.taskState}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.workerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {task.manholeId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Max {task.maxDurationMinutes}min
                          </span>
                        </div>
                        {task.overrideUsed && (
                          <span className="text-xs font-medium text-caution">
                            <AlertTriangle className="mr-1 inline h-3 w-3" />
                            Override was used
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Recent Incidents */}
            <h3 className="mb-3 mt-8 text-lg font-semibold text-foreground">Recent Incidents</h3>
            {incidents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-safe" />
                <p className="text-sm text-muted-foreground">No incidents recorded</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {incidents
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((incident) => (
                    <Card key={incident.id}>
                      <CardContent className="flex items-start gap-3 py-3">
                        {incident.type === "emergency" ? (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caution" />
                        )}
                        <div>
                          <Badge
                            className={
                              incident.type === "emergency"
                                ? "bg-danger text-danger-foreground"
                                : "bg-caution text-caution-foreground"
                            }
                          >
                            {incident.type}
                          </Badge>
                          <p className="mt-1 text-sm text-foreground">{incident.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(incident.timestamp).toLocaleString()} - {incident.manholeId}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Alerts Panel */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Alerts</h3>
            <AlertPanel alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}
