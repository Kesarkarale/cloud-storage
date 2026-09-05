"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileText,
  FileVideo,
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

type FilterType = "all" | "today" | "week";

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

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [selectedFile, setSelectedFile] =
    useState<RecentFile | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<RecentFile | null>(null);

  const [showShare, setShowShare] =
    useState(false);

  const [shareFile, setShareFile] =
    useState<RecentFile | null>(null);

  const filteredFiles = useMemo(() => {
    let result = [...files];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.location.toLowerCase().includes(query)
      );
    }

    if (filter === "today") {
      result = result.filter(
        (file) =>
          !file.accessed.toLowerCase().includes("yesterday") &&
          !file.accessed.toLowerCase().includes("2 days") &&
          !file.accessed.toLowerCase().includes("days")
      );
    }

    if (filter === "week") {
      result = result.filter(
        (file) =>
          !file.accessed.includes("8 days") &&
          !file.accessed.includes("9 days") &&
          !file.accessed.includes("10 days")
      );
    }

    return result;
  }, [files, search, filter]);

  const todayCount = files.filter(
    (file) =>
      file.accessed.includes("now") ||
      file.accessed.includes("minute") ||
      file.accessed.includes("hour")
  ).length;

  const starredCount = files.filter(
    (file) => file.starred
  ).length;

  const locationCount = new Set(
    files.map((file) => file.location)
  ).size;

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

    setSelectedFile((current) =>
      current?.id === id
        ? {
            ...current,
            starred: !current.starred,
          }
        : current
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    const id = deleteTarget.id;

    setFiles((current) =>
      current.filter((file) => file.id !== id)
    );

    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }

    setDeleteTarget(null);
  }

  function openShare(file: RecentFile) {
    setShareFile(file);
    setShowShare(true);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <Clock3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Activity
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Recent Files
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Quickly access files you have recently opened,
                modified or interacted with.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <Clock3 className="h-4 w-4 text-slate-400" />

              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Recent activity
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {files.length} files tracked
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <RecentStat
            icon={<Clock3 className="h-5 w-5" />}
            label="Recent Files"
            value={String(files.length)}
            text="Files accessed recently"
          />

          <RecentStat
            icon={<CalendarDays className="h-5 w-5" />}
            label="Today"
            value={String(todayCount)}
            text="Accessed today"
          />

          <RecentStat
            icon={<Star className="h-5 w-5" />}
            label="Starred"
            value={String(starredCount)}
            text="Important files"
          />

          <RecentStat
            icon={<FolderOpen className="h-5 w-5" />}
            label="Locations"
            value={String(locationCount)}
            text="Different folders"
          />
        </div>

        {/* =====================================================
            TOOLBAR
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}

            <div className="relative w-full lg:max-w-lg">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search recent files..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}

            <div className="flex items-center gap-2 overflow-x-auto">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "today"}
                onClick={() => setFilter("today")}
              >
                Today
              </FilterButton>

              <FilterButton
                active={filter === "week"}
                onClick={() => setFilter("week")}
              >
                This Week
              </FilterButton>
            </div>
          </div>

          {(search || filter !== "all") && (
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-white/5">
              <span>
                Showing{" "}
                <strong className="font-semibold text-slate-600 dark:text-slate-200">
                  {filteredFiles.length}
                </strong>{" "}
                of {files.length} files
              </span>

              {search && (
                <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  “{search}”
                </span>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            FILE LIST
        ====================================================== */}

        {filteredFiles.length === 0 ? (
          <EmptyRecent
            search={search}
            onClear={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            {/* Desktop table header */}

            <div className="hidden grid-cols-[minmax(280px,1fr)_230px_120px_160px_125px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 lg:grid">
              <span>File</span>
              <span>Location</span>
              <span>Size</span>
              <span>Last Accessed</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredFiles.map((file) => (
              <RecentFileRow
                key={file.id}
                file={file}
                onSelect={() => setSelectedFile(file)}
                onStar={() => toggleStar(file.id)}
                onDelete={() => setDeleteTarget(file)}
                onShare={() => openShare(file)}
              />
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ====================================================== */}

      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onStar={() => toggleStar(selectedFile.id)}
          onDelete={() => {
            setDeleteTarget(selectedFile);
          }}
          onShare={() => openShare(selectedFile)}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteTarget && (
        <DeleteModal
          file={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* =====================================================
          SHARE MODAL
      ====================================================== */}

      {showShare && shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => {
            setShowShare(false);
            setShareFile(null);
          }}
        />
      )}
    </DashboardShell>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

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
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>

        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
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

/* ============================================================
   FILTER BUTTON
============================================================ */

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
      type="button"
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

/* ============================================================
   FILE ROW
============================================================ */

function RecentFileRow({
  file,
  onSelect,
  onStar,
  onDelete,
  onShare,
}: {
  file: RecentFile;
  onSelect: () => void;
  onStar: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  return (
    <div className="group border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 lg:grid lg:grid-cols-[minmax(280px,1fr)_230px_120px_160px_125px] lg:items-center lg:gap-4 lg:px-5">

      {/* FILE */}

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 w-full items-center gap-3 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/5">
          <FileIcon type={file.type} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
              {file.name}
            </p>

            {file.starred && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>

          <p className="mt-1 truncate text-xs text-slate-400 lg:hidden">
            {file.location}
          </p>
        </div>
      </button>

      {/* LOCATION */}

      <div className="mt-3 hidden min-w-0 lg:mt-0 lg:block">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 shrink-0 text-slate-400" />

          <span className="truncate text-xs text-slate-500 dark:text-slate-400">
            {file.location}
          </span>
        </div>
      </div>

      {/* SIZE */}

      <div className="mt-3 hidden text-xs text-slate-500 dark:text-slate-400 lg:mt-0 lg:block">
        {file.size}
      </div>

      {/* ACCESSED */}

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 lg:mt-0">
        <Clock3 className="h-3.5 w-3.5 shrink-0" />

        <span>{file.accessed}</span>
      </div>

      {/* ACTIONS */}

      <div className="mt-3 flex items-center justify-end gap-1 lg:mt-0">
        <button
          type="button"
          onClick={onStar}
          aria-label={file.starred ? "Unstar file" : "Star file"}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-yellow-50 hover:text-yellow-500 dark:hover:bg-yellow-500/10"
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
          type="button"
          onClick={onShare}
          aria-label="Share file"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-500/10"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete file"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onSelect}
          aria-label="More details"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   FILE ICON
============================================================ */

function FileIcon({
  type,
}: {
  type: RecentFile["type"];
}) {
  if (type === "pdf") {
    return (
      <FileText className="h-5 w-5 text-red-500" />
    );
  }

  if (type === "image") {
    return (
      <FileImage className="h-5 w-5 text-purple-500" />
    );
  }

  if (type === "zip") {
    return (
      <FileArchive className="h-5 w-5 text-yellow-500" />
    );
  }

  return (
    <File className="h-5 w-5 text-blue-500" />
  );
}

/* ============================================================
   DETAILS MODAL
============================================================ */

function FileDetailsModal({
  file,
  onClose,
  onStar,
  onDelete,
  onShare,
}: {
  file: RecentFile;
  onClose: () => void;
  onStar: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              File Details
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Information about this file
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-5 sm:p-6">

          {/* FILE PREVIEW */}

          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
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

          {/* INFORMATION */}

          <div className="mt-5 space-y-2">
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

          {/* ACTIONS */}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download
            </button>

            <button
              type="button"
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

              {file.starred ? "Unstar" : "Star"}
            </button>
          </div>

          <button
            type="button"
            onClick={onShare}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <Share2 className="h-4 w-4" />
            Share File
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Move to Trash
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ============================================================
   DELETE MODAL
============================================================ */

function DeleteModal({
  file,
  onCancel,
  onConfirm,
}: {
  file: RecentFile;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Move to Trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to move{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {file.name}
              </span>{" "}
              to trash?
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Move to Trash
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ============================================================
   SHARE MODAL
============================================================ */

function ShareModal({
  file,
  onClose,
}: {
  file: RecentFile;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [shared, setShared] = useState(false);

  function handleShare() {
    if (!email.trim()) return;

    setShared(true);
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Share File
            </h2>

            <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400">
              {file.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {shared ? (
            <div className="py-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                File shared successfully
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Access has been granted to {email}.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="name@example.com"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!email.trim()}
                  onClick={handleShare}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Share
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

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

/* ============================================================
   MODAL OVERLAY
============================================================ */

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyRecent({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
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
          ? `Nothing matches "${search}". Try another search term.`
          : "Files you recently access will appear here."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
