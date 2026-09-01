"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Cloud,
  LayoutDashboard,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Share2,
  Star,
  Trash2,
  Clock3,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  Upload,
  MoreHorizontal,
  Download,
  Users,
  HardDrive,
  ChevronDown,
  Menu,
  X,
  File,
  Grid2X2,
  List,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

type FileItem = {
  name: string;
  type: string;
  size: string;
  modified: string;
  shared?: boolean;
};

const recentFiles: FileItem[] = [
  {
    name: "Project Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    modified: "Today, 10:32 AM",
  },
  {
    name: "Cloud Storage Presentation.pptx",
    type: "PPT",
    size: "5.8 MB",
    modified: "Today, 09:18 AM",
    shared: true,
  },
  {
    name: "Database Backup.sql",
    type: "SQL",
    size: "1.2 MB",
    modified: "Yesterday",
  },
  {
    name: "Project Images.zip",
    type: "ZIP",
    size: "18.5 MB",
    modified: "Yesterday",
    shared: true,
  },
  {
    name: "Internship Documentation.docx",
    type: "DOC",
    size: "3.1 MB",
    modified: "Aug 28, 2026",
  },
];

const folders = [
  {
    name: "Projects",
    files: "24 files",
  },
  {
    name: "Documents",
    files: "38 files",
  },
  {
    name: "Images",
    files: "56 files",
  },
  {
    name: "Work",
    files: "17 files",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const filteredFiles = recentFiles.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-slate-900 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Cloud className="h-6 w-6" />
            </div>

            <div>
              <p className="text-lg font-bold">
                Cloud<span className="text-blue-600">Vault</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Secure Cloud Storage
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboard />}
              label="Dashboard"
              active
            />

            <SidebarItem icon={<Folder />} label="My Files" />

            <SidebarItem icon={<Clock3 />} label="Recent" />

            <SidebarItem icon={<Star />} label="Starred" />

            <SidebarItem icon={<Share2 />} label="Shared with me" />
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Library
          </p>

          <nav className="space-y-1">
            <SidebarItem icon={<ImageIcon />} label="Photos" />

            <SidebarItem icon={<Video />} label="Videos" />

            <SidebarItem icon={<FileText />} label="Documents" />

            <SidebarItem icon={<Music />} label="Audio" />
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <nav className="space-y-1">
            <SidebarItem icon={<Settings />} label="Settings" />

            <SidebarItem icon={<Trash2 />} label="Trash" />
          </nav>
        </div>

        {/* Storage */}
        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold">
                  Storage
                </span>
              </div>

              <span className="text-[10px] text-slate-400">
                68%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full w-[68%] rounded-full bg-blue-600" />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>6.8 GB used</span>
              <span>10 GB</span>
            </div>

            <button className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium transition hover:bg-white dark:border-white/10 dark:hover:bg-white/5">
              Manage Storage
            </button>
          </div>

          <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
          <div className="flex h-20 items-center gap-4 px-5 sm:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files and folders..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5"
              />
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5">
                <Bell className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    K
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold">Kesar</p>
                    <p className="text-[10px] text-slate-400">
                      User Account
                    </p>
                  </div>

                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>

                {showProfile && (
                  <div className="absolute right-0 top-14 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    <Link
                      href="/dashboard"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/dashboard"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Account Settings
                    </Link>

                    <div className="my-1 border-t border-slate-200 dark:border-white/10" />

                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="px-5 py-8 sm:px-8">
          {/* Welcome */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Sunday, August 30, 2026
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, Kesar 👋
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what&apos;s happening with your cloud storage.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <Upload className="h-4 w-4" />
                Upload
              </button>

              <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
                <Plus className="h-4 w-4" />
                New Folder
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<HardDrive />}
              title="Storage Used"
              value="6.8 GB"
              subtitle="of 10 GB"
              progress={68}
            />

            <StatCard
              icon={<File />}
              title="Total Files"
              value="128"
              subtitle="+12 this month"
            />

            <StatCard
              icon={<Share2 />}
              title="Shared Files"
              value="24"
              subtitle="8 people"
            />

            <StatCard
              icon={<Star />}
              title="Starred"
              value="17"
              subtitle="Important files"
            />
          </div>

          {/* Storage Overview */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Storage Overview</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Your current storage usage
                  </p>
                </div>

                <button className="flex items-center gap-1 text-xs font-medium text-blue-600">
                  Details
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
                {/* Circle */}
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-3xl font-bold">68%</p>
                    <p className="text-xs text-slate-400">Used</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-5">
                  <StorageRow
                    icon={<FileText />}
                    label="Documents"
                    size="2.4 GB"
                    percent="35%"
                  />

                  <StorageRow
                    icon={<ImageIcon />}
                    label="Images"
                    size="1.8 GB"
                    percent="26%"
                  />

                  <StorageRow
                    icon={<Video />}
                    label="Videos"
                    size="1.6 GB"
                    percent="23%"
                  />

                  <StorageRow
                    icon={<File />}
                    label="Other files"
                    size="1.0 GB"
                    percent="16%"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="font-semibold">Quick Actions</h2>

              <p className="mt-1 text-xs text-slate-400">
                Manage your files quickly
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <QuickAction
                  icon={<Upload />}
                  label="Upload File"
                />

                <QuickAction
                  icon={<Folder />}
                  label="New Folder"
                />

                <QuickAction
                  icon={<Share2 />}
                  label="Share File"
                />

                <QuickAction
                  icon={<Star />}
                  label="Starred"
                />
              </div>

              <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Everything is secure
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Your files are protected with secure authentication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Folders */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Your Folders</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Quickly access your folders
                </p>
              </div>

              <button className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    <Folder className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {folder.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {folder.files}
                    </p>
                  </div>

                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </button>
              ))}
            </div>
          </section>

          {/* Recent Files */}
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Recent Files</h2>

                <p className="mt-1 text-xs text-slate-400">
                  Files you recently accessed
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("list")}
                  className={`rounded-lg p-2 ${
                    view === "list"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                      : "text-slate-400"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setView("grid")}
                  className={`rounded-lg p-2 ${
                    view === "grid"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                      : "text-slate-400"
                  }`}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>

                <button className="ml-2 text-sm font-medium text-blue-600">
                  View all
                </button>
              </div>
            </div>

            {view === "list" ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                {/* Table Header */}
                <div className="hidden grid-cols-[1fr_100px_120px_50px] border-b border-slate-200 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-white/10 sm:grid">
                  <span>Name</span>
                  <span>Size</span>
                  <span>Modified</span>
                  <span />
                </div>

                {filteredFiles.map((file) => (
                  <FileRow key={file.name} file={file} />
                ))}

                {filteredFiles.length === 0 && (
                  <div className="p-10 text-center text-sm text-slate-400">
                    No files found.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFiles.map((file) => (
                  <FileGrid key={file.name} file={file} />
                ))}
              </div>
            )}
          </section>

          {/* Activity */}
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Recent Activity</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Your latest actions
                  </p>
                </div>

                <button className="text-xs font-medium text-blue-600">
                  See all
                </button>
              </div>

              <div className="space-y-5">
                <Activity
                  icon={<Upload />}
                  title="Project Report.pdf uploaded"
                  time="10 minutes ago"
                />

                <Activity
                  icon={<Share2 />}
                  title="Presentation.pptx shared"
                  time="1 hour ago"
                />

                <Activity
                  icon={<Download />}
                  title="Database Backup.sql downloaded"
                  time="Yesterday"
                />

                <Activity
                  icon={<Folder />}
                  title="Projects folder created"
                  time="Aug 28, 2026"
                />
              </div>
            </div>

            {/* Shared */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Shared Files</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Files shared with others
                  </p>
                </div>

                <Users className="h-5 w-5 text-slate-400" />
              </div>

              <div className="space-y-4">
                <SharedFile
                  name="Cloud Storage Presentation.pptx"
                  person="Team Members"
                />

                <SharedFile
                  name="Project Images.zip"
                  person="Internship Team"
                />

                <SharedFile
                  name="Project Report.pdf"
                  person="Supervisor"
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 border-t border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-white/10">
            © 2026 CloudVault. Secure cloud storage platform.
          </footer>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Components ---------------- */

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      {label}
    </button>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  progress,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>

        <MoreHorizontal className="h-5 w-5 text-slate-300" />
      </div>

      <p className="mt-5 text-xs text-slate-400">{title}</p>

      <div className="mt-1 flex items-end gap-2">
        <p className="text-2xl font-bold">{value}</p>
        <span className="mb-1 text-[10px] text-slate-400">
          {subtitle}
        </span>
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StorageRow({
  icon,
  label,
  size,
  percent,
}: {
  icon: React.ReactNode;
  label: string;
  size: string;
  percent: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-medium">{label}</span>
          <span className="text-slate-400">
            {size}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: percent }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-center transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10">
      <span className="text-blue-600 dark:text-blue-400">
        {icon}
      </span>

      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type === "PDF") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
        <FileText className="h-5 w-5" />
      </div>
    );
  }

  if (type === "PPT") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
        <FileText className="h-5 w-5" />
      </div>
    );
  }

  if (type === "SQL") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-500/10">
        <File className="h-5 w-5" />
      </div>
    );
  }

  if (type === "ZIP") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
        <Folder className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5">
      <FileText className="h-5 w-5" />
    </div>
  );
}

function FileRow({ file }: { file: FileItem }) {
  return (
    <div className="group grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/5 sm:grid-cols-[1fr_100px_120px_50px] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <FileIcon type={file.type} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {file.name}
          </p>

          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
            <span>{file.type}</span>

            {file.shared && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-500">
                  <Share2 className="h-3 w-3" />
                  Shared
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <span className="text-xs text-slate-400">
        {file.size}
      </span>

      <span className="text-xs text-slate-400">
        {file.modified}
      </span>

      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-white/5">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

function FileGrid({ file }: { file: FileItem }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <FileIcon type={file.type} />

        <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-5 truncate text-sm font-semibold">
        {file.name}
      </p>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{file.size}</span>
        <span>{file.type}</span>
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        Modified {file.modified}
      </p>
    </div>
  );
}

function Activity({
  icon,
  title,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

function SharedFile({
  name,
  person,
}: {
  name: string;
  person: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <FileIcon type="PDF" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>

        <p className="mt-1 text-xs text-slate-400">
          Shared with {person}
        </p>
      </div>

      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}