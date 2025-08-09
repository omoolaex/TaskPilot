// app/verify-email/page.tsx
import VerifyEmailClient from "./VerifyEmailClient";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
  <Suspense fallback={<p>Loading...</p>}>
    <VerifyEmailClient />;
  </Suspense>
  );
}
