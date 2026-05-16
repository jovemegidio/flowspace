import { create } from "zustand"

export interface LocalTrack {
  id: string
  name: string
  url: string
}

interface LocalPlayerStore {
  tracks: LocalTrack[]
  currentIndex: number
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  visible: boolean

  addTracks: (tracks: LocalTrack[]) => void
  setCurrentIndex: (i: number) => void
  setIsPlaying: (v: boolean) => void
  setVolume: (v: number) => void
  setProgress: (v: number) => void
  setDuration: (v: number) => void
  setVisible: (v: boolean) => void
  next: () => void
  prev: () => void
  clear: () => void
}

export const useLocalPlayerStore = create<LocalPlayerStore>((set, get) => ({
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  visible: false,

  addTracks: (tracks) =>
    set((s) => ({
      tracks: [...s.tracks, ...tracks],
      visible: true,
      isPlaying: s.tracks.length === 0 ? true : s.isPlaying,
      currentIndex: s.tracks.length === 0 ? 0 : s.currentIndex,
    })),

  setCurrentIndex: (i) => set({ currentIndex: i, progress: 0 }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => set({ volume: v }),
  setProgress: (v) => set({ progress: v }),
  setDuration: (v) => set({ duration: v }),
  setVisible: (v) => set({ visible: v }),

  next: () =>
    set((s) => ({
      currentIndex: s.tracks.length > 0 ? (s.currentIndex + 1) % s.tracks.length : 0,
      progress: 0,
      isPlaying: true,
    })),

  prev: () =>
    set((s) => ({
      currentIndex:
        s.tracks.length > 0 ? (s.currentIndex - 1 + s.tracks.length) % s.tracks.length : 0,
      progress: 0,
      isPlaying: true,
    })),

  clear: () => {
    get().tracks.forEach((t) => URL.revokeObjectURL(t.url))
    set({ tracks: [], currentIndex: 0, isPlaying: false, progress: 0, duration: 0, visible: false })
  },
}))
