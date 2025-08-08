"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyEmailPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6 text-center">
          <h2 className="text-xl font-bold">Verify Your Email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A verification link has been sent to your email. Please check your inbox.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
