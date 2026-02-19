import type { User, Worker, Task, IncidentLog, Alert, OverrideLog } from "./types"

// In-memory data store (simulates a database)

export const users: User[] = [
  {
    id: "u1",
    name: "Rajesh Kumar",
    email: "supervisor@demo.com",
    password: "password123",
    role: "supervisor",
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "admin@demo.com",
    password: "password123",
    role: "admin",
  },
]

export const workers: Worker[] = [
  { id: "w1", name: "Amit Patel", designation: "Senior Sanitation Worker" },
  { id: "w2", name: "Sunil Verma", designation: "Sanitation Worker" },
  { id: "w3", name: "Ravi Singh", designation: "Sanitation Worker" },
  { id: "w4", name: "Manoj Yadav", designation: "Junior Sanitation Worker" },
  { id: "w5", name: "Vikram Joshi", designation: "Senior Sanitation Worker" },
]

export const tasks: Task[] = []
export const incidentLogs: IncidentLog[] = []
export const alerts: Alert[] = []
export const overrideLogs: OverrideLog[] = []

let taskCounter = 0
let incidentCounter = 0
let alertCounter = 0
let overrideCounter = 0
let userCounter = 2

export function generateTaskId() {
  taskCounter++
  return `task-${taskCounter}`
}

export function generateIncidentId() {
  incidentCounter++
  return `incident-${incidentCounter}`
}

export function generateAlertId() {
  alertCounter++
  return `alert-${alertCounter}`
}

export function generateOverrideId() {
  overrideCounter++
  return `override-${overrideCounter}`
}

export function generateUserId() {
  userCounter++
  return `u${userCounter}`
}
