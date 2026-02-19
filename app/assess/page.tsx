"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import type { RiskAssessment, Worker, SOPChecklist } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Step = "assess" | "sop" | "assign" | "done"

export default function AssessPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
    else if (user.role !== "supervisor") router.push("/admin-dashboard")
  }, [user, router])

  const { data: workersData } = useSWR<{ workers: Worker[] }>(
    user ? "/api/workers" : null,
    fetcher
  )

  const [step, setStep] = useState<Step>("assess")

  // Risk Assessment form
  const [manholeId, setManholeId] = useState("")
  const [lastCleanedDate, setLastCleanedDate] = useState("")
  const [isRaining, setIsRaining] = useState(false)
  const [pastIncidentCount, setPastIncidentCount] = useState(0)
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [assessLoading, setAssessLoading] = useState(false)

  // SOP checklist
  const [sop, setSop] = useState<SOPChecklist>({
    ventilationConfirmed: false,
    safetyEquipmentReady: false,
    emergencySupportAvailable: false,
    supervisorPresent: false,
  })

  // Worker assignment
  const [selectedWorkerId, setSelectedWorkerId] = useState("")
  const [maxDuration, setMaxDuration] = useState(30)

  // Override
  const [showOverride, setShowOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState("")
  const [overrideUsed, setOverrideUsed] = useState(false)

  // Task creation
  const [creating, setCreating] = useState(false)

  const workers = workersData?.workers || []
  const allSopChecked = sop.ventilationConfirmed && sop.safetyEquipmentReady && sop.emergencySupportAvailable && sop.supervisorPresent
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId)

  async function handleAssess(e: React.FormEvent) {
    e.preventDefault()
    setAssessLoading(true)
    try {
      const res = await fetch("/api/assess-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manholeId, lastCleanedDate, isRaining, pastIncidentCount }),
      })
      const data = await res.json()
      setAssessment(data)
    } finally {
      setAssessLoading(false)
    }
  }

  function handleProceedFromAssessment() {
    if (!assessment) return
    if (assessment.riskStatus === "NOT ALLOWED" && !overrideUsed) {
      setShowOverride(true)
      return
    }
    setStep("sop")
  }

  async function handleOverrideConfirm() {
    if (!overrideReason.trim() || !user || !assessment) return
    await fetch("/api/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supervisorName: user.name,
        supervisorId: user.id,
        manholeId: assessment.manholeId,
        reason: overrideReason,
      }),
    })
    setOverrideUsed(true)
    setShowOverride(false)
    setStep("sop")
  }

  async function handleCreateTask() {
    if (!user || !assessment || !selectedWorker) return
    setCreating(true)
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerName: selectedWorker.name,
          workerId: selectedWorker.id,
          manholeId: assessment.manholeId,
          riskStatus: assessment.riskStatus,
          riskScore: assessment.riskScore,
          maxDurationMinutes: maxDuration,
          supervisorId: user.id,
          supervisorName: user.name,
          sopCompleted: true,
          overrideUsed,
          overrideReason: overrideUsed ? overrideReason : null,
          assessment,
        }),
      })
      setStep("done")
    } finally {
      setCreating(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-3 gap-1">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h2 className="text-2xl font-bold text-foreground">Risk Assessment</h2>
          <p className="text-sm text-muted-foreground">Evaluate manhole conditions before worker entry</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          {[
            { key: "assess", label: "1. Assess Risk" },
            { key: "sop", label: "2. Safety Checklist" },
            { key: "assign", label: "3. Assign Worker" },
            { key: "done", label: "4. Complete" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span
                className={`font-medium ${
                  step === s.key
                    ? "text-primary"
                    : ["assess", "sop", "assign", "done"].indexOf(step) > ["assess", "sop", "assign", "done"].indexOf(s.key)
                    ? "text-safe"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: Risk Assessment */}
        {step === "assess" && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manhole Conditions</CardTitle>
                <CardDescription>Enter current conditions to calculate entry risk</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssess} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="manholeId">Manhole Location ID</Label>
                    <Input
                      id="manholeId"
                      placeholder="e.g., MH-SEC5-042"
                      value={manholeId}
                      onChange={(e) => setManholeId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastCleaned">Last Cleaned Date</Label>
                    <Input
                      id="lastCleaned"
                      type="date"
                      value={lastCleanedDate}
                      onChange={(e) => setLastCleanedDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="raining"
                      checked={isRaining}
                      onCheckedChange={(checked) => setIsRaining(checked === true)}
                    />
                    <Label htmlFor="raining">Is it currently raining?</Label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="incidents">Past Incident Count at This Location</Label>
                    <Input
                      id="incidents"
                      type="number"
                      min={0}
                      value={pastIncidentCount}
                      onChange={(e) => setPastIncidentCount(Number(e.target.value))}
                    />
                  </div>
                  <Button type="submit" disabled={assessLoading} className="gap-2">
                    <Shield className="h-4 w-4" />
                    {assessLoading ? "Calculating..." : "Calculate Risk Score"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Risk Result */}
            {assessment && (
              <Card
                className={`border-2 ${
                  assessment.riskStatus === "SAFE"
                    ? "border-safe"
                    : assessment.riskStatus === "CAUTION"
                    ? "border-caution"
                    : "border-danger"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Risk Assessment Result</CardTitle>
                    <Badge
                      className={
                        assessment.riskStatus === "SAFE"
                          ? "bg-safe text-safe-foreground"
                          : assessment.riskStatus === "CAUTION"
                          ? "bg-caution text-caution-foreground"
                          : "bg-danger text-danger-foreground"
                      }
                    >
                      {assessment.riskStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Score bar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Risk Score</span>
                      <span className="text-2xl font-bold text-foreground">{assessment.riskScore}/100</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          assessment.riskStatus === "SAFE"
                            ? "bg-safe"
                            : assessment.riskStatus === "CAUTION"
                            ? "bg-caution"
                            : "bg-danger"
                        }`}
                        style={{ width: `${assessment.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">Analysis</p>
                    {assessment.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        {reason.includes("+") ? (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        ) : reason.includes("Overall") ? (
                          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
                        )}
                        <span className="text-muted-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>

                  {assessment.riskStatus === "NOT ALLOWED" && !overrideUsed && (
                    <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-danger">
                        <AlertTriangle className="h-4 w-4" />
                        Entry is NOT ALLOWED at this location
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The risk score exceeds safe limits. Supervisor override is required to proceed.
                      </p>
                    </div>
                  )}

                  {overrideUsed && (
                    <div className="rounded-lg border border-caution/30 bg-caution/5 p-3">
                      <p className="text-sm font-medium text-caution">
                        <AlertTriangle className="mr-1 inline h-4 w-4" />
                        Override activated - proceeding with elevated risk
                      </p>
                    </div>
                  )}

                  <Button onClick={handleProceedFromAssessment} className="gap-2">
                    <ChevronRight className="h-4 w-4" />
                    {assessment.riskStatus === "NOT ALLOWED" && !overrideUsed
                      ? "Request Override to Proceed"
                      : "Proceed to Safety Checklist"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* STEP 2: SOP Checklist */}
        {step === "sop" && (
          <Card>
            <CardHeader>
              <CardTitle>Mandatory Safety Checklist (SOP)</CardTitle>
              <CardDescription>
                All items must be confirmed before worker entry is authorized
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { key: "ventilationConfirmed" as const, label: "Ventilation confirmed at the manhole location" },
                { key: "safetyEquipmentReady" as const, label: "Safety equipment ready and inspected (harness, mask, gloves)" },
                { key: "emergencySupportAvailable" as const, label: "Emergency support team is available and on standby" },
                { key: "supervisorPresent" as const, label: "Supervisor is physically present on site" },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Checkbox
                    id={item.key}
                    checked={sop[item.key]}
                    onCheckedChange={(checked) => setSop((prev) => ({ ...prev, [item.key]: checked === true }))}
                  />
                  <Label htmlFor={item.key} className="text-sm leading-relaxed text-foreground cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}

              <Button
                onClick={() => setStep("assign")}
                disabled={!allSopChecked}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {allSopChecked ? "Proceed to Worker Assignment" : "Complete All Items to Proceed"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Worker Assignment */}
        {step === "assign" && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Worker</CardTitle>
              <CardDescription>
                Select a registered worker and configure safe duration for manhole {assessment?.manholeId}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Select Worker</Label>
                <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} - {w.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="maxDuration">Maximum Safe Duration (minutes)</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  min={5}
                  max={120}
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  An emergency alert will trigger if this duration is exceeded
                </p>
              </div>

              {selectedWorker && (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm font-semibold text-foreground">Task Summary</p>
                  <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>Worker: {selectedWorker.name} ({selectedWorker.designation})</p>
                    <p>Location: {assessment?.manholeId}</p>
                    <p>Risk: {assessment?.riskStatus} (Score: {assessment?.riskScore})</p>
                    <p>Max Duration: {maxDuration} minutes</p>
                    <p>SOP: Completed</p>
                    {overrideUsed && <p className="text-caution">Override: Active</p>}
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateTask}
                disabled={!selectedWorkerId || creating}
                className="gap-2"
              >
                {creating ? "Creating Task..." : "Create Task & Return to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <Card className="border-safe">
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <CheckCircle2 className="h-16 w-16 text-safe" />
              <h3 className="text-xl font-bold text-foreground">Task Created Successfully</h3>
              <p className="text-center text-sm text-muted-foreground">
                The task has been created and is ready for worker entry. Return to the dashboard to monitor the operation.
              </p>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Override Modal */}
      <Dialog open={showOverride} onOpenChange={setShowOverride}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              Safety Override Required
            </DialogTitle>
            <DialogDescription>
              This location has been assessed as NOT ALLOWED for entry. You are about to
              override this safety restriction. This action will be permanently logged.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-foreground">
            <p className="mb-2 font-semibold">Before proceeding, confirm:</p>
            <ul className="flex flex-col gap-1 text-muted-foreground">
              <li>- Additional safety measures have been arranged</li>
              <li>- Emergency response team is on high alert</li>
              <li>- The operation is urgently required</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="overrideReason">Justification for Override (required)</Label>
            <Textarea
              id="overrideReason"
              placeholder="Explain why this override is necessary..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowOverride(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleOverrideConfirm}
              disabled={!overrideReason.trim()}
            >
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
