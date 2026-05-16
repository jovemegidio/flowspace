import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeId =
  | "dark"
  | "midnight"
  | "blue"
  | "forest"
  | "sunset"
  | "light"
  | "purple"
  | "monokai"

export interface ThemeConfig {
  id: ThemeId
  name: string
  description: string
  preview: string[]
  vars: Record<string, string>
}

export const THEMES: ThemeConfig[] = [
  {
    id: "dark",
    name: "Escuro",
    description: "Tema padrão com tons neutros",
    preview: ["#111111", "#6366f1", "#181818"],
    vars: {
      "--bg-base": "#080810",
      "--bg-surface": "#111111",
      "--bg-surface-1": "#181818",
      "--bg-surface-2": "#202020",
      "--bg-surface-3": "#282828",
      "--border": "#2a2a2a",
      "--border-subtle": "#1f1f1f",
      "--text-primary": "#efefef",
      "--text-secondary": "#888888",
      "--text-muted": "#4a4a4a",
      "--text-faint": "#333333",
      "--accent": "#6366f1",
      "--accent-hover": "#4f46e5",
      "--accent-dim": "rgba(99,102,241,0.08)",
      "--accent-rgb": "99,102,241",
      "--sidebar-bg": "#0c0c0c",
      "--titlebar-bg": "#0a0a0a",
      "--main-bg": "#0d0d0d",
      "--card-bg": "#141414",
      "--card-hover": "#181818",
      "--scrollbar": "#282828",
      "--input-bg": "#141414",
      "--input-border": "#222222",
      "--input-focus": "rgba(99,102,241,0.4)",
    },
  },
  {
    id: "midnight",
    name: "Meia-noite",
    description: "Azul escuro elegante",
    preview: ["#0a0f1e", "#60a5fa", "#111827"],
    vars: {
      "--bg-base": "#060c1a",
      "--bg-surface": "#0a0f1e",
      "--bg-surface-1": "#0f1629",
      "--bg-surface-2": "#151e33",
      "--bg-surface-3": "#1c263d",
      "--border": "#1e2d4a",
      "--border-subtle": "#172340",
      "--text-primary": "#e2e8f0",
      "--text-secondary": "#7d96b8",
      "--text-muted": "#3d5475",
      "--text-faint": "#253548",
      "--accent": "#60a5fa",
      "--accent-hover": "#3b82f6",
      "--accent-dim": "rgba(96,165,250,0.08)",
      "--accent-rgb": "96,165,250",
      "--sidebar-bg": "#080d1a",
      "--titlebar-bg": "#070c18",
      "--main-bg": "#090e1c",
      "--card-bg": "#0d1425",
      "--card-hover": "#111829",
      "--scrollbar": "#1c263d",
      "--input-bg": "#0d1425",
      "--input-border": "#1e2d4a",
      "--input-focus": "rgba(96,165,250,0.35)",
    },
  },
  {
    id: "blue",
    name: "Oceano",
    description: "Azul profundo e calmante",
    preview: ["#0f172a", "#38bdf8", "#1e293b"],
    vars: {
      "--bg-base": "#09111f",
      "--bg-surface": "#0f172a",
      "--bg-surface-1": "#162133",
      "--bg-surface-2": "#1e2d40",
      "--bg-surface-3": "#243549",
      "--border": "#1e3a5f",
      "--border-subtle": "#162d4a",
      "--text-primary": "#e0f2fe",
      "--text-secondary": "#7ec8e3",
      "--text-muted": "#345d7e",
      "--text-faint": "#1d3d56",
      "--accent": "#38bdf8",
      "--accent-hover": "#0ea5e9",
      "--accent-dim": "rgba(56,189,248,0.08)",
      "--accent-rgb": "56,189,248",
      "--sidebar-bg": "#0b1422",
      "--titlebar-bg": "#091220",
      "--main-bg": "#0c1524",
      "--card-bg": "#12213a",
      "--card-hover": "#172840",
      "--scrollbar": "#1e3350",
      "--input-bg": "#111e32",
      "--input-border": "#1e3a5f",
      "--input-focus": "rgba(56,189,248,0.35)",
    },
  },
  {
    id: "forest",
    name: "Floresta",
    description: "Verde natural e relaxante",
    preview: ["#0a1410", "#4ade80", "#111e14"],
    vars: {
      "--bg-base": "#060f08",
      "--bg-surface": "#0a1410",
      "--bg-surface-1": "#0f1c12",
      "--bg-surface-2": "#152418",
      "--bg-surface-3": "#1b2c1f",
      "--border": "#1e3524",
      "--border-subtle": "#172a1c",
      "--text-primary": "#dcfce7",
      "--text-secondary": "#6dbf7e",
      "--text-muted": "#2e5c3c",
      "--text-faint": "#1c3824",
      "--accent": "#4ade80",
      "--accent-hover": "#22c55e",
      "--accent-dim": "rgba(74,222,128,0.08)",
      "--accent-rgb": "74,222,128",
      "--sidebar-bg": "#08120a",
      "--titlebar-bg": "#060f08",
      "--main-bg": "#090e0b",
      "--card-bg": "#0c1810",
      "--card-hover": "#111e14",
      "--scrollbar": "#1b2c1f",
      "--input-bg": "#0c1810",
      "--input-border": "#1e3524",
      "--input-focus": "rgba(74,222,128,0.35)",
    },
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    description: "Tons quentes de laranja e rosa",
    preview: ["#150a08", "#fb923c", "#1f1008"],
    vars: {
      "--bg-base": "#0e0805",
      "--bg-surface": "#150a08",
      "--bg-surface-1": "#1c0f0a",
      "--bg-surface-2": "#22140e",
      "--bg-surface-3": "#2a1a12",
      "--border": "#3d1f12",
      "--border-subtle": "#30180e",
      "--text-primary": "#fef3e2",
      "--text-secondary": "#c4845a",
      "--text-muted": "#5c3020",
      "--text-faint": "#3a1e12",
      "--accent": "#fb923c",
      "--accent-hover": "#f97316",
      "--accent-dim": "rgba(251,146,60,0.08)",
      "--accent-rgb": "251,146,60",
      "--sidebar-bg": "#100907",
      "--titlebar-bg": "#0e0805",
      "--main-bg": "#110a06",
      "--card-bg": "#180b08",
      "--card-hover": "#1e1009",
      "--scrollbar": "#2a1a12",
      "--input-bg": "#180b08",
      "--input-border": "#3d1f12",
      "--input-focus": "rgba(251,146,60,0.35)",
    },
  },
  {
    id: "light",
    name: "Claro",
    description: "Tema claro e limpo",
    preview: ["#f8f8f8", "#6366f1", "#ffffff"],
    vars: {
      "--bg-base": "#f4f4f5",
      "--bg-surface": "#ffffff",
      "--bg-surface-1": "#f9f9fb",
      "--bg-surface-2": "#f0f0f5",
      "--bg-surface-3": "#e8e8ef",
      "--border": "#d8d8e0",
      "--border-subtle": "#e4e4ec",
      "--text-primary": "#111111",
      "--text-secondary": "#555555",
      "--text-muted": "#888888",
      "--text-faint": "#bbbbbb",
      "--accent": "#6366f1",
      "--accent-hover": "#4f46e5",
      "--accent-dim": "rgba(99,102,241,0.08)",
      "--accent-rgb": "99,102,241",
      "--sidebar-bg": "#f0f0f5",
      "--titlebar-bg": "#e8e8ef",
      "--main-bg": "#f5f5f8",
      "--card-bg": "#ffffff",
      "--card-hover": "#f7f7ff",
      "--scrollbar": "#d0d0dc",
      "--input-bg": "#ffffff",
      "--input-border": "#d0d0dc",
      "--input-focus": "rgba(99,102,241,0.35)",
    },
  },
  {
    id: "purple",
    name: "Violeta",
    description: "Roxo intenso e vibrante",
    preview: ["#0f0a1e", "#c084fc", "#160e28"],
    vars: {
      "--bg-base": "#09061a",
      "--bg-surface": "#0f0a1e",
      "--bg-surface-1": "#150f27",
      "--bg-surface-2": "#1c1432",
      "--bg-surface-3": "#231a3d",
      "--border": "#2d1f5a",
      "--border-subtle": "#211547",
      "--text-primary": "#f3e8ff",
      "--text-secondary": "#a78bfa",
      "--text-muted": "#5b3f8c",
      "--text-faint": "#361f60",
      "--accent": "#c084fc",
      "--accent-hover": "#a855f7",
      "--accent-dim": "rgba(192,132,252,0.08)",
      "--accent-rgb": "192,132,252",
      "--sidebar-bg": "#0b081d",
      "--titlebar-bg": "#090618",
      "--main-bg": "#0c091e",
      "--card-bg": "#120e26",
      "--card-hover": "#17122d",
      "--scrollbar": "#231a3d",
      "--input-bg": "#120e26",
      "--input-border": "#2d1f5a",
      "--input-focus": "rgba(192,132,252,0.35)",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    description: "Clássico dos editores de código",
    preview: ["#272822", "#a6e22e", "#3e3d32"],
    vars: {
      "--bg-base": "#1c1c18",
      "--bg-surface": "#272822",
      "--bg-surface-1": "#2d2e27",
      "--bg-surface-2": "#34352d",
      "--bg-surface-3": "#3e3d32",
      "--border": "#44453a",
      "--border-subtle": "#3a3b30",
      "--text-primary": "#f8f8f2",
      "--text-secondary": "#a59f85",
      "--text-muted": "#635f4a",
      "--text-faint": "#474740",
      "--accent": "#a6e22e",
      "--accent-hover": "#8dcc1a",
      "--accent-dim": "rgba(166,226,46,0.08)",
      "--accent-rgb": "166,226,46",
      "--sidebar-bg": "#232420",
      "--titlebar-bg": "#1c1c18",
      "--main-bg": "#24251f",
      "--card-bg": "#2d2e27",
      "--card-hover": "#333428",
      "--scrollbar": "#3e3d32",
      "--input-bg": "#2d2e27",
      "--input-border": "#44453a",
      "--input-focus": "rgba(166,226,46,0.35)",
    },
  },
]

export interface AccessibilityConfig {
  fontSize: "small" | "medium" | "large" | "xlarge"
  reduceMotion: boolean
  highContrast: boolean
  keyboardFocus: boolean
}

interface ThemeStore {
  themeId: ThemeId
  accessibility: AccessibilityConfig

  setTheme: (id: ThemeId) => void
  setFontSize: (s: AccessibilityConfig["fontSize"]) => void
  setReduceMotion: (v: boolean) => void
  setHighContrast: (v: boolean) => void
  setKeyboardFocus: (v: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeId: "dark",
      accessibility: {
        fontSize: "medium",
        reduceMotion: false,
        highContrast: false,
        keyboardFocus: true,
      },
      setTheme: (id) => set({ themeId: id }),
      setFontSize: (fontSize) =>
        set((s) => ({ accessibility: { ...s.accessibility, fontSize } })),
      setReduceMotion: (reduceMotion) =>
        set((s) => ({ accessibility: { ...s.accessibility, reduceMotion } })),
      setHighContrast: (highContrast) =>
        set((s) => ({ accessibility: { ...s.accessibility, highContrast } })),
      setKeyboardFocus: (keyboardFocus) =>
        set((s) => ({ accessibility: { ...s.accessibility, keyboardFocus } })),
    }),
    { name: "flowspace-theme" }
  )
)
