"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // ⏳ Show loading state while checking session
  if (status === "loading" || status === "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Check if email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        toast.error("Email already in use. Please log in instead.");
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { error } = await supabase.from("users").insert([
        {
          email,
          password: hashedPassword,
          role: "user",
          provider: "credentials",
        },
      ]);

      if (error) {
        toast.error(error.message || "Signup failed.");
      } else {
        toast.success("Account created successfully!");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-center">Create an Account</h2>

          {/* Social Signup */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <FaGithub className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Already have an account? Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
