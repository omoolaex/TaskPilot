// /types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      provider: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    provider: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    provider: string
  }
}
