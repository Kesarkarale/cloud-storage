"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock3,
  Cloud,
  FolderOpen,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

type Theme = "light" | "dark";

interface DashboardShellProps {
  children: React.ReactNode;
}

interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

/* =========================================================
   AUTH TOKEN
========================================================= */

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "token",
    "accessToken",
    "jwt",
    "authToken",
    "cloudstorage_token",
    "cloud-storage-token",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

/* =========================================================
   CURRENT USER
========================================================= */

async function getCurrentUser(): Promise<UserProfile | null> {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      return null;
    }

    if (
      data.user &&
      typeof data.user === "object"
    ) {
      return data.user as UserProfile;
    }

    if (
      data.data &&
      typeof data.data === "object"
    ) {
      return data.data as UserProfile;
    }

    return data as UserProfile;
  } catch (error) {
    console.error(
      "Failed to load current user:",
      error
    );

    return null;
  }
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  name?: string,
  email?: string
): string {
  const value =
    name?.trim() ||
    email?.trim() ||
    "User";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return value
    .charAt(0)
    .toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [userLoading, setUserLoading] =
    useState(true);

  /* =======================================================
     NAVIGATION
  ======================================================= */

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
      name: "Starred",
      href: "/starred",
      icon: Star,
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

  /* =======================================================
     THEME INITIALIZATION
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "cloudvault-theme"
      );

    const initialTheme: Theme =
      savedTheme === "light"
        ? "light"
        : "dark";

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

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setUserLoading(true);

      const currentUser =
        await getCurrentUser();

      if (active) {
        setUser(currentUser);
        setUserLoading(false);
      }
    }

    if (mounted) {
      loadUser();
    }

    return () => {
      active = false;
    };
  }, [mounted]);

  /* =======================================================
     CLOSE DROPDOWNS ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     THEME
  ======================================================= */

  function changeTheme(
    nextTheme: Theme
  ) {
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

  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    const possibleKeys = [
      "token",
      "accessToken",
      "jwt",
      "authToken",
      "cloudstorage_token",
      "cloud-storage-token",
    ];

    possibleKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    setUser(null);
    setProfileOpen(false);

    window.location.href = "/login";
  }

  /* =======================================================
     ACTIVE NAV
  ======================================================= */

  function isActive(
    href: string
  ) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  /* =======================================================
     USER DISPLAY
  ======================================================= */

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const displayEmail =
    user?.email ||
    "CloudVault Account";

  const initials = useMemo(
    () =>
      getInitials(
        user?.name,
        user?.email
      ),
    [user?.name, user?.email]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-white">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          flex-col
          border-r
          border-slate-200
          bg-white
          shadow-xl
          shadow-slate-900/5
          transition-transform
          duration-300
          dark:border-white/[0.07]
          dark:bg-[#090e19]
          dark:shadow-black/30
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-white/[0.07]">

          <Link
            href="/dashboard"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Cloud className="h-5 w-5" />

              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#090e19]" />
            </div>

            <div>
              <p className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">
                Cloud
                <span className="text-blue-600 dark:text-blue-400">
                  Vault
                </span>
              </p>

              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Cloud Storage
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={`
                    group
                    relative
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/[0.12] dark:text-blue-400"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }
                  `}
                >
                  {active && (
                    <span className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex h-9 w-9 items-center justify-center rounded-lg transition
                        ${
                          active
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                            : "text-slate-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400"
                        }
                      `}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>

                    <span>
                      {item.name}
                    </span>
                  </div>

                  {active ? (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="my-7 h-px bg-slate-200 dark:bg-white/[0.07]" />

          {/* ACCOUNT */}

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Account
          </p>

          <Link
            href="/settings"
            onClick={() =>
              setSidebarOpen(false)
            }
            className={`
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              transition
              ${
                isActive("/settings")
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              }
            `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <Settings className="h-[18px] w-[18px] group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>

            <span>Settings</span>
          </Link>

          {/* SECURITY */}

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-500/10 dark:bg-emerald-500/[0.06]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Secure Storage
              </span>
            </div>

            <p className="mt-1.5 text-[10px] leading-4 text-emerald-700/70 dark:text-emerald-400/60">
              Your files are protected and securely stored.
            </p>
          </div>
        </nav>

        {/* ===================================================
            STORAGE
        =================================================== */}

        <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.035]">

          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                Storage
              </p>

              <p className="text-[10px] text-slate-400">
                3.8 GB of 10 GB
              </p>
            </div>

            <span className="ml-auto text-[11px] font-bold text-blue-600 dark:text-blue-400">
              38%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
              style={{
                width: "38%",
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              6.2 GB remaining
            </p>

            <Link
              href="/settings"
              className="text-[10px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Manage
            </Link>
          </div>
        </div>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div className="shrink-0 border-t border-slate-200 p-4 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/[0.08] dark:hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[18px] transition group-hover:translate-x-0.5" />

            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="lg:pl-[280px]">

        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#070b14]/90">

          <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* SEARCH */}

            <div className="hidden max-w-md flex-1 md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search files, folders..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.07] dark:bg-white/[0.035] dark:text-white dark:focus:border-blue-500/50 dark:focus:bg-white/[0.05]"
                />

                <div className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 lg:block dark:border-white/10">
                  ⌘ K
                </div>
              </div>
            </div>

            {/* MOBILE SEARCH */}

            <button
              type="button"
              onClick={() =>
                setSearchOpen(!searchOpen)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            <div className="ml-auto flex items-center gap-2">

              {/* UPLOAD */}

              <Link
                href="/files?upload=true"
                className="hidden h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 sm:flex"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Link>

              {/* THEME */}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
              >
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-amber-400" />
                ) : (
                  <Sun className="h-4 w-4 text-blue-500" />
                )}
              </button>

              {/* NOTIFICATIONS */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(
                      !notificationsOpen
                    );
                    setProfileOpen(false);
                  }}
                  aria-label="Notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                >
                  <Bell className="h-4 w-4" />

                  <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#070b14]" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#101622]">

                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Notifications
                      </p>

                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        1 new
                      </span>
                    </div>

                    <div className="p-2">
                      <div className="flex gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-white/5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                          <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">
                            File uploaded successfully
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Your recent upload is now available.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(
                      !profileOpen
                    );
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <div className="hidden text-right sm:block">
                    {userLoading ? (
                      <>
                        <div className="ml-auto h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/10" />

                        <div className="mt-1.5 ml-auto h-2.5 w-32 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                      </>
                    ) : (
                      <>
                        <p className="max-w-[160px] truncate text-xs font-bold text-slate-800 dark:text-white">
                          {displayName}
                        </p>

                        <p className="max-w-[190px] truncate text-[10px] text-slate-400">
                          {displayEmail}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-600/20">
                    {userLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      initials
                    )}
                  </div>

                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#101622]">

                    <div className="border-b border-slate-200 p-4 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {displayName}
                          </p>

                          <p className="truncate text-[10px] text-slate-400">
                            {displayEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">

                      <Link
                        href="/settings"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>

                      <div className="my-1 h-px bg-slate-200 dark:bg-white/10" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE SEARCH PANEL */}

          {searchOpen && (
            <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#090e19] md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  autoFocus
                  type="text"
                  placeholder="Search files, folders..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
          )}
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="min-h-[calc(100vh-76px)] bg-slate-50 transition-colors duration-300 dark:bg-[#070b14]">
          {children}
        </main>
      </div>
    </div>
  );
}
