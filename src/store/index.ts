import { create } from "zustand"

export interface SpotifyTrack {
  id: string
  name: string
  artist: string
  albumArt: string
  uri: string
  durationMs: number
  progressMs: number
  isPlaying: boolean
}

interface SpotifyStore {
  spotifyConnected: boolean
  nowPlaying: SpotifyTrack | null
  searchOpen: boolean
  searchCallback: ((track: SpotifyTrack) => void) | null

  setSpotifyConnected: (v: boolean) => void
  setNowPlaying: (t: SpotifyTrack | null) => void
  openSearch: (cb?: (track: SpotifyTrack) => void) => void
  closeSearch: () => void
}

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  spotifyConnected: false,
  nowPlaying: null,
  searchOpen: false,
  searchCallback: null,

  setSpotifyConnected: (v) => set({ spotifyConnected: v }),
  setNowPlaying: (t) => set({ nowPlaying: t }),
  openSearch: (cb) => set({ searchOpen: true, searchCallback: cb ?? null }),
  closeSearch: () => set({ searchOpen: false, searchCallback: null }),
}))
