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
  ChevronRight,
  HardDrive,
} from "lucide-react";

type Theme = "light" | "dark";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* =========================================
     THEME INITIALIZATION
  ========================================= */

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem("cloudvault-theme");

    const initialTheme: Theme =
      savedTheme === "light" ? "light" : "dark";

    setTheme(initialTheme);

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  /* =========================================
     CHANGE THEME
  ========================================= */

  function changeTheme(nextTheme: Theme) {
    setTheme(nextTheme);

    localStorage.setItem(
      "cloudvault-theme",
      nextTheme
    );

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    changeTheme(
      theme === "dark" ? "light" : "dark"
    );
  }

  /* =========================================
     LOGOUT
  ========================================= */

  function handleLogout() {
    localStorage.removeItem("token");

    window.location.href = "/login";
  }

  /* =========================================
     NAVIGATION
  ========================================= */

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

  /* =========================================
     PREVENT THEME FLICKER
  ========================================= */

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* =====================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-72
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-transform
          duration-300
          dark:border-white/10
          dark:bg-slate-950
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ===================================
            LOGO
        ==================================== */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">

          <Link
            href="/dashboard"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Cloud className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Cloud
                <span className="text-blue-600 dark:text-blue-400">
                  Vault
                </span>
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Cloud Storage
              </p>
            </div>
          </Link>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ===================================
            NAVIGATION
        ==================================== */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                    dark:text-slate-400
                    dark:hover:bg-white/5
                    dark:hover:text-white
                  "
                >

                  <div className="flex items-center gap-3">

                    <Icon
                      className="
                        h-5
                        w-5
                        transition
                        group-hover:text-blue-600
                        dark:group-hover:text-blue-400
                      "
                    />

                    <span>{item.name}</span>
                  </div>

                  <ChevronRight
                    className="
                      h-4
                      w-4
                      opacity-0
                      transition
                      group-hover:translate-x-0.5
                      group-hover:opacity-100
                    "
                  />
                </Link>
              );
            })}
          </div>

          {/* Divider */}

          <div className="my-7 h-px bg-slate-200 dark:bg-white/10" />

          {/* Account */}

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Account
          </p>

          <Link
            href="/settings"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-slate-600
              transition
              hover:bg-slate-100
              hover:text-slate-900
              dark:text-slate-400
              dark:hover:bg-white/5
              dark:hover:text-white
            "
          >
            <Settings className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />

            <span>Settings</span>
          </Link>
        </nav>

        {/* ===================================
            STORAGE CARD
        ==================================== */}

        <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">

          <div className="mb-3 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
              <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                Storage
              </p>

              <p className="text-[10px] text-slate-400">
                3.8 GB of 10 GB
              </p>
            </div>

            <span className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400">
              38%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: "38%",
              }}
            />
          </div>

          <p className="mt-2 text-[10px] text-slate-400">
            6.2 GB remaining
          </p>
        </div>

        {/* ===================================
            LOGOUT
        ==================================== */}

        <div className="shrink-0 border-t border-slate-200 p-4 dark:border-white/10">

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-slate-500
              transition
              hover:bg-red-50
              hover:text-red-600
              dark:text-slate-400
              dark:hover:bg-red-500/10
              dark:hover:text-red-400
            "
          >
            <LogOut className="h-5 w-5" />

            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <div className="lg:pl-72">

        {/* ===================================
            TOP NAVBAR
        ==================================== */}

        <header className="
          sticky
          top-0
          z-30
          border-b
          border-slate-200
          bg-white/90
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-slate-950/90
        ">

          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* Mobile Menu */}

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                p-2.5
                text-slate-600
                shadow-sm
                transition
                hover:bg-slate-50
                dark:border-white/10
                dark:bg-white/5
                dark:text-slate-300
                dark:hover:bg-white/10
                lg:hidden
              "
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Empty Space */}

            <div className="hidden lg:block" />

            {/* Right Side */}

            <div className="ml-auto flex items-center gap-3">

              {/* =================================
                  THEME BUTTON
              ================================== */}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-50
                  dark:border-white/10
                  dark:bg-white/5
                  dark:text-slate-300
                  dark:hover:bg-white/10
                "
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

              {/* =================================
                  USER PROFILE
              ================================== */}

              <div className="
                flex
                items-center
                gap-3
                border-l
                border-slate-200
                pl-3
                dark:border-white/10
              ">

                <div className="hidden text-right sm:block">

                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    User
                  </p>

                  <p className="text-[11px] text-slate-400">
                    CloudVault Account
                  </p>
                </div>

                <div className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                ">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================
            PAGE CONTENT
        ==================================== */}

        <main className="min-h-[calc(100vh-5rem)] bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
