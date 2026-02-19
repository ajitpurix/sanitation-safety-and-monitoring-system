import { NextResponse } from "next/server"
import { users, generateUserId } from "@/lib/store"
import type { UserRole } from "@/lib/types"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, password, role } = body as {
    name: string
    email: string
    password: string
    role: UserRole
  }

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const existing = users.find((u) => u.email === email)
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 })
  }

  const newUser = {
    id: generateUserId(),
    name,
    email,
    password,
    role,
  }
  users.push(newUser)

  return NextResponse.json({ message: "Account created successfully" }, { status: 201 })
}
