"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const token =
        params.get("token") ||
        params.get("accessToken") ||
        params.get("jwt");

      if (!token) {
        setError("Authentication token not found.");

        setTimeout(() => {
          router.replace("/login");
        }, 2000);

        return;
      }

      localStorage.setItem("token", token);

      router.replace("/dashboard");
    } catch {
      setError(
        "Google authentication failed. Please try again."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md text-center">

        {!error ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold">
              C
            </div>

            <h1 className="text-2xl font-bold">
              Signing you in...
            </h1>

            <p className="mt-3 text-slate-400">
              Please wait while we complete your
              Google authentication.
            </p>

            <div className="mx-auto mt-8 h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-400">
              !
            </div>

            <h1 className="text-2xl font-bold">
              Authentication Failed
            </h1>

            <p className="mt-3 text-slate-400">
              {error}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Redirecting to login...
            </p>
          </>
        )}

      </div>
    </main>
  );
}
