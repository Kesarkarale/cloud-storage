"use client";

import {
  ArrowDownAZ,
  ChevronRight,
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  Grid2X2,
  List,
  MoreVertical,
  Search,
  Share2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type FileItem = {
  id: number;
  name: string;
  type: string;
  size: string;
  modified: string;
  starred: boolean;
};

type FolderItem = {
  id: number;
  name: string;
  items: number;
  modified: string;
};

const initialFolders: FolderItem[] = [
  {
    id: 1,
    name: "Documents",
    items: 24,
    modified: "Today",
  },
  {
    id: 2,
    name: "Projects",
    items: 18,
    modified: "Yesterday",
  },
  {
    id: 3,
    name: "Images",
    items: 46,
    modified: "2 days ago",
  },
  {
    id: 4,
    name: "Work",
    items: 31,
    modified: "3 days ago",
  },
];

const initialFiles: FileItem[] = [
  {
    id: 1,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "Today, 10:32 AM",
    starred: true,
  },
  {
    id: 2,
    name: "Presentation.pptx",
    type: "ppt",
    size: "5.8 MB",
    modified: "Yesterday, 4:15 PM",
    starred: false,
  },
  {
    id: 3,
    name: "Database.sql",
    type: "sql",
    size: "1.2 MB",
    modified: "Aug 30, 2026",
    starred: false,
  },
  {
    id: 4,
    name: "Images.zip",
    type: "zip",
    size: "18.5 MB",
    modified: "Aug 29, 2026",
    starred: true,
  },
  {
    id: 5,
    name: "Resume.pdf",
    type: "pdf",
    size: "820 KB",
    modified: "Aug 28, 2026",
    starred: false,
  },
  {
    id: 6,
    name: "UI Design.png",
    type: "image",
    size: "3.1 MB",
    modified: "Aug 27, 2026",
    starred: false,
  },
  {
    id: 7,
    name: "Project Notes.txt",
    type: "text",
    size: "45 KB",
    modified: "Aug 26, 2026",
    starred: true,
  },
  {
    id: 8,
    name: "Source Code.zip",
    type: "zip",
    size: "12.7 MB",
    modified: "Aug 25, 2026",
    starred: false,
  },
];

export default function FilesPage() {
  const [folders, setFolders] =
    useState<FolderItem[]>(initialFolders);

  const [files, setFiles] =
    useState<FileItem[]>(initialFiles);

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [search, setSearch] = useState("");

  const [sort, setSort] =
    useState<"name" | "date">("name");

  const [showUpload, setShowUpload] =
    useState(false);

  const [showNewFolder, setShowNewFolder] =
    useState(false);

  const [folderName, setFolderName] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const filteredFolders = useMemo(() => {
    const result = folders.filter((folder) =>
      folder.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (sort === "name") {
      return [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [folders, search, sort]);

  const filteredFiles = useMemo(() => {
    const result = files.filter((file) =>
      file.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (sort === "name") {
      return [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [files, search, sort]);

  function createFolder() {
    const name = folderName.trim();

    if (!name) return;

    const newFolder: FolderItem = {
      id: Date.now(),
      name,
      items: 0,
      modified: "Just now",
    };

    setFolders((current) => [
      newFolder,
      ...current,
    ]);

    setFolderName("");
    setShowNewFolder(false);
  }

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

  function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    if (!selected) return;

    setUploading(true);

    setTimeout(() => {
      const newFile: FileItem = {
        id: Date.now(),
        name: selected.name,
        type: getFileType(selected.name),
        size: formatFileSize(selected.size),
        modified: "Just now",
        starred: false,
      };

      setFiles((current) => [
        newFile,
        ...current,
      ]);

      setUploading(false);
      setShowUpload(false);
    }, 800);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Page Header */}
        <div className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                <span>My Drive</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  All Files
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                My Files
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage and organize all your files and folders.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setShowNewFolder(true)
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <FolderPlus className="h-4 w-4" />
                New Folder
              </button>

              <button
                onClick={() =>
                  setShowUpload(true)
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search files and folders..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value as
                        | "name"
                        | "date"
                    )
                  }
                  className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="name">
                    Name
                  </option>
                  <option value="date">
                    Date
                  </option>
                </select>

                <ArrowDownAZ className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* View toggle */}
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() =>
                    setView("grid")
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    view === "grid"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <Grid2X2 className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() =>
                    setView("list")
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    view === "list"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <List className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Folders */}
        {filteredFolders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Folders
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredFolders.length} folders
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSearch("");
                  }}
                  className="group text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                      <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <span className="rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-4 truncate text-sm font-semibold text-slate-800 dark:text-white">
                    {folder.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {folder.items} items · {folder.modified}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Files */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Files
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredFiles.length} files
              </p>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <EmptyState
              search={search}
              onUpload={() =>
                setShowUpload(true)
              }
            />
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFiles.map((file) => (
                <FileGridCard
                  key={file.id}
                  file={file}
                  onStar={() =>
                    toggleStar(file.id)
                  }
                  onDelete={() =>
                    deleteFile(file.id)
                  }
                  onSelect={() =>
                    setSelectedFile(file)
                  }
                />
              ))}
            </div>
          ) : (
            <FileList
              files={filteredFiles}
              onStar={toggleStar}
              onDelete={deleteFile}
              onSelect={setSelectedFile}
            />
          )}
        </section>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <Modal
          title="Upload Files"
          onClose={() =>
            setShowUpload(false)
          }
        >
          <label className="block cursor-pointer">
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-white/[0.03] dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/10">
                <Upload className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="mt-5 font-semibold text-slate-900 dark:text-white">
                {uploading
                  ? "Uploading..."
                  : "Choose a file to upload"}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Click here to browse files from your device
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Maximum file size depends on your storage plan
              </p>
            </div>

            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Modal>
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <Modal
          title="Create New Folder"
          onClose={() =>
            setShowNewFolder(false)
          }
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Folder name
            </label>

            <input
              autoFocus
              value={folderName}
              onChange={(e) =>
                setFolderName(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createFolder();
                }
              }}
              placeholder="e.g. My Projects"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowNewFolder(false)
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={createFolder}
                disabled={!folderName.trim()}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Folder
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* File Details */}
      {selectedFile && (
        <Modal
          title="File Details"
          onClose={() =>
            setSelectedFile(null)
          }
        >
          <FileDetails
            file={selectedFile}
            onStar={() =>
              toggleStar(selectedFile.id)
            }
            onDelete={() =>
              deleteFile(selectedFile.id)
            }
          />
        </Modal>
      )}
    </DashboardShell>
  );
}

/* ============================= */
/* FILE GRID CARD */
/* ============================= */

function FileGridCard({
  file,
  onStar,
  onDelete,
  onSelect,
}: {
  file: FileItem;
  onStar: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between">
        <button
          onClick={onSelect}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5"
        >
          <FileIcon
            type={file.type}
          />
        </button>

        <button className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-white/10">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={onSelect}
        className="mt-4 block w-full text-left"
      >
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {file.size} · {file.modified}
        </p>
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
        <button
          onClick={onStar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-yellow-500 dark:hover:bg-white/10"
        >
          <Star
            className={`h-4 w-4 ${
              file.starred
                ? "fill-yellow-400 text-yellow-400"
                : ""
            }`}
          />
        </button>

        <div className="flex items-center gap-1">
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= */
/* FILE LIST */
/* ============================= */

function FileList({
  files,
  onStar,
  onDelete,
  onSelect,
}: {
  files: FileItem[];
  onStar: (id: number) => void;
  onDelete: (id: number) => void;
  onSelect: (file: FileItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="hidden grid-cols-[minmax(250px,1fr)_130px_180px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 md:grid">
        <span>Name</span>
        <span>Size</span>
        <span>Modified</span>
        <span className="text-right">Actions</span>
      </div>

      {files.map((file) => (
        <div
          key={file.id}
          className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 md:grid-cols-[minmax(250px,1fr)_130px_180px_150px] md:items-center md:gap-4 md:px-5"
        >
          <button
            onClick={() => onSelect(file)}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
              <FileIcon type={file.type} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-slate-400 md:hidden">
                {file.size} · {file.modified}
              </p>
            </div>
          </button>

          <span className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
            {file.size}
          </span>

          <span className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
            {file.modified}
          </span>

          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onStar(file.id)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-yellow-500 dark:hover:bg-white/10"
            >
              <Star
                className={`h-4 w-4 ${
                  file.starred
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                }`}
              />
            </button>

            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10">
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={() => onDelete(file.id)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================= */
/* FILE ICON */
/* ============================= */

function FileIcon({
  type,
}: {
  type: string;
}) {
  switch (type) {
    case "pdf":
      return (
        <FileText className="h-6 w-6 text-red-500" />
      );

    case "image":
      return (
        <FileImage className="h-6 w-6 text-purple-500" />
      );

    case "zip":
      return (
        <FileArchive className="h-6 w-6 text-yellow-500" />
      );

    default:
      return (
        <File className="h-6 w-6 text-blue-500" />
      );
  }
}

/* ============================= */
/* FILE DETAILS */
/* ============================= */

function FileDetails({
  file,
  onStar,
  onDelete,
}: {
  file: FileItem;
  onStar: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
          <FileIcon type={file.type} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 dark:text-white">
            {file.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {file.type.toUpperCase()} · {file.size}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <InfoRow
          label="Size"
          value={file.size}
        />

        <InfoRow
          label="Last modified"
          value={file.modified}
        />

        <InfoRow
          label="Status"
          value="Available"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500">
          <Download className="h-4 w-4" />
          Download
        </button>

        <button
          onClick={onStar}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
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
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        Move to Trash
      </button>
    </div>
  );
}

/* ============================= */
/* INFO ROW */
/* ============================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-white/5">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ============================= */
/* EMPTY STATE */
/* ============================= */

function EmptyState({
  search,
  onUpload,
}: {
  search: string;
  onUpload: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-white/[0.03]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Search className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="mt-5 font-semibold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "No files yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        {search
          ? `We couldn't find anything matching "${search}".`
          : "Upload your first file to start using your cloud storage."}
      </p>

      {!search && (
        <button
          onClick={onUpload}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      )}
    </div>
  );
}

/* ============================= */
/* MODAL */
/* ============================= */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================= */
/* HELPERS */
/* ============================= */

function getFileType(name: string) {
  const extension =
    name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";

  if (
    ["png", "jpg", "jpeg", "gif", "webp"].includes(
      extension || ""
    )
  ) {
    return "image";
  }

  if (
    ["zip", "rar", "7z"].includes(
      extension || ""
    )
  ) {
    return "zip";
  }

  return "file";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}
