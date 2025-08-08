"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import Footer from "@/components/layout/Footer"

export default function LayoutSelector({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { status } = useSession()

  const excludedRoutes = ["/", "/login", "/signup"]
  const isExcluded = excludedRoutes.includes(pathname)
  const isAuthenticated = status === "authenticated"

  const shouldUseFullLayout = isAuthenticated && !isExcluded

  if (!shouldUseFullLayout) {
    // Minimal layout
    return <>{children}</>
  }

  // Full layout with sidebar, header, footer
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content layout */}
      <div className="flex-1 flex flex-col h-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
