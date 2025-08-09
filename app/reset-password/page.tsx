import ResetPasswordClient from "./ResetPasswordClient";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
