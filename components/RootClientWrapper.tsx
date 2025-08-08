"use client"

import { useEffect } from "react"
import { useSession, SessionProvider } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { useTheme } from "next-themes"
import LayoutSelector from "@/components/layout/LayoutSelector"
import { Toaster } from "sonner"

export default function RootClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerRootClientWrapper>{children}</InnerRootClientWrapper>
    </SessionProvider>
  )
}

function InnerRootClientWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { setTheme } = useTheme()

  useEffect(() => {
    async function loadUserTheme() {
      if (!session?.user?.id) {
        setTheme("system")
        return
      }

      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("user_id", session.user.id)
        .eq("key", "theme")
        .single()

      if (!error && data?.value) {
        setTheme(data.value)
      } else {
        setTheme("system")
      }
    }
    loadUserTheme()
  }, [session, setTheme])

  return (
    <>
      <Toaster richColors />
      <LayoutSelector>{children}</LayoutSelector>
    </>
  )
}
