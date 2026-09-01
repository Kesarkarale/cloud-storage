"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  Files,
  FolderOpen,
  HardDrive,
  Clock3,
  Star,
  Share2,
  Trash2,
  Settings,
  LogOut,
  X,
} from "lucide-react";

type Props = {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

const menu = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HardDrive,
  },
  {
    label: "My Files",
    href: "/files",
    icon: Files,
  },
  {
    label: "Recent",
    href: "/recent",
    icon: Clock3,
  },
  {
    label: "Starred",
    href: "/starred",
    icon: Star,
  },
  {
    label: "Shared",
    href: "/shared",
    icon: Share2,
  },
  {
    label: "Trash",
    href: "/trash",
    icon: Trash2,
  },
];

export default function DashboardSidebar({
  mobileOpen,
  setMobileOpen,
}: Props) {
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[270px]
          flex-col border-r border-slate-200 bg-white
          transition-transform duration-300
          dark:border-white/10 dark:bg-slate-950
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Cloud className="h-5 w-5 text-white" />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cloud<span className="text-blue-500">Vault</span>
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-6">
          <Link
            href="/files?upload=true"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <span className="text-xl leading-none">+</span>
            Upload Files
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-3 text-sm
                    font-medium transition
                    ${
                      active
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className="h-[19px] w-[19px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Account
          </p>

          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={`
              flex items-center gap-3 rounded-xl px-3 py-3 text-sm
              font-medium transition
              ${
                pathname.startsWith("/settings")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              }
            `}
          >
            <Settings className="h-[19px] w-[19px]" />
            Settings
          </Link>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Storage
              </span>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                2.4 GB / 10 GB
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full w-[24%] rounded-full bg-blue-600" />
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              7.6 GB available
            </p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
