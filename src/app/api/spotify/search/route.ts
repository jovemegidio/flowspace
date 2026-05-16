import { auth } from "../../../../../auth"
import { searchSpotify } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.accessToken)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const type = searchParams.get("type") ?? "track"

  if (!q) return NextResponse.json({ tracks: { items: [] } })

  try {
    const data = await searchSpotify(session.accessToken, q, type)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
