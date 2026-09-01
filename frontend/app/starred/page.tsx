"use client";

import {
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  Grid2X2,
  List,
  MoreVertical,
  Search,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type FileType = "pdf" | "image" | "zip" | "file";

type StarredFile = {
  id: number;
  name: string;
  type: FileType;
  size: string;
  location: string;
  modified: string;
};

const initialFiles: StarredFile[] = [
  {
    id: 1,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    location: "My Drive / Documents",
    modified: "Today, 10:32 AM",
  },
  {
    id: 2,
    name: "Presentation.pptx",
    type: "file",
    size: "5.8 MB",
    location: "My Drive / Projects",
    modified: "Yesterday, 6:15 PM",
  },
  {
    id: 3,
    name: "Team Photos.zip",
    type: "zip",
    size: "18.5 MB",
    location: "My Drive / Images",
    modified: "Aug 28, 2026",
  },
  {
    id: 4,
    name: "Dashboard Screenshot.png",
    type: "image",
    size: "1.8 MB",
    location: "My Drive / Images",
    modified: "Aug 26, 2026",
  },
  {
    id: 5,
    name: "Database Backup.sql",
    type: "file",
    size: "7.2 MB",
    location: "My Drive / Backup",
    modified: "Aug 24, 2026",
  },
  {
    id: 6,
    name: "Important Notes.pdf",
    type: "pdf",
    size: "860 KB",
    location: "My Drive / Documents",
    modified: "Aug 22, 2026",
  },
];

export default function StarredPage() {
  const [files, setFiles] =
    useState<StarredFile[]>(initialFiles);

  const [search, setSearch] = useState("");

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [sort, setSort] =
    useState<"name" | "modified" | "size">(
      "modified"
    );

  const filteredFiles = useMemo(() => {
    const result = files.filter(
      (file) =>
        file.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        file.location
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    return [...result].sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "size") {
        return (
          parseFileSize(b.size) -
          parseFileSize(a.size)
        );
      }

      return b.id - a.id;
    });
  }, [files, search, sort]);

  function removeStar(id: number) {
    setFiles((current) =>
      current.filter((file) => file.id !== id)
    );
  }

  function downloadFile(file: StarredFile) {
    const blob = new Blob(
      [
        `CloudVault Demo File\n\nFile: ${file.name}\nSize: ${file.size}\nLocation: ${file.location}`,
      ],
      { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =============================== */}
        {/* HEADER */}
        {/* =============================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
              </div>

              <span className="text-sm font-medium text-amber-500">
                Favorites
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Starred Files
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Quickly access the files and folders
              you use most often.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {files.length} Starred
            </span>
          </div>
        </div>

        {/* =============================== */}
        {/* TOOLBAR */}
        {/* =============================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search starred files..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">

              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value as
                      | "name"
                      | "modified"
                      | "size"
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <option value="modified">
                  Recently modified
                </option>

                <option value="name">
                  Name
                </option>

                <option value="size">
                  Size
                </option>
              </select>

              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() =>
                    setView("grid")
                  }
                  className={`rounded-lg p-2 transition ${
                    view === "grid"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="Grid view"
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() =>
                    setView("list")
                  }
                  className={`rounded-lg p-2 transition ${
                    view === "list"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =============================== */}
        {/* CONTENT */}
        {/* =============================== */}

        {filteredFiles.length === 0 ? (
          <EmptyStarred search={search} />
        ) : view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map((file) => (
              <StarredCard
                key={file.id}
                file={file}
                onRemoveStar={() =>
                  removeStar(file.id)
                }
                onDownload={() =>
                  downloadFile(file)
                }
              />
            ))}
          </div>
        ) : (
          <StarredList
            files={filteredFiles}
            onRemoveStar={removeStar}
            onDownload={downloadFile}
          />
        )}
      </div>
    </DashboardShell>
  );
}

/* ========================================= */
/* GRID CARD */
/* ========================================= */

function StarredCard({
  file,
  onRemoveStar,
  onDownload,
}: {
  file: StarredFile;
  onRemoveStar: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">

      {/* Preview */}
      <div className="relative flex h-44 items-center justify-center bg-slate-50 dark:bg-white/[0.03]">

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
          <FileTypeIcon type={file.type} large />
        </div>

        {/* Star */}
        <button
          onClick={onRemoveStar}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-400 shadow-sm transition hover:bg-amber-50 dark:border-amber-500/20 dark:bg-slate-900 dark:hover:bg-amber-500/10"
          title="Remove from starred"
        >
          <Star className="h-4 w-4 fill-current" />
        </button>

        {/* More */}
        <button
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-500 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-300"
          title="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Details */}
      <div className="p-5">

        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {file.name}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <FolderOpen className="h-3.5 w-3.5" />

          <span className="truncate">
            {file.location}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>{file.size}</span>
          <span>{file.modified}</span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>

          <button
            className="flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-blue-400"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================= */
/* LIST */
/* ========================================= */

function StarredList({
  files,
  onRemoveStar,
  onDownload,
}: {
  files: StarredFile[];
  onRemoveStar: (id: number) => void;
  onDownload: (file: StarredFile) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

      {/* Header */}
      <div className="hidden grid-cols-[minmax(260px,1fr)_220px_130px_180px_120px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 lg:grid">
        <span>File</span>
        <span>Location</span>
        <span>Size</span>
        <span>Modified</span>
        <span>Actions</span>
      </div>

      {files.map((file) => (
        <div
          key={file.id}
          className="grid gap-4 border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 lg:grid-cols-[minmax(260px,1fr)_220px_130px_180px_120px] lg:items-center lg:px-5"
        >
          {/* File */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
              <FileTypeIcon type={file.type} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-slate-400 lg:hidden">
                {file.location}
              </p>
            </div>

            <Star className="ml-auto h-4 w-4 shrink-0 fill-amber-400 text-amber-400 lg:hidden" />
          </div>

          {/* Location */}
          <div className="hidden min-w-0 lg:block">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 shrink-0 text-slate-400" />

              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {file.location}
              </span>
            </div>
          </div>

          {/* Size */}
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 lg:block">
            {file.size}
          </span>

          {/* Modified */}
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 lg:block">
            {file.modified}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onDownload(file)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15 lg:flex-none"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>

            <button
              onClick={() =>
                onRemoveStar(file.id)
              }
              className="rounded-lg p-2 text-amber-400 transition hover:bg-amber-50 dark:hover:bg-amber-500/10"
              title="Remove star"
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========================================= */
/* ICON */
/* ========================================= */

function FileTypeIcon({
  type,
  large = false,
}: {
  type: FileType;
  large?: boolean;
}) {
  const className = large
    ? "h-9 w-9"
    : "h-5 w-5";

  if (type === "pdf") {
    return (
      <FileText
        className={`${className} text-red-500`}
      />
    );
  }

  if (type === "image") {
    return (
      <FileImage
        className={`${className} text-purple-500`}
      />
    );
  }

  if (type === "zip") {
    return (
      <FileArchive
        className={`${className} text-yellow-500`}
      />
    );
  }

  return (
    <File
      className={`${className} text-blue-500`}
    />
  );
}

/* ========================================= */
/* EMPTY STATE */
/* ========================================= */

function EmptyStarred({
  search,
}: {
  search: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-24 text-center dark:border-slate-700 dark:bg-white/[0.03]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
        <Star className="h-7 w-7 text-amber-400" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
        {search
          ? "No starred files found"
          : "No starred files yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {search
          ? `Nothing matches "${search}". Try another search.`
          : "Star your important files to access them quickly from this page."}
      </p>
    </div>
  );
}

/* ========================================= */
/* SIZE PARSER */
/* ========================================= */

function parseFileSize(size: string) {
  const value = parseFloat(size);

  if (size.includes("KB")) {
    return value / 1024;
  }

  if (size.includes("GB")) {
    return value * 1024;
  }

  return value;
}
