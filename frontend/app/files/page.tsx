"use client";

import {
  Archive,
  ChevronDown,
  Download,
  File,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  Grid2X2,
  HardDrive,
  List,
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type FileItem = {
  id: number;
  name: string;
  type: "folder" | "pdf" | "image" | "document" | "zip";
  size: string;
  modified: string;
};

const initialFiles: FileItem[] = [
  {
    id: 1,
    name: "Documents",
    type: "folder",
    size: "—",
    modified: "Today",
  },
  {
    id: 2,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "Today",
  },
  {
    id: 3,
    name: "Presentation.pptx",
    type: "document",
    size: "5.8 MB",
    modified: "Yesterday",
  },
  {
    id: 4,
    name: "Project Images",
    type: "folder",
    size: "—",
    modified: "Yesterday",
  },
  {
    id: 5,
    name: "Database.sql",
    type: "document",
    size: "1.2 MB",
    modified: "Aug 29, 2026",
  },
  {
    id: 6,
    name: "Images.zip",
    type: "zip",
    size: "18.5 MB",
    modified: "Aug 28, 2026",
  },
  {
    id: 7,
    name: "Profile Image.png",
    type: "image",
    size: "1.8 MB",
    modified: "Aug 27, 2026",
  },
  {
    id: 8,
    name: "Resume.pdf",
    type: "pdf",
    size: "890 KB",
    modified: "Aug 25, 2026",
  },
];

export default function FilesPage() {
  const [files, setFiles] =
    useState<FileItem[]>(initialFiles);

  const [search, setSearch] =
    useState("");

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [sortBy, setSortBy] =
    useState("recent");

  const [showUpload, setShowUpload] =
    useState(false);

  const [showFolder, setShowFolder] =
    useState(false);

  const [folderName, setFolderName] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const filteredFiles = useMemo(() => {
    let result = files.filter((file) =>
      file.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "size") {
      result = [...result].sort((a, b) =>
        a.size.localeCompare(b.size)
      );
    }

    return result;
  }, [files, search, sortBy]);

  function createFolder() {
    const cleanName =
      folderName.trim();

    if (!cleanName) return;

    const newFolder: FileItem = {
      id: Date.now(),
      name: cleanName,
      type: "folder",
      size: "—",
      modified: "Just now",
    };

    setFiles((current) => [
      newFolder,
      ...current,
    ]);

    setFolderName("");
    setShowFolder(false);
  }

  function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files;

    if (!selected || selected.length === 0) {
      return;
    }

    const uploadedFiles: FileItem[] =
      Array.from(selected).map(
        (file, index) => ({
          id: Date.now() + index,
          name: file.name,
          type: getFileType(file.name),
          size: formatFileSize(
            file.size
          ),
          modified: "Just now",
        })
      );

    setFiles((current) => [
      ...uploadedFiles,
      ...current,
    ]);

    setShowUpload(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function deleteFile(id: number) {
    setFiles((current) =>
      current.filter(
        (file) => file.id !== id
      )
    );

    setSelectedFile(null);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <HardDrive className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              </div>

              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Cloud Storage
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              My Files
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Upload, organize and manage your
              files securely.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                setShowFolder(true)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </button>

            <button
              onClick={() =>
                setShowUpload(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* ================================= */}
        {/* STORAGE CARD */}
        {/* ================================= */}

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Storage
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  3.8 GB used of 10 GB
                </p>
              </div>
            </div>

            <div className="w-full sm:max-w-sm">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">
                  38% used
                </span>

                <span className="font-medium text-slate-600 dark:text-slate-300">
                  6.2 GB free
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: "38%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* TOOLBAR */}
        {/* ================================= */}

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">

            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search files and folders..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">

            {/* SORT */}

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <option value="recent">
                  Recently Modified
                </option>

                <option value="name">
                  Name
                </option>

                <option value="size">
                  Size
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* VIEW */}

            <div className="flex h-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">

              <button
                onClick={() =>
                  setView("grid")
                }
                className={`rounded-lg px-3 transition ${
                  view === "grid"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                onClick={() =>
                  setView("list")
                }
                className={`rounded-lg px-3 transition ${
                  view === "list"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* BREADCRUMB */}
        {/* ================================= */}

        <div className="mt-6 flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-900 dark:text-white">
            My Files
          </span>

          <span className="text-slate-300 dark:text-slate-700">
            /
          </span>

          <span className="text-slate-400">
            All Files
          </span>
        </div>

        {/* ================================= */}
        {/* FILES */}
        {/* ================================= */}

        {filteredFiles.length === 0 ? (
          <EmptyState
            search={search}
            onUpload={() =>
              setShowUpload(true)
            }
          />
        ) : view === "grid" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onClick={() =>
                  setSelectedFile(file)
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            <div className="hidden grid-cols-[1fr_140px_160px_50px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-white/10 md:grid">
              <span>Name</span>
              <span>Size</span>
              <span>Modified</span>
              <span />
            </div>

            {filteredFiles.map((file) => (
              <ListFile
                key={file.id}
                file={file}
                onClick={() =>
                  setSelectedFile(file)
                }
              />
            ))}
          </div>
        )}

        {/* ================================= */}
        {/* MODALS */}
        {/* ================================= */}

        {showUpload && (
          <UploadModal
            inputRef={fileInputRef}
            onClose={() =>
              setShowUpload(false)
            }
            onUpload={handleFileUpload}
          />
        )}

        {showFolder && (
          <FolderModal
            value={folderName}
            setValue={setFolderName}
            onClose={() =>
              setShowFolder(false)
            }
            onCreate={createFolder}
          />
        )}

        {selectedFile && (
          <FileDetailsModal
            file={selectedFile}
            onClose={() =>
              setSelectedFile(null)
            }
            onDelete={() =>
              deleteFile(selectedFile.id)
            }
          />
        )}
      </div>
    </DashboardShell>
  );
}

/* ========================================= */
/* FILE CARD */
/* ========================================= */

function FileCard({
  file,
  onClick,
}: {
  file: FileItem;
  onClick: () => void;
}) {
  const folder =
    file.type === "folder";

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
    >
      <div className="flex items-start justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            folder
              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
          }`}
        >
          <FileIcon type={file.type} />
        </div>

        <MoreHorizontal className="h-5 w-5 text-slate-300 transition group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300" />
      </div>

      <div className="mt-5">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.name}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {file.size}
          </span>

          <span className="text-xs text-slate-400">
            {file.modified}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ========================================= */
/* LIST FILE */
/* ========================================= */

function ListFile({
  file,
  onClick,
}: {
  file: FileItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 md:grid-cols-[1fr_140px_160px_50px] md:items-center md:gap-4"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <FileIcon type={file.type} />
        </div>

        <span className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.name}
        </span>
      </div>

      <span className="hidden text-xs text-slate-400 md:block">
        {file.size}
      </span>

      <span className="hidden text-xs text-slate-400 md:block">
        {file.modified}
      </span>

      <MoreHorizontal className="hidden h-5 w-5 text-slate-400 md:block" />
    </button>
  );
}

/* ========================================= */
/* FILE ICON */
/* ========================================= */

function FileIcon({
  type,
}: {
  type: FileItem["type"];
}) {
  if (type === "folder") {
    return <Folder className="h-6 w-6" />;
  }

  if (type === "image") {
    return <FileImage className="h-6 w-6" />;
  }

  if (
    type === "pdf" ||
    type === "document"
  ) {
    return <FileText className="h-6 w-6" />;
  }

  if (type === "zip") {
    return <Archive className="h-6 w-6" />;
  }

  return <File className="h-6 w-6" />;
}

/* ========================================= */
/* EMPTY STATE */
/* ========================================= */

function EmptyState({
  search,
  onUpload,
}: {
  search: string;
  onUpload: () => void;
}) {
  return (
    <div className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "Your storage is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        {search
          ? "Try searching with a different file or folder name."
          : "Upload your first file to start using your CloudVault storage."}
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

/* ========================================= */
/* UPLOAD MODAL */
/* ========================================= */

function UploadModal({
  inputRef,
  onClose,
  onUpload,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <Modal onClose={onClose}>

      <div className="text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
          <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          Upload Files
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Select one or multiple files from your device.
        </p>

        <button
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-6 w-full rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-sm font-semibold text-slate-600 transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-blue-500/5"
        >
          Click to choose files
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onUpload}
        />
      </div>
    </Modal>
  );
}

/* ========================================= */
/* FOLDER MODAL */
/* ========================================= */

function FolderModal({
  value,
  setValue,
  onClose,
  onCreate,
}: {
  value: string;
  setValue: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Create New Folder
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Give your folder a name.
      </p>

      <input
        autoFocus
        value={value}
        onChange={(e) =>
          setValue(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCreate();
          }
        }}
        placeholder="Folder name"
        className="mt-6 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
        >
          Cancel
        </button>

        <button
          onClick={onCreate}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Create Folder
        </button>
      </div>
    </Modal>
  );
}

/* ========================================= */
/* FILE DETAILS MODAL */
/* ========================================= */

function FileDetailsModal({
  file,
  onClose,
  onDelete,
}: {
  file: FileItem;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <FileIcon type={file.type} />
          </div>

          <div>
            <h2 className="max-w-[230px] truncate text-lg font-bold text-slate-900 dark:text-white">
              {file.name}
            </h2>

            <p className="text-xs text-slate-400">
              {file.type === "folder"
                ? "Folder"
                : "File"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-white/5">

        <DetailRow
          label="Size"
          value={file.size}
        />

        <DetailRow
          label="Modified"
          value={file.modified}
        />

        <DetailRow
          label="Status"
          value="Available"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">

        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
          <Download className="h-4 w-4" />
          Download
        </button>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <button
        onClick={onDelete}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        Move to Trash
      </button>
    </Modal>
  );
}

/* ========================================= */
/* DETAIL ROW */
/* ========================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0 dark:border-white/5">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ========================================= */
/* MODAL */
/* ========================================= */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>
  );
}

/* ========================================= */
/* HELPERS */
/* ========================================= */

function getFileType(
  fileName: string
): FileItem["type"] {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "pdf"
  ) {
    return "pdf";
  }

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

  return "document";
}

function formatFileSize(
  bytes: number
) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}
