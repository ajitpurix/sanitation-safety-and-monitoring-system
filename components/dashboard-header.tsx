"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, FileText } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground">SafeEntry</h1>
            <p className="text-xs text-muted-foreground">Safety & Monitoring System</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {user?.role === "supervisor" && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/incidents">
                  <FileText className="mr-1 h-4 w-4" />
                  Incidents
                </Link>
              </Button>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin-dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/incidents">
                  <FileText className="mr-1 h-4 w-4" />
                  Incidents
                </Link>
              </Button>
            </>
          )}
          <div className="ml-2 flex items-center gap-2 border-l border-border pl-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
