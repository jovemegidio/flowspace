import { auth } from "../../../../../auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return null

  const board = await prisma.board.findFirst({
    where: { id, userId: session.user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          cards: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!board) notFound()

  return <KanbanBoard board={board} />
}
