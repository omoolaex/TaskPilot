// src/components/layout/Sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { useSession, signOut, signIn } from "next-auth/react"
import {
  LayoutDashboard,
  MessageCircle,
  Settings,
  LogOut,
  LogIn,
  PanelLeft,
  PanelRight,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <aside
        className={clsx(
          "h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top Section: Logo and Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
          <span className="text-xl font-bold text-gray-800 dark:text-white truncate">
            {collapsed ? "TP" : "TaskPilot"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href
            const linkClass = clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
            )

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link href={href} className={linkClass}>
                    <Icon className="w-5 h-5" />
                    {!collapsed && name}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <span>{name}</span>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Bottom Auth Section */}
        <div className="border-t dark:border-gray-700 px-4 py-3">
        {user ? (
          <div className={clsx("flex items-center gap-3", collapsed && "justify-center")}>
            {!collapsed && (
              <Avatar className="h-8 w-8 shrink-0">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name || "User"} />
                ) : (
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className={clsx(collapsed ? "flex justify-center" : "")}>
            <Button
              variant="outline"
              className={clsx("w-full flex items-center justify-center gap-2", collapsed && "w-auto")}
              onClick={() => signIn()}
            >
              <LogIn className="w-4 h-4" />
              {!collapsed && "Login / Signup"}
            </Button>
          </div>
        )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
