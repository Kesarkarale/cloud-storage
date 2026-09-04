"use client";

import DashboardShell from "../components/DashboardShell";
// जर DashboardShell components folder मध्ये वेगळ्या path वर असेल
// तर तुझ्या project च्या path प्रमाणे import path बदल.

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Download,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Grid2X2,
  List,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type ViewMode = "grid" | "list";
type SortDirection = "asc" | "desc";

interface StarredFile {
  id: string;
  name?: string;
  fileName?: string;
  originalFileName?: string;
  filename?: string;
  size?: number;
  fileSize?: number;
  contentType?: string;
  mimeType?: string;
  type?: string;
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  starred?: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = [
    "token",
    "accessToken",
    "jwt",
    "authToken",
    "cloudstorage_token",
    "cloud-storage-token",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();

  return {
    Authorization: token
      ? token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`
      : "",
    "Content-Type": "application/json",
  };
}

function getFileName(file: StarredFile): string {
  return (
    file.name ||
    file.fileName ||
    file.originalFileName ||
    file.filename ||
    "Untitled file"
  );
}

function getMimeType(file: StarredFile): string {
  return (
    file.contentType ||
    file.mimeType ||
    file.type ||
    ""
  ).toLowerCase();
}

function getExtension(file: StarredFile): string {
  const name = getFileName(file);
  const index = name.lastIndexOf(".");

  return index === -1
    ? ""
    : name.substring(index + 1).toLowerCase();
}

function getFileCategory(
  file: StarredFile
):
  | "image"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "archive"
  | "audio"
  | "code"
  | "other" {
  const mime = getMimeType(file);
  const ext = getExtension(file);

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime.includes("pdf") || ext === "pdf") {
    return "pdf";
  }

  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    ["xls", "xlsx", "csv", "ods"].includes(ext)
  ) {
    return "spreadsheet";
  }

  if (
    mime.includes("word") ||
    mime.includes("document") ||
    ["doc", "docx", "txt", "rtf"].includes(ext)
  ) {
    return "document";
  }

  if (
    mime.includes("zip") ||
    mime.includes("rar") ||
    mime.includes("7z") ||
    ["zip", "rar", "7z", "tar", "gz"].includes(ext)
  ) {
    return "archive";
  }

  if (
    mime.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)
  ) {
    return "audio";
  }

  if (
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    mime.includes("json") ||
    mime.includes("html") ||
    mime.includes("css") ||
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "html",
      "css",
      "java",
      "py",
      "cpp",
      "c",
    ].includes(ext)
  ) {
    return "code";
  }

  return "other";
}

function formatFileSize(bytes?: number): string {
  const size = bytes ?? 0;

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(
    size /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

function formatDate(date?: string): string {
  if (!date) {
    return "Unknown date";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function FileTypeIcon({
  file,
  className = "h-6 w-6",
}: {
  file: StarredFile;
  className?: string;
}) {
  const category = getFileCategory(file);

  if (category === "image") {
    return <FileImage className={className} />;
  }

  if (category === "spreadsheet") {
    return <FileSpreadsheet className={className} />;
  }

  if (category === "archive") {
    return <FileArchive className={className} />;
  }

  if (category === "audio") {
    return <FileAudio className={className} />;
  }

  if (category === "code") {
    return <FileCode2 className={className} />;
  }

  if (
    category === "document" ||
    category === "pdf"
  ) {
    return <FileText className={className} />;
  }

  return <FileIcon className={className} />;
}

function getIconClasses(file: StarredFile): string {
  const category = getFileCategory(file);

  if (category === "image") {
    return "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
  }

  if (category === "pdf") {
    return "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400";
  }

  if (category === "spreadsheet") {
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  }

  if (category === "archive") {
    return "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
  }

  if (category === "audio") {
    return "bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400";
  }

  if (category === "code") {
    return "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400";
  }

  return "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />

      <div className="mt-3 h-3 w-1/2 rounded bg-slate-100 dark:bg-white/5" />

      <div className="mt-6 h-3 w-full rounded bg-slate-100 dark:bg-white/5" />
    </div>
  );
}

export default function StarredPage() {
  const [files, setFiles] = useState<StarredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");
  const [activeMenu, setActiveMenu] =
    useState<string | null>(null);
  const [removingId, setRemovingId] =
    useState<string | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  const fetchStarredFiles = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const token = getAuthToken();

        if (!token) {
          setFiles([]);
          setError(
            "Please log in to view your starred files."
          );
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/files/starred`,
          {
            method: "GET",
            headers: getAuthHeaders(),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load starred files."
          );
        }

        const data = await response.json();

        let starredFiles: StarredFile[] = [];

        if (Array.isArray(data)) {
          starredFiles = data;
        } else if (Array.isArray(data?.data)) {
          starredFiles = data.data;
        } else if (Array.isArray(data?.files)) {
          starredFiles = data.files;
        } else if (
          Array.isArray(data?.content)
        ) {
          starredFiles = data.content;
        }

        setFiles(
          starredFiles.filter(
            (file) => file && file.id
          )
        );
      } catch (err) {
        console.error(err);

        setFiles([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load starred files."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStarredFiles();
  }, [fetchStarredFiles]);

  useEffect(() => {
    const handleClick = () => {
      setActiveMenu(null);
    };

    if (activeMenu) {
      document.addEventListener(
        "click",
        handleClick
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, [activeMenu]);

  const filteredFiles = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    const result = files.filter((file) => {
      if (!query) {
        return true;
      }

      return getFileName(file)
        .toLowerCase()
        .includes(query);
    });

    result.sort((a, b) => {
      const dateA = new Date(
        a.updatedAt ||
          a.createdAt ||
          0
      ).getTime();

      const dateB = new Date(
        b.updatedAt ||
          b.createdAt ||
          0
      ).getTime();

      return sortDirection === "desc"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    files,
    searchQuery,
    sortDirection,
  ]);

  async function handleUnstar(
    file: StarredFile
  ) {
    if (removingId) {
      return;
    }

    try {
      setRemovingId(file.id);
      setActiveMenu(null);

      const response = await fetch(
        `${API_BASE}/api/files/${file.id}/star`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to remove star."
        );
      }

      setFiles((current) =>
        current.filter(
          (item) => item.id !== file.id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove star."
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function downloadFile(
    file: StarredFile
  ) {
    const directUrl =
      file.downloadUrl ||
      file.fileUrl ||
      file.url;

    if (!directUrl) {
      alert(
        "Download URL is not available for this file."
      );
      return;
    }

    try {
      const response = await fetch(
        directUrl,
        {
          headers: {
            Authorization:
              getAuthHeaders()
                .Authorization || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const blob =
        await response.blob();

      const objectUrl =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement("a");

      anchor.href = objectUrl;
      anchor.download =
        getFileName(file);

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        objectUrl
      );
    } catch {
      window.open(
        directUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  return (
    <DashboardShell>
      <div
        className="min-h-[calc(100vh-5rem)] bg-slate-50 transition-colors duration-300 dark:bg-slate-950"
        onClick={() =>
          setActiveMenu(null)
        }
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* HEADER */}

          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/10">
                <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Starred
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your important files, all in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fetchStarredFiles(true);
              }}
              disabled={refreshing}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* TOOLBAR */}

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center">

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search starred files..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortDirection(
                  (current) =>
                    current === "desc"
                      ? "asc"
                      : "desc"
                )
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              {sortDirection === "desc" ? (
                <ArrowDownAZ className="h-4 w-4" />
              ) : (
                <ArrowUpAZ className="h-4 w-4" />
              )}

              {sortDirection === "desc"
                ? "Newest"
                : "Oldest"}
            </button>

            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() =>
                  setViewMode("grid")
                }
                className={`flex h-8 w-9 items-center justify-center rounded-lg ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
                    : "text-slate-400"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("list")
                }
                className={`flex h-8 w-9 items-center justify-center rounded-lg ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
                    : "text-slate-400"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CONTENT */}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <SkeletonCard
                  key={index}
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/5">
              <h2 className="font-semibold text-red-800 dark:text-red-300">
                Unable to load starred files
              </h2>

              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchStarredFiles()
                }
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 dark:bg-amber-500/10">
                <Star className="h-9 w-9 fill-amber-500 text-amber-500" />
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {searchQuery
                  ? "No matching files"
                  : "No starred files yet"}
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {searchQuery
                  ? "Try searching with a different file name."
                  : "Star your important files from My Files and they will appear here."}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFiles.map(
                (file) => {
                  const fileName =
                    getFileName(file);

                  const isRemoving =
                    removingId ===
                    file.id;

                  return (
                    <div
                      key={file.id}
                      className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="mb-5 flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${getIconClasses(
                            file
                          )}`}
                        >
                          <FileTypeIcon
                            file={file}
                            className="h-6 w-6"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          </div>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                setActiveMenu(
                                  activeMenu ===
                                    file.id
                                    ? null
                                    : file.id
                                );
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>

                            {activeMenu ===
                              file.id && (
                              <div
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadFile(
                                      file
                                    )
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isRemoving
                                  }
                                  onClick={() =>
                                    handleUnstar(
                                      file
                                    )
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                >
                                  {isRemoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Star className="h-4 w-4 fill-current" />
                                  )}
                                  Remove star
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3
                        title={fileName}
                        className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                      >
                        {fileName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatFileSize(
                          file.size ??
                            file.fileSize
                        )}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                        <span className="text-[11px] text-slate-400">
                          {formatDate(
                            file.updatedAt ||
                              file.createdAt
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={
                            isRemoving
                          }
                          onClick={() =>
                            handleUnstar(
                              file
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star className="h-4 w-4 fill-current" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="hidden border-b border-slate-200 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/10 md:grid md:grid-cols-[minmax(0,1fr)_120px_140px_100px]">
                <span>Name</span>
                <span>Size</span>
                <span>Modified</span>
                <span className="text-right">
                  Action
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredFiles.map(
                  (file) => {
                    const fileName =
                      getFileName(file);

                    const isRemoving =
                      removingId ===
                      file.id;

                    return (
                      <div
                        key={file.id}
                        className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3 md:grid md:grid-cols-[minmax(0,1fr)_120px_140px_100px] md:gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getIconClasses(
                                file
                              )}`}
                            >
                              <FileTypeIcon
                                file={file}
                                className="h-5 w-5"
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                title={fileName}
                                className="truncate text-sm font-semibold text-slate-800 dark:text-white"
                              >
                                {fileName}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span className="text-[11px] text-slate-400">
                                  Starred
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                            {formatFileSize(
                              file.size ??
                                file.fileSize
                            )}
                          </span>

                          <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                            {formatDate(
                              file.updatedAt ||
                                file.createdAt
                            )}
                          </span>

                          <div className="ml-auto flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                downloadFile(
                                  file
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              disabled={
                                isRemoving
                              }
                              onClick={() =>
                                handleUnstar(
                                  file
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                            >
                              {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4 fill-current" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
