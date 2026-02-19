"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Shield, FileWarning, Search } from "lucide-react"
import type { IncidentLog } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getTypeBadge(type: string) {
  if (type === "emergency") return { label: "Emergency", className: "bg-danger text-danger-foreground" }
  if (type === "override") return { label: "Override", className: "bg-caution text-caution-foreground" }
  return { label: "Near-Miss", className: "bg-primary text-primary-foreground" }
}

function getTypeIcon(type: string) {
  if (type === "emergency") return <AlertTriangle className="h-5 w-5 text-danger" />
  if (type === "override") return <Shield className="h-5 w-5 text-caution" />
  return <FileWarning className="h-5 w-5 text-primary" />
}

export default function IncidentsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  const { data } = useSWR<{ incidents: IncidentLog[] }>(
    user ? "/api/incidents" : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const [dateFilter, setDateFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")

  const incidents = data?.incidents || []

  // Get unique locations for filter
  const locations = [...new Set(incidents.map((i) => i.manholeId))]

  const filtered = incidents.filter((i) => {
    if (dateFilter) {
      const incidentDate = new Date(i.timestamp).toISOString().split("T")[0]
      if (incidentDate !== dateFilter) return false
    }
    if (locationFilter !== "all" && i.manholeId !== locationFilter) return false
    return true
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Incident Log</h2>
          <p className="text-sm text-muted-foreground">
            Record of all emergency alerts, overrides, and near-miss incidents
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dateFilter">Filter by Date</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Filter by Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No incidents found</p>
            <p className="text-sm text-muted-foreground">
              {incidents.length === 0
                ? "No incidents have been recorded yet"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered
              .slice()
              .reverse()
              .map((incident) => {
                const badge = getTypeBadge(incident.type)
                return (
                  <Card key={incident.id}>
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="mt-0.5">{getTypeIcon(incident.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={badge.className}>{badge.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(incident.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-foreground">{incident.description}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Location: {incident.manholeId}</span>
                          <span>Worker: {incident.workerName}</span>
                          <span>Supervisor: {incident.supervisorName}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </main>
    </div>
  )
}
