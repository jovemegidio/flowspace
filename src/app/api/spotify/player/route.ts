import { auth } from "../../../../../auth"
import { playPause, skipNext, skipPrevious, setVolume, playTrack } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.accessToken)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action, value } = await req.json()

  try {
    switch (action) {
      case "play":
        await playPause(session.accessToken, true)
        break
      case "pause":
        await playPause(session.accessToken, false)
        break
      case "next":
        await skipNext(session.accessToken)
        break
      case "previous":
        await skipPrevious(session.accessToken)
        break
      case "volume":
        await setVolume(session.accessToken, value)
        break
      case "play-track":
        await playTrack(session.accessToken, value)
        break
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
