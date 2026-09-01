"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  FolderOpen,
  Lock,
  Menu,
  Share2,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  // =========================================================
  // OAUTH ERROR CHECK
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const oauthError = params.get("error");

    if (oauthError === "oauth_failed") {
      setError(
        "Google login failed. Please try again."
      );
    }

    if (oauthError === "google_email_missing") {
      setError(
        "Could not get your Google email."
      );
    }
  }, []);

  // =========================================================
  // NORMAL LOGIN
  // =========================================================

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
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
        let message =
          "Invalid email or password.";

        if (
          typeof data === "object" &&
          data !== null &&
          "message" in data
        ) {
          const objectData = data as {
            message?: unknown;
          };

          if (objectData.message) {
            message = String(
              objectData.message
            );
          }
        } else if (
          typeof data === "string" &&
          data.trim()
        ) {
          message = data;
        }

        throw new Error(message);
      }

      // =====================================================
      // GET JWT TOKEN
      // =====================================================

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
        typeof data === "string" &&
        data.trim()
      ) {
        token = data.trim();
      }

      if (!token) {
        throw new Error(
          "Login successful, but no authentication token was returned."
        );
      }

      // =====================================================
      // SAVE TOKEN
      // =====================================================

      localStorage.setItem(
        "token",
        token
      );

      // Optional compatibility key
      localStorage.setItem(
        "accessToken",
        token
      );

      // =====================================================
      // REDIRECT
      // =====================================================

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

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

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
    <main className="min-h-screen overflow-hidden bg-[#060912] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-[-180px] top-[-150px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-[-180px] right-[-150px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.04] blur-[120px]" />
      </div>

      {/* =====================================================
          MOBILE TOP BAR
      ====================================================== */}

      <header className="border-b border-white/[0.07] bg-[#060912]/80 backdrop-blur-xl lg:hidden">

        <div className="flex h-[72px] items-center justify-between px-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Cloud className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold">
              Cloud<span className="text-blue-400">
                Vault
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Open menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/[0.07] px-5 py-4">

            <Link
              href="/"
              onClick={() =>
                setMenuOpen(false)
              }
              className="block rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Back to Home
            </Link>

            <Link
              href="/register"
              onClick={() =>
                setMenuOpen(false)
              }
              className="mt-2 block rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold"
            >
              Create Account
            </Link>
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="grid min-h-[calc(100vh-72px)] lg:min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* ===================================================
            LEFT BRAND PANEL
        ==================================================== */}

        <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[#080d18] lg:flex lg:flex-col">

          {/* Decorative glow */}

          <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.08] blur-[150px]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <Link
              href="/"
              className="group flex w-fit items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25 transition duration-300 group-hover:scale-105">
                <Cloud className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Cloud<span className="text-blue-400">
                  Vault
                </span>
              </span>
            </Link>

            {/* Main content */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.07] px-4 py-2 text-xs font-medium text-blue-300">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                Secure Cloud Storage
              </div>

              <h2 className="text-5xl font-bold leading-[1.08] tracking-[-0.04em] xl:text-6xl">
                Your files.
                <br />

                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Your cloud.
                </span>

                <br />

                Your control.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 xl:text-lg">
                Store, manage and access your
                important files securely from
                anywhere with CloudVault.
              </p>

              {/* Benefits */}

              <div className="mt-10 space-y-5">

                <Benefit
                  icon={<ShieldCheck />}
                  title="Secure storage"
                  text="Keep your important files protected."
                />

                <Benefit
                  icon={<FolderOpen />}
                  title="Simple file management"
                  text="Organize and manage files with ease."
                />

                <Benefit
                  icon={<Zap />}
                  title="Fast access"
                  text="Access your files whenever you need."
                />

                <Benefit
                  icon={<Users />}
                  title="Easy sharing"
                  text="Share files whenever collaboration is needed."
                />
              </div>

              {/* Dashboard Preview */}

              <div className="mt-12">
                <DashboardPreview />
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

        {/* ===================================================
            RIGHT LOGIN PANEL
        ==================================================== */}

        <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">

          <div className="w-full max-w-[430px]">

            {/* Back link */}

            <Link
              href="/"
              className="mb-8 hidden items-center gap-2 text-sm text-slate-600 transition hover:text-slate-300 sm:inline-flex"
            >
              <span>←</span>
              Back to CloudVault
            </Link>

            {/* Header */}

            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.08]">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Sign in to continue to your
                CloudVault account.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3.5 text-sm text-red-300">

                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400" />

                <span>{error}</span>
              </div>
            )}

            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl shadow-black/20 sm:p-6">

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

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

                  <div className="mb-2.5 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-200"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Password reset is not configured yet."
                        )
                      }
                      className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#080d18] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-700 hover:border-white/[0.14] focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-600 transition hover:bg-white/5 hover:text-slate-300"
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

                {/* Sign in */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold shadow-lg shadow-blue-600/15 transition duration-300 hover:bg-blue-500 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-white/[0.07]" />

                <span className="text-[10px] font-medium tracking-widest text-slate-700">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              {/* Google */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-[#080d18] text-sm font-medium text-slate-200 transition hover:border-white/[0.14] hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {googleLoading ? (
                  <>
                    <Spinner />

                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <GoogleIcon />

                    Continue with Google
                  </>
                )}
              </button>
            </div>

            {/* Register */}

            <p className="mt-7 text-center text-sm text-slate-500">

              Don't have an account?{" "}

              <Link
                href="/register"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Create an account
              </Link>
            </p>

            {/* Security */}

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-700">

              <ShieldCheck className="h-3.5 w-3.5" />

              Your connection is securely protected
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   BENEFIT COMPONENT
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
        <span className="[&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
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
   DASHBOARD PREVIEW
========================================================= */

function DashboardPreview() {
  return (
    <div className="relative max-w-[500px]">

      <div className="absolute -inset-6 rounded-3xl bg-blue-600/[0.08] blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1120]/95 shadow-2xl">

        {/* Browser bar */}

        <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-3">

          <span className="h-2 w-2 rounded-full bg-red-400/60" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
          <span className="h-2 w-2 rounded-full bg-green-400/60" />

          <div className="ml-4 h-5 flex-1 rounded-md bg-white/[0.03]" />
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-3 p-3">

          {/* Sidebar */}

          <div className="rounded-xl bg-white/[0.025] p-2.5">

            <div className="mb-5 flex items-center gap-1.5">

              <Cloud className="h-3.5 w-3.5 text-blue-400" />

              <span className="text-[8px] font-bold">
                CloudVault
              </span>
            </div>

            <div className="space-y-1.5">

              <MiniNav
                active
                icon={<FolderOpen />}
                text="Dashboard"
              />

              <MiniNav
                icon={<FolderOpen />}
                text="My Files"
              />

              <MiniNav
                icon={<Share2 />}
                text="Shared"
              />

              <MiniNav
                icon={<Zap />}
                text="Recent"
              />
            </div>
          </div>

          {/* Main */}

          <div>

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-[7px] text-slate-600">
                  Welcome back
                </p>

                <p className="mt-0.5 text-[10px] font-semibold">
                  My Dashboard
                </p>
              </div>

              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-3 w-3 text-blue-400" />
              </div>
            </div>

            {/* Stats */}

            <div className="mb-3 grid grid-cols-3 gap-2">

              <MiniStat
                icon={<FolderOpen />}
                value="128"
                label="Files"
              />

              <MiniStat
                icon={<Share2 />}
                value="24"
                label="Shared"
              />

              <MiniStat
                icon={<ShieldCheck />}
                value="98%"
                label="Secure"
              />
            </div>

            {/* Recent files */}

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">

              <div className="mb-3 flex items-center justify-between">

                <p className="text-[8px] font-semibold">
                  Recent Files
                </p>

                <span className="text-[7px] text-blue-400">
                  View all
                </span>
              </div>

              <div className="space-y-2">

                <FileRow
                  name="Project Report.pdf"
                  size="2.4 MB"
                />

                <FileRow
                  name="Presentation.pptx"
                  size="5.8 MB"
                />

                <FileRow
                  name="Database.sql"
                  size="1.2 MB"
                />

                <FileRow
                  name="Images.zip"
                  size="18.5 MB"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI NAV
========================================================= */

function MiniNav({
  icon,
  text,
  active = false,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[7px] ${
        active
          ? "bg-blue-500/10 text-blue-300"
          : "text-slate-600"
      }`}
    >
      <span className="[&>svg]:h-2.5 [&>svg]:w-2.5">
        {icon}
      </span>

      {text}
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">

      <div className="mb-1 text-blue-400 [&>svg]:h-3 [&>svg]:w-3">
        {icon}
      </div>

      <p className="text-[10px] font-bold">
        {value}
      </p>

      <p className="mt-0.5 text-[6px] text-slate-600">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   FILE ROW
========================================================= */

function FileRow({
  name,
  size,
}: {
  name: string;
  size: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 last:border-0 last:pb-0">

      <div className="flex min-w-0 items-center gap-2">

        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/[0.07]">
          <FolderOpen className="h-3 w-3 text-blue-400" />
        </div>

        <span className="truncate text-[7px] text-slate-400">
          {name}
        </span>
      </div>

      <span className="ml-2 shrink-0 text-[6px] text-slate-700">
        {size}
      </span>
    </div>
  );
}

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.39Z"
        fill="#4285F4"
      />

      <path
        d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.51A9.74 9.74 0 0 0 12 21.67Z"
        fill="#34A853"
      />

      <path
        d="M6.54 13.77a5.85 5.85 0 0 1 0-3.54V7.72H3.29a9.74 9.74 0 0 0 0 8.56l3.25-2.51Z"
        fill="#FBBC05"
      />

      <path
        d="M12 6.2c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.3 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.71 5.39l3.25 2.51C7.31 7.92 9.46 6.2 12 6.2Z"
        fill="#EA4335"
      />
    </svg>
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
