"use client";

import Link from "next/link";
import {
  Cloud,
  ShieldCheck,
  Zap,
  Lock,
  FolderOpen,
  Share2,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Cloud className="h-6 w-6" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Cloud<span className="text-blue-400">Vault</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#security"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Security
            </a>

            <a
              href="#about"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              About
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-300 md:hidden"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-white/10 px-6 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMenuOpen(false)}>
                Features
              </a>

              <a href="#security" onClick={() => setMenuOpen(false)}>
                Security
              </a>

              <a href="#about" onClick={() => setMenuOpen(false)}>
                About
              </a>

              <Link
                href="/login"
                className="rounded-lg border border-white/10 px-4 py-3 text-center"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Secure cloud storage for everyone
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Your files.
              <br />
              <span className="text-blue-400">Anywhere.</span>
              <br />
              Anytime.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              Store, manage, and access your files securely from anywhere.
              CloudVault gives you a simple, reliable and modern cloud storage
              experience.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Start for Free
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold transition hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Easy to use
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Secure storage
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Fast access
              </div>
            </div>
          </div>

          {/* Right Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-blue-600/20 blur-3xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl">
              {/* Browser Header */}
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />

                <div className="ml-4 h-8 flex-1 rounded-lg bg-white/5" />
              </div>

              {/* Fake Dashboard */}
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="mb-6 flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-bold">CloudVault</span>
                  </div>

                  <div className="space-y-3 text-[10px] text-slate-400">
                    <div className="rounded-lg bg-blue-600/20 px-2 py-2 text-blue-300">
                      Dashboard
                    </div>
                    <div>My Files</div>
                    <div>Shared</div>
                    <div>Recent</div>
                    <div>Trash</div>
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Welcome back</p>
                      <p className="font-semibold">My Dashboard</p>
                    </div>

                    <div className="h-8 w-8 rounded-full bg-blue-500/30" />
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <FolderOpen className="mb-2 h-5 w-5 text-blue-400" />
                      <p className="text-lg font-bold">128</p>
                      <p className="text-[9px] text-slate-400">Files</p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <Share2 className="mb-2 h-5 w-5 text-purple-400" />
                      <p className="text-lg font-bold">24</p>
                      <p className="text-[9px] text-slate-400">Shared</p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <ShieldCheck className="mb-2 h-5 w-5 text-green-400" />
                      <p className="text-lg font-bold">98%</p>
                      <p className="text-[9px] text-slate-400">Secure</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-4 text-xs font-semibold">
                      Recent Files
                    </p>

                    <div className="space-y-3">
                      {[
                        ["Project Report.pdf", "2.4 MB"],
                        ["Presentation.pptx", "5.8 MB"],
                        ["Database.sql", "1.2 MB"],
                        ["Images.zip", "18.5 MB"],
                      ].map(([name, size]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                              <FolderOpen className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <span className="text-[10px]">{name}</span>
                          </div>

                          <span className="text-[9px] text-slate-500">
                            {size}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Powerful Features
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Everything you need to manage your files
            </h2>

            <p className="mt-4 text-slate-400">
              A clean and powerful cloud storage platform designed to make
              file management simple.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Cloud />}
              title="Cloud Storage"
              description="Store your important files securely in the cloud and access them whenever you need."
            />

            <Feature
              icon={<ShieldCheck />}
              title="Secure"
              description="Your files and account are protected using modern authentication and security practices."
            />

            <Feature
              icon={<Zap />}
              title="Fast Access"
              description="Quickly upload, manage and access your files with a responsive experience."
            />

            <Feature
              icon={<Share2 />}
              title="File Sharing"
              description="Share files easily and collaborate with others whenever required."
            />
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
              <Lock className="h-7 w-7 text-blue-400" />
            </div>

            <h2 className="text-3xl font-bold sm:text-4xl">
              Built with security in mind
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              CloudVault uses authentication, protected APIs and secure
              database access to keep your files and account protected.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SecurityCard
              title="JWT Authentication"
              description="Secure token-based authentication for protected APIs."
            />

            <SecurityCard
              title="OAuth 2.0"
              description="Sign in securely using your Google account."
            />

            <SecurityCard
              title="Protected APIs"
              description="Authenticated users can access protected resources."
            />

            <SecurityCard
              title="PostgreSQL"
              description="Reliable relational database for application data."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Ready to store your files smarter?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Create your account and experience a simple, secure and modern
            cloud storage platform.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            <span>CloudVault</span>
          </div>

          <p>
            © {new Date().getFullYear()} CloudVault. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function SecurityCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <h3 className="font-semibold">{title}</h3>
      </div>

      <p className="text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}