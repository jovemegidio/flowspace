import { auth } from "../../../../auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(boards)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, color } = await req.json()
  const board = await prisma.board.create({
    data: {
      title,
      description,
      color: color ?? "#6366f1",
      userId: session.user.id,
      columns: {
        create: [
          { title: "A fazer", order: 0 },
          { title: "Em progresso", order: 1 },
          { title: "Concluído", order: 2 },
        ],
      },
    },
    include: { columns: true },
  })
  return NextResponse.json(board)
}
