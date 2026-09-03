"use client";

import {
  Archive,
  Check,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  Grid2X2,
  List,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
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

type UUID = string;

type TrashType = "file" | "folder";

type TrashItem = {
  id: UUID;
  name: string;
  type: TrashType;
  size: string;
  deletedAt: string | null;
  fileType?: string | null;
  parentFolderId?: UUID | null;
};

type BackendTrashItem = {
  id?: UUID;
  fileId?: UUID;
  folderId?: UUID;

  fileName?: string;
  name?: string;

  fileSize?: number;
  size?: number | string;

  fileType?: string;
  contentType?: string;

  deletedAt?: string | null;

  parentFolderId?: UUID | null;

  folder?: boolean;
  isFolder?: boolean;

  type?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt")
  );
}

function authHeaders(): HeadersInit {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.message ||
      data?.error ||
      data?.details ||
      `Request failed with status ${response.status}`
    );
  } catch {
    try {
      const text = await response.text();

      return (
        text ||
        `Request failed with status ${response.status}`
      );
    } catch {
      return `Request failed with status ${response.status}`;
    }
  }
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await parseApiError(response)
    );
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatBytes(
  bytes: number | string | null | undefined
): string {
  if (
    bytes === null ||
    bytes === undefined ||
    bytes === ""
  ) {
    return "—";
  }

  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return value === 0 ? "0 B" : "—";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1
  );

  const size =
    value / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}

function formatDeletedDate(
  value: string | null
): string {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
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

function getFileType(
  item: BackendTrashItem
): TrashType {
  if (
    item.folder === true ||
    item.isFolder === true ||
    item.type?.toLowerCase() === "folder"
  ) {
    return "folder";
  }

  return "file";
}

function normalizeTrashItem(
  item: BackendTrashItem
): TrashItem | null {
  const type = getFileType(item);

  const id =
    item.id ||
    item.fileId ||
    item.folderId;

  if (!id) {
    return null;
  }

  const name =
    item.name ||
    item.fileName ||
    (type === "folder"
      ? "Untitled folder"
      : "Untitled file");

  return {
    id,
    name,
    type,
    size:
      type === "folder"
        ? "—"
        : formatBytes(
            item.fileSize ??
              item.size
          ),
    deletedAt:
      item.deletedAt || null,
    fileType:
      item.fileType ||
      item.contentType ||
      null,
    parentFolderId:
      item.parentFolderId || null,
  };
}

function getFileIcon(
  type: TrashType,
  fileType?: string | null
) {
  if (type === "folder") {
    return Folder;
  }

  const value =
    fileType?.toLowerCase() || "";

  if (value.includes("image")) {
    return FileImage;
  }

  if (value.includes("audio")) {
    return FileAudio;
  }

  if (value.includes("video")) {
    return FileVideo;
  }

  if (
    value.includes("spreadsheet") ||
    value.includes("excel") ||
    value.includes("csv")
  ) {
    return FileSpreadsheet;
  }

  if (
    value.includes("zip") ||
    value.includes("rar") ||
    value.includes("archive")
  ) {
    return FileArchive;
  }

  if (
    value.includes("text") ||
    value.includes("pdf") ||
    value.includes("document") ||
    value.includes("word")
  ) {
    return FileText;
  }

  return FileIcon;
}

function getTypeLabel(
  type: TrashType
) {
  return type === "folder"
    ? "Folder"
    : "File";
}

export default function TrashPage() {
  const [items, setItems] =
    useState<TrashItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("list");

  const [selectedIds, setSelectedIds] =
    useState<Set<UUID>>(new Set());

  const [restoreId, setRestoreId] =
    useState<UUID | null>(null);

  const [deleteId, setDeleteId] =
    useState<UUID | null>(null);

  const [deleteConfirm, setDeleteConfirm] =
    useState<TrashItem | null>(null);

  const [emptyConfirm, setEmptyConfirm] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [toast, setToast] =
    useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);

  const showToast = useCallback(
    (
      type: "success" | "error",
      message: string
    ) => {
      setToast({
        type,
        message,
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  const loadTrash = useCallback(
    async (
      showRefresh = false
    ) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data =
          await apiRequest("/api/trash");

        let rawItems: BackendTrashItem[] = [];

        /*
         * Supports multiple backend response formats:
         *
         * 1. [ file, folder, file ]
         *
         * 2. {
         *      files: [...],
         *      folders: [...]
         *    }
         *
         * 3. {
         *      items: [...]
         *    }
         *
         * 4. {
         *      content: [...]
         *    }
         */

        if (Array.isArray(data)) {
          rawItems = data;
        } else if (
          data &&
          Array.isArray(data.items)
        ) {
          rawItems = data.items;
        } else if (
          data &&
          Array.isArray(data.content)
        ) {
          rawItems = data.content;
        } else if (data) {
          const files =
            Array.isArray(data.files)
              ? data.files
              : [];

          const folders =
            Array.isArray(data.folders)
              ? data.folders.map(
                  (folder: BackendTrashItem) => ({
                    ...folder,
                    folder: true,
                    isFolder: true,
                    type: "folder",
                  })
                )
              : [];

          rawItems = [
            ...files,
            ...folders,
          ];
        }

        const normalized =
          rawItems
            .map(normalizeTrashItem)
            .filter(
              (
                item
              ): item is TrashItem =>
                item !== null
            );

        setItems(normalized);
        setSelectedIds(new Set());
      } catch (error: any) {
        console.error(
          "Trash loading error:",
          error
        );

        showToast(
          "error",
          error?.message ||
            "Unable to load Trash."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const filteredItems =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return items;
      }

      return items.filter((item) =>
        item.name
          .toLowerCase()
          .includes(value)
      );
    }, [items, search]);

  const selectedItems =
    useMemo(() => {
      return items.filter((item) =>
        selectedIds.has(item.id)
      );
    }, [items, selectedIds]);

  const allSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) =>
      selectedIds.has(item.id)
    );

  const toggleSelect = (
    id: UUID
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
    if (allSelected) {
      setSelectedIds(
        (previous) => {
          const next = new Set(previous);

          filteredItems.forEach(
            (item) => {
              next.delete(item.id);
            }
          );

          return next;
        }
      );

      return;
    }

    setSelectedIds(
      (previous) => {
        const next = new Set(previous);

        filteredItems.forEach(
          (item) => {
            next.add(item.id);
          }
        );

        return next;
      }
    );
  };

  const restoreItem = async (
    item: TrashItem
  ) => {
    if (actionLoading) return;

    setRestoreId(item.id);
    setActionLoading(true);

    try {
      /*
       * Same endpoint is used for files/folders.
       * Backend should detect whether the ID belongs
       * to a deleted file or deleted folder.
       */
      await apiRequest(
        `/api/trash/${item.id}/restore`,
        {
          method: "POST",
        }
      );

      setItems((previous) =>
        previous.filter(
          (current) =>
            current.id !== item.id
        )
      );

      setSelectedIds((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });

      showToast(
        "success",
        `${item.type === "folder" ? "Folder" : "File"} restored successfully.`
      );
    } catch (error: any) {
      console.error(
        "Restore error:",
        error
      );

      showToast(
        "error",
        error?.message ||
          "Unable to restore item."
      );
    } finally {
      setRestoreId(null);
      setActionLoading(false);
    }
  };

  const permanentlyDeleteItem =
    async () => {
      if (
        !deleteConfirm ||
        actionLoading
      ) {
        return;
      }

      const item = deleteConfirm;

      setDeleteId(item.id);
      setActionLoading(true);

      try {
        await apiRequest(
          `/api/trash/${item.id}`,
          {
            method: "DELETE",
          }
        );

        setItems((previous) =>
          previous.filter(
            (current) =>
              current.id !== item.id
          )
        );

        setSelectedIds((previous) => {
          const next = new Set(previous);
          next.delete(item.id);
          return next;
        });

        setDeleteConfirm(null);

        showToast(
          "success",
          `${item.type === "folder" ? "Folder" : "File"} permanently deleted.`
        );
      } catch (error: any) {
        console.error(
          "Permanent delete error:",
          error
        );

        showToast(
          "error",
          error?.message ||
            "Unable to permanently delete item."
        );
      } finally {
        setDeleteId(null);
        setActionLoading(false);
      }
    };

  const restoreSelected =
    async () => {
      if (
        selectedItems.length === 0 ||
        actionLoading
      ) {
        return;
      }

      setActionLoading(true);

      try {
        const selected =
          [...selectedItems];

        for (const item of selected) {
          await apiRequest(
            `/api/trash/${item.id}/restore`,
            {
              method: "POST",
            }
          );
        }

        const selectedSet =
          new Set(
            selected.map(
              (item) => item.id
            )
          );

        setItems((previous) =>
          previous.filter(
            (item) =>
              !selectedSet.has(item.id)
          )
        );

        setSelectedIds(new Set());

        showToast(
          "success",
          `${selected.length} item${
            selected.length > 1
              ? "s"
              : ""
          } restored successfully.`
        );
      } catch (error: any) {
        console.error(
          "Restore selected error:",
          error
        );

        showToast(
          "error",
          error?.message ||
            "Unable to restore selected items."
        );

        await loadTrash(true);
      } finally {
        setActionLoading(false);
      }
    };

  const permanentlyDeleteSelected =
    async () => {
      if (
        selectedItems.length === 0 ||
        actionLoading
      ) {
        return;
      }

      setActionLoading(true);

      try {
        const selected =
          [...selectedItems];

        for (const item of selected) {
          await apiRequest(
            `/api/trash/${item.id}`,
            {
              method: "DELETE",
            }
          );
        }

        const selectedSet =
          new Set(
            selected.map(
              (item) => item.id
            )
          );

        setItems((previous) =>
          previous.filter(
            (item) =>
              !selectedSet.has(item.id)
          )
        );

        setSelectedIds(new Set());

        showToast(
          "success",
          `${selected.length} item${
            selected.length > 1
              ? "s"
              : ""
          } permanently deleted.`
        );
      } catch (error: any) {
        console.error(
          "Permanent selected delete error:",
          error
        );

        showToast(
          "error",
          error?.message ||
            "Unable to delete selected items."
        );

        await loadTrash(true);
      } finally {
        setActionLoading(false);
      }
    };

  const emptyTrash =
    async () => {
      if (actionLoading) return;

      setActionLoading(true);

      try {
        await apiRequest(
          "/api/trash/empty",
          {
            method: "DELETE",
          }
        );

        setItems([]);
        setSelectedIds(new Set());
        setEmptyConfirm(false);

        showToast(
          "success",
          "Trash emptied successfully."
        );
      } catch (error: any) {
        console.error(
          "Empty trash error:",
          error
        );

        showToast(
          "error",
          error?.message ||
            "Unable to empty Trash."
        );
      } finally {
        setActionLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* =========================
          HEADER
      ========================= */}

      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Trash Bin
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Deleted files and folders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                loadTrash(true)
              }
              disabled={refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setEmptyConfirm(true)
                }
                disabled={actionLoading}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Empty Trash
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                placeholder="Search trash..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-slate-500 dark:focus:bg-slate-800"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {selectedItems.length >
                0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      restoreSelected
                    }
                    disabled={
                      actionLoading
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </button>

                  <button
                    type="button"
                    onClick={
                      permanentlyDeleteSelected
                    }
                    disabled={
                      actionLoading
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}

              <div className="flex items-center rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode("list")
                  }
                  className={`rounded-md p-2 transition ${
                    viewMode === "list"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("grid")
                  }
                  className={`rounded-md p-2 transition ${
                    viewMode === "grid"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  title="Grid view"
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            CONTENT
        ========================= */}

        <div className="mt-5">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-7 w-7 animate-spin" />

                <p className="text-sm">
                  Loading Trash...
                </p>
              </div>
            </div>
          ) : filteredItems.length ===
            0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Archive className="h-8 w-8 text-slate-400" />
              </div>

              <h2 className="text-lg font-semibold">
                {search
                  ? "No items found"
                  : "Trash is empty"}
              </h2>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {search
                  ? "Try a different search term."
                  : "Deleted files and folders will appear here."}
              </p>
            </div>
          ) : viewMode ===
            "list" ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[48px_minmax(0,1fr)_140px_180px_120px_90px] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <div>
                  <input
                    type="checkbox"
                    checked={
                      allSelected
                    }
                    onChange={
                      toggleSelectAll
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </div>

                <div>Name</div>
                <div>Type</div>
                <div>Deleted</div>
                <div>Size</div>
                <div className="text-right">
                  Actions
                </div>
              </div>

              {filteredItems.map(
                (item) => {
                  const Icon =
                    getFileIcon(
                      item.type,
                      item.fileType
                    );

                  const selected =
                    selectedIds.has(
                      item.id
                    );

                  const restoring =
                    restoreId ===
                    item.id;

                  const deleting =
                    deleteId ===
                    item.id;

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`group border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800 ${
                        selected
                          ? "bg-slate-50 dark:bg-slate-800/50"
                          : ""
                      }`}
                    >
                      {/* DESKTOP */}

                      <div className="hidden grid-cols-[48px_minmax(0,1fr)_140px_180px_120px_90px] items-center gap-3 md:grid">
                        <div>
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleSelect(
                                item.id
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </div>

                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              item.type ===
                              "folder"
                                ? "bg-slate-100 dark:bg-slate-800"
                                : "bg-slate-100 dark:bg-slate-800"
                            }`}
                          >
                            <Icon className="h-5 w-5 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {item.name}
                            </p>

                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {item.type ===
                              "folder"
                                ? "Deleted folder"
                                : item.fileType ||
                                  "File"}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {getTypeLabel(
                            item.type
                          )}
                        </div>

                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDeletedDate(
                            item.deletedAt
                          )}
                        </div>

                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {item.size}
                        </div>

                        <div className="flex justify-end">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                restoreItem(
                                  item
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="Restore"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                              {restoring ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm(
                                  item
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="Delete permanently"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                            >
                              {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* MOBILE */}

                      <div className="flex items-center gap-3 md:hidden">
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleSelect(
                              item.id
                            )
                          }
                          className="h-4 w-4 shrink-0 rounded border-slate-300"
                        />

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Icon className="h-5 w-5 text-slate-500" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {getTypeLabel(
                              item.type
                            )}{" "}
                            •{" "}
                            {item.size}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            restoreItem(
                              item
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {restoring ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm(
                              item
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            /* =========================
               GRID VIEW
            ========================= */

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map(
                (item) => {
                  const Icon =
                    getFileIcon(
                      item.type,
                      item.fileType
                    );

                  const selected =
                    selectedIds.has(
                      item.id
                    );

                  const restoring =
                    restoreId ===
                    item.id;

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`relative rounded-xl border bg-white p-4 shadow-sm transition dark:bg-slate-900 ${
                        selected
                          ? "border-slate-400 ring-2 ring-slate-200 dark:border-slate-600 dark:ring-slate-800"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="absolute right-3 top-3">
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleSelect(
                              item.id
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-6 w-6 text-slate-500" />
                      </div>

                      <div className="mt-4">
                        <h3 className="truncate pr-7 text-sm font-semibold">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {getTypeLabel(
                            item.type
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Deleted{" "}
                          {formatDeletedDate(
                            item.deletedAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Size:{" "}
                          {item.size}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            restoreItem(
                              item
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          {restoring ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}

                          Restore
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm(
                              item
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/30"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          DELETE MODAL
      ========================= */}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm(
                    null
                  )
                }
                disabled={actionLoading}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Delete permanently?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                "{deleteConfirm.name}"
              </span>{" "}
              will be permanently deleted. This
              action cannot be undone.
            </p>

            {deleteConfirm.type ===
              "folder" && (
              <p className="mt-2 text-xs text-red-500">
                This is a folder. Its deleted
                contents may also be permanently
                removed by the backend.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm(
                    null
                  )
                }
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  permanentlyDeleteItem
                }
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          EMPTY TRASH MODAL
      ========================= */}

      {emptyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Empty Trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              All files and folders in Trash will
              be permanently deleted. This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setEmptyConfirm(
                    false
                  )
                }
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  emptyTrash
                }
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          TOAST
      ========================= */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60]">
          <div
            className={`flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              toast.type ===
              "success"
                ? "border-emerald-200 bg-white text-slate-800 dark:border-emerald-900 dark:bg-slate-900 dark:text-white"
                : "border-red-200 bg-white text-slate-800 dark:border-red-900 dark:bg-slate-900 dark:text-white"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                toast.type ===
                "success"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
                  : "bg-red-100 text-red-600 dark:bg-red-950/40"
              }`}
            >
              {toast.type ===
              "success" ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </div>

            <p className="text-sm font-medium">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() =>
                setToast(null)
              }
              className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
