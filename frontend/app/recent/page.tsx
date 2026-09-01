"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  MoreVertical,
  Search,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type RecentFile = {
  id: number;
  name: string;
  type: "pdf" | "image" | "zip" | "file";
  size: string;
  location: string;
  accessed: string;
  starred: boolean;
};

const initialFiles: RecentFile[] = [
  {
    id: 1,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    location: "My Drive / Documents",
    accessed: "Just now",
    starred: true,
  },
  {
    id: 2,
    name: "Presentation.pptx",
    type: "file",
    size: "5.8 MB",
    location: "My Drive / Projects",
    accessed: "10 minutes ago",
    starred: false,
  },
  {
    id: 3,
    name: "UI Design.png",
    type: "image",
    size: "3.1 MB",
    location: "My Drive / Images",
    accessed: "35 minutes ago",
    starred: true,
  },
  {
    id: 4,
    name: "Database.sql",
    type: "file",
    size: "1.2 MB",
    location: "My Drive / Projects",
    accessed: "1 hour ago",
    starred: false,
  },
  {
    id: 5,
    name: "Source Code.zip",
    type: "zip",
    size: "12.7 MB",
    location: "My Drive / Work",
    accessed: "2 hours ago",
    starred: false,
  },
  {
    id: 6,
    name: "Resume.pdf",
    type: "pdf",
    size: "820 KB",
    location: "My Drive / Documents",
    accessed: "Yesterday",
    starred: false,
  },
  {
    id: 7,
    name: "Project Notes.txt",
    type: "file",
    size: "45 KB",
    location: "My Drive / Documents",
    accessed: "Yesterday",
    starred: true,
  },
  {
    id: 8,
    name: "Images.zip",
    type: "zip",
    size: "18.5 MB",
    location: "My Drive / Images",
    accessed: "2 days ago",
    starred: false,
  },
];

export default function RecentPage() {
  const [files, setFiles] =
    useState<RecentFile[]>(initialFiles);

  const [search, setSearch] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<RecentFile | null>(null);

  const [filter, setFilter] = useState<
    "all" | "today" | "week"
  >("all");

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (search.trim()) {
      result = result.filter(
        (file) =>
          file.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          file.location
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (filter === "today") {
      result = result.filter(
        (file) =>
          !file.accessed.includes("Yesterday") &&
          !file.accessed.includes("2 days")
      );
    }

    if (filter === "week") {
      result = result.filter(
        (file) =>
          !file.accessed.includes("3 days") &&
          !file.accessed.includes("4 days") &&
          !file.accessed.includes("5 days") &&
          !file.accessed.includes("6 days") &&
          !file.accessed.includes("7 days")
      );
    }

    return result;
  }, [files, search, filter]);

  function toggleStar(id: number) {
    setFiles((current) =>
      current.map((file) =>
        file.id === id
          ? {
              ...file,
              starred: !file.starred,
            }
          : file
      )
    );
  }

  function deleteFile(id: number) {
    setFiles((current) =>
      current.filter((file) => file.id !== id)
    );

    setSelectedFile(null);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Clock3 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              </div>

              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Activity
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Recent Files
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Quickly access files you have recently opened or modified.
            </p>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RecentStat
            icon={<Clock3 />}
            label="Recent Files"
            value={String(files.length)}
            text="Files accessed recently"
          />

          <RecentStat
            icon={<CalendarDays />}
            label="Today"
            value={String(
              files.filter(
                (file) =>
                  file.accessed.includes("now") ||
                  file.accessed.includes("minute") ||
                  file.accessed.includes("hour")
              ).length
            )}
            text="Accessed today"
          />

          <RecentStat
            icon={<Star />}
            label="Starred"
            value={String(
              files.filter(
                (file) => file.starred
              ).length
            )}
            text="Important files"
          />

          <RecentStat
            icon={<FolderOpen />}
            label="Locations"
            value={String(
              new Set(
                files.map(
                  (file) => file.location
                )
              ).size
            )}
            text="Different folders"
          />
        </div>

        {/* ================= TOOLBAR ================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search recent files..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <FilterButton
                active={filter === "all"}
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "today"}
                onClick={() =>
                  setFilter("today")
                }
              >
                Today
              </FilterButton>

              <FilterButton
                active={filter === "week"}
                onClick={() =>
                  setFilter("week")
                }
              >
                This Week
              </FilterButton>
            </div>
          </div>
        </div>

        {/* ================= FILES ================= */}

        {filteredFiles.length === 0 ? (
          <EmptyRecent search={search} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            {/* Desktop Header */}
            <div className="hidden grid-cols-[minmax(280px,1fr)_230px_140px_150px_80px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 lg:grid">
              <span>File</span>
              <span>Location</span>
              <span>Size</span>
              <span>Last Accessed</span>
              <span />
            </div>

            {filteredFiles.map((file) => (
              <RecentFileRow
                key={file.id}
                file={file}
                onSelect={() =>
                  setSelectedFile(file)
                }
                onStar={() =>
                  toggleStar(file.id)
                }
                onDelete={() =>
                  deleteFile(file.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= DETAILS MODAL ================= */}

      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() =>
            setSelectedFile(null)
          }
          onStar={() =>
            toggleStar(selectedFile.id)
          }
          onDelete={() =>
            deleteFile(selectedFile.id)
          }
        />
      )}
    </DashboardShell>
  );
}

/* ========================================= */
/* STAT */
/* ========================================= */

function RecentStat({
  icon,
  label,
  value,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* ========================================= */
/* FILTER */
/* ========================================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/* ========================================= */
/* FILE ROW */
/* ========================================= */

function RecentFileRow({
  file,
  onSelect,
  onStar,
  onDelete,
}: {
  file: RecentFile;
  onSelect: () => void;
  onStar: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 lg:grid lg:grid-cols-[minmax(280px,1fr)_230px_140px_150px_80px] lg:items-center lg:gap-4 lg:px-5">

      {/* File */}
      <button
        onClick={onSelect}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
          <FileIcon type={file.type} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-slate-400 lg:hidden">
            {file.location}
          </p>
        </div>
      </button>

      {/* Location */}
      <div className="mt-3 hidden min-w-0 lg:mt-0 lg:block">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 shrink-0 text-slate-400" />

          <span className="truncate text-xs text-slate-500 dark:text-slate-400">
            {file.location}
          </span>
        </div>
      </div>

      {/* Size */}
      <div className="mt-3 hidden text-xs text-slate-500 dark:text-slate-400 lg:mt-0 lg:block">
        {file.size}
      </div>

      {/* Accessed */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 lg:mt-0">
        <Clock3 className="h-3.5 w-3.5" />
        {file.accessed}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-end gap-1 lg:mt-0">
        <button
          onClick={onStar}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-yellow-500 dark:hover:bg-white/10"
          title="Star"
        >
          <Star
            className={`h-4 w-4 ${
              file.starred
                ? "fill-yellow-400 text-yellow-400"
                : ""
            }`}
          />
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          onClick={onSelect}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10"
          title="More"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ========================================= */
/* FILE ICON */
/* ========================================= */

function FileIcon({
  type,
}: {
  type: RecentFile["type"];
}) {
  if (type === "pdf") {
    return (
      <FileText className="h-5.5 w-5.5 text-red-500" />
    );
  }

  if (type === "image") {
    return (
      <FileImage className="h-5.5 w-5.5 text-purple-500" />
    );
  }

  if (type === "zip") {
    return (
      <FileArchive className="h-5.5 w-5.5 text-yellow-500" />
    );
  }

  return (
    <File className="h-5.5 w-5.5 text-blue-500" />
  );
}

/* ========================================= */
/* DETAILS MODAL */
/* ========================================= */

function FileDetailsModal({
  file,
  onClose,
  onStar,
  onDelete,
}: {
  file: RecentFile;
  onClose: () => void;
  onStar: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            File Details
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">

          {/* File */}
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
              <FileIcon type={file.type} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {file.size}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-5 space-y-3">
            <InfoRow
              label="Location"
              value={file.location}
            />

            <InfoRow
              label="File size"
              value={file.size}
            />

            <InfoRow
              label="Last accessed"
              value={file.accessed}
            />

            <InfoRow
              label="Status"
              value="Available"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
              <Download className="h-4 w-4" />
              Download
            </button>

            <button
              onClick={onStar}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <Star
                className={`h-4 w-4 ${
                  file.starred
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                }`}
              />
              {file.starred
                ? "Unstar"
                : "Star"}
            </button>
          </div>

          <button
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Move to Trash
          </button>

          <button
            onClick={() => {}}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Share2 className="h-4 w-4" />
            Share File
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================= */
/* INFO ROW */
/* ========================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/5">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ========================================= */
/* EMPTY */
/* ========================================= */

function EmptyRecent({
  search,
}: {
  search: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-white/[0.03]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Search className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="mt-5 font-semibold text-slate-900 dark:text-white">
        {search
          ? "No recent files found"
          : "No recent activity"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        {search
          ? `Nothing matches "${search}".`
          : "Files you recently access will appear here."}
      </p>
    </div>
  );
}
