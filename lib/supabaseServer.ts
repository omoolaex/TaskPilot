// /lib/supabaseServer.ts
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

/**
 * Returns a Supabase client tied to the current user session.
 * This is intended for use in Next.js server components or API routes.
 */
export async function getSupabaseServerClient() {
  const session = await getServerSession(authOptions)

  // Create Supabase client with user cookies to enable RLS
  const supabase = createServerComponentClient({ cookies })

  // If user is authenticated, set the RLS context in the database
  if (session?.user?.id) {
    const { error } = await supabase.rpc("set_current_user_id", {
      uid: session.user.id,
    })
    if (error) {
      console.error("Failed to set RLS context:", error)
    }
  }

  return supabase
}

/**
 * Returns a Supabase client with Service Role key.
 * Use this only for privileged admin actions (bypassing RLS).
 */
export function getSupabaseServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
