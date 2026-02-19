import { NextResponse } from "next/server"
import { workers } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ workers })
}
