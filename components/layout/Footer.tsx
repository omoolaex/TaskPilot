// src/components/layout/Footer.tsx
"use client"

export default function Footer() {
  return (
    <footer className="h-14 w-full bg-white border-t px-6 py-4 text-sm text-center">
      &copy; {new Date().getFullYear()} TaskPilot. All rights reserved.
    </footer>
  )
}