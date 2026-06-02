import { getCurrentWindow } from "@tauri-apps/api/window"
import { Minus, Square, X } from "lucide-react"
import { useState, useEffect } from "react"
import { isTauri } from "@/lib/tauri"

// Only the desktop (Tauri) build has a real window to control. In the browser
// preview `getCurrentWindow()` would throw, so we lazily resolve it and guard.
function getWin() {
  return isTauri() ? getCurrentWindow() : null
}

export function TitleBar() {
  const [maximized, setMaximized] = useState(false)
  const [win] = useState(getWin)

  useEffect(() => {
    if (!win) return
    win.isMaximized().then(setMaximized)
    const unlisten = win.onResized(() => { win.isMaximized().then(setMaximized) })
    return () => { unlisten.then((fn) => fn()) }
  }, [win])

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-9 px-3 shrink-0 select-none"
      style={{ background: "var(--titlebar-bg)", borderBottom: "1px solid var(--border-subtle)" }}
      role="banner"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <img src="/Icone.png" alt="" aria-hidden="true" className="w-4 h-4 rounded-[4px] object-contain" />
        <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>Flowspace</span>
      </div>
      {win && (
        <div className="flex items-center gap-0.5">
          <button onClick={() => win.minimize()} aria-label="Minimizar" className="w-8 h-7 flex items-center justify-center rounded" style={{ color: "var(--text-faint)" }}><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={() => (maximized ? win.unmaximize() : win.maximize())} aria-label="Maximizar" className="w-8 h-7 flex items-center justify-center rounded" style={{ color: "var(--text-faint)" }}><Square className="w-3 h-3" /></button>
          <button onClick={() => win.close()} aria-label="Fechar" className="w-8 h-7 flex items-center justify-center rounded hover:bg-red-600/70 hover:!text-white" style={{ color: "var(--text-faint)" }}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  )
}
