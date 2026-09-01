"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Check OAuth errors after the page loads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");

    if (oauthError === "oauth_failed") {
      setError("Google login failed. Please try again.");
    }

    if (oauthError === "google_email_missing") {
      setError("Could not get your Google email.");
    }
  }, []);

  // =========================
  // NORMAL LOGIN
  // =========================

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080";

      const response = await fetch(
        `${apiUrl}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data: unknown;

      if (
        contentType?.includes("application/json")
      ) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let message =
          "Invalid email or password.";

        if (
          typeof data === "object" &&
          data !== null &&
          "message" in data
        ) {
          message = String(
            (data as { message?: unknown })
              .message || message
          );
        } else if (
          typeof data === "string" &&
          data.trim()
        ) {
          message = data;
        }

        throw new Error(message);
      }

      let token: string | null = null;

      if (
        typeof data === "object" &&
        data !== null
      ) {
        const objectData = data as {
          token?: string;
          accessToken?: string;
          jwt?: string;
        };

        token =
          objectData.token ||
          objectData.accessToken ||
          objectData.jwt ||
          null;
      }

      if (
        !token &&
        typeof data === "string"
      ) {
        token = data;
      }

      if (!token) {
        throw new Error(
          "Login successful, but no authentication token was returned."
        );
      }

      localStorage.setItem("token", token);

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // GOOGLE LOGIN
  // =========================

  function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";

    window.location.href =
      `${apiUrl}/oauth2/authorization/google`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-12 lg:flex">

          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700">
              C
            </div>

            CloudStore
          </Link>

          <div className="max-w-lg">

            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200">
              Secure Cloud Storage
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Your files.
              <br />
              Your cloud.
              <br />
              Your control.
            </h2>

            <p className="mt-6 text-lg leading-8 text-blue-100/80">
              Store, manage and access your files
              securely from anywhere.
            </p>

          </div>

          <p className="text-sm text-blue-200/60">
            © 2026 CloudStore
          </p>

        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* Mobile Back */}

            <Link
              href="/"
              className="mb-8 inline-flex items-center text-sm text-slate-400 hover:text-white lg:hidden"
            >
              ← Back to CloudStore
            </Link>

            {/* Header */}

            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
                C
              </div>

              <h1 className="text-3xl font-bold">
                Welcome back
              </h1>

              <p className="mt-2 text-slate-400">
                Sign in to continue to your
                CloudStore account.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Login Form */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>

            {/* Divider */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-800" />

              <span className="text-xs text-slate-500">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-800" />

            </div>

            {/* Google */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900 py-3.5 font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <span className="text-lg font-bold">
                G
              </span>

              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}

            </button>

            {/* Register */}

            <p className="mt-8 text-center text-sm text-slate-400">

              Don't have an account?{" "}

              <Link
                href="/register"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Create an account
              </Link>

            </p>

          </div>

        </div>

      </div>
    </main>
  );
}
