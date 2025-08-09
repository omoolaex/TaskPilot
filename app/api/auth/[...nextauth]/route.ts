import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Use bcryptjs for better compatibility
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { syncUserWithSupabase } from "@/lib/syncUserWithSupabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabase = await getSupabaseServerClient();

        // Fetch user by email, include email_verified field
        const { data: user, error } = await supabase
          .from("users")
          .select("id, name, email, image, role, password_hash, email_verified")
          .eq("email", credentials.email)
          .single();

        if (error || !user?.password_hash) {
          console.error("Authorize error fetching user or no password hash:", error);
          return null;
        }

        // Throw error if email not verified
        if (!user.email_verified) {
          throw new Error("Email not verified");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role ?? "user",
          provider: "credentials",
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.supabaseId = user.id;
        token.role = user.role;
        token.provider = user.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.supabaseId as string;
        session.user.role = token.role as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (!user?.email) {
        console.error("signIn: Missing user email");
        return false;
      }

      // Use provider string from account if available, fallback to credentials
      const providerName = account?.provider ?? "credentials";

      const synced = await syncUserWithSupabase({
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        provider: providerName,
      });

      if (!synced) {
        console.error("signIn: Failed to sync user with Supabase");
        return false;
      }

      // Attach Supabase user ID to user object for jwt callback
      user.id = synced.supabaseId;

      // Set RLS context for this user on server
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase.rpc("set_current_user_id", {
        uid: synced.supabaseId,
      });

      if (error) {
        console.error("signIn: Failed to set RLS context:", error);
        return false;
      }

      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
