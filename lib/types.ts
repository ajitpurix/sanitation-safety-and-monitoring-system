export type UserRole = "supervisor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
}

export type RiskStatus = "SAFE" | "CAUTION" | "NOT ALLOWED"

export type TaskState = "Not Started" | "Inside" | "Completed"

export interface RiskAssessment {
  manholeId: string
  lastCleanedDate: string
  isRaining: boolean
  pastIncidentCount: number
  riskScore: number
  riskStatus: RiskStatus
  reasons: string[]
}

export interface SOPChecklist {
  ventilationConfirmed: boolean
  safetyEquipmentReady: boolean
  emergencySupportAvailable: boolean
  supervisorPresent: boolean
}

export interface OverrideLog {
  id: string
  supervisorName: string
  supervisorId: string
  time: string
  manholeId: string
  reason: string
}

export interface Worker {
  id: string
  name: string
  designation: string
}

export interface Task {
  id: string
  workerName: string
  workerId: string
  manholeId: string
  riskStatus: RiskStatus
  riskScore: number
  taskState: TaskState
  entryTime: string | null
  exitTime: string | null
  maxDurationMinutes: number
  supervisorId: string
  supervisorName: string
  sopCompleted: boolean
  overrideUsed: boolean
  overrideReason: string | null
  assessment: RiskAssessment | null
  createdAt: string
}

export interface IncidentLog {
  id: string
  type: "emergency" | "override" | "near-miss"
  manholeId: string
  workerName: string
  supervisorName: string
  description: string
  timestamp: string
  taskId: string
}

export interface Alert {
  id: string
  taskId: string
  workerName: string
  manholeId: string
  type: "time-exceeded" | "no-exit" | "emergency"
  message: string
  timestamp: string
  resolved: boolean
}
