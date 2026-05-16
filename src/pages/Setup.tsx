import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ExternalLink, Loader2, CheckCircle2, Music2, Unplug } from "lucide-react"
import { startOAuth, getClientId, setClientId, isConnected, clearTokens } from "@/lib/spotify"
import { useSpotifyStore } from "@/store"

export function SetupPage() {
  const navigate = useNavigate()
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
      setTimeout(() => navigate("/dashboard"), 900)
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
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto">
      <div className="max-w-md mx-auto w-full p-6 pt-7">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#444] hover:text-[#888] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#f0f0f0]">Integração Spotify</h1>
            <p className="text-[#555] text-xs">Opcional — o app funciona sem ele</p>
          </div>
        </div>

        {/* Already connected */}
        {(connected || spotifyConnected) && (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#1DB954] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#f0f0f0]">Spotify conectado</p>
                <p className="text-xs text-[#555]">Player flutuante ativo</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] hover:bg-red-900/20 border border-[#2a2a2a] hover:border-red-800/30 text-[#666] hover:text-red-400 rounded-lg text-sm transition-all"
            >
              <Unplug className="w-3.5 h-3.5" />
              Desconectar Spotify
            </button>
          </div>
        )}

        {/* Connect flow — hide when already connected */}
        {!connected && !spotifyConnected && (
          <>
            <div className="space-y-4 mb-5">
              <Step n={1} title="Criar app no Spotify">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    import("@tauri-apps/plugin-shell").then((m) =>
                      m.open("https://developer.spotify.com/dashboard")
                    )
                  }}
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Abrir Spotify Dashboard
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Step>

              <Step n={2} title="Adicionar Redirect URI">
                <p className="text-[#555] text-xs mb-1.5">
                  Em <strong className="text-[#777]">Settings → Redirect URIs</strong>, adicione:
                </p>
                <code className="block bg-[#141414] border border-[#222] rounded-lg px-3 py-2 text-xs text-indigo-300 font-mono">
                  http://127.0.0.1:8765/callback
                </code>
              </Step>

              <Step n={3} title="Copiar Client ID">
                <p className="text-[#555] text-xs mb-2">Cole o Client ID abaixo:</p>
                <input
                  value={clientId}
                  onChange={(e) => setLocalClientId(e.target.value)}
                  placeholder="ex: a1b2c3d4e5f6..."
                  className="w-full bg-[#141414] border border-[#222] focus:border-indigo-500/40 text-[#f0f0f0] rounded-lg px-3 py-2.5 text-sm outline-none font-mono transition-colors placeholder:text-[#3a3a3a]"
                />
              </Step>
            </div>

            {error && (
              <div className="bg-red-900/10 border border-red-800/25 text-red-400 text-xs rounded-lg px-4 py-3 mb-4 leading-relaxed">
                {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading || !clientId.trim()}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all active:scale-[0.98]"
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

            {loading && (
              <p className="text-center text-[#444] text-xs mt-3">
                O navegador vai abrir. Após autorizar, volte aqui.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-xs text-[#555] font-medium shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#d0d0d0] font-medium mb-1.5">{title}</p>
        {children}
      </div>
    </div>
  )
}
