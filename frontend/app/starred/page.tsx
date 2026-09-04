"use client";

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
  Trash2,
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

/* =========================================================
   AUTH TOKEN
========================================================= */

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "token",
    "accessToken",
    "jwt",
    "authToken",
    "cloudstorage_token",
    "cloud-storage-token",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

/* =========================================================
   AUTH HEADERS
========================================================= */

function getAuthHeaders(): HeadersInit {
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

/* =========================================================
   FILE NAME
========================================================= */

function getFileName(file: StarredFile): string {
  return (
    file.name ||
    file.fileName ||
    file.originalFileName ||
    file.filename ||
    "Untitled file"
  );
}

/* =========================================================
   MIME TYPE
========================================================= */

function getMimeType(file: StarredFile): string {
  return (
    file.contentType ||
    file.mimeType ||
    file.type ||
    ""
  ).toLowerCase();
}

/* =========================================================
   FILE EXTENSION
========================================================= */

function getExtension(file: StarredFile): string {
  const name = getFileName(file);

  const lastDot = name.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return name
    .substring(lastDot + 1)
    .toLowerCase();
}

/* =========================================================
   FILE TYPE
========================================================= */

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
  const extension = getExtension(file);

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (
    mime.includes("pdf") ||
    extension === "pdf"
  ) {
    return "pdf";
  }

  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    [
      "xls",
      "xlsx",
      "csv",
      "ods",
    ].includes(extension)
  ) {
    return "spreadsheet";
  }

  if (
    mime.includes("word") ||
    mime.includes("document") ||
    [
      "doc",
      "docx",
      "txt",
      "rtf",
    ].includes(extension)
  ) {
    return "document";
  }

  if (
    mime.includes("zip") ||
    mime.includes("rar") ||
    mime.includes("7z") ||
    [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
    ].includes(extension)
  ) {
    return "archive";
  }

  if (
    mime.startsWith("audio/") ||
    [
      "mp3",
      "wav",
      "ogg",
      "m4a",
      "aac",
    ].includes(extension)
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
    ].includes(extension)
  ) {
    return "code";
  }

  return "other";
}

/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(
  bytes?: number
): string {
  const size = bytes ?? 0;

  if (!size || size < 1) {
    return "0 KB";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    size /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

/* =========================================================
   GET SIZE
========================================================= */

function getFileSize(
  file: StarredFile
): number {
  return Number(
    file.size ??
      file.fileSize ??
      0
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  date?: string
): string {
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

/* =========================================================
   FILE ICON
========================================================= */

function FileTypeIcon({
  file,
  className = "h-6 w-6",
}: {
  file: StarredFile;
  className?: string;
}) {
  const category =
    getFileCategory(file);

  if (category === "image") {
    return (
      <FileImage
        className={className}
      />
    );
  }

  if (category === "spreadsheet") {
    return (
      <FileSpreadsheet
        className={className}
      />
    );
  }

  if (category === "archive") {
    return (
      <FileArchive
        className={className}
      />
    );
  }

  if (category === "audio") {
    return (
      <FileAudio
        className={className}
      />
    );
  }

  if (category === "code") {
    return (
      <FileCode2
        className={className}
      />
    );
  }

  if (
    category === "document" ||
    category === "pdf"
  ) {
    return (
      <FileText
        className={className}
      />
    );
  }

  return (
    <FileIcon
      className={className}
    />
  );
}

/* =========================================================
   FILE ICON BACKGROUND
========================================================= */

function getIconClasses(
  file: StarredFile
): string {
  const category =
    getFileCategory(file);

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

/* =========================================================
   DOWNLOAD FILE
========================================================= */

async function downloadFile(
  file: StarredFile
) {
  const directUrl =
    file.downloadUrl ||
    file.fileUrl ||
    file.url;

  if (directUrl) {
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
        throw new Error(
          "Download failed"
        );
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

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        objectUrl
      );

      return;
    } catch {
      window.open(
        directUrl,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }
  }

  /*
    If your backend later provides a dedicated
    download endpoint, this fallback can be
    adjusted according to that endpoint.
  */

  const endpoint =
    `${API_BASE}/api/files/${file.id}/download`;

  try {
    const response = await fetch(
      endpoint,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Download failed"
      );
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

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    window.URL.revokeObjectURL(
      objectUrl
    );
  } catch (error) {
    console.error(
      "Download error:",
      error
    );

    alert(
      "Unable to download this file."
    );
  }
}

/* =========================================================
   SKELETON CARD
========================================================= */

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

/* =========================================================
   PAGE
========================================================= */

export default function StarredPage() {
  const [files, setFiles] =
    useState<StarredFile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

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

  /* =======================================================
     FETCH STARRED FILES
  ======================================================= */

  const fetchStarredFiles =
    useCallback(
      async (
        showRefreshLoader = false
      ) => {
        try {
          if (showRefreshLoader) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError(null);

          const token =
            getAuthToken();

          if (!token) {
            setFiles([]);

            setError(
              "Please log in to view your starred files."
            );

            return;
          }

          const response =
            await fetch(
              `${API_BASE}/api/files/starred`,
              {
                method: "GET",
                headers:
                  getAuthHeaders(),
                cache: "no-store",
              }
            );

          if (!response.ok) {
            let message =
              "Failed to load starred files.";

            try {
              const data =
                await response.json();

              if (
                data?.message
              ) {
                message =
                  data.message;
              }
            } catch {
              // Ignore JSON parsing error.
            }

            throw new Error(
              message
            );
          }

          const data =
            await response.json();

          let starredFiles: StarredFile[] =
            [];

          /*
            Supports:
            [
              ...
            ]

            OR

            {
              data: [...]
            }

            OR

            {
              files: [...]
            }

            OR

            {
              content: [...]
            }
          */

          if (Array.isArray(data)) {
            starredFiles = data;
          } else if (
            Array.isArray(data?.data)
          ) {
            starredFiles =
              data.data;
          } else if (
            Array.isArray(data?.files)
          ) {
            starredFiles =
              data.files;
          } else if (
            Array.isArray(
              data?.content
            )
          ) {
            starredFiles =
              data.content;
          }

          setFiles(
            starredFiles.filter(
              (file) =>
                file &&
                file.id
            )
          );
        } catch (err) {
          console.error(
            "Failed to load starred files:",
            err
          );

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

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchStarredFiles();
  }, [fetchStarredFiles]);

  /* =======================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handleClick() {
      setActiveMenu(null);
    }

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

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredFiles =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      let result =
        files.filter((file) => {
          if (!query) {
            return true;
          }

          return getFileName(
            file
          )
            .toLowerCase()
            .includes(query);
        });

      result.sort((a, b) => {
        const dateA =
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0
          ).getTime();

        return sortDirection ===
          "desc"
          ? dateB - dateA
          : dateA - dateB;
      });

      return result;
    }, [
      files,
      searchQuery,
      sortDirection,
    ]);

  /* =======================================================
     UNSTAR FILE
  ======================================================= */

  async function handleUnstar(
    file: StarredFile
  ) {
    if (removingId) {
      return;
    }

    try {
      setRemovingId(file.id);
      setActiveMenu(null);

      const response =
        await fetch(
          `${API_BASE}/api/files/${file.id}/star`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders(),
          }
        );

      if (!response.ok) {
        let message =
          "Unable to remove star.";

        try {
          const data =
            await response.json();

          if (
            data?.message
          ) {
            message =
              data.message;
          }
        } catch {
          // Ignore.
        }

        throw new Error(
          message
        );
      }

      setFiles((current) =>
        current.filter(
          (item) =>
            item.id !== file.id
        )
      );
    } catch (error) {
      console.error(
        "Unstar error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove star."
      );
    } finally {
      setRemovingId(null);
    }
  }

  /* =======================================================
     SEARCH HANDLER
  ======================================================= */

  function handleSearch(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setSearchQuery(
      event.target.value
    );
  }

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  function clearSearch() {
    setSearchQuery("");
  }

  /* =======================================================
     REFRESH
  ======================================================= */

  function handleRefresh() {
    fetchStarredFiles(true);
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (
    !loading &&
    error &&
    files.length === 0
  ) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-6 transition-colors duration-300 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Starred
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quickly access your important files.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>

              <div className="flex-1">
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
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div
      className="min-h-[calc(100vh-5rem)] bg-slate-50 transition-colors duration-300 dark:bg-slate-950"
      onClick={() =>
        setActiveMenu(null)
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 shadow-sm dark:bg-amber-500/10">
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

          <div className="flex items-center gap-2">

            {/* Refresh */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRefresh();
              }}
              disabled={refreshing}
              title="Refresh"
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              <span className="hidden sm:block">
                Refresh
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center">

          {/* Search */}

          <div className="relative min-w-0 flex-1">

            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onClick={(event) =>
                event.stopPropagation()
              }
              placeholder="Search starred files..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  clearSearch();
                }}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              setSortDirection(
                (current) =>
                  current ===
                  "desc"
                    ? "asc"
                    : "desc"
              );
            }}
            title="Change sort order"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {sortDirection ===
            "desc" ? (
              <ArrowDownAZ className="h-4 w-4" />
            ) : (
              <ArrowUpAZ className="h-4 w-4" />
            )}

            <span className="hidden sm:block">
              {sortDirection ===
              "desc"
                ? "Newest"
                : "Oldest"}
            </span>
          </button>

          {/* View switch */}

          <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setViewMode("grid");
              }}
              title="Grid view"
              className={`flex h-8 w-9 items-center justify-center rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setViewMode("list");
              }}
              title="List view"
              className={`flex h-8 w-9 items-center justify-center rounded-lg transition ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        {!loading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">
              {searchQuery
                ? `${filteredFiles.length} ${
                    filteredFiles.length ===
                    1
                      ? "result"
                      : "results"
                  }`
                : `${files.length} ${
                    files.length === 1
                      ? "starred file"
                      : "starred files"
                  }`}
            </p>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-3"
            }
          >
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <SkeletonCard
                key={index}
              />
            ))}
          </div>
        ) : filteredFiles.length ===
          0 ? (
          /* ===============================================
             EMPTY STATE
          =============================================== */

          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 dark:bg-amber-500/10">
              <Star className="h-9 w-9 fill-amber-500 text-amber-500" />
            </div>

            {searchQuery ? (
              <>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  No matching files
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  We couldn't find any
                  starred files matching{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    "{searchQuery}"
                  </span>
                  .
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  No starred files yet
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Star your important files
                  from My Files and they will
                  appear here for quick access.
                </p>
              </>
            )}
          </div>
        ) : viewMode ===
          "grid" ? (
          /* ===============================================
             GRID VIEW
          =============================================== */

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {filteredFiles.map(
              (file) => {
                const fileName =
                  getFileName(file);

                const fileSize =
                  getFileSize(file);

                const isRemoving =
                  removingId ===
                  file.id;

                return (
                  <div
                    key={file.id}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className={`group relative overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 ${
                      isRemoving
                        ? "opacity-60"
                        : ""
                    }`}
                  >

                    {/* Top */}

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
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="File actions"
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
                              className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  downloadFile(
                                    file
                                  )
                                }
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
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
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-amber-600 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
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

                    {/* Name */}

                    <div className="min-w-0">
                      <h3
                        title={fileName}
                        className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                      >
                        {fileName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatFileSize(
                          fileSize
                        )}
                      </p>
                    </div>

                    {/* Bottom */}

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
                        title="Remove star"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 dark:hover:bg-amber-500/10"
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
          /* ===============================================
             LIST VIEW
          =============================================== */

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">

            {/* Desktop heading */}

            <div className="hidden border-b border-slate-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:border-white/10 md:grid md:grid-cols-[minmax(0,1fr)_120px_140px_70px] md:items-center md:gap-4">
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

                  const fileSize =
                    getFileSize(file);

                  const isRemoving =
                    removingId ===
                    file.id;

                  return (
                    <div
                      key={file.id}
                      className={`group px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.02] ${
                        isRemoving
                          ? "opacity-60"
                          : ""
                      }`}
                    >

                      <div className="flex items-center gap-3 md:grid md:grid-cols-[minmax(0,1fr)_120px_140px_70px] md:gap-4">

                        {/* File */}

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
                              title={
                                fileName
                              }
                              className="truncate text-sm font-semibold text-slate-800 dark:text-white"
                            >
                              {fileName}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />

                              <span className="text-[11px] text-slate-400">
                                Starred
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Size */}

                        <div className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                          {formatFileSize(
                            fileSize
                          )}
                        </div>

                        {/* Date */}

                        <div className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                          {formatDate(
                            file.updatedAt ||
                              file.createdAt
                          )}
                        </div>

                        {/* Actions */}

                        <div className="ml-auto flex items-center gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              downloadFile(
                                file
                              )
                            }
                            title="Download"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
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
                            title="Remove star"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 dark:hover:bg-amber-500/10"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4 fill-current" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mobile details */}

                      <div className="ml-[52px] mt-2 flex items-center gap-3 text-[11px] text-slate-400 md:hidden">
                        <span>
                          {formatFileSize(
                            fileSize
                          )}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />

                        <span>
                          {formatDate(
                            file.updatedAt ||
                              file.createdAt
                          )}
                        </span>
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
  );
}
