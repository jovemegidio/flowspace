import { auth } from "../../../../auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, emoji: true, updatedAt: true },
  })
  return NextResponse.json(notes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, emoji } = await req.json()
  const note = await prisma.note.create({
    data: {
      title: title ?? "Nova nota",
      emoji: emoji ?? "📝",
      content: JSON.stringify({ type: "doc", content: [] }),
      userId: session.user.id,
    },
  })
  return NextResponse.json(note)
}
