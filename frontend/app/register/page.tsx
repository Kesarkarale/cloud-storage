"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  FolderOpen,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================
  // REGISTER
  // =========================

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
      setError(
        "Password must contain at least 6 characters."
      );
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080";

      const response = await fetch(
        `${apiUrl}/api/auth/register`,
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
        } else if (
          typeof data === "string" &&
          data.trim()
        ) {
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
    <main className="min-h-screen bg-[#060912] text-white">
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* =====================================================
            BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-200px] top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

          <div className="absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
        </div>

        {/* =====================================================
            LEFT BRAND SECTION
        ====================================================== */}

        <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[#080d18] lg:flex lg:flex-col lg:justify-between">

          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <Link
              href="/"
              className="group flex w-fit items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25 transition group-hover:scale-105">
                <Cloud className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Cloud<span className="text-blue-400">
                  Vault
                </span>
              </span>
            </Link>

            {/* Main content */}

            <div className="relative max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.07] px-4 py-2 text-xs font-medium text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />

                Start your cloud journey
              </div>

              <h2 className="text-5xl font-bold leading-[1.08] tracking-[-0.04em] xl:text-6xl">
                One place for
                <br />

                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  all your files.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 xl:text-lg">
                Create your CloudVault account and get a
                simple, secure place to store and manage
                your important files.
              </p>

              {/* Benefits */}

              <div className="mt-9 space-y-4">

                <Benefit
                  icon={<ShieldCheck />}
                  title="Secure file storage"
                  text="Keep your files protected."
                />

                <Benefit
                  icon={<FolderOpen />}
                  title="Easy organization"
                  text="Manage your files effortlessly."
                />

                <Benefit
                  icon={<Zap />}
                  title="Fast access"
                  text="Access your files from anywhere."
                />

              </div>

              {/* Mini storage preview */}

              <div className="relative mt-12 hidden xl:block">
                <StoragePreview />
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                © {new Date().getFullYear()} CloudVault
              </span>

              <span>
                Secure. Simple. Reliable.
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT REGISTER SECTION
        ====================================================== */}

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">

          <div className="w-full max-w-[430px]">

            {/* Mobile Back */}

            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to CloudVault
            </Link>

            {/* Mobile Logo */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <Cloud className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold">
                Cloud<span className="text-blue-400">
                  Vault
                </span>
              </span>
            </div>

            {/* Header */}

            <div className="mb-7">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                <Users className="h-5 w-5" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Join CloudVault and start managing your
                files securely.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3.5 text-sm text-red-300">

                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />

                <span>{error}</span>
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3.5 text-sm text-green-300">

                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{success}</span>
              </div>
            )}

            {/* Register Card */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl shadow-black/20 sm:p-6">

              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >

                {/* Full Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#080d18] px-4 text-sm text-white outline-none transition placeholder:text-slate-700 hover:border-white/[0.14] focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
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
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#080d18] px-4 text-sm text-white outline-none transition placeholder:text-slate-700 hover:border-white/[0.14] focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="At least 6 characters"
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#080d18] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-700 hover:border-white/[0.14] focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
                  >
                    Confirm password
                  </label>

                  <div className="relative">

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Re-enter your password"
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#080d18] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-700 hover:border-white/[0.14] focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms */}

                <label className="flex cursor-pointer items-start gap-3 pt-2">

                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) =>
                      setAgree(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                  />

                  <span className="text-xs leading-5 text-slate-500 sm:text-sm">
                    I agree to the{" "}
                    <span className="text-blue-400">
                      Terms and Conditions
                    </span>{" "}
                    and Privacy Policy.
                  </span>
                </label>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold shadow-lg shadow-blue-600/15 transition duration-300 hover:bg-blue-500 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account

                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Login */}

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}

              <Link
                href="/login"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>

            {/* Security */}

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" />

              Your information is securely protected
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-blue-400">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STORAGE PREVIEW
========================================================= */

function StoragePreview() {
  return (
    <div className="relative max-w-[500px]">

      <div className="absolute -inset-5 rounded-3xl bg-blue-600/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1120]/90 shadow-2xl">

        {/* Header */}

        <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
          <span className="h-2 w-2 rounded-full bg-green-400/70" />

          <div className="ml-3 h-5 flex-1 rounded-md bg-white/[0.03]" />
        </div>

        <div className="p-4">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[8px] text-slate-600">
                CloudVault
              </p>

              <p className="mt-1 text-xs font-semibold">
                Your storage
              </p>
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10">
              <Cloud className="h-3.5 w-3.5 text-blue-400" />
            </div>
          </div>

          {/* Storage */}

          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <FolderOpen className="h-4 w-4 text-blue-400" />
                </div>

                <div>
                  <p className="text-[8px] text-slate-600">
                    Storage used
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold">
                    6.8 GB / 10 GB
                  </p>
                </div>

              </div>

              <span className="text-[9px] font-semibold text-blue-400">
                68%
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[68%] rounded-full bg-blue-500" />
            </div>
          </div>

          {/* Files */}

          <div className="mt-3 grid grid-cols-3 gap-2">

            <PreviewItem
              icon={<FolderOpen />}
              value="128"
              label="Files"
            />

            <PreviewItem
              icon={<Upload />}
              value="24"
              label="Uploads"
            />

            <PreviewItem
              icon={<Users />}
              value="12"
              label="Shared"
            />

          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">

      <div className="mb-1 text-blue-400">
        {icon}
      </div>

      <p className="text-[10px] font-bold">
        {value}
      </p>

      <p className="text-[7px] text-slate-600">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

