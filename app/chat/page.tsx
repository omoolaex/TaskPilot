// src/app/chat/page.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([])

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Chat Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
          <li className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
            Chat with AI
          </li>
          <li className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
            Business Plan Draft
          </li>
        </ul>
      </aside>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 p-4 overflow-hidden">
        <div className="flex-1 overflow-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No messages yet...</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className="bg-gray-200 dark:bg-gray-700 p-3 rounded max-w-xl"
              >
                {msg}
              </div>
            ))
          )}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const input = form.message as HTMLInputElement
            const value = input.value.trim()
            if (value) {
              setMessages((prev) => [...prev, value])
              input.value = ""
            }
          }}
        >
          <Input name="message" placeholder="Type a message..." />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  )
}
