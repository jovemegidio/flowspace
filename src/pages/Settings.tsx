import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft, Palette, Accessibility, Music2, Check,
  ZoomIn, Eye, Keyboard, Wind, ExternalLink, Unplug, CheckCircle2, Loader2,
} from "lucide-react"
import { THEMES, useThemeStore, type ThemeId } from "@/store/theme"
import { cn } from "@/lib/utils"
import { clearTokens, isConnected, startOAuth, getClientId, setClientId } from "@/lib/spotify"
import { useSpotifyStore } from "@/store"
import { useEffect } from "react"

type Tab = "temas" | "acessibilidade" | "spotify"

export function SettingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("temas")

  const themeId = useThemeStore((s) => s.themeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const accessibility = useThemeStore((s) => s.accessibility)
  const setFontSize = useThemeStore((s) => s.setFontSize)
  const setReduceMotion = useThemeStore((s) => s.setReduceMotion)
  const setHighContrast = useThemeStore((s) => s.setHighContrast)
  const setKeyboardFocus = useThemeStore((s) => s.setKeyboardFocus)

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-3xl mx-auto px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-muted)" }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <h1 className="text-[20px] font-bold mb-6" style={{ color: "var(--text-primary)" }}>
          Configurações
        </h1>

        {/* Tabs */}
        <div
          className="flex gap-1 rounded-xl p-1 mb-8 w-fit"
          role="tablist"
          style={{ background: "var(--bg-surface-1)" }}
        >
          {(["temas", "acessibilidade", "spotify"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all capitalize",
                tab === t
                  ? "shadow-sm"
                  : "hover:opacity-80"
              )}
              style={
                tab === t
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--text-muted)" }
              }
            >
              {t === "temas" && <Palette className="w-3.5 h-3.5" />}
              {t === "acessibilidade" && <Accessibility className="w-3.5 h-3.5" />}
              {t === "spotify" && <Music2 className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ─── TEMAS ─────────────────────────────────────────────── */}
        {tab === "temas" && (
          <section aria-label="Seleção de tema">
            <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
              Escolha a aparência do Flowspace
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id as ThemeId)}
                  aria-pressed={themeId === theme.id}
                  className="relative rounded-2xl p-4 text-left transition-all group focus:outline-none"
                  style={{
                    background: theme.vars["--bg-surface"],
                    border: `2px solid ${themeId === theme.id ? theme.vars["--accent"] : theme.vars["--border"]}`,
                    boxShadow:
                      themeId === theme.id
                        ? `0 0 0 3px ${theme.vars["--accent"]}22`
                        : undefined,
                  }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    {theme.preview.map((c, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>

                  <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: theme.vars["--text-primary"] }}
                  >
                    {theme.name}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 leading-snug"
                    style={{ color: theme.vars["--text-muted"] }}
                  >
                    {theme.description}
                  </p>

                  {themeId === theme.id && (
                    <div
                      className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: theme.vars["--accent"] }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─── ACESSIBILIDADE ───────────────────────────────────── */}
        {tab === "acessibilidade" && (
          <section aria-label="Configurações de acessibilidade" className="space-y-6">
            {/* Font size */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ZoomIn className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Tamanho da fonte
                </h2>
              </div>
              <div className="flex gap-2" role="radiogroup" aria-label="Tamanho da fonte">
                {(["small", "medium", "large", "xlarge"] as const).map((s) => {
                  const labels = { small: "Pequena", medium: "Média", large: "Grande", xlarge: "Enorme" }
                  return (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={accessibility.fontSize === s}
                      onClick={() => setFontSize(s)}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                      style={
                        accessibility.fontSize === s
                          ? { background: "var(--accent)", color: "#fff" }
                          : {
                              background: "var(--bg-surface-1)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }
                      }
                    >
                      {labels[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <AccessToggle
                icon={<Wind className="w-4 h-4" />}
                label="Reduzir movimentos"
                description="Desativa animações e transições"
                checked={accessibility.reduceMotion}
                onChange={setReduceMotion}
              />
              <AccessToggle
                icon={<Eye className="w-4 h-4" />}
                label="Alto contraste"
                description="Aumenta o contraste de texto e bordas"
                checked={accessibility.highContrast}
                onChange={setHighContrast}
              />
              <AccessToggle
                icon={<Keyboard className="w-4 h-4" />}
                label="Indicador de foco por teclado"
                description="Mostra contorno visível ao navegar com Tab"
                checked={accessibility.keyboardFocus}
                onChange={setKeyboardFocus}
              />
            </div>

            {/* Keyboard shortcuts */}
            <div>
              <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Atalhos de teclado
              </h2>
              <div
                className="rounded-xl divide-y"
                style={{ border: "1px solid var(--border)" }}
              >
                {[
                  { key: "Ctrl + B", desc: "Ir para Boards" },
                  { key: "Ctrl + N", desc: "Ir para Notas" },
                  { key: "Ctrl + L", desc: "Ir para Biblioteca" },
                  { key: "Ctrl + ,", desc: "Abrir Configurações" },
                  { key: "Esc", desc: "Fechar modal / cancelar ação" },
                  { key: "Tab", desc: "Navegar entre elementos" },
                  { key: "Enter", desc: "Confirmar ação selecionada" },
                ].map(({ key, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ background: "var(--card-bg)" }}
                  >
                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {desc}
                    </span>
                    <kbd
                      className="px-2 py-1 rounded-md text-[11px] font-mono"
                      style={{
                        background: "var(--bg-surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── SPOTIFY ──────────────────────────────────────────── */}
        {tab === "spotify" && <SpotifyTab />}
      </div>
    </div>
  )
}

function AccessToggle({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all"
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${checked ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div style={{ color: checked ? "var(--accent)" : "var(--text-muted)" }}>{icon}</div>
        <div>
          <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
            {label}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>
      </div>
      <div
        className="relative w-10 h-5 rounded-full transition-all"
        style={{ background: checked ? "var(--accent)" : "var(--bg-surface-3)" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
    </button>
  )
}

function SpotifyTab() {
  const setSpotifyConnected = useSpotifyStore((s) => s.setSpotifyConnected)
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)
  const [clientId, setLocalClientId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    getClientId().then((id) => { if (id) setLocalClientId(id) })
    isConnected().then((ok) => {
      setConnected(ok)
      if (ok) setSpotifyConnected(true)
    })
  }, [setSpotifyConnected])

  async function handleConnect() {
    if (!clientId.trim()) { setError("Cole o Client ID do seu app Spotify."); return }
    setError(null)
    setLoading(true)
    try {
      await setClientId(clientId.trim())
      await startOAuth(clientId.trim())
      setSpotifyConnected(true)
      setConnected(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    await clearTokens()
    setSpotifyConnected(false)
    setConnected(false)
  }

  return (
    <section aria-label="Integração Spotify" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(29,185,84,0.1)" }}>
          <Music2 className="w-5 h-5" style={{ color: "#1DB954" }} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
            Integração Spotify
          </h2>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            Opcional — o app funciona sem ele
          </p>
        </div>
      </div>

      {(connected || spotifyConnected) ? (
        <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#1DB954" }} />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Spotify conectado</p>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Player flutuante ativo</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <Unplug className="w-3.5 h-3.5" />
            Desconectar Spotify
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <SpotifyStep n={1} title="Criar app no Spotify">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                import("@tauri-apps/plugin-shell").then((m) =>
                  m.open("https://developer.spotify.com/dashboard")
                )
              }}
              className="inline-flex items-center gap-1.5 text-[13px] transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Abrir Spotify Dashboard
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </SpotifyStep>

          <SpotifyStep n={2} title="Adicionar Redirect URI">
            <p className="text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
              Em <strong>Settings → Redirect URIs</strong>, adicione:
            </p>
            <code
              className="block rounded-lg px-3 py-2 text-[12px] font-mono"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--accent)" }}
            >
              http://127.0.0.1:8765/callback
            </code>
          </SpotifyStep>

          <SpotifyStep n={3} title="Copiar Client ID">
            <input
              value={clientId}
              onChange={(e) => setLocalClientId(e.target.value)}
              placeholder="ex: a1b2c3d4e5f6..."
              aria-label="Spotify Client ID"
              className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none font-mono transition-colors"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </SpotifyStep>

          {error && (
            <div className="rounded-lg px-4 py-3 text-[12px] leading-relaxed"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading || !clientId.trim()}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-[13px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#1DB954", color: "#000" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando autorização...
              </>
            ) : (
              "Conectar Spotify"
            )}
          </button>
        </div>
      )}
    </section>
  )
}

function SpotifyStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 mt-0.5"
        style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        {n}
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>{title}</p>
        {children}
      </div>
    </div>
  )
}
