import { Store } from "@tauri-apps/plugin-store"
import { open } from "@tauri-apps/plugin-shell"
import { invoke } from "@tauri-apps/api/core"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"

const SPOTIFY_BASE = "https://api.spotify.com/v1"
const TOKEN_URL = "https://accounts.spotify.com/api/token"
const OAUTH_PORT = 8765
const REDIRECT_URI = `http://127.0.0.1:${OAUTH_PORT}/callback`

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "streaming",
].join(" ")

// ─── PKCE ─────────────────────────────────────────────────────────────────────

function generateVerifier(length = 128): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  const arr = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(arr, (b) => chars[b % chars.length]).join("")
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

// ─── Token Store ──────────────────────────────────────────────────────────────

let _store: Store | null = null
async function getStore() {
  if (!_store) _store = await Store.load("flowspace-tokens.dat")
  return _store
}

export async function getClientId(): Promise<string | null> {
  const s = await getStore()
  return (await s.get<string>("spotify_client_id")) ?? null
}

export async function setClientId(id: string) {
  const s = await getStore()
  await s.set("spotify_client_id", id)
  await s.save()
}

export async function getAccessToken(): Promise<string | null> {
  const s = await getStore()
  const expiresAt = await s.get<number>("spotify_expires_at")
  if (expiresAt && Date.now() >= expiresAt - 60_000) {
    await refreshTokens()
  }
  return (await s.get<string>("spotify_access_token")) ?? null
}

async function saveTokens(tokens: {
  access_token: string
  refresh_token?: string
  expires_in: number
}) {
  const s = await getStore()
  await s.set("spotify_access_token", tokens.access_token)
  await s.set("spotify_expires_at", Date.now() + tokens.expires_in * 1000)
  if (tokens.refresh_token) await s.set("spotify_refresh_token", tokens.refresh_token)
  await s.save()
}

async function refreshTokens(): Promise<void> {
  const s = await getStore()
  const clientId = await s.get<string>("spotify_client_id")
  const refreshToken = await s.get<string>("spotify_refresh_token")
  if (!clientId || !refreshToken) return

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
  if (res.ok) await saveTokens(await res.json())
}

export async function clearTokens() {
  const s = await getStore()
  await s.delete("spotify_access_token")
  await s.delete("spotify_refresh_token")
  await s.delete("spotify_expires_at")
  await s.save()
}

export async function isConnected(): Promise<boolean> {
  const token = await getAccessToken()
  return !!token
}

// ─── OAuth PKCE Flow ──────────────────────────────────────────────────────────

export async function startOAuth(clientId: string): Promise<string> {
  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)

  const s = await getStore()
  await s.set("pkce_verifier", verifier)
  await s.set("spotify_client_id", clientId)
  await s.save()

  await invoke("start_spotify_oauth")

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SCOPES,
  })

  await open(`https://accounts.spotify.com/authorize?${params}`)

  return new Promise((resolve, reject) => {
    let unlisten: UnlistenFn | null = null
    let unlistenErr: UnlistenFn | null = null

    const cleanup = () => { unlisten?.(); unlistenErr?.() }
    const timeout = setTimeout(() => { cleanup(); reject(new Error("Timeout OAuth (2 min).")) }, 120_000)

    listen<string>("spotify-oauth-code", async (event) => {
      clearTimeout(timeout)
      cleanup()
      try {
        const sv = await getStore()
        const pkceVerifier = await sv.get<string>("pkce_verifier")
        await sv.delete("pkce_verifier")

        const res = await fetch(TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code: event.payload,
            redirect_uri: REDIRECT_URI,
            code_verifier: pkceVerifier ?? "",
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          reject(new Error(err.error_description ?? "Token exchange failed"))
          return
        }
        const tokens = await res.json()
        await saveTokens(tokens)
        resolve(tokens.access_token)
      } catch (e) { reject(e) }
    }).then((fn) => { unlisten = fn })

    listen<string>("spotify-oauth-error", (event) => {
      clearTimeout(timeout); cleanup()
      reject(new Error(event.payload))
    }).then((fn) => { unlistenErr = fn })
  })
}

// ─── Spotify API ──────────────────────────────────────────────────────────────

async function spotifyFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  if (!token) throw new Error("Not authenticated")
  const res = await fetch(`${SPOTIFY_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...options.headers },
  })
  if (res.status === 204 || res.status === 202) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Spotify error ${res.status}`)
  }
  return res.json()
}

export const spotify = {
  getNowPlaying: () => spotifyFetch("/me/player/currently-playing"),
  getPlayer: () => spotifyFetch("/me/player"),
  play: () => spotifyFetch("/me/player/play", { method: "PUT" }),
  pause: () => spotifyFetch("/me/player/pause", { method: "PUT" }),
  next: () => spotifyFetch("/me/player/next", { method: "POST" }),
  previous: () => spotifyFetch("/me/player/previous", { method: "POST" }),
  volume: (pct: number) => spotifyFetch(`/me/player/volume?volume_percent=${Math.round(pct)}`, { method: "PUT" }),
  playTrack: (uri: string) => spotifyFetch("/me/player/play", { method: "PUT", body: JSON.stringify({ uris: [uri] }) }),
  search: (q: string, type = "track", limit = 20) => spotifyFetch(`/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`),
}
