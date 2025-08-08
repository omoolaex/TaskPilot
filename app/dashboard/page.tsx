// /app/dashboard/page.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <p className="text-center mt-10">Loading dashboard...</p>
  }

  const user = session?.user

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6 text-center">
          <h2 className="text-2xl font-bold">Welcome, {user?.name || "User"}</h2>
          {user?.image && (
            <Image
              src={user.image}
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full mx-auto"
            />
          )}
          <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
          <p className="text-sm text-muted-foreground">Role: {user?.role}</p>
          <p className="text-sm text-muted-foreground">Provider: {user?.provider}</p>

          <div className="space-y-2">
            <Button onClick={() => router.push("/settings")} className="w-full">
              Settings
            </Button>
            <Button onClick={() => signOut({ callbackUrl: "/login" })} variant="destructive" className="w-full">
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
