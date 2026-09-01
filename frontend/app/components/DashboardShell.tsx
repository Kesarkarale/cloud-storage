"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Cloud,
  LayoutDashboard,
  FolderOpen,
  Share2,
  Clock3,
  Trash2,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

type Theme = "light" | "dark";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] =
    useState<Theme>("dark");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("cloudvault-theme") as
        | Theme
        | null;

    const initialTheme =
      savedTheme || "dark";

    setTheme(initialTheme);

    if (initialTheme === "dark") {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }
  }, []);

  function changeTheme(nextTheme: Theme) {
    setTheme(nextTheme);

    localStorage.setItem(
      "cloudvault-theme",
      nextTheme
    );

    if (nextTheme === "dark") {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }
  }

  function toggleTheme() {
    changeTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem(
      "cloudvault-theme"
    );

    window.location.href = "/login";
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Files",
      href: "/files",
      icon: FolderOpen,
    },
    {
      name: "Shared Files",
      href: "/shared",
      icon: Share2,
    },
    {
      name: "Recent",
      href: "/recent",
      icon: Clock3,
    },
    {
      name: "Trash",
      href: "/trash",
      icon: Trash2,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* ============================= */}
      {/* MOBILE OVERLAY */}
      {/* ============================= */}

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ============================= */}
      {/* SIDEBAR */}
      {/* ============================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-slate-950 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Cloud className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Cloud
                <span className="text-blue-600 dark:text-blue-400">
                  Vault
                </span>
              </p>

              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Cloud Storage
              </p>
            </div>
          </Link>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <Icon className="h-5 w-5 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" />

                <span>
                  {item.name}
                </span>
              </Link>
            );
          })}

          <div className="my-6 h-px bg-slate-200 dark:bg-white/10" />

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Account
          </p>

          <Link
            href="/settings"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Settings className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            Settings
          </Link>
        </nav>

        {/* Storage */}

        <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Storage
            </span>

            <span className="text-xs text-slate-400">
              38%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: "38%",
              }}
            />
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            3.8 GB of 10 GB used
          </p>
        </div>

        {/* Logout */}

        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ============================= */}
      {/* MAIN */}
      {/* ============================= */}

      <div className="lg:pl-72">

        {/* TOPBAR */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">

          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* Mobile menu */}

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden lg:block" />

            {/* Right */}

            <div className="ml-auto flex items-center gap-3">

              {/* Theme */}

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="hidden sm:block">
                      Light
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-blue-600" />
                    <span className="hidden sm:block">
                      Dark
                    </span>
                  </>
                )}
              </button>

              {/* User */}

              <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-white/10">

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    User
                  </p>

                  <p className="text-xs text-slate-400">
                    CloudVault Account
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}

        <main className="min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
