"use client";

import {
  Archive,
  Check,
  ChevronDown,
  File,
  FileImage,
  FileText,
  Folder,
  Grid2X2,
  HardDrive,
  List,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

/* =========================================
   TYPES
========================================= */

type TrashType =
  | "folder"
  | "pdf"
  | "image"
  | "document"
  | "zip"
  | "other";

type TrashItem = {
  id: string;
  name: string;
  type: TrashType;
  sizeBytes: number;
  size: string;
  deletedAt: string;
  parentId: string | null;
};

/* =========================================
   BACKEND TYPE
========================================= */

type BackendTrashItem = {
  id: string | number;

  name?: string;
  fileName?: string;
  filename?: string;

  type?: string;
  fileType?: string;

  mimeType?: string;
  contentType?: string;

  size?: number | string;
  fileSize?: number | string;

  deletedAt?: string;
  deleted_at?: string;

  updatedAt?: string;
  createdAt?: string;

  parentId?: string | number | null;
  folderId?: string | number | null;

  folder?: boolean;
  isFolder?: boolean;
};

/* =========================================
   AUTH TOKEN
========================================= */

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
    const value =
      localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

/* =========================================
   API REQUEST
========================================= */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers = new Headers(
    options.headers
  );

  if (!(options.body instanceof FormData)) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
      cache: "no-store",
    }
  );

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get(
      "content-type"
    );

  let data: unknown = null;

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    data = await response.json();
  } else {
    const text =
      await response.text();

    data = text || null;
  }

  if (!response.ok) {
    let message =
      "Something went wrong.";

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const objectData =
        data as Record<
          string,
          unknown
        >;

      message = String(
        objectData.message ||
          objectData.error ||
          objectData.detail ||
          message
      );
    } else if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    throw new Error(message);
  }

  return data as T;
}

/* =========================================
   SIZE
========================================= */

function parseSize(
  value:
    | number
    | string
    | null
    | undefined
): number {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (
    typeof value !== "string"
  ) {
    return 0;
  }

  const text =
    value.trim();

  if (!text) return 0;

  const number =
    Number(text);

  if (Number.isFinite(number)) {
    return number;
  }

  const match =
    text.match(
      /^([\d.]+)\s*(B|KB|MB|GB|TB)$/i
    );

  if (!match) return 0;

  const amount =
    Number(match[1]);

  const unit =
    match[2].toUpperCase();

  const multipliers: Record<
    string,
    number
  > = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return (
    amount *
    (multipliers[unit] || 1)
  );
}

/* =========================================
   FORMAT SIZE
========================================= */

function formatSize(
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

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

/* =========================================
   DATE
========================================= */

function formatDeletedDate(
  value?: string
): string {
  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  const now =
    new Date();

  const difference = Math.max(
    0,
    now.getTime() -
      date.getTime()
  );

  const minutes =
    Math.floor(
      difference / 60000
    );

  const hours =
    Math.floor(
      difference / 3600000
    );

  const days =
    Math.floor(
      difference / 86400000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr${
      hours === 1
        ? ""
        : "s"
    } ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================
   TYPE DETECTION
========================================= */

function getTrashType(
  name: string,
  mimeType = "",
  backendType = ""
): TrashType {
  if (
    backendType
      .toLowerCase()
      .includes("folder")
  ) {
    return "folder";
  }

  if (
    mimeType
      .toLowerCase()
      .startsWith(
        "image/"
      )
  ) {
    return "image";
  }

  if (
    mimeType.toLowerCase() ===
    "application/pdf"
  ) {
    return "pdf";
  }

  if (
    mimeType
      .toLowerCase()
      .includes("zip") ||
    mimeType
      .toLowerCase()
      .includes(
        "compressed"
      )
  ) {
    return "zip";
  }

  const extension =
    name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "pdf"
  ) {
    return "pdf";
  }

  if (
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "bmp",
      "avif",
      "heic",
      "heif",
    ].includes(
      extension || ""
    )
  ) {
    return "image";
  }

  if (
    [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
    ].includes(
      extension || ""
    )
  ) {
    return "zip";
  }

  if (
    [
      "doc",
      "docx",
      "txt",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "csv",
    ].includes(
      extension || ""
    )
  ) {
    return "document";
  }

  return "other";
}

/* =========================================
   NORMALIZE
========================================= */

function normalizeTrashItem(
  item: BackendTrashItem
): TrashItem {
  const name =
    item.name ||
    item.fileName ||
    item.filename ||
    "Untitled";

  const mime =
    item.mimeType ||
    item.contentType ||
    "";

  const backendType =
    item.fileType ||
    item.type ||
    "";

  const type =
    item.folder ||
    item.isFolder
      ? "folder"
      : getTrashType(
          name,
          mime,
          backendType
        );

  const sizeBytes =
    type === "folder"
      ? 0
      : parseSize(
          item.size ??
            item.fileSize
        );

  return {
    id: String(
      item.id
    ),

    name,

    type,

    sizeBytes,

    size:
      type === "folder"
        ? "—"
        : formatSize(
            sizeBytes
          ),

    deletedAt:
      item.deletedAt ||
      item.deleted_at ||
      item.updatedAt ||
      item.createdAt ||
      "",

    parentId:
      item.parentId ===
        null ||
      item.parentId ===
        undefined
        ? item.folderId ===
          null ||
          item.folderId ===
            undefined
          ? null
          : String(
              item.folderId
            )
        : String(
            item.parentId
          ),
  };
}

/* =========================================
   PAGE
========================================= */

export default function TrashPage() {
  const [items, setItems] =
    useState<TrashItem[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState<
      "recent" | "name" | "size"
    >("recent");

  const [view, setView] =
    useState<
      "grid" | "list"
    >("grid");

  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(
      new Set()
    );

  const [restoreId, setRestoreId] =
    useState<string | null>(
      null
    );

  const [deleteId, setDeleteId] =
    useState<string | null>(
      null
    );

  const [showEmptyConfirm, setShowEmptyConfirm] =
    useState(false);

  const [emptyingTrash, setEmptyingTrash] =
    useState(false);

  /* =========================================
     LOAD TRASH
  ========================================== */

  const loadTrash =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const response =
            await apiRequest<unknown>(
              "/api/trash"
            );

          let rawItems:
            BackendTrashItem[] =
            [];

          if (
            Array.isArray(
              response
            )
          ) {
            rawItems =
              response as BackendTrashItem[];
          } else if (
            response &&
            typeof response ===
              "object"
          ) {
            const data =
              response as Record<
                string,
                unknown
              >;

            if (
              Array.isArray(
                data.content
              )
            ) {
              rawItems =
                data.content as BackendTrashItem[];
            } else if (
              Array.isArray(
                data.items
              )
            ) {
              rawItems =
                data.items as BackendTrashItem[];
            } else if (
              Array.isArray(
                data.files
              )
            ) {
              rawItems =
                data.files as BackendTrashItem[];
            } else if (
              Array.isArray(
                data.data
              )
            ) {
              rawItems =
                data.data as BackendTrashItem[];
            }
          }

          const normalized =
            rawItems.map(
              normalizeTrashItem
            );

          setItems(
            normalized
          );

          setSelectedIds(
            new Set()
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Trash."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /* =========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  /* =========================================
     SELECTED
  ========================================== */

  const filteredItems =
    useMemo(() => {
      let result =
        items.filter(
          (item) =>
            item.name
              .toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase()
              )
        );

      if (
        sortBy === "name"
      ) {
        result =
          [...result].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          );
      }

      if (
        sortBy === "size"
      ) {
        result =
          [...result].sort(
            (a, b) =>
              b.sizeBytes -
              a.sizeBytes
          );
      }

      if (
        sortBy === "recent"
      ) {
        result =
          [...result].sort(
            (a, b) => {
              const dateA =
                new Date(
                  a.deletedAt
                ).getTime();

              const dateB =
                new Date(
                  b.deletedAt
                ).getTime();

              return (
                dateB - dateA
              );
            }
          );
      }

      return result;
    }, [
      items,
      search,
      sortBy,
    ]);

  /* =========================================
     STORAGE
  ========================================== */

  const deletedBytes =
    items.reduce(
      (total, item) =>
        total +
        item.sizeBytes,
      0
    );

  /* =========================================
     SELECTION
  ========================================== */

  const allVisibleSelected =
    filteredItems.length >
      0 &&
    filteredItems.every(
      (item) =>
        selectedIds.has(
          item.id
        )
    );

  function toggleSelect(
    id: string
  ) {
    setSelectedIds(
      (previous) => {
        const next =
          new Set(
            previous
          );

        if (
          next.has(id)
        ) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      }
    );
  }

  function toggleSelectAll() {
    if (
      allVisibleSelected
    ) {
      setSelectedIds(
        (previous) => {
          const next =
            new Set(
              previous
            );

          filteredItems.forEach(
            (item) =>
              next.delete(
                item.id
              )
          );

          return next;
        }
      );

      return;
    }

    setSelectedIds(
      (previous) => {
        const next =
          new Set(
            previous
          );

        filteredItems.forEach(
          (item) =>
            next.add(
              item.id
            )
        );

        return next;
      }
    );
  }

  /* =========================================
     RESTORE
  ========================================== */

  async function restoreItem(
    id: string
  ) {
    try {
      setRestoreId(id);
      setError("");

      await apiRequest(
        `/api/trash/${encodeURIComponent(
          id
        )}/restore`,
        {
          method: "POST",
        }
      );

      await loadTrash(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Restore failed."
      );
    } finally {
      setRestoreId(null);
    }
  }

  /* =========================================
     PERMANENT DELETE
  ========================================== */

  async function permanentlyDelete(
    id: string
  ) {
    const item =
      items.find(
        (entry) =>
          entry.id === id
      );

    if (!item) return;

    const confirmed =
      window.confirm(
        `Permanently delete "${item.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteId(id);
      setError("");

      await apiRequest(
        `/api/trash/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      await loadTrash(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Permanent delete failed."
      );
    } finally {
      setDeleteId(null);
    }
  }

  /* =========================================
     RESTORE SELECTED
  ========================================== */

  async function restoreSelected() {
    const ids =
      Array.from(
        selectedIds
      );

    if (!ids.length) {
      return;
    }

    try {
      setError("");

      for (const id of ids) {
        await apiRequest(
          `/api/trash/${encodeURIComponent(
            id
          )}/restore`,
          {
            method: "POST",
          }
        );
      }

      await loadTrash(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to restore selected items."
      );
    }
  }

  /* =========================================
     DELETE SELECTED
  ========================================== */

  async function deleteSelected() {
    const ids =
      Array.from(
        selectedIds
      );

    if (!ids.length) {
      return;
    }

    const confirmed =
      window.confirm(
        `Permanently delete ${ids.length} selected item${
          ids.length === 1
            ? ""
            : "s"
        }? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      for (const id of ids) {
        await apiRequest(
          `/api/trash/${encodeURIComponent(
            id
          )}`,
          {
            method: "DELETE",
          }
        );
      }

      await loadTrash(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to permanently delete selected items."
      );
    }
  }

  /* =========================================
     EMPTY TRASH
  ========================================== */

  async function emptyTrash() {
    try {
      setEmptyingTrash(true);
      setError("");

      await apiRequest(
        "/api/trash/empty",
        {
          method: "DELETE",
        }
      );

      setShowEmptyConfirm(
        false
      );

      await loadTrash(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to empty Trash."
      );
    } finally {
      setEmptyingTrash(false);
    }
  }

  /* =========================================
     RENDER
  ========================================== */

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>

              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                Recycle Bin
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Trash
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Deleted files stay here until you restore or permanently delete them.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                loadTrash(false)
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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

            {items.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  setShowEmptyConfirm(
                    true
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Empty Trash
              </button>
            )}
          </div>
        </div>

        {/* =====================================
            WARNING
        ====================================== */}

        {items.length >
          0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-500/20 dark:bg-amber-500/10">

            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Items in Trash
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                Restore items to move them back to My Files, or permanently delete them to remove them forever.
              </p>
            </div>
          </div>
        )}

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =====================================
            STORAGE / STATS
        ====================================== */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <StatCard
            icon={
              <Trash2 className="h-5 w-5" />
            }
            label="Items in Trash"
            value={String(
              items.length
            )}
          />

          <StatCard
            icon={
              <HardDrive className="h-5 w-5" />
            }
            label="Trash Storage"
            value={formatSize(
              deletedBytes
            )}
          />

          <StatCard
            icon={
              <RotateCcw className="h-5 w-5" />
            }
            label="Recoverable Items"
            value={String(
              items.length
            )}
          />
        </div>

        {/* =====================================
            TOOLBAR
        ====================================== */}

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">

            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(
                event: ChangeEvent<HTMLInputElement>
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search deleted files..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {selectedIds.size >
              0 && (
              <>
                <button
                  type="button"
                  onClick={
                    restoreSelected
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore (
                  {
                    selectedIds.size
                  }
                  )
                </button>

                <button
                  type="button"
                  onClick={
                    deleteSelected
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}

            <div className="relative">

              <select
                value={sortBy}
                onChange={(
                  event
                ) =>
                  setSortBy(
                    event.target
                      .value as
                      | "recent"
                      | "name"
                      | "size"
                  )
                }
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <option value="recent">
                  Recently Deleted
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

            <div className="flex h-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">

              <button
                type="button"
                onClick={() =>
                  setView("grid")
                }
                className={`rounded-lg px-3 ${
                  view === "grid"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setView("list")
                }
                className={`rounded-lg px-3 ${
                  view === "list"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================
            SELECT ALL
        ====================================== */}

        {!loading &&
          filteredItems.length >
            0 && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">

              <button
                type="button"
                onClick={
                  toggleSelectAll
                }
                className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    allVisibleSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 dark:border-white/20"
                  }`}
                >
                  {allVisibleSelected && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </span>

                Select all
              </button>

              <span className="text-xs text-slate-400">
                {filteredItems.length}{" "}
                item
                {filteredItems.length ===
                1
                  ? ""
                  : "s"}
              </span>
            </div>
          )}

        {/* =====================================
            CONTENT
        ====================================== */}

        <div className="mt-4">

          {loading ? (
            <LoadingState />
          ) : filteredItems.length ===
            0 ? (
            <EmptyTrash
              search={search}
              onClearSearch={() =>
                setSearch("")
              }
            />
          ) : view ===
            "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredItems.map(
                (item) => (
                  <TrashCard
                    key={item.id}
                    item={item}
                    selected={selectedIds.has(
                      item.id
                    )}
                    restoring={
                      restoreId ===
                      item.id
                    }
                    deleting={
                      deleteId ===
                      item.id
                    }
                    onSelect={() =>
                      toggleSelect(
                        item.id
                      )
                    }
                    onRestore={() =>
                      restoreItem(
                        item.id
                      )
                    }
                    onDelete={() =>
                      permanentlyDelete(
                        item.id
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <TrashList
              items={
                filteredItems
              }
              selectedIds={
                selectedIds
              }
              restoreId={
                restoreId
              }
              deleteId={
                deleteId
              }
              onSelect={
                toggleSelect
              }
              onRestore={
                restoreItem
              }
              onDelete={
                permanentlyDelete
              }
            />
          )}
        </div>

        {/* =====================================
            EMPTY TRASH MODAL
        ====================================== */}

        {showEmptyConfirm && (
          <ConfirmModal
            title="Empty Trash?"
            description="All items currently in Trash will be permanently deleted. This action cannot be undone."
            confirmText={
              emptyingTrash
                ? "Deleting..."
                : "Empty Trash"
            }
            danger
            loading={
              emptyingTrash
            }
            onClose={() =>
              setShowEmptyConfirm(
                false
              )
            }
            onConfirm={
              emptyTrash
            }
          />
        )}
      </div>
    </DashboardShell>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   TRASH CARD
========================================= */

function TrashCard({
  item,
  selected,
  restoring,
  deleting,
  onSelect,
  onRestore,
  onDelete,
}: {
  item: TrashItem;
  selected: boolean;
  restoring: boolean;
  deleting: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-white/[0.04] ${
        selected
          ? "border-blue-500 ring-4 ring-blue-500/10"
          : "border-slate-200 dark:border-white/10"
      }`}
    >

      {/* CHECKBOX */}

      <button
        type="button"
        onClick={onSelect}
        className={`absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-md border ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white/90 dark:border-white/20 dark:bg-slate-900/90"
        }`}
      >
        {selected && (
          <Check className="h-3.5 w-3.5" />
        )}
      </button>

      {/* ICON */}

      <div className="flex items-start justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <TrashIcon
            type={item.type}
          />
        </div>

        <MoreHorizontal className="h-5 w-5 text-slate-300" />
      </div>

      {/* NAME */}

      <div className="mt-4">

        <p className="truncate pr-8 text-sm font-semibold text-slate-800 dark:text-white">
          {item.name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">

          <span className="text-xs text-slate-400">
            {item.type ===
            "folder"
              ? "Folder"
              : item.size}
          </span>

          <span className="truncate text-xs text-slate-400">
            {formatDeletedDate(
              item.deletedAt
            )}
          </span>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-white/5">

        <button
          type="button"
          onClick={
            onRestore
          }
          disabled={
            restoring ||
            deleting
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
        >
          {restoring ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}

          Restore
        </button>

        <button
          type="button"
          onClick={
            onDelete
          }
          disabled={
            restoring ||
            deleting
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}

          Delete
        </button>
      </div>
    </div>
  );
}

/* =========================================
   LIST
========================================= */

function TrashList({
  items,
  selectedIds,
  restoreId,
  deleteId,
  onSelect,
  onRestore,
  onDelete,
}: {
  items: TrashItem[];
  selectedIds: Set<string>;
  restoreId: string | null;
  deleteId: string | null;
  onSelect: (
    id: string
  ) => void;
  onRestore: (
    id: string
  ) => void;
  onDelete: (
    id: string
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

      {/* HEADER */}

      <div className="hidden grid-cols-[40px_1fr_140px_180px_210px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-white/10 md:grid">
        <span />
        <span>Name</span>
        <span>Size</span>
        <span>Deleted</span>
        <span>Actions</span>
      </div>

      {items.map(
        (item) => {
          const selected =
            selectedIds.has(
              item.id
            );

          return (
            <div
              key={item.id}
              className={`grid gap-3 border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 md:grid-cols-[40px_1fr_140px_180px_210px] md:items-center md:gap-4 md:px-5 ${
                selected
                  ? "bg-blue-50/50 dark:bg-blue-500/5"
                  : "hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >

              {/* CHECK */}

              <button
                type="button"
                onClick={() =>
                  onSelect(
                    item.id
                  )
                }
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 dark:border-white/20"
                }`}
              >
                {selected && (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>

              {/* NAME */}

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  <TrashIcon
                    type={
                      item.type
                    }
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.type ===
                    "folder"
                      ? "Folder"
                      : item.type.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* SIZE */}

              <span className="hidden text-xs text-slate-400 md:block">
                {item.type ===
                "folder"
                  ? "—"
                  : item.size}
              </span>

              {/* DATE */}

              <span className="hidden text-xs text-slate-400 md:block">
                {formatDeletedDate(
                  item.deletedAt
                )}
              </span>

              {/* ACTIONS */}

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    onRestore(
                      item.id
                    )
                  }
                  disabled={
                    restoreId ===
                      item.id ||
                    deleteId ===
                      item.id
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                >
                  {restoreId ===
                  item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}

                  Restore
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(
                      item.id
                    )
                  }
                  disabled={
                    restoreId ===
                      item.id ||
                    deleteId ===
                      item.id
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                >
                  {deleteId ===
                  item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}

                  Delete
                </button>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

/* =========================================
   ICON
========================================= */

function TrashIcon({
  type,
}: {
  type: TrashType;
}) {
  switch (type) {
    case "folder":
      return (
        <Folder className="h-6 w-6" />
      );

    case "image":
      return (
        <FileImage className="h-6 w-6" />
      );

    case "pdf":
    case "document":
      return (
        <FileText className="h-6 w-6" />
      );

    case "zip":
      return (
        <Archive className="h-6 w-6" />
      );

    default:
      return (
        <File className="h-6 w-6" />
      );
  }
}

/* =========================================
   EMPTY STATE
========================================= */

function EmptyTrash({
  search,
  onClearSearch,
}: {
  search: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-white/5">

        <Trash2 className="h-9 w-9 text-slate-400" />
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
        {search
          ? "No deleted files found"
          : "Trash is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        {search
          ? "Try another search term to find deleted items."
          : "Files and folders you delete will appear here. You can restore them whenever you need."}
      </p>

      {search && (
        <button
          type="button"
          onClick={
            onClearSearch
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

/* =========================================
   LOADING
========================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Loading Trash...
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Fetching your deleted files securely.
      </p>
    </div>
  );
}

/* =========================================
   CONFIRM MODAL
========================================= */

function ConfirmModal({
  title,
  description,
  confirmText,
  danger,
  loading,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmText: string;
  danger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <div className="flex items-start gap-4">

          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          }`}>
            {danger ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <Trash2 className="h-6 w-6" />
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
