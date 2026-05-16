import { auth } from "../../../../../auth"
import { getNowPlaying } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) return NextResponse.json(null)

  try {
    const data = await getNowPlaying(session.accessToken)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(null)
  }
}
