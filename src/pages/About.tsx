import { useNavigate } from "react-router-dom"
import { ArrowLeft, Github, ExternalLink, Database, Zap, Lock, Palette, Music2, FileText, LayoutDashboard, BookOpen } from "lucide-react"

const STACK = [
  { label: "Tauri v2", desc: "Runtime desktop (Rust + WebView2)", color: "#24C8D8" },
  { label: "React 18", desc: "UI Framework", color: "#61DAFB" },
  { label: "TypeScript", desc: "Tipagem estática", color: "#3178C6" },
  { label: "Tailwind CSS", desc: "Estilização utility-first", color: "#38BDF8" },
  { label: "SQLite", desc: "Banco de dados local", color: "#003B57" },
  { label: "TipTap", desc: "Editor rich-text", color: "#6366f1" },
  { label: "Framer Motion", desc: "Animações fluidas", color: "#ff0055" },
  { label: "Zustand", desc: "Estado global", color: "#f97316" },
  { label: "@dnd-kit", desc: "Drag & drop", color: "#a78bfa" },
]

const FEATURES = [
  { Icon: LayoutDashboard, label: "Kanban", desc: "Boards, colunas e cards com drag & drop. Fluxo de trabalho visual ao estilo Trello." },
  { Icon: FileText, label: "Notas Rich-Text", desc: "Editor completo ao estilo Notion com TipTap — headings, listas, checklists, código e mais." },
  { Icon: Music2, label: "Música integrada", desc: "Player de arquivos locais (MP3, FLAC, WAV) e integração com Spotify. Tudo sem sair do app." },
  { Icon: BookOpen, label: "Biblioteca & Pomodoro", desc: "Links de estudo curados e timer Pomodoro integrado para sessões de foco." },
  { Icon: Palette, label: "8 Temas visuais", desc: "Escuro, Meia-noite, Oceano, Floresta, Pôr do Sol, Claro, Violeta e Monokai." },
  { Icon: Lock, label: "100% local", desc: "Sem servidor, sem conta, sem internet. Seus dados ficam no seu computador em SQLite." },
  { Icon: Database, label: "Offline-first", desc: "Projetado para funcionar sem conexão. Board, notas e música local funcionam sem internet." },
  { Icon: Zap, label: "Performance nativa", desc: "Binário Rust pequeno (~5 MB). Sem Electron, sem overhead de Node.js." },
]

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Hero */}
        <div className="flex items-center gap-5 mb-10">
          <img
            src="/Icone.png"
            alt="Flowspace"
            className="w-16 h-16 rounded-2xl shadow-xl"
            style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.3)" }}
          />
          <div>
            <img src="/Logo.png" alt="Flowspace" className="h-8 object-contain mb-1.5" />
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Versão 0.1.0 · Windows x64
            </p>
          </div>
        </div>

        {/* Description */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
        >
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
            Flowspace é um <strong>workspace local e offline-first</strong> para Windows, construído com
            Tauri + React. Concentra Kanban, notas rich-text e música em um único aplicativo nativo
            leve — sem servidores, sem assinaturas, sem internet obrigatória.
          </p>
          <p className="text-[13px] leading-relaxed mt-3" style={{ color: "var(--text-muted)" }}>
            Inspirado no Trello, Notion e Obsidian, o Flowspace foi projetado para quem quer
            produtividade real sem depender de SaaS.
          </p>
        </div>

        {/* Features grid */}
        <h2 className="text-[13px] font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Funcionalidades
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10">
          {FEATURES.map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <h2 className="text-[13px] font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {STACK.map(({ label, desc, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
              title={desc}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Links */}
        <h2 className="text-[13px] font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Links
        </h2>
        <div className="flex gap-3">
          <a
            href="https://github.com/jovemegidio/flowspace"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <Github className="w-4 h-4" />
            Código-fonte no GitHub
            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
          </a>
          <a
            href="https://github.com/jovemegidio/flowspace/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)33",
              color: "var(--accent)",
            }}
          >
            Releases & Downloads
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>
            MIT License · Feito por{" "}
            <a
              href="https://github.com/jovemegidio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--text-muted)" }}
            >
              Egidio
            </a>
            {" "}· Flowspace — seu espaço de trabalho, do seu jeito.
          </p>
        </div>
      </div>
    </div>
  )
}
