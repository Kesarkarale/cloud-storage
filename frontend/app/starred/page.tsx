"use client";

import {
  AlertCircle,
  ArrowDownAZ,
  CalendarDays,
  Download,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  Grid2X2,
  List,
  Loader2,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardShell from "@/app/components/DashboardShell";

/* =========================================================
   TYPES
========================================================= */

type UUID = string;

type ItemType = "file" | "folder";

type ViewMode = "grid" | "list";

type SortKey = "name" | "date" | "size";

type SortDirection = "asc" | "desc";

interface FileItem {
  id: UUID;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  userId?: UUID;
  parentFolderId?: UUID | null;
  createdAt: string;
}

interface FolderItem {
  id: UUID;
  name: string;
  folderName?: string;
  userId?: UUID;
  parentFolderId?: UUID | null;
  createdAt?: string;
}

interface StarredItem {
  id: UUID;
  type: ItemType;
  name: string;
  size?: number;
  fileType?: string;
  createdAt?: string;
  parentFolderId?: UUID | null;
  file?: FileItem;
  folder?: FolderItem;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

const STARRED_STORAGE_KEY =
  "cloudstorage-starred-items";

/* =========================================================
   AUTH
========================================================= */

function getToken(): string | null {
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

    if (value && value.trim()) {
      return value;
    }
  }

  return null;
}

function authHeaders(
  extra?: HeadersInit
): HeadersInit {
  const token = getToken();

  return {
    ...(token
      ? {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
        }
      : {}),
    ...extra,
  };
}

/* =========================================================
   API ERROR
========================================================= */

async function parseApiError(
  response: Response
): Promise<string> {
  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();

      return (
        data?.message ||
        data?.error ||
        data?.detail ||
        `Request failed (${response.status})`
      );
    }

    const text = await response.text();

    if (text) {
      return text;
    }
  } catch {
    // Ignore parsing errors.
  }

  return `Request failed (${response.status})`;
}

/* =========================================================
   NORMALIZERS
========================================================= */

function normalizeFile(
  value: any
): FileItem {
  return {
    id: String(value?.id ?? ""),
    fileName:
      value?.fileName ??
      value?.filename ??
      value?.name ??
      "Unnamed file",

    fileType:
      value?.fileType ??
      value?.contentType ??
      value?.mimeType ??
      "application/octet-stream",

    fileSize: Number(
      value?.fileSize ??
        value?.size ??
        0
    ),

    filePath: value?.filePath,

    userId: value?.userId,

    parentFolderId:
      value?.parentFolderId ??
      value?.parent_folder_id ??
      null,

    createdAt:
      value?.createdAt ??
      value?.created_at ??
      new Date().toISOString(),
  };
}

function normalizeFolder(
  value: any
): FolderItem {
  return {
    id: String(value?.id ?? ""),

    name:
      value?.name ??
      value?.folderName ??
      value?.folder_name ??
      "Untitled folder",

    folderName:
      value?.folderName,

    userId:
      value?.userId,

    parentFolderId:
      value?.parentFolderId ??
      value?.parent_folder_id ??
      null,

    createdAt:
      value?.createdAt ??
      value?.created_at,
  };
}

/* =========================================================
   HELPERS
========================================================= */

function formatFileSize(
  bytes: number
): string {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const size =
    bytes /
    Math.pow(1024, index);

  return `${size.toFixed(
    index === 0
      ? 0
      : size >= 10
      ? 1
      : 2
  )} ${units[index]}`;
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getExtension(
  fileName: string
): string {
  const parts =
    fileName.split(".");

  if (parts.length < 2) {
    return "";
  }

  return (
    parts.pop()?.toLowerCase() ||
    ""
  );
}

function getFileCategory(
  file: FileItem
): string {
  const type =
    file.fileType?.toLowerCase() ||
    "";

  const ext = getExtension(
    file.fileName
  );

  if (type.startsWith("image/")) {
    return "image";
  }

  if (
    type.startsWith("video/") ||
    [
      "mp4",
      "webm",
      "mov",
      "mkv",
      "avi",
    ].includes(ext)
  ) {
    return "video";
  }

  if (
    type.startsWith("audio/") ||
    [
      "mp3",
      "wav",
      "ogg",
      "m4a",
      "aac",
      "flac",
    ].includes(ext)
  ) {
    return "audio";
  }

  if (
    type === "application/pdf" ||
    ext === "pdf"
  ) {
    return "pdf";
  }

  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    [
      "xls",
      "xlsx",
      "csv",
    ].includes(ext)
  ) {
    return "spreadsheet";
  }

  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("7z") ||
    [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
    ].includes(ext)
  ) {
    return "archive";
  }

  if (
    type.includes("text") ||
    type.includes("word") ||
    type.includes("document") ||
    [
      "txt",
      "doc",
      "docx",
      "rtf",
    ].includes(ext)
  ) {
    return "document";
  }

  if (
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("json") ||
    type.includes("html") ||
    type.includes("css") ||
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "html",
      "css",
    ].includes(ext)
  ) {
    return "code";
  }

  return "other";
}

function getFileIcon(
  file: FileItem,
  size = 26
) {
  const category =
    getFileCategory(file);

  switch (category) {
    case "image":
      return (
        <FileImage size={size} />
      );

    case "video":
      return (
        <FileVideo size={size} />
      );

    case "audio":
      return (
        <FileAudio size={size} />
      );

    case "pdf":
    case "document":
      return (
        <FileText size={size} />
      );

    case "spreadsheet":
      return (
        <FileSpreadsheet
          size={size}
        />
      );

    case "archive":
      return (
        <FileArchive
          size={size}
        />
      );

    case "code":
      return (
        <FileCode2
          size={size}
        />
      );

    default:
      return (
        <FileIcon
          size={size}
        />
      );
  }
}

/* =========================================================
   LOAD RESPONSE ARRAY
========================================================= */

function extractArray(
  data: any,
  key: string
): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(data?.[key])
  ) {
    return data[key];
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data;
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

export default function StarredPage() {
  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [folders, setFolders] =
    useState<FolderItem[]>([]);

  const [starredKeys, setStarredKeys] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  const [sortKey, setSortKey] =
    useState<SortKey>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = useCallback(
    (
      type: "success" | "error",
      message: string
    ) => {
      setToast({
        type,
        message,
      });

      window.setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  /* =======================================================
     LOAD LOCAL STARRED ITEMS
  ======================================================= */

  const loadStarredKeys =
    useCallback(() => {
      try {
        const stored =
          localStorage.getItem(
            STARRED_STORAGE_KEY
          );

        if (!stored) {
          setStarredKeys([]);
          return;
        }

        const parsed =
          JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setStarredKeys(
            parsed.filter(
              (
                item
              ): item is string =>
                typeof item ===
                "string"
            )
          );
        } else {
          setStarredKeys([]);
        }
      } catch (err) {
        console.error(
          "Unable to load starred items:",
          err
        );

        setStarredKeys([]);
      }
    }, []);

  /* =======================================================
     FETCH FOLDER
  ======================================================= */

  const fetchFolders =
    useCallback(
      async (
        parentFolderId:
          | UUID
          | null
      ): Promise<
        FolderItem[]
      > => {
        const url =
          new URL(
            `${API_BASE}/api/folders`
          );

        if (parentFolderId) {
          url.searchParams.set(
            "parentFolderId",
            parentFolderId
          );
        }

        const response =
          await fetch(
            url.toString(),
            {
              method: "GET",
              headers:
                authHeaders(),
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response
            )
          );
        }

        const data =
          await response.json();

        return extractArray(
          data,
          "folders"
        )
          .map(
            normalizeFolder
          )
          .filter(
            (folder) =>
              Boolean(folder.id)
          );
      },
      []
    );

  /* =======================================================
     FETCH FILES
  ======================================================= */

  const fetchFiles =
    useCallback(
      async (
        parentFolderId:
          | UUID
          | null
      ): Promise<
        FileItem[]
      > => {
        const url =
          new URL(
            `${API_BASE}/api/files`
          );

        if (parentFolderId) {
          url.searchParams.set(
            "parentFolderId",
            parentFolderId
          );
        }

        const response =
          await fetch(
            url.toString(),
            {
              method: "GET",
              headers:
                authHeaders(),
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response
            )
          );
        }

        const data =
          await response.json();

        return extractArray(
          data,
          "files"
        )
          .map(
            normalizeFile
          )
          .filter(
            (file) =>
              Boolean(file.id)
          );
      },
      []
    );

  /* =======================================================
     LOAD ALL FILES + FOLDERS
  ======================================================= */

  const loadAllData =
    useCallback(
      async () => {
        const token =
          getToken();

        if (!token) {
          throw new Error(
            "You are not authenticated. Please login again."
          );
        }

        const allFiles: FileItem[] =
          [];

        const allFolders: FolderItem[] =
          [];

        const visitedFolders =
          new Set<string>();

        const queue: (
          | UUID
          | null
        )[] = [null];

        while (
          queue.length > 0
        ) {
          const parentFolderId =
            queue.shift()!;

          const folderKey =
            parentFolderId ??
            "ROOT";

          if (
            visitedFolders.has(
              folderKey
            )
          ) {
            continue;
          }

          visitedFolders.add(
            folderKey
          );

          const [
            childFolders,
            childFiles,
          ] =
            await Promise.all([
              fetchFolders(
                parentFolderId
              ),
              fetchFiles(
                parentFolderId
              ),
            ]);

          allFolders.push(
            ...childFolders
          );

          allFiles.push(
            ...childFiles
          );

          for (const folder of childFolders) {
            if (
              folder.id &&
              !visitedFolders.has(
                folder.id
              )
            ) {
              queue.push(
                folder.id
              );
            }
          }
        }

        setFiles(allFiles);
        setFolders(allFolders);
      },
      [
        fetchFiles,
        fetchFolders,
      ]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  const loadPage =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          setError("");

          loadStarredKeys();

          await loadAllData();
        } catch (err: any) {
          console.error(
            "Starred page loading error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load starred items."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        loadAllData,
        loadStarredKeys,
      ]
    );

  useEffect(() => {
    loadPage(true);
  }, [loadPage]);

  /* =======================================================
     STORAGE EVENT
  ======================================================= */

  useEffect(() => {
    const handleStorage =
      (
        event: StorageEvent
      ) => {
        if (
          event.key ===
          STARRED_STORAGE_KEY
        ) {
          loadStarredKeys();
        }
      };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [loadStarredKeys]);

  /* =======================================================
     BUILD STARRED ITEMS
  ======================================================= */

  const starredItems =
    useMemo<StarredItem[]>(() => {
      const result: StarredItem[] =
        [];

      for (const key of starredKeys) {
        const separator =
          key.indexOf(":");

        if (separator === -1) {
          continue;
        }

        const type =
          key.slice(
            0,
            separator
          );

        const id =
          key.slice(
            separator + 1
          );

        if (
          type !== "file" &&
          type !== "folder"
        ) {
          continue;
        }

        if (type === "file") {
          const file =
            files.find(
              (item) =>
                item.id === id
            );

          if (!file) {
            continue;
          }

          result.push({
            id: file.id,
            type: "file",
            name: file.fileName,
            size: file.fileSize,
            fileType:
              file.fileType,
            createdAt:
              file.createdAt,
            parentFolderId:
              file.parentFolderId,
            file,
          });
        }

        if (type === "folder") {
          const folder =
            folders.find(
              (item) =>
                item.id === id
            );

          if (!folder) {
            continue;
          }

          result.push({
            id: folder.id,
            type: "folder",
            name: folder.name,
            createdAt:
              folder.createdAt,
            parentFolderId:
              folder.parentFolderId,
            folder,
          });
        }
      }

      return result;
    }, [
      starredKeys,
      files,
      folders,
    ]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        [...starredItems];

      if (query) {
        result =
          result.filter(
            (item) =>
              item.name
                .toLowerCase()
                .includes(query)
          );
      }

      result.sort(
        (a, b) => {
          let comparison =
            0;

          if (
            sortKey ===
            "name"
          ) {
            comparison =
              a.name.localeCompare(
                b.name
              );
          }

          if (
            sortKey ===
            "size"
          ) {
            comparison =
              (a.size ?? 0) -
              (b.size ?? 0);
          }

          if (
            sortKey ===
            "date"
          ) {
            comparison =
              new Date(
                a.createdAt ||
                  0
              ).getTime() -
              new Date(
                b.createdAt ||
                  0
              ).getTime();
          }

          return sortDirection ===
            "asc"
            ? comparison
            : -comparison;
        }
      );

      return result;
    }, [
      starredItems,
      search,
      sortKey,
      sortDirection,
    ]);

  const fileCount =
    starredItems.filter(
      (item) =>
        item.type === "file"
    ).length;

  const folderCount =
    starredItems.filter(
      (item) =>
        item.type === "folder"
    ).length;

  /* =======================================================
     UNSTAR
  ======================================================= */

  const unstarItem =
    useCallback(
      (
        item: StarredItem
      ) => {
        const key =
          `${item.type}:${item.id}`;

        const updated =
          starredKeys.filter(
            (existingKey) =>
              existingKey !== key
          );

        try {
          localStorage.setItem(
            STARRED_STORAGE_KEY,
            JSON.stringify(
              updated
            )
          );

          setStarredKeys(
            updated
          );

          showToast(
            "success",
            `"${item.name}" removed from Starred.`
          );
        } catch (err) {
          console.error(
            "Unable to remove starred item:",
            err
          );

          showToast(
            "error",
            "Unable to update Starred."
          );
        }
      },
      [
        starredKeys,
        showToast,
      ]
    );

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const downloadFile =
    useCallback(
      async (
        file: FileItem
      ) => {
        const token =
          getToken();

        if (!token) {
          showToast(
            "error",
            "Please login again."
          );
          return;
        }

        setDownloadingId(
          file.id
        );

        try {
          const response =
            await fetch(
              `${API_BASE}/api/files/${file.id}/download`,
              {
                method: "GET",
                headers:
                  authHeaders(),
              }
            );

          if (!response.ok) {
            throw new Error(
              await parseApiError(
                response
              )
            );
          }

          const blob =
            await response.blob();

          const objectUrl =
            window.URL.createObjectURL(
              blob
            );

          const anchor =
            document.createElement(
              "a"
            );

          anchor.href =
            objectUrl;

          anchor.download =
            file.fileName;

          document.body.appendChild(
            anchor
          );

          anchor.click();

          anchor.remove();

          window.URL.revokeObjectURL(
            objectUrl
          );

          showToast(
            "success",
            "Download started."
          );
        } catch (err: any) {
          console.error(
            "Download error:",
            err
          );

          showToast(
            "error",
            err?.message ||
              "Unable to download file."
          );
        } finally {
          setDownloadingId(
            null
          );
        }
      },
      [showToast]
    );

  /* =======================================================
     SORT
  ======================================================= */

  const changeSort =
    useCallback(
      (key: SortKey) => {
        if (
          sortKey === key
        ) {
          setSortDirection(
            (previous) =>
              previous ===
              "asc"
                ? "desc"
                : "asc"
          );

          return;
        }

        setSortKey(key);

        setSortDirection(
          key === "name"
            ? "asc"
            : "desc"
        );
      },
      [sortKey]
    );

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadPage(false);

      showToast(
        "success",
        "Starred items refreshed."
      );
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardShell>
      <div className="min-h-full bg-slate-50 dark:bg-slate-950">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="px-5 py-6 sm:px-8">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Star
                    size={16}
                    className="fill-current text-amber-500"
                  />

                  <span>
                    Favorites
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Starred
                  </h1>

                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    {starredItems.length}{" "}
                    {starredItems.length ===
                    1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quickly access your
                  favorite files and
                  folders.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing ||
                  loading
                }
                className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 xl:self-auto"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* STATS */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-xl">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm dark:bg-slate-800">
                    <Star
                      size={17}
                      className="fill-current"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Starred files
                    </p>

                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {fileCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                    <Folder
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Starred folders
                    </p>

                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {folderCount}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search starred items..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-slate-700 dark:focus:bg-slate-900 dark:focus:ring-slate-800"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X
                    size={16}
                  />
                </button>
              )}
            </div>

            {/* CONTROLS */}

            <div className="flex flex-wrap items-center gap-2">

              {/* SORT */}

              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">

                <button
                  type="button"
                  onClick={() =>
                    changeSort(
                      "name"
                    )
                  }
                  className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition ${
                    sortKey ===
                    "name"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <ArrowDownAZ
                    size={15}
                  />

                  Name

                  {sortKey ===
                    "name" &&
                    (sortDirection ===
                    "asc"
                      ? " ↑"
                      : " ↓")}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeSort(
                      "size"
                    )
                  }
                  className={`hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition sm:flex ${
                    sortKey ===
                    "size"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Size

                  {sortKey ===
                    "size" &&
                    (sortDirection ===
                    "asc"
                      ? " ↑"
                      : " ↓")}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeSort(
                      "date"
                    )
                  }
                  className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition ${
                    sortKey ===
                    "date"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <CalendarDays
                    size={14}
                  />

                  Date

                  {sortKey ===
                    "date" &&
                    (sortDirection ===
                    "asc"
                      ? " ↑"
                      : " ↓")}
                </button>

              </div>

              {/* VIEW */}

              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">

                <button
                  type="button"
                  onClick={() =>
                    setViewMode(
                      "grid"
                    )
                  }
                  title="Grid view"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    viewMode ===
                    "grid"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Grid2X2
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode(
                      "list"
                    )
                  }
                  title="List view"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    viewMode ===
                    "list"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <List
                    size={18}
                  />
                </button>

              </div>

            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="px-5 pt-5 sm:px-8">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  Unable to load starred items
                </p>

                <p className="mt-1 text-sm opacity-90">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadPage(true)
                }
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-100 dark:border-red-900 dark:hover:bg-red-950"
              >
                Retry
              </button>

            </div>
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="px-5 py-6 sm:px-8">

          {loading ? (
            <LoadingState />
          ) : filteredItems.length ===
            0 ? (
            <EmptyState
              hasSearch={Boolean(
                search.trim()
              )}
            />
          ) : viewMode ===
            "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

              {filteredItems.map(
                (item) => (
                  <StarredGridCard
                    key={`${item.type}:${item.id}`}
                    item={item}
                    onUnstar={
                      unstarItem
                    }
                    onDownload={
                      item.file
                        ? () =>
                            downloadFile(
                              item.file!
                            )
                        : undefined
                    }
                    downloading={
                      downloadingId ===
                      item.id
                    }
                  />
                )
              )}

            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="hidden grid-cols-[minmax(0,1fr)_120px_150px_110px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800 md:grid">
                <span>
                  Name
                </span>

                <span>
                  Type
                </span>

                <span>
                  Modified
                </span>

                <span />
              </div>

              {filteredItems.map(
                (item) => (
                  <StarredListItem
                    key={`${item.type}:${item.id}`}
                    item={item}
                    onUnstar={
                      unstarItem
                    }
                    onDownload={
                      item.file
                        ? () =>
                            downloadFile(
                              item.file!
                            )
                        : undefined
                    }
                    downloading={
                      downloadingId ===
                      item.id
                    }
                  />
                )
              )}

            </div>
          )}

        </div>
      </div>

      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
              toast.type ===
              "success"
                ? "border-emerald-200 bg-white text-slate-800 dark:border-emerald-900 dark:bg-slate-900 dark:text-white"
                : "border-red-200 bg-white text-red-700 dark:border-red-900 dark:bg-slate-900 dark:text-red-300"
            }`}
          >
            {toast.type ===
            "success" ? (
              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                ✓
              </div>
            ) : (
              <AlertCircle
                size={19}
                className="mt-0.5"
              />
            )}

            <p className="text-sm font-medium">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() =>
                setToast(null)
              }
              className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X
                size={16}
              />
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* =========================================================
   STARRED GRID CARD
========================================================= */

function StarredGridCard({
  item,
  onUnstar,
  onDownload,
  downloading,
}: {
  item: StarredItem;
  onUnstar: (
    item: StarredItem
  ) => void;
  onDownload?: () => void;
  downloading: boolean;
}) {
  const isFolder =
    item.type === "folder";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">

      {/* TOP */}

      <div className="flex items-start justify-between gap-3 p-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isFolder
              ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {isFolder ? (
            <Folder
              size={25}
              className="fill-current/10"
            />
          ) : (
            item.file &&
            getFileIcon(
              item.file,
              25
            )
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onUnstar(item)
          }
          title="Remove from Starred"
          className="rounded-lg p-2 text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10"
        >
          <Star
            size={18}
            className="fill-current"
          />
        </button>

      </div>

      {/* CONTENT */}

      <div className="px-4 pb-4">

        <p
          className="truncate text-sm font-semibold text-slate-900 dark:text-white"
          title={item.name}
        >
          {item.name}
        </p>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

          <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
            {isFolder
              ? "Folder"
              : getFileCategory(
                  item.file!
                )}
          </span>

          {!isFolder &&
            typeof item.size ===
              "number" && (
              <span>
                {formatFileSize(
                  item.size
                )}
              </span>
            )}

        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <CalendarDays
            size={13}
          />

          {formatDate(
            item.createdAt
          )}
        </div>

      </div>

      {/* ACTIONS */}

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">

        {!isFolder &&
          onDownload && (
            <button
              type="button"
              onClick={
                onDownload
              }
              disabled={
                downloading
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {downloading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Download
                  size={15}
                />
              )}

              {downloading
                ? "Downloading..."
                : "Download"}
            </button>
          )}

        <button
          type="button"
          onClick={() =>
            onUnstar(item)
          }
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            isFolder
              ? "w-full"
              : ""
          } text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400`}
        >
          <Trash2
            size={15}
          />

          Remove
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   STARRED LIST ITEM
========================================================= */

function StarredListItem({
  item,
  onUnstar,
  onDownload,
  downloading,
}: {
  item: StarredItem;
  onUnstar: (
    item: StarredItem
  ) => void;
  onDownload?: () => void;
  downloading: boolean;
}) {
  const isFolder =
    item.type === "folder";

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 md:grid md:grid-cols-[minmax(0,1fr)_120px_150px_110px] md:items-center md:gap-4 dark:border-slate-800">

      {/* NAME */}

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isFolder
              ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {isFolder ? (
            <Folder
              size={21}
            />
          ) : (
            item.file &&
            getFileIcon(
              item.file,
              21
            )
          )}
        </div>

        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold text-slate-900 dark:text-white"
            title={item.name}
          >
            {item.name}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {isFolder
              ? "Folder"
              : formatFileSize(
                  item.size || 0
                )}
          </p>
        </div>

      </div>

      {/* TYPE */}

      <div className="hidden text-xs font-medium capitalize text-slate-500 md:block dark:text-slate-400">
        {isFolder
          ? "Folder"
          : getFileCategory(
              item.file!
            )}
      </div>

      {/* DATE */}

      <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex dark:text-slate-400">
        <CalendarDays
          size={14}
        />

        {formatDate(
          item.createdAt
        )}
      </div>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-1">

        {!isFolder &&
          onDownload && (
            <button
              type="button"
              onClick={
                onDownload
              }
              disabled={
                downloading
              }
              title="Download"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {downloading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Download
                  size={17}
                />
              )}
            </button>
          )}

        <button
          type="button"
          onClick={() =>
            onUnstar(item)
          }
          title="Remove from Starred"
          className="rounded-lg p-2 text-amber-500 transition hover:bg-amber-50 hover:text-red-600 dark:hover:bg-amber-500/10 dark:hover:text-red-400"
        >
          <Star
            size={17}
            className="fill-current"
          />
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="mt-5 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-3 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-5 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-5 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasSearch,
}: {
  hasSearch: boolean;
}) {
  return (
    <div className="flex min-h-[430px] items-center justify-center">

      <div className="max-w-md text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
          <Star
            size={29}
            className="fill-current"
          />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
          {hasSearch
            ? "No starred items found"
            : "No starred items yet"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {hasSearch
            ? "Try a different search term."
            : "Star your important files and folders from My Files to access them quickly from here."}
        </p>

        {!hasSearch && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Star
              size={14}
              className="fill-current text-amber-500"
            />

            Click the star icon on
            any file or folder
          </div>
        )}

      </div>

    </div>
  );
}
