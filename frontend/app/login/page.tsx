"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  File,
  FolderOpen,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // CHECK OAUTH ERRORS
  // =========================

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

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
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

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let message = "Invalid email or password.";

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

      if (!token && typeof data === "string") {
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
    <main className="min-h-screen bg-[#060912] text-white">
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* =====================================================
            BACKGROUND GLOW
        ====================================================== */}

        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-200px] top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

          <div className="absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
        </div>

        {/* =====================================================
            LEFT BRAND SECTION
        ====================================================== */}

        <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[#080d18] lg:flex lg:flex-col lg:justify-between">

          {/* Glow */}
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

            {/* Center Content */}
            <div className="relative max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.07] px-4 py-2 text-xs font-medium text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />

                Secure cloud storage
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
                Store, organize and access your important
                files securely from anywhere with CloudVault.
              </p>

              {/* Benefits */}
              <div className="mt-9 space-y-4">

                <Benefit
                  icon={<ShieldCheck />}
                  title="Secure storage"
                  text="Your files stay protected."
                />

                <Benefit
                  icon={<ZapIcon />}
                  title="Fast access"
                  text="Access your files whenever you need."
                />

                <Benefit
                  icon={<ShareIcon />}
                  title="Easy sharing"
                  text="Share files when collaboration matters."
                />

              </div>

              {/* Mini Dashboard */}
              <div className="relative mt-12 hidden xl:block">
                <MiniDashboard />
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
            RIGHT LOGIN SECTION
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
            <div className="mb-9 flex items-center gap-3 lg:hidden">
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
            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                <Lock className="h-5 w-5" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Sign in to access your CloudVault
                account and files.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3.5 text-sm text-red-300">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />

                <span>{error}</span>
              </div>
            )}

            {/* Login Card */}
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
                          "Password reset will be available soon."
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
                        setShowPassword(!showPassword)
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

                {/* Login */}
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

                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/[0.07]" />

                <span className="text-[10px] font-medium tracking-widest text-slate-600">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-[#080d18] text-sm font-medium text-slate-200 transition hover:border-white/[0.15] hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
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

            {/* Security note */}
            <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" />

              Your connection is protected
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
   MINI DASHBOARD
========================================================= */

function MiniDashboard() {
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

          {/* Dashboard title */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] text-slate-600">
                Welcome back
              </p>

              <p className="mt-1 text-xs font-semibold">
                My Files
              </p>
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-[8px] font-bold text-blue-300">
              K
            </div>
          </div>

          {/* Cards */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <DashboardBox
              icon={<FolderOpen />}
              value="128"
              label="Files"
            />

            <DashboardBox
              icon={<Share2 />}
              value="24"
              label="Shared"
            />

            <DashboardBox
              icon={<HardDrive />}
              value="6.8 GB"
              label="Storage"
            />
          </div>

          {/* Files */}
          <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">

            <div className="mb-3 flex justify-between">
              <span className="text-[8px] font-semibold">
                Recent Files
              </span>

              <span className="text-[7px] text-blue-400">
                View all
              </span>
            </div>

            <SmallFile
              icon={<FileText />}
              name="Project Report.pdf"
              size="2.4 MB"
            />

            <SmallFile
              icon={<File />}
              name="Presentation.pptx"
              size="5.8 MB"
            />

            <SmallFile
              icon={<FileImage />}
              name="Images.zip"
              size="18.5 MB"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardBox({
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

function SmallFile({
  icon,
  name,
  size,
}: {
  icon: React.ReactNode;
  name: string;
  size: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-0">
      <div className="flex items-center gap-2">
        <div className="text-blue-400">
          {icon}
        </div>

        <span className="text-[8px] text-slate-400">
          {name}
        </span>
      </div>

      <span className="text-[7px] text-slate-600">
        {size}
      </span>
    </div>
  );
}

/* =========================================================
   ICON HELPERS
========================================================= */

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
      />

      <path
        fill="#34A853"
        d="M12 21.77c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.77Z"
      />

      <path
        fill="#FBBC05"
        d="M6.53 13.85A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.85V7.62H3.28A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.38l3.25-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.12c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.21 14.62 2.23 12 2.23a9.75 9.75 0 0 0-8.72 5.39l3.25 2.53C7.3 7.84 9.46 6.12 12 6.12Z"
      />
    </svg>
  );
}

function ZapIcon() {
  return <Zap className="h-5 w-5" />;
}

function ShareIcon() {
  return <Share2 className="h-5 w-5" />;
}

function FileText() {
  return <File className="h-3 w-3" />;
}

function FileImage() {
  return <File className="h-3 w-3" />;
}

function HardDrive() {
  return <HardDriveIcon className="h-3.5 w-3.5" />;
}

function FolderOpen() {
  return <FolderOpenIcon className="h-3.5 w-3.5" />;
}

function Share2() {
  return <Share2Icon className="h-3.5 w-3.5" />;
}

function HardDriveIcon(props: React.ComponentProps<"svg">) {
  return <HardDrive {...props} />;
}

function FolderOpenIcon(props: React.ComponentProps<"svg">) {
  return <FolderOpen {...props} />;
}

function Share2Icon(props: React.ComponentProps<"svg">) {
  return <Share2 {...props} />;
}
