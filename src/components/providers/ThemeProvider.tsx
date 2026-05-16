import { useEffect } from "react"
import { useThemeStore, THEMES } from "@/store/theme"

const FONT_SIZES = {
  small: "13px",
  medium: "15px",
  large: "17px",
  xlarge: "19px",
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId)
  const accessibility = useThemeStore((s) => s.accessibility)

  useEffect(() => {
    const theme = THEMES.find((t) => t.id === themeId)
    if (!theme) return
    const root = document.documentElement
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value)
    }

    root.style.setProperty("--font-size-base", FONT_SIZES[accessibility.fontSize])
    root.style.setProperty(
      "--motion-duration",
      accessibility.reduceMotion ? "0ms" : "200ms"
    )
    root.style.setProperty(
      "--motion-duration-slow",
      accessibility.reduceMotion ? "0ms" : "500ms"
    )

    if (accessibility.highContrast) {
      root.setAttribute("data-high-contrast", "true")
    } else {
      root.removeAttribute("data-high-contrast")
    }

    if (accessibility.keyboardFocus) {
      root.setAttribute("data-keyboard-focus", "true")
    } else {
      root.removeAttribute("data-keyboard-focus")
    }

    if (accessibility.reduceMotion) {
      root.setAttribute("data-reduce-motion", "true")
    } else {
      root.removeAttribute("data-reduce-motion")
    }

    const isLight = themeId === "light"
    if (isLight) {
      root.setAttribute("data-theme", "light")
    } else {
      root.setAttribute("data-theme", "dark")
    }
  }, [themeId, accessibility])

  return <>{children}</>
}
