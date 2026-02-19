"use client"

import React, { Suspense } from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const registered = searchParams.get("registered") === "true"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === "supervisor") {
        router.push("/dashboard")
      } else {
        router.push("/admin-dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">SafeEntry</CardTitle>
          <CardDescription>Sanitation Safety & Monitoring System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {registered && (
              <div className="flex items-center gap-2 rounded-md bg-safe/10 p-3 text-sm text-safe">
                <CheckCircle2 className="h-4 w-4" />
                Account created. Please log in.
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>

            <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Demo Credentials</p>
              <p className="text-xs text-muted-foreground">
                Supervisor: supervisor@demo.com / password123
              </p>
              <p className="text-xs text-muted-foreground">
                Admin: admin@demo.com / password123
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
