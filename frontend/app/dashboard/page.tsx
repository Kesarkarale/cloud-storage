"use client";

import {
  Activity,
  ArrowRight,
  Clock3,
  FileArchive,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Share2,
  Upload,
  Users,
} from "lucide-react";

import DashboardShell from "@/app/components/DashboardShell";
import StorageCard from "@/app/components/StorageCard";
import FileCard from "@/app/components/FileCard";

type FileItem = {
  name: string;
  type: string;
  size: string;
  updated: string;
  starred?: boolean;
};

const recentFiles: FileItem[] = [
  {
    name: "Project Report.pdf",
    type: "application/pdf",
    size: "2.4 MB",
    updated: "2 hours ago",
    starred: true,
  },
  {
    name: "Presentation.pptx",
    type: "application/vnd.ms-powerpoint",
    size: "8.7 MB",
    updated: "5 hours ago",
  },
  {
    name: "Vacation Photos.zip",
    type: "application/zip",
    size: "124 MB",
    updated: "Yesterday",
    starred: true,
  },
  {
    name: "Profile Image.png",
    type: "image/png",
    size: "1.8 MB",
    updated: "Yesterday",
  },
];

const folders = [
  {
    name: "Documents",
    count: "24 files",
    icon: FileText,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    name: "Images",
    count: "46 files",
    icon: ImageIcon,
    iconClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
  {
    name: "Projects",
    count: "18 files",
    icon: FolderOpen,
    iconClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    name: "Archives",
    count: "12 files",
    icon: FileArchive,
    iconClass:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  },
];

const activities = [
  {
    title: "Project Report.pdf",
    description: "Uploaded to Documents",
    time: "2 hours ago",
    icon: Upload,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Vacation Photos.zip",
    description: "Shared with 2 people",
    time: "Yesterday",
    icon: Share2,
    iconClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
  {
    title: "Presentation.pptx",
    description: "Updated recently",
    time: "Yesterday",
    icon: Activity,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} transition-transform duration-300 group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6 pb-8">
        {/* =====================================================
            WELCOME HEADER
        ====================================================== */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-purple-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                CloudVault Dashboard
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Welcome back 👋
              </h1>

              <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Manage your files, folders and shared documents from one
                secure place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <FolderPlus className="h-4 w-4" />
                New Folder
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            title="Total Files"
            value="128"
            description="12 added this month"
            icon={FileText}
            iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />

          <StatCard
            title="Folders"
            value="24"
            description="4 created this month"
            icon={Folder}
            iconClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
          />

          <StatCard
            title="Shared Files"
            value="18"
            description="6 people have access"
            icon={Users}
            iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
          />

          <StatCard
            title="Images"
            value="46"
            description="800 MB used"
            icon={ImageIcon}
            iconClass="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400"
          />
        </section>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Storage */}
          <div className="xl:col-span-1">
            <StorageCard />
          </div>

          {/* Folders */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Your folders
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Quickly access your important folders
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {folders.map((folder) => {
                const Icon = folder.icon;

                return (
                  <button
                    type="button"
                    key={folder.name}
                    className="group rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${folder.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                      {folder.name}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {folder.count}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            RECENT FILES + ACTIVITY
        ====================================================== */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Files */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent files
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Files you recently uploaded or edited
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recentFiles.map((file) => (
                <FileCard
                  key={file.name}
                  file={file}
                />
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent activity
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest actions on your account
                </p>
              </div>

              <Clock3 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-5 space-y-5">
              {activities.map((activity, index) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.title}
                    className="relative flex gap-3"
                  >
                    {index !== activities.length - 1 && (
                      <div className="absolute left-4 top-9 h-7 w-px bg-slate-200 dark:bg-white/10" />
                    )}

                    <div
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.iconClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-white">
                        {activity.title}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {activity.description}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {activity.time}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label={`More options for ${activity.title}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              View activity
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* =====================================================
            QUICK ACTION
        ====================================================== */}
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-500/20 dark:bg-blue-500/[0.06]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <CloudIcon />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Keep your files organized
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Create folders and move your files to keep everything easy
                  to find.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create folder
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function CloudIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9" />
      <path d="M16 16a5 5 0 1 0-4.9-6.02" />
      <path d="M16 16h.01" />
    </svg>
  );
}
