// Detects whether the app is running inside the Tauri runtime.
// In the browser (e.g. the web preview) the Tauri internals are absent,
// so all `@tauri-apps/*` plugin calls (which rely on `invoke`) would fail.
// We use this flag to swap in browser-friendly fallbacks.
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}
