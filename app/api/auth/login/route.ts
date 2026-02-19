import { NextResponse } from "next/server"
import { users } from "@/lib/store"

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body as { email: string; password: string }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}
