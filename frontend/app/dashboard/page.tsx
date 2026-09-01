"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Share2,
  Upload,
} from "lucide-react";

import DashboardShell from "../components/DashboardShell";
import StorageCard from "../components/StorageCard";
import FileCard from "../components/FileCard";

const recentFiles = [
  {
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    updated: "Today",
    starred: true,
  },
  {
    name: "Presentation.pptx",
    type: "document",
    size: "5.8 MB",
    updated: "Yesterday",
  },
  {
    name: "Database.sql",
    type: "sql",
    size: "1.2 MB",
    updated: "2 days ago",
  },
  {
    name: "Images.zip",
    type: "zip",
    size: "18.5 MB",
    updated: "3 days ago",
    starred: true,
  },
];

const folders = [
  {
    name: "Documents",
    files: "24 files",
    color: "blue",
  },
  {
    name: "Projects",
    files: "18 files",
    color: "purple",
  },
  {
    name: "Images",
    files: "46 files",
    color: "orange",
  },
  {
    name: "Work",
    files: "31 files",
    color: "green",
  },
];

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Welcome */}
        <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              CloudVault Workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Welcome back 👋
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage your files, folders and shared documents from one place.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/files?new-folder=true"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Link>

            <Link
              href="/files?upload=true"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Files"
            value="128"
            subtitle="+12 this month"
            icon={<FileText />}
          />

          <StatCard
            title="Folders"
            value="24"
            subtitle="4 created this month"
            icon={<Folder />}
          />

          <StatCard
            title="Shared Files"
            value="18"
            subtitle="6 people have access"
            icon={<Share2 />}
          />

          <StatCard
            title="Images"
            value="46"
            subtitle="800 MB used"
            icon={<ImageIcon />}
          />
        </section>

        {/* Main Grid */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* Left */}
          <div className="space-y-6">

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Quick actions
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Common actions for managing your cloud files
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <QuickAction
                  href="/files?upload=true"
                  icon={<Upload />}
                  title="Upload files"
                  description="Add new files"
                />

                <QuickAction
                  href="/files?new-folder=true"
                  icon={<FolderPlus />}
                  title="New folder"
                  description="Organize your files"
                />

                <QuickAction
                  href="/shared"
                  icon={<Share2 />}
                  title="Shared files"
                  description="View shared content"
                />
              </div>
            </div>

            {/* Folders */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    My Folders
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Organize your files
                  </p>
                </div>

                <Link
                  href="/files"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {folders.map((folder) => (
                  <Link
                    key={folder.name}
                    href={`/files?folder=${encodeURIComponent(
                      folder.name
                    )}`}
                    className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30 dark:hover:bg-blue-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                        <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>

                      <button
                        onClick={(e) => e.preventDefault()}
                        className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-white group-hover:opacity-100 dark:hover:bg-white/10"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-4 truncate text-sm font-semibold text-slate-800 dark:text-white">
                      {folder.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {folder.files}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent files */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Recent Files
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Your recently modified files
                  </p>
                </div>

                <Link
                  href="/recent"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400"
                >
                  View all
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {recentFiles.map((file) => (
                  <FileCard
                    key={file.name}
                    file={file}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <StorageCard />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
                  <Share2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Shared with you
                  </h3>

                  <p className="text-xs text-slate-400">
                    6 files from others
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Design Document.pdf",
                  "Team Presentation.pptx",
                  "Project Assets.zip",
                ].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
                        <FileText className="h-4 w-4 text-blue-500" />
                      </div>

                      <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                        {name}
                      </span>
                    </div>

                    <span className="ml-2 text-[10px] text-slate-400">
                      Shared
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/shared"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Open Shared Files
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <CloudIcon />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Your files, always available.
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Securely store, organize and access your files from anywhere.
              </p>

              <Link
                href="/files"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Open My Files
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
    </Link>
  );
}

function CloudIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9H17a5 5 0 0 1 .5 9Z" />
    </svg>
  );
}
