"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  File,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Lock,
  Menu,
  Play,
  Shield,
  ShieldCheck,
  Share2,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#060912] text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />

        <div className="absolute left-[-250px] top-[40%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-250px] right-[-200px] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#060912]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 transition duration-300 group-hover:scale-105 group-hover:shadow-blue-500/50">
              <Cloud className="h-5 w-5" />
            </div>

            <div className="text-[20px] font-bold tracking-tight">
              Cloud<span className="text-blue-400">Vault</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-9 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Security
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              About
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-300 transition hover:bg-white/[0.08] md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-white/[0.07] bg-[#080d18]/95 px-5 py-5 backdrop-blur-xl md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"
              >
                Features
              </a>

              <a
                href="#security"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"
              >
                Security
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"
              >
                How it works
              </a>

              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"
              >
                About
              </a>

              <div className="my-2 h-px bg-white/[0.07]" />

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200"
              >
                Log in
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            {/* Hero Content */}
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-medium text-blue-300 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                </span>

                Secure cloud storage, made simple
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">
                Your files,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  everywhere you go.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                Store, organize, manage and share your files securely from
                anywhere. CloudVault gives you a fast, simple and reliable
                place for everything that matters.
              </p>

              {/* CTA */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/30"
                >
                  Start for free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <a
                  href="#how-it-works"
                  className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  <Play className="h-4 w-4 fill-current text-blue-400" />
                  See how it works
                </a>
              </div>

              {/* Trust Points */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <TrustItem text="Easy to use" />
                <TrustItem text="Secure storage" />
                <TrustItem text="Fast access" />
              </div>
            </div>

            {/* Dashboard Preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST BAR
      ========================================================== */}
      <section className="border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-5 px-5 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          <TrustStat
            icon={<HardDrive className="h-5 w-5" />}
            value="100%"
            label="Cloud based"
          />

          <TrustStat
            icon={<ShieldCheck className="h-5 w-5" />}
            value="Secure"
            label="Authentication"
          />

          <TrustStat
            icon={<Zap className="h-5 w-5" />}
            value="Fast"
            label="File access"
          />

          <TrustStat
            icon={<Users className="h-5 w-5" />}
            value="Simple"
            label="File sharing"
          />
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================== */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-28">
          <SectionHeading
            eyebrow="Powerful features"
            title="Everything you need for your files"
            description="A modern cloud storage experience designed around simplicity, speed and security."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Cloud />}
              title="Cloud Storage"
              description="Keep your important files organized in one secure place and access them whenever you need."
            />

            <FeatureCard
              icon={<ShieldCheck />}
              title="Secure by Design"
              description="Authentication and protected APIs help keep your account and resources safe."
            />

            <FeatureCard
              icon={<Zap />}
              title="Fast Access"
              description="Upload, manage and access your files through a clean and responsive interface."
            />

            <FeatureCard
              icon={<FolderOpen />}
              title="Smart Organization"
              description="Keep your documents, images and other files organized with a simple folder structure."
            />

            <FeatureCard
              icon={<Share2 />}
              title="Easy Sharing"
              description="Share files with others when collaboration or quick access is needed."
            />

            <FeatureCard
              icon={<Lock />}
              title="Private & Protected"
              description="Your files stay connected to your authenticated account and protected resources."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-white/[0.07] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-28">
          <SectionHeading
            eyebrow="How it works"
            title="Simple from the very first click"
            description="Get started in minutes and keep your files accessible wherever you are."
          />

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              icon={<Users />}
              title="Create your account"
              description="Register your account and securely sign in to your CloudVault workspace."
            />

            <Step
              number="02"
              icon={<Upload />}
              title="Upload your files"
              description="Add your documents, images and other important files to your cloud storage."
            />

            <Step
              number="03"
              icon={<Share2 />}
              title="Manage & share"
              description="Organize your files and share them whenever you need to collaborate."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          SECURITY
      ========================================================== */}
      <section id="security" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Left */}
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.08]">
                <Shield className="h-7 w-7 text-blue-400" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Security first
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                Your data deserves a secure home.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                CloudVault is designed with authentication, protected APIs and
                secure database access at the core of the platform.
              </p>

              <div className="mt-8 space-y-4">
                <Bullet text="JWT based authentication" />
                <Bullet text="Google OAuth 2.0 sign in" />
                <Bullet text="Protected backend APIs" />
                <Bullet text="PostgreSQL database" />
              </div>
            </div>

            {/* Security Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <SecurityCard
                icon={<Lock />}
                title="JWT Authentication"
                description="Token-based authentication helps secure protected resources."
              />

              <SecurityCard
                icon={<ShieldCheck />}
                title="OAuth 2.0"
                description="Secure sign-in through your Google account."
              />

              <SecurityCard
                icon={<Zap />}
                title="Protected APIs"
                description="Authenticated users can access protected resources."
              />

              <SecurityCard
                icon={<HardDrive />}
                title="Reliable Database"
                description="PostgreSQL provides structured and reliable application storage."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section id="about" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8 lg:pb-28">
          <div className="relative overflow-hidden rounded-[28px] border border-blue-400/15 bg-gradient-to-br from-blue-600/20 via-blue-500/[0.08] to-violet-600/10 px-6 py-16 text-center sm:px-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[100px]" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
                <Cloud className="h-7 w-7 text-blue-300" />
              </div>

              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
                Ready to take control of your files?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Create your account and experience a cleaner, faster and more
                secure way to manage your files.
              </p>

              <Link
                href="/register"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Cloud className="h-4 w-4" />
            </div>

            <span className="font-semibold">
              Cloud<span className="text-blue-400">Vault</span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-5 text-xs text-slate-500">
            <a href="#features" className="transition hover:text-slate-300">
              Features
            </a>

            <a href="#security" className="transition hover:text-slate-300">
              Security
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-slate-300"
            >
              How it works
            </a>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} CloudVault. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   DASHBOARD PREVIEW
========================================================= */

function DashboardPreview() {
  const files = [
    {
      name: "Project Report.pdf",
      size: "2.4 MB",
      type: "pdf",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      name: "Presentation.pptx",
      size: "5.8 MB",
      type: "ppt",
      icon: <File className="h-4 w-4" />,
    },
    {
      name: "Database.sql",
      size: "1.2 MB",
      type: "sql",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      name: "Images.zip",
      size: "18.5 MB",
      type: "zip",
      icon: <FileImage className="h-4 w-4" />,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      {/* Glow */}
      <div className="absolute -inset-8 rounded-[40px] bg-blue-600/10 blur-3xl" />

      {/* Main Window */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0b1120]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {/* Window Top */}
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-4">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />

          <div className="ml-3 flex h-7 flex-1 items-center rounded-lg border border-white/[0.05] bg-white/[0.03] px-3">
            <span className="text-[9px] text-slate-600">
              app.cloudvault.com/dashboard
            </span>
          </div>
        </div>

        <div className="grid min-h-[430px] grid-cols-[145px_1fr]">
          {/* Sidebar */}
          <div className="border-r border-white/[0.07] bg-white/[0.015] p-4">
            <div className="mb-7 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <Cloud className="h-3.5 w-3.5" />
              </div>

              <span className="text-[10px] font-bold">CloudVault</span>
            </div>

            <div className="space-y-1.5">
              <SideItem active icon={<HardDrive />} text="Dashboard" />
              <SideItem icon={<Folder />} text="My Files" />
              <SideItem icon={<Share2 />} text="Shared" />
              <SideItem icon={<Zap />} text="Recent" />
              <SideItem icon={<TrashIcon />} text="Trash" />
            </div>

            <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[8px] text-slate-500">Storage</span>
                <span className="text-[8px] font-semibold text-blue-400">
                  68%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full w-[68%] rounded-full bg-blue-500" />
              </div>

              <p className="mt-2 text-[8px] text-slate-600">
                6.8 GB of 10 GB used
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] text-slate-500">Welcome back</p>
                <h3 className="mt-1 text-sm font-bold sm:text-base">
                  My Dashboard
                </h3>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10">
                <span className="text-[9px] font-bold text-blue-300">K</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
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
                icon={<HardDrive />}
                value="6.8 GB"
                label="Storage"
              />
            </div>

            {/* Files */}
            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold">Recent Files</p>

                <span className="cursor-pointer text-[8px] text-blue-400">
                  View all
                </span>
              </div>

              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 transition hover:bg-white/[0.04]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        {file.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[9px] font-medium">
                          {file.name}
                        </p>

                        <p className="mt-0.5 text-[8px] text-slate-600">
                          {file.size}
                        </p>
                      </div>
                    </div>

                    <div className="hidden h-6 w-6 items-center justify-center rounded-md bg-white/[0.03] sm:flex">
                      <span className="text-slate-500">•••</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom upload */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-blue-400/20 bg-blue-500/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-400" />
                <span className="text-[9px] text-slate-400">
                  Drag & drop files here
                </span>
              </div>

              <span className="text-[8px] font-semibold text-blue-400">
                Upload
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Security Badge */}
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#101827]/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10">
          <ShieldCheck className="h-5 w-5 text-green-400" />
        </div>

        <div>
          <p className="text-[9px] font-semibold">Your files are protected</p>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Secure authentication
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.045]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-400 transition duration-300 group-hover:scale-105 group-hover:bg-blue-500/15">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-1 text-xs font-medium text-blue-400 opacity-0 transition group-hover:opacity-100">
        Learn more
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

function SecurityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:bg-white/[0.04]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/[0.08] text-blue-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/[0.08] text-blue-400">
        {icon}
      </div>

      <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-blue-400">
        STEP {number}
      </p>

      <h3 className="mt-2 text-lg font-semibold">{title}</h3>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <CheckCircle2 className="h-4 w-4 text-green-400" />
      {text}
    </div>
  );
}

function TrustStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 border-white/[0.06] md:border-r last:border-r-0">
      <div className="text-blue-400">{icon}</div>

      <div>
        <p className="text-sm font-bold">{value}</p>
        <p className="text-[10px] text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
        <Check className="h-3 w-3 text-green-400" />
      </div>

      {text}
    </div>
  );
}

function SideItem({
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
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[9px] transition ${
        active
          ? "bg-blue-500/10 font-medium text-blue-300"
          : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
      }`}
    >
      <span className="h-3.5 w-3.5">{icon}</span>
      {text}
    </div>
  );
}

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
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="mb-2 text-blue-400">{icon}</div>

      <p className="text-sm font-bold">{value}</p>

      <p className="mt-0.5 text-[8px] text-slate-600">{label}</p>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-full w-full"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
