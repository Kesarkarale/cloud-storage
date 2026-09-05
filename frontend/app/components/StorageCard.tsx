"use client";

import {
  Cloud,
  FileText,
  Image as ImageIcon,
  Video,
  ArrowUpRight,
  HardDrive,
} from "lucide-react";

const storageItems = [
  {
    label: "Documents",
    value: "1.1 GB",
    percentage: 46,
    icon: FileText,
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Images",
    value: "800 MB",
    percentage: 33,
    icon: ImageIcon,
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    label: "Videos",
    value: "500 MB",
    percentage: 21,
    icon: Video,
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];

export default function StorageCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/10" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Storage usage
            </p>

            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              Healthy
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              2.4 GB
            </h3>

            <span className="text-xs text-slate-400">
              of 10 GB
            </span>
          </div>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105 dark:bg-blue-500/10 dark:ring-blue-500/20">
          <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Storage progress */}
      <div className="relative mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            24% used
          </span>

          <span className="text-slate-400">
            7.6 GB available
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: "24%" }}
          />
        </div>
      </div>

      {/* Storage categories */}
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {storageItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${item.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>

              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                {item.value}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {item.label}
              </p>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full ${item.iconColor.replace(
                    "text-",
                    "bg-"
                  )}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5">
            <HardDrive className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          </div>

          <div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Cloud storage
            </p>
            <p className="text-[10px] text-slate-400">
              10 GB plan
            </p>
          </div>
        </div>

        <button
          type="button"
          className="group/manage flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          Manage
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/manage:-translate-y-0.5 group-hover/manage:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
