"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError(
        "Please agree to the Terms and Conditions."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      const contentType = response.headers.get("content-type");

      let data: unknown;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let message = "Registration failed.";

        if (
          typeof data === "object" &&
          data !== null &&
          "message" in data
        ) {
          message = String(
            (data as { message?: unknown }).message ||
              message
          );
        } else if (typeof data === "string" && data.trim()) {
          message = data;
        }

        throw new Error(message);
      }

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgree(false);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left */}
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
              Start today
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              One place for
              <br />
              all your files.
            </h2>

            <p className="mt-6 text-lg leading-8 text-blue-100/80">
              Create your CloudStore account and start managing
              your files securely.
            </p>

            <div className="mt-8 space-y-4 text-sm text-blue-100">
              <div>✓ Secure file storage</div>
              <div>✓ Easy file management</div>
              <div>✓ Access from anywhere</div>
            </div>
          </div>

          <p className="text-sm text-blue-200/60">
            © 2026 CloudStore
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            <Link
              href="/"
              className="mb-7 inline-flex text-sm text-slate-400 hover:text-white lg:hidden"
            >
              ← Back to CloudStore
            </Link>

            <div className="mb-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
                C
              </div>

              <h1 className="text-3xl font-bold">
                Create an account
              </h1>

              <p className="mt-2 text-slate-400">
                Create your account to get started.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) =>
                    setAgree(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-blue-600"
                />

                <span className="text-sm leading-6 text-slate-400">
                  I agree to the{" "}
                  <span className="text-blue-400">
                    Terms and Conditions
                  </span>{" "}
                  and Privacy Policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}