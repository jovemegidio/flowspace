import { auth } from "../../../../../auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { NoteEditor } from "@/components/editor/NoteEditor"

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return null

  const note = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!note) notFound()

  return <NoteEditor note={note} />
}
