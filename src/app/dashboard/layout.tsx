import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { FloatingPlayer } from "@/components/spotify/FloatingPlayer"
import { SpotifySearch } from "@/components/spotify/SpotifySearch"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
      <FloatingPlayer accessToken={session.accessToken ?? ""} />
      <SpotifySearch accessToken={session.accessToken ?? ""} />
    </div>
  )
}
