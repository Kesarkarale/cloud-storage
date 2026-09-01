"use client";

import {
  AlertTriangle,
  Check,
  Clock3,
  File,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  RotateCcw,
  Search,
  Trash2,
  X,
  MoreVertical,
} from "lucide-react";
import { useMemo, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type TrashFile = {
  id: number;
  name: string;
  type: "pdf" | "image" | "zip" | "file";
  size: string;
  location: string;
  deletedAt: string;
  daysLeft: number;
};

const initialTrashFiles: TrashFile[] = [
  {
    id: 1,
    name: "Old Project Report.pdf",
    type: "pdf",
    size: "2.8 MB",
    location: "My Drive / Documents",
    deletedAt: "Today, 10:32 AM",
    daysLeft: 29,
  },
  {
    id: 2,
    name: "Unused Images.zip",
    type: "zip",
    size: "14.2 MB",
    location: "My Drive / Images",
    deletedAt: "Yesterday, 6:15 PM",
    daysLeft: 28,
  },
  {
    id: 3,
    name: "Screenshot.png",
    type: "image",
    size: "1.6 MB",
    location: "My Drive / Images",
    deletedAt: "2 days ago",
    daysLeft: 27,
  },
  {
    id: 4,
    name: "Notes.txt",
    type: "file",
    size: "18 KB",
    location: "My Drive / Documents",
    deletedAt: "3 days ago",
    daysLeft: 26,
  },
  {
    id: 5,
    name: "Resume Old.pdf",
    type: "pdf",
    size: "940 KB",
    location: "My Drive / Documents",
    deletedAt: "5 days ago",
    daysLeft: 24,
  },
  {
    id: 6,
    name: "Database Backup.sql",
    type: "file",
    size: "7.4 MB",
    location: "My Drive / Backup",
    deletedAt: "8 days ago",
    daysLeft: 21,
  },
];

export default function TrashPage() {
  const [files, setFiles] =
    useState<TrashFile[]>(initialTrashFiles);

  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const [showEmptyConfirm, setShowEmptyConfirm] =
    useState(false);

  const [showPermanentConfirm, setShowPermanentConfirm] =
    useState(false);

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;

    return files.filter(
      (file) =>
        file.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        file.location
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [files, search]);

  const allSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((file) =>
      selectedIds.includes(file.id)
    );

  function toggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !filteredFiles.some(
              (file) => file.id === id
            )
        )
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...filteredFiles.map(
          (file) => file.id
        ),
      ]),
    ]);
  }

  function restoreFile(id: number) {
    setFiles((current) =>
      current.filter(
        (file) => file.id !== id
      )
    );

    setSelectedIds((current) =>
      current.filter((item) => item !== id)
    );
  }

  function restoreSelected() {
    setFiles((current) =>
      current.filter(
        (file) =>
          !selectedIds.includes(file.id)
      )
    );

    setSelectedIds([]);
  }

  function permanentlyDeleteSelected() {
    setFiles((current) =>
      current.filter(
        (file) =>
          !selectedIds.includes(file.id)
      )
    );

    setSelectedIds([]);
    setShowPermanentConfirm(false);
  }

  function emptyTrash() {
    setFiles([]);
    setSelectedIds([]);
    setShowEmptyConfirm(false);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                <Trash2 className="h-4.5 w-4.5 text-red-500" />
              </div>

              <span className="text-sm font-medium text-red-500">
                Recently Deleted
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Trash
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Files in Trash are automatically deleted
              permanently after 30 days.
            </p>
          </div>

          {files.length > 0 && (
            <button
              onClick={() =>
                setShowEmptyConfirm(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
              Empty Trash
            </button>
          )}
        </div>

        {/* ===================================== */}
        {/* WARNING */}
        {/* ===================================== */}

        <div className="mb-7 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Files are automatically deleted
            </h3>

            <p className="mt-1 text-xs leading-5 text-amber-700/80 dark:text-amber-300/70">
              Items in your Trash will be permanently
              deleted after 30 days. Restore anything
              you still need before then.
            </p>
          </div>
        </div>

        {/* ===================================== */}
        {/* STATS */}
        {/* ===================================== */}

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <TrashStat
            label="Items in Trash"
            value={String(files.length)}
            icon={<Trash2 />}
          />

          <TrashStat
            label="Selected"
            value={String(selectedIds.length)}
            icon={<Check />}
          />

          <TrashStat
            label="Storage to Recover"
            value={calculateTotalSize(files)}
            icon={<RotateCcw />}
          />
        </div>

        {/* ===================================== */}
        {/* TOOLBAR */}
        {/* ===================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search trash..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={restoreSelected}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore Selected
                </button>

                <button
                  onClick={() =>
                    setShowPermanentConfirm(
                      true
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================================== */}
        {/* FILE LIST */}
        {/* ===================================== */}

        {filteredFiles.length === 0 ? (
          <EmptyTrash search={search} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            {/* Table Header */}
            <div className="hidden grid-cols-[40px_minmax(260px,1fr)_230px_140px_170px_160px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 lg:grid">

              <button
                onClick={toggleSelectAll}
                className={`flex h-5 w-5 items-center justify-center rounded border transition ${
                  allSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {allSelected && (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>

              <span>File</span>
              <span>Location</span>
              <span>Size</span>
              <span>Deleted</span>
              <span>Actions</span>
            </div>

            {filteredFiles.map((file) => (
              <TrashFileRow
                key={file.id}
                file={file}
                selected={selectedIds.includes(
                  file.id
                )}
                onSelect={() =>
                  toggleSelect(file.id)
                }
                onRestore={() =>
                  restoreFile(file.id)
                }
                onDelete={() => {
                  setSelectedIds([file.id]);
                  setShowPermanentConfirm(
                    true
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* EMPTY TRASH MODAL */}
      {/* ===================================== */}

      {showEmptyConfirm && (
        <ConfirmModal
          title="Empty Trash?"
          description="All files in Trash will be permanently deleted. This action cannot be undone."
          confirmText="Empty Trash"
          danger
          onCancel={() =>
            setShowEmptyConfirm(false)
          }
          onConfirm={emptyTrash}
        />
      )}

      {/* ===================================== */}
      {/* PERMANENT DELETE MODAL */}
      {/* ===================================== */}

      {showPermanentConfirm && (
        <ConfirmModal
          title="Delete Permanently?"
          description={`${
            selectedIds.length
          } selected ${
            selectedIds.length === 1
              ? "file"
              : "files"
          } will be permanently deleted. This action cannot be undone.`}
          confirmText="Delete Permanently"
          danger
          onCancel={() =>
            setShowPermanentConfirm(false)
          }
          onConfirm={
            permanentlyDeleteSelected
          }
        />
      )}
    </DashboardShell>
  );
}

/* ========================================= */
/* STAT CARD */
/* ========================================= */

function TrashStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
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
        Current storage status
      </p>
    </div>
  );
}

/* ========================================= */
/* FILE ROW */
/* ========================================= */

function TrashFileRow({
  file,
  selected,
  onSelect,
  onRestore,
  onDelete,
}: {
  file: TrashFile;
  selected: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 lg:grid lg:grid-cols-[40px_minmax(260px,1fr)_230px_140px_170px_160px] lg:items-center lg:gap-4 lg:px-5">

      {/* Checkbox */}
      <button
        onClick={onSelect}
        className={`hidden h-5 w-5 items-center justify-center rounded border transition lg:flex ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 dark:border-slate-600"
        }`}
      >
        {selected && (
          <Check className="h-3.5 w-3.5" />
        )}
      </button>

      {/* File */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onSelect}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
            selected
              ? "bg-blue-50 dark:bg-blue-500/10"
              : "bg-slate-50 dark:bg-white/5"
          }`}
        >
          <TrashFileIcon type={file.type} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {file.name}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400 lg:hidden">
            {file.location}
          </p>

          <p className="mt-1 text-xs text-red-500 lg:hidden">
            {file.daysLeft} days remaining
          </p>
        </div>
      </div>

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

      {/* Deleted */}
      <div className="mt-3 hidden lg:mt-0 lg:block">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          {file.deletedAt}
        </p>

        <p className="mt-1 text-[11px] text-red-500">
          {file.daysLeft} days remaining
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 lg:mt-0">

        <button
          onClick={onRestore}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15 lg:flex-none"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restore
        </button>

        <button
          onClick={onDelete}
          className="flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          title="Delete permanently"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white lg:block"
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

function TrashFileIcon({
  type,
}: {
  type: TrashFile["type"];
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
/* EMPTY TRASH */
/* ========================================= */

function EmptyTrash({
  search,
}: {
  search: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-white/[0.03]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Trash2 className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "Trash is empty"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {search
          ? `No deleted files match "${search}".`
          : "Deleted files will appear here. You can restore them or permanently delete them."}
      </p>
    </div>
  );
}

/* ========================================= */
/* CONFIRM MODAL */
/* ========================================= */

function ConfirmModal({
  title,
  description,
  confirmText,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmText: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                danger
                  ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                  : "bg-blue-50 text-blue-500 dark:bg-blue-500/10"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>

          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition ${
                danger
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================= */
/* SIZE CALCULATION */
/* ========================================= */

function calculateTotalSize(
  files: TrashFile[]
) {
  let totalMB = 0;

  files.forEach((file) => {
    const value = parseFloat(file.size);

    if (file.size.includes("KB")) {
      totalMB += value / 1024;
    } else {
      totalMB += value;
    }
  });

  if (totalMB < 1) {
    return `${Math.round(
      totalMB * 1024
    )} KB`;
  }

  return `${totalMB.toFixed(1)} MB`;
}
