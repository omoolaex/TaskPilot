// src/app/onboarding/page.tsx
"use client"

import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Welcome to TaskPilot 👋</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Let’s get to know you better so we can personalize your experience.
        </p>

        {/* Placeholder for step content */}
        <div className="border rounded p-6 bg-white dark:bg-gray-900 shadow-sm">
          <p className="text-center">[ Step 1: Select your role ]</p>
          {/* Add your inputs here later */}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost">Skip</Button>
          <Button>Next</Button>
        </div>
      </div>
    </div>
  )
}
