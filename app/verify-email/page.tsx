"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // State for resend email form
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    async function verifyEmail() {
      try {
        const res = await fetch(`/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified! You can now log in.");
          toast.success("Email verified successfully!");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          toast.error(data.error || "Verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    }

    verifyEmail();
  }, [token, router]);

  // Handler to resend verification email
  const handleResend = async () => {
    if (!resendEmail) {
      toast.error("Please enter your email.");
      return;
    }
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed to resend verification email");
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === "loading" && <p>Verifying your email...</p>}

        {status === "success" && (
          <p className="text-green-600">{message}</p>
        )}

        {status === "error" && (
          <>
            <p className="text-red-600 mb-4">{message}</p>

            <div className="mb-2">
              <input
                type="email"
                placeholder="Enter your email to resend verification"
                className="w-full p-2 border rounded"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={resendLoading}
              />
            </div>

            <button
              onClick={handleResend}
              disabled={resendLoading || !resendEmail}
              className="w-full py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
