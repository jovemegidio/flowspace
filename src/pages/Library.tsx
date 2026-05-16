import { useState, useCallback, useEffect, useRef } from "react"
import {
  BookOpen, Search, X, ExternalLink, Clock, Play, Pause,
  RotateCcw, ChevronRight, Globe, Calculator, FlaskConical,
  Code2, Languages, Music, Microscope, Atom, BookMarked,
  ArrowLeft, Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────────────── */

interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: CategoryId
  tags: string[]
  type: "website" | "video" | "course"
}

type CategoryId =
  | "all"
  | "matematica"
  | "ciencias"
  | "codigo"
  | "linguagens"
  | "historia"
  | "musica"
  | "fisica"
  | "quimica"
  | "biologia"

/* ─── Data ───────────────────────────────────────────────────── */

const CATEGORIES: { id: CategoryId; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "Todos", Icon: BookOpen },
  { id: "matematica", label: "Matemática", Icon: Calculator },
  { id: "ciencias", label: "Ciências", Icon: FlaskConical },
  { id: "codigo", label: "Programação", Icon: Code2 },
  { id: "linguagens", label: "Idiomas", Icon: Languages },
  { id: "historia", label: "História", Icon: Globe },
  { id: "musica", label: "Música", Icon: Music },
  { id: "fisica", label: "Física", Icon: Atom },
  { id: "quimica", label: "Química", Icon: Microscope },
  { id: "biologia", label: "Biologia", Icon: Microscope },
]

const RESOURCES: Resource[] = [
  // Matemática
  {
    id: "khanmath",
    title: "Khan Academy — Matemática",
    description: "Álgebra, geometria, cálculo e muito mais com exercícios interativos",
    url: "https://pt.khanacademy.org/math",
    category: "matematica",
    tags: ["álgebra", "geometria", "cálculo", "gratuito"],
    type: "course",
  },
  {
    id: "geogebra",
    title: "GeoGebra",
    description: "Calculadora gráfica interativa para geometria, álgebra e estatística",
    url: "https://www.geogebra.org/calculator",
    category: "matematica",
    tags: ["gráficos", "geometria", "interativo"],
    type: "website",
  },
  {
    id: "wolframalpha",
    title: "Wolfram Alpha",
    description: "Motor computacional para resolução de problemas matemáticos",
    url: "https://www.wolframalpha.com",
    category: "matematica",
    tags: ["cálculo", "resolução", "computacional"],
    type: "website",
  },
  // Programação
  {
    id: "mdn",
    title: "MDN Web Docs",
    description: "Documentação completa de HTML, CSS e JavaScript",
    url: "https://developer.mozilla.org/pt-BR",
    category: "codigo",
    tags: ["web", "javascript", "css", "html"],
    type: "website",
  },
  {
    id: "freecodecamp",
    title: "freeCodeCamp",
    description: "Cursos gratuitos de desenvolvimento web e ciência de dados",
    url: "https://www.freecodecamp.org",
    category: "codigo",
    tags: ["web", "python", "data", "gratuito"],
    type: "course",
  },
  {
    id: "cs50",
    title: "CS50 — Harvard",
    description: "Introdução à Ciência da Computação por Harvard (gratuito)",
    url: "https://cs50.harvard.edu/x",
    category: "codigo",
    tags: ["harvard", "iniciante", "c", "python"],
    type: "course",
  },
  {
    id: "replit",
    title: "Replit",
    description: "IDE online para programar em qualquer linguagem no navegador",
    url: "https://replit.com",
    category: "codigo",
    tags: ["ide", "online", "prática"],
    type: "website",
  },
  // Ciências
  {
    id: "khanscience",
    title: "Khan Academy — Ciências",
    description: "Biologia, química, física e ciências da terra",
    url: "https://pt.khanacademy.org/science",
    category: "ciencias",
    tags: ["biologia", "química", "física", "gratuito"],
    type: "course",
  },
  {
    id: "phet",
    title: "PhET Simulations",
    description: "Simulações interativas de física, química, biologia e matemática",
    url: "https://phet.colorado.edu/pt_BR",
    category: "ciencias",
    tags: ["simulação", "interativo", "visual"],
    type: "website",
  },
  // Física
  {
    id: "hyperphysics",
    title: "HyperPhysics",
    description: "Conceitos de física com diagramas e calculadoras interativas",
    url: "http://hyperphysics.phy-astr.gsu.edu/hbase/index.html",
    category: "fisica",
    tags: ["conceitos", "mecânica", "eletromagnetismo"],
    type: "website",
  },
  // Química
  {
    id: "ptable",
    title: "Tabela Periódica Interativa",
    description: "Explore a tabela periódica com propriedades de cada elemento",
    url: "https://ptable.com/?lang=pt",
    category: "quimica",
    tags: ["elementos", "tabela periódica", "interativo"],
    type: "website",
  },
  // Biologia
  {
    id: "khanbiologia",
    title: "Khan Academy — Biologia",
    description: "Células, genética, evolução e ecossistemas",
    url: "https://pt.khanacademy.org/science/biology",
    category: "biologia",
    tags: ["células", "genética", "evolução"],
    type: "course",
  },
  // Linguagens
  {
    id: "duolingo",
    title: "Duolingo",
    description: "Aprenda idiomas com gamificação e prática diária",
    url: "https://www.duolingo.com",
    category: "linguagens",
    tags: ["inglês", "espanhol", "francês", "gamificação"],
    type: "course",
  },
  {
    id: "bbc",
    title: "BBC Learning English",
    description: "Recursos gratuitos para aprender inglês da BBC",
    url: "https://www.bbc.co.uk/learningenglish",
    category: "linguagens",
    tags: ["inglês", "bbc", "gratuito"],
    type: "website",
  },
  // História
  {
    id: "khanhistoria",
    title: "Khan Academy — História",
    description: "História mundial, arte e humanidades",
    url: "https://pt.khanacademy.org/humanities",
    category: "historia",
    tags: ["história", "arte", "humanidades"],
    type: "course",
  },
  // Música
  {
    id: "musictheory",
    title: "MusicTheory.net",
    description: "Aprenda teoria musical de forma interativa e gratuita",
    url: "https://www.musictheory.net",
    category: "musica",
    tags: ["teoria", "solfejo", "harmonia"],
    type: "website",
  },
  {
    id: "teoria",
    title: "teoria.com",
    description: "Exercícios de solfejo, intervalos e ditado musical",
    url: "https://www.teoria.com",
    category: "musica",
    tags: ["solfejo", "intervalos", "prática"],
    type: "website",
  },
]

/* ─── Pomodoro Timer ─────────────────────────────────────────── */

type PomodoroMode = "focus" | "short" | "long"

const POMODORO_TIMES: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

function PomodoroTimer() {
  const [mode, setMode] = useState<PomodoroMode>("focus")
  const [seconds, setSeconds] = useState(POMODORO_TIMES.focus)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = POMODORO_TIMES[mode]
  const pct = (seconds / total) * 100

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function switchMode(m: PomodoroMode) {
    setMode(m)
    setRunning(false)
    setSeconds(POMODORO_TIMES[m])
  }

  function reset() {
    setRunning(false)
    setSeconds(POMODORO_TIMES[mode])
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div
      className="rounded-2xl p-5 flex flex-col items-center gap-4"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
      aria-label="Timer Pomodoro"
    >
      <p className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
        Pomodoro
      </p>

      {/* Mode selector */}
      <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--bg-surface-2)" }}>
        {(["focus", "short", "long"] as PomodoroMode[]).map((m) => {
          const labels = { focus: "Foco", short: "Pausa", long: "Longa" }
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="px-3 py-1 rounded-md text-[11px] font-medium transition-all"
              style={
                mode === m
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--text-muted)" }
              }
              aria-pressed={mode === m}
            >
              {labels[m]}
            </button>
          )
        })}
      </div>

      {/* Circular progress */}
      <div className="relative" style={{ width: 130, height: 130 }}>
        <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={65} cy={65} r={r}
            fill="none"
            strokeWidth={6}
            stroke="var(--bg-surface-2)"
          />
          <circle
            cx={65} cy={65} r={r}
            fill="none"
            strokeWidth={6}
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[26px] font-bold font-mono tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {mm}:{ss}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
          aria-label={running ? "Pausar timer" : "Iniciar timer"}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          aria-label="Reiniciar timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ─── Main Library Page ──────────────────────────────────────── */

export function LibraryPage() {
  const [category, setCategory] = useState<CategoryId>("all")
  const [query, setQuery] = useState("")
  const [activeResource, setActiveResource] = useState<Resource | null>(null)
  const [iframeLoading, setIframeLoading] = useState(false)

  const filtered = RESOURCES.filter((r) => {
    const matchCat = category === "all" || r.category === category
    const q = query.toLowerCase()
    const matchQ =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.includes(q))
    return matchCat && matchQ
  })

  const openExternal = useCallback((url: string) => {
    import("@tauri-apps/plugin-shell").then((m) => m.open(url))
  }, [])

  const typeIcon: Record<Resource["type"], string> = {
    website: "🌐",
    video: "▶️",
    course: "🎓",
  }

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "var(--main-bg)" }}>
      {/* Left panel — resources */}
      <div
        className={cn(
          "flex flex-col transition-all",
          activeResource ? "w-[340px] shrink-0" : "flex-1"
        )}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 border-b shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
              Biblioteca
            </h1>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar recursos..."
              aria-label="Buscar recursos de estudo"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] outline-none transition-colors"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                aria-label="Limpar busca"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
            {CATEGORIES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                aria-pressed={category === id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all shrink-0"
                style={
                  category === id
                    ? { background: "var(--accent)", color: "#fff" }
                    : {
                        background: "var(--bg-surface-1)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BookOpen className="w-10 h-10" style={{ color: "var(--text-faint)" }} />
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                Nenhum recurso encontrado
              </p>
            </div>
          )}

          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveResource(r)
                setIframeLoading(true)
              }}
              className="w-full text-left rounded-xl p-4 transition-all group"
              style={{
                background: activeResource?.id === r.id ? "var(--accent-dim)" : "var(--card-bg)",
                border: `1px solid ${activeResource?.id === r.id ? "var(--accent)" : "var(--border)"}`,
              }}
              aria-pressed={activeResource?.id === r.id}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{typeIcon[r.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {r.title}
                    </p>
                  </div>
                  <p
                    className="text-[11px] leading-snug line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{
                          background: "var(--bg-surface-2)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight
                  className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — embedded viewer or Pomodoro */}
      <div
        className={cn(
          "flex flex-col border-l transition-all",
          activeResource ? "flex-1" : "w-[260px] shrink-0"
        )}
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {activeResource ? (
          <>
            {/* Viewer header */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface-1)" }}
            >
              <button
                onClick={() => setActiveResource(null)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Fechar visualizador"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {activeResource.title}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                  {activeResource.url}
                </p>
              </div>
              <button
                onClick={() => openExternal(activeResource.url)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Abrir no navegador externo"
                title="Abrir no navegador"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* iframe */}
            <div className="flex-1 relative">
              {iframeLoading && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                  style={{ background: "var(--main-bg)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--accent)" }}
                  />
                  <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    Carregando...
                  </p>
                </div>
              )}
              <iframe
                key={activeResource.id}
                src={activeResource.url}
                title={activeResource.title}
                className="w-full h-full border-0"
                onLoad={() => setIframeLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </>
        ) : (
          /* Sidebar tools when nothing is open */
          <div className="flex flex-col gap-4 p-4 overflow-y-auto">
            <PomodoroTimer />

            {/* Quick links */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <p
                className="text-[11px] font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Acesso rápido
              </p>
              <div className="space-y-1.5">
                {[
                  { label: "Khan Academy", url: "https://pt.khanacademy.org" },
                  { label: "Wikipedia (PT)", url: "https://pt.wikipedia.org" },
                  { label: "Google Acadêmico", url: "https://scholar.google.com.br" },
                  { label: "Tradutor", url: "https://translate.google.com.br" },
                  { label: "Desmos Calculadora", url: "https://www.desmos.com/scientific" },
                ].map(({ label, url }) => (
                  <button
                    key={url}
                    onClick={() => openExternal(url)}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="text-[12px]">{label}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" style={{ color: "var(--text-faint)" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}
            >
              <div className="flex items-start gap-2">
                <BookMarked className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                <div>
                  <p className="text-[12px] font-semibold mb-1" style={{ color: "var(--accent)" }}>
                    Dica de estudo
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Selecione um recurso à esquerda para abrir dentro do app. Use o timer Pomodoro para
                    sessões de 25 minutos com pausas de 5.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <p
                className="text-[11px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Tempo de estudo
              </p>
              <StudyStats />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StudyStats() {
  const [today] = useState(() => {
    const key = `study-${new Date().toDateString()}`
    return parseInt(localStorage.getItem(key) ?? "0", 10)
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
        <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
          Hoje: <strong style={{ color: "var(--text-primary)" }}>{Math.floor(today / 60)}min</strong>
        </span>
      </div>
      <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
        Use o timer para registrar seu progresso
      </p>
    </div>
  )
}
