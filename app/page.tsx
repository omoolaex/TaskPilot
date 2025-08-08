"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInstallButton(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleInstall = async () => {
    try {
      await promptInstall()
      toast.success("🎉 TaskPilot is being installed!")
    } catch {
      toast.error("Installation was dismissed.")
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 gap-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          🚀 Welcome to <span className="text-primary">TaskPilot</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base md:text-lg text-muted-foreground">
          Your AI Assistant for Business Success
        </p>
      </motion.div>

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg shadow-md">
        <CardContent className="p-6">
          <p className="text-base sm:text-lg font-medium text-muted-foreground">
            This is a <strong>Shadcn</strong> Card Component
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
        <Button
          size="lg"
          onClick={() => router.push("/login")}
          className="w-full sm:w-auto"
        >
          🚧 Try it Now
        </Button>

        {canInstall && showInstallButton && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleInstall}
            className="w-full sm:w-auto border border-dashed"
          >
            📲 Install TaskPilot
          </Button>
        )}
      </div>
    </main>
  )
}
