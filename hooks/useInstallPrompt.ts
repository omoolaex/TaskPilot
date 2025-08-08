import { useEffect, useState } from "react"

// ✅ Declare the event type manually
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function useInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const promptInstall = async () => {
    if (!installPromptEvent) return
    installPromptEvent.prompt()
    const choiceResult = await installPromptEvent.userChoice
    if (choiceResult.outcome === "accepted") {
      console.log("✅ PWA installation accepted")
    } else {
      console.log("❌ PWA installation dismissed")
    }
    setInstallPromptEvent(null)
  }

  return {
    canInstall: !!installPromptEvent,
    promptInstall,
  }
}
