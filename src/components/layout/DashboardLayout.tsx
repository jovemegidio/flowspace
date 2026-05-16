import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function DashboardLayout() {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden" style={{ background: "var(--main-bg)" }} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
