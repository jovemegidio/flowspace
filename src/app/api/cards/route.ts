import { auth } from "../../../../auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, columnId } = await req.json()

  const maxOrder = await prisma.card.aggregate({
    where: { columnId },
    _max: { order: true },
  })

  const card = await prisma.card.create({
    data: { title, columnId, order: (maxOrder._max.order ?? -1) + 1 },
  })
  return NextResponse.json(card)
}
