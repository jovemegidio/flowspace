import { auth } from "../../../auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { LayoutDashboard, FileText, Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const [boardCount, noteCount] = await Promise.all([
    prisma.board.count({ where: { userId: session.user.id } }),
    prisma.note.count({ where: { userId: session.user.id } }),
  ])

  const recentBoards = await prisma.board.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 4,
  })

  const recentNotes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 4,
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Olá, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-[#888] mt-1 text-sm">Bem-vindo ao seu workspace.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span className="text-[#888] text-sm">Boards</span>
          </div>
          <p className="text-3xl font-bold text-white">{boardCount}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-[#888] text-sm">Notas</span>
          </div>
          <p className="text-3xl font-bold text-white">{noteCount}</p>
        </div>
      </div>

      <Section
        title="Boards recentes"
        createHref="/dashboard/board"
        createLabel="Novo board"
      >
        {recentBoards.length === 0 ? (
          <EmptyState href="/dashboard/board" label="Criar primeiro board" />
        ) : (
          recentBoards.map((b) => (
            <Link
              key={b.id}
              href={`/dashboard/board/${b.id}`}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 hover:border-indigo-600/50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg mb-3"
                style={{ background: b.color }}
              />
              <p className="font-medium text-white text-sm">{b.title}</p>
              {b.description && (
                <p className="text-[#666] text-xs mt-1 truncate">{b.description}</p>
              )}
            </Link>
          ))
        )}
      </Section>

      <Section
        title="Notas recentes"
        createHref="/dashboard/notes"
        createLabel="Nova nota"
      >
        {recentNotes.length === 0 ? (
          <EmptyState href="/dashboard/notes" label="Criar primeira nota" />
        ) : (
          recentNotes.map((n) => (
            <Link
              key={n.id}
              href={`/dashboard/notes/${n.id}`}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 hover:border-purple-600/50 transition-colors"
            >
              <span className="text-2xl mb-2 block">{n.emoji}</span>
              <p className="font-medium text-white text-sm">{n.title}</p>
              <p className="text-[#555] text-xs mt-1">
                {new Date(n.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            </Link>
          ))
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  createHref,
  createLabel,
  children,
}: {
  title: string
  createHref: string
  createLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">{title}</h2>
        <Link
          href={createHref}
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {createLabel}
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
    </div>
  )
}

function EmptyState({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="col-span-2 md:col-span-4 flex flex-col items-center justify-center gap-2 border border-dashed border-[#2e2e2e] rounded-xl p-8 text-[#555] hover:border-[#444] hover:text-[#888] transition-colors"
    >
      <Plus className="w-6 h-6" />
      <span className="text-sm">{label}</span>
    </Link>
  )
}
