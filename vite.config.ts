import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import fs from "fs"

const host = process.env.TAURI_DEV_HOST

// Patch fs.readdirSync to filter out ghost files (e.g. cloud-only desktop.ini)
// that appear in directory listings but cannot be stat-ed (Google Drive Files On Demand).
const _readdirSync = fs.readdirSync.bind(fs)
const publicDirAbs = path.resolve(__dirname, "public")
;(fs as any).readdirSync = function (p: any, ...args: any[]) {
  const results = _readdirSync(p, ...args) as string[]
  if (typeof p === "string" && path.normalize(p) === path.normalize(publicDirAbs)) {
    return results.filter((entry) => {
      try {
        fs.statSync(path.join(p, entry))
        return true
      } catch {
        return false
      }
    })
  }
  return results
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    outDir: "dist_tauri",
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
})
