"use client";

import {
  Bell,
  Menu,
  Search,
  UserCircle,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type Props = {
  onMenuClick: () => void;
};

export default function DashboardHeader({
  onMenuClick,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Search files and folders..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
          </button>

          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 sm:flex">
            <UserCircle className="h-7 w-7 text-slate-500 dark:text-slate-300" />

            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                User
              </p>
              <p className="text-[10px] text-slate-400">
                Personal account
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
