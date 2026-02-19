"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskCard } from "@/components/task-card"
import { AlertPanel } from "@/components/alert-panel"
import { Button } from "@/components/ui/button"
import { Plus, Activity, Users, AlertTriangle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { Task, Alert } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
    else if (user.role !== "supervisor") router.push("/admin-dashboard")
  }, [user, router])

  const { data: tasksData, mutate: mutateTasks } = useSWR<{ tasks: Task[] }>(
    user ? "/api/tasks" : null,
    fetcher,
    { refreshInterval: 3000 }
  )
  const { data: alertsData, mutate: mutateAlerts } = useSWR<{ alerts: Alert[] }>(
    user ? "/api/alerts" : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  const tasks = tasksData?.tasks || []
  const alerts = alertsData?.alerts || []

  const activeTasks = tasks.filter((t) => t.taskState === "Inside")
  const completedTasks = tasks.filter((t) => t.taskState === "Completed")
  const activeAlerts = alerts.filter((a) => !a.resolved)

  async function handleMarkEntered(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enter" }),
    })
    mutateTasks()
  }

  async function handleMarkExited(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "exit" }),
    })
    mutateTasks()
    mutateAlerts()
  }

  async function handleTriggerEmergency(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "emergency" }),
    })
    mutateTasks()
    mutateAlerts()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Welcome + Action */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome, {user.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Supervisor Dashboard - Monitor and manage sanitation operations
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/assess">
              <Plus className="h-4 w-4" />
              Start New Risk Assessment
            </Link>
          </Button>
        </div>

        {/* Stats Strip */}
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
          {/* Tasks List */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-lg font-semibold text-foreground">Active Tasks</h3>
            {tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No tasks yet</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Start a risk assessment to create your first task
                </p>
                <Button asChild variant="outline">
                  <Link href="/assess">Start Risk Assessment</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {tasks
                  .slice()
                  .sort((a, b) => {
                    const order = { Inside: 0, "Not Started": 1, Completed: 2 }
                    return (order[a.taskState] ?? 3) - (order[b.taskState] ?? 3)
                  })
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMarkEntered={handleMarkEntered}
                      onMarkExited={handleMarkExited}
                      onTriggerEmergency={handleTriggerEmergency}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Alert Panel */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Alerts</h3>
            <AlertPanel alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}
