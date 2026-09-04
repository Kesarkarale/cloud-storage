"use client";

import {
  Archive,
  Check,
  ChevronDown,
  File as FileIcon,
  FileImage,
  FileText,
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
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

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
  parentFolderId?: string | number | null;
  folderId?: string | number | null;

  folder?: boolean;
  isFolder?: boolean;
};

type ViewMode = "grid" | "list";

type ModalType =
  | "delete"
  | "restore"
  | "empty"
  | null;

function getToken(): string | null {
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

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const headers = new Headers(
    options.headers || {}
  );

  if (token) {
    headers.set(
      "Authorization",
      token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`
    );
  }

  if (!(options.body instanceof FormData)) {
    headers.set(
      "Content-Type",
      "application/json"
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
    return null;
  }

  const contentType =
    response.headers.get("content-type") || "";

  const isJson =
    contentType.includes("application/json");

  const data = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          "Something went wrong";

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

  return data;
}

function formatFileSize(
  bytes: number
): string {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const safeIndex = Math.min(
    index,
    units.length - 1
  );

  const value =
    bytes /
    Math.pow(1024, safeIndex);

  return `${value.toFixed(
    safeIndex === 0 ? 0 : 1
  )} ${units[safeIndex]}`;
}

/* =========================================================
   FILE / FOLDER TYPE DETECTION
   ========================================================= */
function getFileType(
  item: BackendTrashItem
): TrashType {
  /*
   * Folder object from backend does not necessarily contain
   * folder=true / isFolder=true.
   *
   * Folder has:
   * - name
   * - userId / parentFolderId / createdAt
   * - no fileName
   * - no fileType
   * - no fileSize
   *
   * So detect that case as well.
   */
  const isFolder =
    item.folder === true ||
    item.isFolder === true ||
    (
      !!item.name &&
      !item.fileName &&
      !item.filename &&
      !item.fileType &&
      !item.mimeType &&
      !item.contentType &&
      item.size === undefined &&
      item.fileSize === undefined
    );

  if (isFolder) {
    return "folder";
  }

  const mime = (
    item.fileType ||
    item.mimeType ||
    item.contentType ||
    item.type ||
    ""
  ).toLowerCase();

  const name = (
    item.fileName ||
    item.filename ||
    item.name ||
    ""
  ).toLowerCase();

  /* PDF */
  if (
    mime.includes("pdf") ||
    name.endsWith(".pdf")
  ) {
    return "pdf";
  }

  /* IMAGE */
  if (
    mime.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|heic|heif)$/i.test(
      name
    )
  ) {
    return "image";
  }

  /* ZIP / ARCHIVE */
  if (
    mime.includes("zip") ||
    mime.includes("compressed") ||
    /\.(zip|rar|7z|tar|gz)$/i.test(name)
  ) {
    return "zip";
  }

  /* DOCUMENT */
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("text") ||
    /\.(doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx|csv)$/i.test(
      name
    )
  ) {
    return "document";
  }

  return "other";
}

function getFileIcon(type: TrashType) {
  switch (type) {
    case "pdf":
      return FileText;

    case "image":
      return FileImage;

    case "document":
      return FileText;

    case "folder":
      return Archive;

    case "zip":
      return Archive;

    default:
      return FileIcon;
  }
}

function getTypeLabel(type: TrashType) {
  switch (type) {
    case "pdf":
      return "PDF";

    case "image":
      return "Image";

    case "document":
      return "Document";

    case "zip":
      return "Archive";

    case "folder":
      return "Folder";

    default:
      return "File";
  }
}

function formatDeletedDate(
  date: string
) {
  if (!date) {
    return "Recently deleted";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently deleted";
  }

  return parsed.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function normalizeTrashItem(
  item: BackendTrashItem
): TrashItem {
  const rawSize =
    item.fileSize ??
    item.size ??
    0;

  const sizeBytes =
    typeof rawSize === "string"
      ? Number(rawSize) || 0
      : Number(rawSize) || 0;

  const name =
    item.fileName ||
    item.filename ||
    item.name ||
    "Untitled file";

  const type = getFileType(item);

  return {
    id: String(item.id),

    name,

    type,

    sizeBytes,

    size:
      type === "folder"
        ? "—"
        : formatFileSize(sizeBytes),

    deletedAt:
      item.deletedAt ||
      item.deleted_at ||
      item.updatedAt ||
      item.createdAt ||
      "",

    parentId:
      item.parentFolderId != null
        ? String(item.parentFolderId)
        : item.parentId != null
        ? String(item.parentId)
        : item.folderId != null
        ? String(item.folderId)
        : null,
  };
}

export default function TrashPage() {
  const [items, setItems] = useState<
    TrashItem[]
  >([]);

  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(
      new Set()
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [modalType, setModalType] =
    useState<ModalType>(null);

  const [modalItem, setModalItem] =
    useState<TrashItem | null>(null);

  const [showMenu, setShowMenu] =
    useState<string | null>(null);

  const loadTrash = useCallback(
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

        const data =
          await apiRequest("/api/trash");

        let backendItems: BackendTrashItem[] =
          [];

        if (Array.isArray(data)) {
          backendItems = data;
        } else if (
          data &&
          Array.isArray(data.content)
        ) {
          backendItems = data.content;
        } else if (
          data &&
          Array.isArray(data.items)
        ) {
          backendItems = data.items;
        } else if (
          data &&
          Array.isArray(data.files)
        ) {
          backendItems = data.files;
        } else if (
          data &&
          Array.isArray(data.data)
        ) {
          backendItems = data.data;
        }

        const normalized =
          backendItems.map(
            normalizeTrashItem
          );

        setItems(normalized);

        setSelectedIds(
          new Set()
        );
      } catch (err) {
        console.error(
          "Trash loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load trash"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const filteredItems = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(query) ||
        getTypeLabel(item.type)
          .toLowerCase()
          .includes(query)
    );
  }, [
    items,
    searchQuery,
  ]);

  const allVisibleSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) =>
      selectedIds.has(item.id)
    );

  const selectedCount =
    selectedIds.size;

  const toggleSelection = (
    id: string
  ) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (allVisibleSelected) {
        filteredItems.forEach(
          (item) =>
            next.delete(item.id)
        );
      } else {
        filteredItems.forEach(
          (item) =>
            next.add(item.id)
        );
      }

      return next;
    });
  };

  const openRestoreModal = (
    item: TrashItem
  ) => {
    setModalItem(item);
    setModalType("restore");
    setShowMenu(null);
  };

  const openDeleteModal = (
    item: TrashItem
  ) => {
    setModalItem(item);
    setModalType("delete");
    setShowMenu(null);
  };

  const restoreItem = async (
    id: string
  ) => {
    try {
      setActionLoading(true);
      setError(null);

      await apiRequest(
        `/api/trash/${encodeURIComponent(
          id
        )}/restore`,
        {
          method: "POST",
        }
      );

      setItems((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      setSelectedIds((previous) => {
        const next = new Set(previous);

        next.delete(id);

        return next;
      });

      setModalType(null);
      setModalItem(null);
    } catch (err) {
      console.error(
        "Restore error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to restore item"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const permanentlyDelete = async (
    id: string
  ) => {
    try {
      setActionLoading(true);
      setError(null);

      await apiRequest(
        `/api/trash/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      setItems((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      setSelectedIds((previous) => {
        const next = new Set(previous);

        next.delete(id);

        return next;
      });

      setModalType(null);
      setModalItem(null);
    } catch (err) {
      console.error(
        "Permanent delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to permanently delete item"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const restoreSelected = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const ids =
        Array.from(selectedIds);

      await Promise.all(
        ids.map((id) =>
          apiRequest(
            `/api/trash/${encodeURIComponent(
              id
            )}/restore`,
            {
              method: "POST",
            }
          )
        )
      );

      setItems((previous) =>
        previous.filter(
          (item) =>
            !selectedIds.has(item.id)
        )
      );

      setSelectedIds(
        new Set()
      );

      setModalType(null);
      setModalItem(null);
    } catch (err) {
      console.error(
        "Restore selected error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to restore selected items"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const ids =
        Array.from(selectedIds);

      await Promise.all(
        ids.map((id) =>
          apiRequest(
            `/api/trash/${encodeURIComponent(
              id
            )}`,
            {
              method: "DELETE",
            }
          )
        )
      );

      setItems((previous) =>
        previous.filter(
          (item) =>
            !selectedIds.has(item.id)
        )
      );

      setSelectedIds(
        new Set()
      );

      setModalType(null);
      setModalItem(null);
    } catch (err) {
      console.error(
        "Delete selected error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to permanently delete selected items"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const emptyTrash = async () => {
    try {
      setActionLoading(true);
      setError(null);

      await apiRequest(
        "/api/trash/empty",
        {
          method: "DELETE",
        }
      );

      setItems([]);

      setSelectedIds(
        new Set()
      );

      setModalType(null);
      setModalItem(null);
    } catch (err) {
      console.error(
        "Empty trash error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to empty trash"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setModalType(null);
    setModalItem(null);
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900">
                  <Trash2 size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Trash
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Files deleted from your storage
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  loadTrash(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setModalType("empty");
                    setModalItem(null);
                  }}
                  disabled={
                    actionLoading
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />

                  Empty Trash
                </button>
              )}

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1">

                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setError(null)
                }
                className="rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <X size={16} />
              </button>

            </div>
          )}

          {/* Search / Toolbar */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative w-full xl:max-w-md">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search trash..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-500 dark:focus:bg-slate-950"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery("")
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <X size={15} />
                  </button>
                )}

              </div>

              <div className="flex flex-wrap items-center gap-2">

                {filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={
                      toggleSelectAll
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        allVisibleSelected
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {allVisibleSelected && (
                        <Check size={11} />
                      )}
                    </span>

                    Select all
                  </button>
                )}

                <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("grid")
                    }
                    className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
                      viewMode === "grid"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid2X2 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("list")
                    }
                    className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
                      viewMode === "list"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>

                </div>
              </div>
            </div>

            {/* Selected actions */}
            {selectedCount > 0 && (
              <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950">

                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">

                  <div className="flex h-7 min-w-7 items-center justify-center rounded-md bg-slate-900 px-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                    {selectedCount}
                  </div>

                  selected
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      restoreSelected
                    }
                    disabled={
                      actionLoading
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {actionLoading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <RotateCcw
                        size={15}
                      />
                    )}

                    Restore
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalType(
                        "delete"
                      );
                      setModalItem(null);
                    }}
                    disabled={
                      actionLoading
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <Trash2 size={15} />

                    Delete permanently
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIds(
                        new Set()
                      )
                    }
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent px-2.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Clear selection"
                  >
                    <X size={16} />
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

              <div className="flex flex-col items-center gap-3 text-center">

                <Loader2
                  size={30}
                  className="animate-spin text-slate-500"
                />

                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Loading trash...
                </p>

              </div>
            </div>
          ) : items.length === 0 ? (

            /* Empty Trash */
            <div className="flex min-h-[480px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">

              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                <Trash2
                  size={34}
                  className="text-slate-400"
                />

              </div>

              <h2 className="text-xl font-bold">
                Trash is empty
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Files and folders you delete will appear here.
                You can restore them or permanently
                delete them from this page.
              </p>

            </div>
          ) : filteredItems.length === 0 ? (

            /* No Search Results */
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center dark:border-slate-800 dark:bg-slate-900">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                <Search
                  size={28}
                  className="text-slate-400"
                />

              </div>

              <h2 className="text-lg font-bold">
                No files found
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try a different search term.
              </p>

            </div>
          ) : viewMode === "grid" ? (

            /* GRID */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredItems.map(
                (item) => {
                  const Icon =
                    getFileIcon(
                      item.type
                    );

                  const selected =
                    selectedIds.has(
                      item.id
                    );

                  return (
                    <div
                      key={item.id}
                      className={`group relative overflow-hidden rounded-xl border bg-white transition dark:bg-slate-900 ${
                        selected
                          ? "border-slate-900 ring-1 ring-slate-900 dark:border-white dark:ring-white"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                      }`}
                    >

                      {/* Selection */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleSelection(
                            item.id
                          )
                        }
                        className={`absolute left-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded border transition ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                            : "border-slate-300 bg-white/90 text-transparent hover:border-slate-500 dark:border-slate-600 dark:bg-slate-900/90"
                        }`}
                        aria-label={
                          selected
                            ? "Unselect item"
                            : "Select item"
                        }
                      >
                        <Check size={12} />
                      </button>

                      {/* Menu */}
                      <div className="absolute right-3 top-3 z-20">

                        <button
                          type="button"
                          onClick={() =>
                            setShowMenu(
                              showMenu ===
                                item.id
                                ? null
                                : item.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <MoreHorizontal
                            size={17}
                          />
                        </button>

                        {showMenu ===
                          item.id && (
                          <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">

                            <button
                              type="button"
                              onClick={() =>
                                openRestoreModal(
                                  item
                                )
                              }
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <RotateCcw
                                size={15}
                              />

                              Restore
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(
                                  item
                                )
                              }
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              <Trash2
                                size={15}
                              />

                              Delete permanently
                            </button>

                          </div>
                        )}

                      </div>

                      {/* File preview area */}
                      <div className="flex h-44 items-center justify-center bg-slate-50 dark:bg-slate-950">

                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                          <Icon
                            size={40}
                            strokeWidth={1.5}
                            className="text-slate-400"
                          />

                        </div>

                      </div>

                      {/* Details */}
                      <div className="p-4">

                        <div className="min-w-0 pr-2">

                          <h3
                            title={item.name}
                            className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                          >
                            {item.name}
                          </h3>

                          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

                            <span>
                              {getTypeLabel(
                                item.type
                              )}
                            </span>

                            <span>•</span>

                            <span>
                              {item.size}
                            </span>

                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">

                            <Trash2
                              size={12}
                            />

                            <span>
                              Deleted{" "}
                              {formatDeletedDate(
                                item.deletedAt
                              )}
                            </span>

                          </div>

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openRestoreModal(
                                item
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <RotateCcw
                              size={14}
                            />

                            Restore
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(
                                item
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2
                              size={14}
                            />

                            Delete
                          </button>

                        </div>
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            /* LIST */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

              <div className="hidden grid-cols-[40px_minmax(240px,1.7fr)_120px_130px_170px_120px] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">

                <div />

                <div>
                  Name
                </div>

                <div>
                  Type
                </div>

                <div>
                  Size
                </div>

                <div>
                  Deleted
                </div>

                <div className="text-right">
                  Action
                </div>

              </div>

              {filteredItems.map(
                (item) => {
                  const Icon =
                    getFileIcon(
                      item.type
                    );

                  const selected =
                    selectedIds.has(
                      item.id
                    );

                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800 md:grid-cols-[40px_minmax(240px,1.7fr)_120px_130px_170px_120px] ${
                        selected
                          ? "bg-slate-50 dark:bg-slate-800/50"
                          : ""
                      }`}
                    >

                      {/* checkbox */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleSelection(
                            item.id
                          )
                        }
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                            : "border-slate-300 text-transparent dark:border-slate-600"
                        }`}
                      >
                        <Check size={12} />
                      </button>

                      {/* name */}
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">

                          <Icon
                            size={20}
                            className="text-slate-400"
                          />

                        </div>

                        <div className="min-w-0">

                          <p
                            title={item.name}
                            className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                          >
                            {item.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            Deleted item
                          </p>

                        </div>
                      </div>

                      {/* type */}
                      <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
                        {getTypeLabel(
                          item.type
                        )}
                      </div>

                      {/* size */}
                      <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
                        {item.size}
                      </div>

                      {/* deleted */}
                      <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
                        {formatDeletedDate(
                          item.deletedAt
                        )}
                      </div>

                      {/* actions */}
                      <div className="flex items-center justify-end gap-1.5">

                        <button
                          type="button"
                          onClick={() =>
                            openRestoreModal(
                              item
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="hidden h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:inline-flex dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <RotateCcw
                            size={13}
                          />

                          Restore
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(
                              item
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="hidden h-8 items-center gap-1.5 rounded-lg bg-red-600 px-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 sm:inline-flex"
                        >
                          <Trash2
                            size={13}
                          />

                          Delete
                        </button>

                        <div className="relative sm:hidden">

                          <button
                            type="button"
                            onClick={() =>
                              setShowMenu(
                                showMenu ===
                                  item.id
                                  ? null
                                  : item.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                          >
                            <MoreHorizontal
                              size={16}
                            />
                          </button>

                          {showMenu ===
                            item.id && (
                            <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">

                              <button
                                type="button"
                                onClick={() =>
                                  openRestoreModal(
                                    item
                                  )
                                }
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                <RotateCcw
                                  size={15}
                                />

                                Restore
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(
                                    item
                                  )
                                }
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                <Trash2
                                  size={15}
                                />

                                Delete permanently
                              </button>

                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                }
              )}

            </div>
          )}

          {/* Footer */}
          {!loading &&
            items.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <span>
                  {filteredItems.length} of{" "}
                  {items.length} item
                  {items.length !== 1
                    ? "s"
                    : ""}
                </span>

                <span className="flex items-center gap-1.5">
                  <HardDrive size={13} />
                  Trash storage
                </span>

              </div>
            )}

        </div>

        {/* Overlay for open menu */}
        {showMenu && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setShowMenu(null)
            }
            className="fixed inset-0 z-10 cursor-default"
          />
        )}

        {/* Confirmation Modal */}
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

            <div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* Modal header */}
              <div className="flex items-start gap-4 px-6 pb-4 pt-6">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    modalType ===
                    "restore"
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  }`}
                >
                  {modalType ===
                  "restore" ? (
                    <RotateCcw
                      size={21}
                    />
                  ) : (
                    <AlertTriangle
                      size={21}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">

                    {modalType ===
                    "restore"
                      ? `Restore ${
                          modalItem?.type ===
                          "folder"
                            ? "folder"
                            : "file"
                        }?`
                      : modalType ===
                        "empty"
                      ? "Empty Trash?"
                      : "Delete permanently?"}

                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">

                    {modalType ===
                    "restore"
                      ? `“${
                          modalItem?.name ||
                          "This item"
                        }” will be moved back to My Files.`
                      : modalType ===
                        "empty"
                      ? "All files and folders currently in Trash will be permanently deleted. This action cannot be undone."
                      : modalItem
                      ? `“${modalItem.name}” will be permanently deleted. This action cannot be undone.`
                      : `${selectedCount} selected items will be permanently deleted. This action cannot be undone.`}

                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    actionLoading
                  }
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>

              </div>

              {/* Modal actions */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    actionLoading
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() => {

                    if (
                      modalType ===
                      "restore" &&
                      modalItem
                    ) {
                      restoreItem(
                        modalItem.id
                      );
                      return;
                    }

                    if (
                      modalType ===
                      "delete" &&
                      modalItem
                    ) {
                      permanentlyDelete(
                        modalItem.id
                      );
                      return;
                    }

                    if (
                      modalType ===
                      "delete" &&
                      !modalItem
                    ) {
                      deleteSelected();
                      return;
                    }

                    if (
                      modalType ===
                      "empty"
                    ) {
                      emptyTrash();
                    }

                  }}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    modalType ===
                    "restore"
                      ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >

                  {actionLoading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Processing...
                    </>
                  ) : modalType ===
                    "restore" ? (
                    <>
                      <RotateCcw
                        size={16}
                      />

                      Restore
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />

                      {modalType ===
                      "empty"
                        ? "Empty Trash"
                        : "Delete permanently"}
                    </>
                  )}

                </button>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}

