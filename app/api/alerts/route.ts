import { NextResponse } from "next/server"
import { alerts } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ alerts })
}
