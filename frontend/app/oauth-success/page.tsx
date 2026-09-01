"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    localStorage.setItem("token", token);

    router.replace("/dashboard");
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <h1 className="text-xl font-semibold">
          Login successful
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Opening your dashboard...
        </p>
      </div>
    </main>
  );
}