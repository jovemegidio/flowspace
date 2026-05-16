import { auth } from "../../../../auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, boardId } = await req.json()

  const board = await prisma.board.findFirst({
    where: { id: boardId, userId: session.user.id },
  })
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const maxOrder = await prisma.column.aggregate({
    where: { boardId },
    _max: { order: true },
  })

  const column = await prisma.column.create({
    data: { title, boardId, order: (maxOrder._max.order ?? -1) + 1 },
    include: { cards: true },
  })
  return NextResponse.json(column)
}
