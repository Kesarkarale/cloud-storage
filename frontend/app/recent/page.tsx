"use client";

import {
  CalendarDays,
  Clock3,
  Download,
  File as FileIcon,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  Loader2,
  MoreVertical,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

type FileType =
  | "pdf"
  | "image"
  | "zip"
  | "document"
  | "file";

type RecentFile = {
  id: string;
  name: string;
  type: FileType;
  size: number;
  fileType?: string;
  modifiedAt: number;
  modified: string;
};

type FilterType = "all" | "today" | "week";

type ToastType = "success" | "error";

type ToastState = {
  type: ToastType;
  message: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

export default function RecentPage() {
  const [files, setFiles] = useState<RecentFile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [selectedFile, setSelectedFile] =
    useState<RecentFile | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<RecentFile | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  /* =====================================================
     TOAST
  ===================================================== */

  const showToast = useCallback(
    (
      type: ToastType,
      message: string
    ) => {
      setToast({
        type,
        message,
      });

      window.setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    []
  );

  /* =====================================================
     TOKEN
  ===================================================== */

  const getToken = useCallback(() => {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem(
        "cloudstorage_token"
      ) ||
      localStorage.getItem(
        "cloud-storage-token"
      )
    );
  }, []);

  /* =====================================================
     API REQUEST
  ===================================================== */

  const apiRequest = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login again to access your files."
        );
      }

      const headers = new Headers(
        options.headers
      );

      headers.set(
        "Authorization",
        `Bearer ${token}`
      );

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

      if (!response.ok) {
        let message =
          `Request failed (${response.status})`;

        try {
          const contentType =
            response.headers.get(
              "content-type"
            );

          if (
            contentType?.includes(
              "application/json"
            )
          ) {
            const data =
              await response.json();

            message =
              data?.message ||
              data?.error ||
              message;
          } else {
            const text =
              await response.text();

            if (text.trim()) {
              message = text;
            }
          }
        } catch {
          // Keep default message.
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

      return response;
    },
    [getToken]
  );

  /* =====================================================
     HELPERS
  ===================================================== */

  const getFileType = useCallback(
    (name: string): FileType => {
      const extension =
        name
          .split(".")
          .pop()
          ?.toLowerCase() || "";

      if (extension === "pdf") {
        return "pdf";
      }

      if (
        [
          "png",
          "jpg",
          "jpeg",
          "gif",
          "webp",
          "svg",
          "bmp",
          "ico",
        ].includes(extension)
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
        ].includes(extension)
      ) {
        return "zip";
      }

      if (
        [
          "doc",
          "docx",
          "txt",
          "rtf",
          "odt",
          "ppt",
          "pptx",
          "xls",
          "xlsx",
          "csv",
          "sql",
          "json",
          "xml",
          "html",
          "css",
          "js",
          "ts",
          "tsx",
          "java",
          "py",
        ].includes(extension)
      ) {
        return "document";
      }

      return "file";
    },
    []
  );

  const getTimestamp = useCallback(
    (value: unknown) => {
      if (!value) {
        return 0;
      }

      const timestamp =
        new Date(
          String(value)
        ).getTime();

      return Number.isNaN(timestamp)
        ? 0
        : timestamp;
    },
    []
  );

  const formatRelativeDate = useCallback(
    (value: unknown) => {
      const timestamp =
        getTimestamp(value);

      if (!timestamp) {
        return "Unknown";
      }

      const now = Date.now();

      const difference =
        Math.max(
          0,
          now - timestamp
        );

      const minute =
        60 * 1000;

      const hour =
        60 * minute;

      const day =
        24 * hour;

      if (difference < minute) {
        return "Just now";
      }

      if (difference < hour) {
        const minutes =
          Math.floor(
            difference / minute
          );

        return `${minutes} minute${
          minutes !== 1 ? "s" : ""
        } ago`;
      }

      if (difference < day) {
        const hours =
          Math.floor(
            difference / hour
          );

        return `${hours} hour${
          hours !== 1 ? "s" : ""
        } ago`;
      }

      if (
        difference <
        2 * day
      ) {
        return "Yesterday";
      }

      if (
        difference <
        7 * day
      ) {
        const days =
          Math.floor(
            difference / day
          );

        return `${days} days ago`;
      }

      return new Date(
        timestamp
      ).toLocaleDateString(
        undefined,
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    },
    [getTimestamp]
  );

  const formatBytes = useCallback(
    (bytes: number) => {
      if (!bytes) {
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
        Math.log(bytes) /
          Math.log(1024)
      );

      const safeIndex =
        Math.min(
          index,
          units.length - 1
        );

      return `${(
        bytes /
        Math.pow(
          1024,
          safeIndex
        )
      ).toFixed(
        safeIndex === 0 ? 0 : 1
      )} ${units[safeIndex]}`;
    },
    []
  );

  /* =====================================================
     NORMALIZE BACKEND FILE
  ===================================================== */

  const normalizeFile =
    useCallback(
      (item: any): RecentFile => {
        const name =
          item?.fileName ??
          item?.name ??
          "Unnamed file";

        const rawSize =
          item?.fileSize ??
          item?.size ??
          0;

        const size =
          typeof rawSize === "number"
            ? rawSize
            : Number(rawSize) || 0;

        const modifiedValue =
          item?.updatedAt ??
          item?.createdAt ??
          item?.modifiedAt ??
          item?.uploadedAt ??
          null;

        return {
          id: String(
            item?.id ??
              item?.fileId ??
              ""
          ),
          name: String(name),
          type: getFileType(
            String(name)
          ),
          size,
          fileType:
            item?.fileType ??
            item?.contentType ??
            undefined,
          modifiedAt:
            getTimestamp(
              modifiedValue
            ),
          modified:
            formatRelativeDate(
              modifiedValue
            ),
        };
      },
      [
        formatRelativeDate,
        getFileType,
        getTimestamp,
      ]
    );

  /* =====================================================
     LOAD ACTUAL FILES
  ===================================================== */

  const loadFiles = useCallback(
    async (
      showRefreshLoader = false
    ) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiRequest(
            "/api/files"
          );

        const data =
          await response.json();

        const backendFiles =
          Array.isArray(data)
            ? data
            : data?.files ?? [];

        const normalized =
          backendFiles
            .map(normalizeFile)
            .filter(
              (file: RecentFile) =>
                Boolean(file.id)
            )
            .sort(
              (
                a: RecentFile,
                b: RecentFile
              ) =>
                b.modifiedAt -
                a.modifiedAt
            );

        setFiles(normalized);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load recent files.";

        showToast(
          "error",
          message
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      apiRequest,
      normalizeFile,
      showToast,
    ]
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredFiles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        files.filter(
          (file) =>
            !query ||
            file.name
              .toLowerCase()
              .includes(query)
        );

      const now = Date.now();

      const oneDay =
        24 * 60 * 60 * 1000;

      if (filter === "today") {
        result =
          result.filter(
            (file) =>
              file.modifiedAt >=
              now - oneDay
          );
      }

      if (filter === "week") {
        result =
          result.filter(
            (file) =>
              file.modifiedAt >=
              now -
                7 * oneDay
          );
      }

      return result;
    }, [
      files,
      search,
      filter,
    ]);

  /* =====================================================
     STATS
  ===================================================== */

  const todayCount =
    useMemo(() => {
      const today =
        new Date();

      return files.filter(
        (file) => {
          if (!file.modifiedAt) {
            return false;
          }

          const date =
            new Date(
              file.modifiedAt
            );

          return (
            date.getDate() ===
              today.getDate() &&
            date.getMonth() ===
              today.getMonth() &&
            date.getFullYear() ===
              today.getFullYear()
          );
        }
      ).length;
    }, [files]);

  const totalSize =
    useMemo(
      () =>
        files.reduce(
          (
            total,
            file
          ) =>
            total +
            file.size,
          0
        ),
      [files]
    );

  /* =====================================================
     DOWNLOAD
  ===================================================== */

  async function downloadFile(
    file: RecentFile
  ) {
    try {
      setDownloadingId(
        file.id
      );

      const response =
        await apiRequest(
          `/api/files/${file.id}/download`
        );

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;
      anchor.download =
        file.name;

      document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );

      showToast(
        "success",
        "Download started."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Download failed.";

      showToast(
        "error",
        message
      );
    } finally {
      setDownloadingId(
        null
      );
    }
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const file =
      deleteTarget;

    try {
      setDeletingId(
        file.id
      );

      await apiRequest(
        `/api/files/${file.id}`,
        {
          method: "DELETE",
        }
      );

      setFiles(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              file.id
          )
      );

      if (
        selectedFile?.id ===
        file.id
      ) {
        setSelectedFile(
          null
        );
      }

      setDeleteTarget(
        null
      );

      showToast(
        "success",
        "File moved to trash successfully."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete file.";

      showToast(
        "error",
        message
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <section className="relative mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <Clock3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Activity
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Recent Files
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Quickly access the files you have recently uploaded or modified.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadFiles(true)
              }
              disabled={
                refreshing ||
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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
        </section>

        {/* STATS */}
        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            label="Recent Files"
            value={String(
              files.length
            )}
            text="Actual stored files"
          />

          <StatCard
            icon={
              <CalendarDays className="h-5 w-5" />
            }
            label="Today"
            value={String(
              todayCount
            )}
            text="Modified today"
          />

          <StatCard
            icon={
              <FolderOpen className="h-5 w-5" />
            }
            label="Storage"
            value={formatBytesStatic(
              totalSize
            )}
            text="Total file size"
          />

          <StatCard
            icon={
              <FileIcon className="h-5 w-5" />
            }
            label="Showing"
            value={String(
              filteredFiles.length
            )}
            text="Files in this view"
          />

        </div>

        {/* TOOLBAR */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search recent files..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <FilterButton
                active={
                  filter ===
                  "all"
                }
                onClick={() =>
                  setFilter(
                    "all"
                  )
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "today"
                }
                onClick={() =>
                  setFilter(
                    "today"
                  )
                }
              >
                Today
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "week"
                }
                onClick={() =>
                  setFilter(
                    "week"
                  )
                }
              >
                This Week
              </FilterButton>
            </div>

          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <LoadingState />
        ) : filteredFiles.length ===
          0 ? (
          <EmptyState
            search={search}
            onClear={() => {
              setSearch("");
              setFilter(
                "all"
              );
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            {/* TABLE HEADER */}
            <div className="hidden grid-cols-[minmax(280px,1fr)_150px_170px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 lg:grid">
              <span>File</span>
              <span>Size</span>
              <span>Modified</span>
              <span className="text-right">
                Actions
              </span>
            </div>

            {filteredFiles.map(
              (file) => (
                <RecentFileRow
                  key={file.id}
                  file={file}
                  onSelect={() =>
                    setSelectedFile(
                      file
                    )
                  }
                  onDownload={() =>
                    downloadFile(
                      file
                    )
                  }
                  onDelete={() =>
                    setDeleteTarget(
                      file
                    )
                  }
                  downloading={
                    downloadingId ===
                    file.id
                  }
                  deleting={
                    deletingId ===
                    file.id
                  }
                />
              )
            )}

          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedFile && (
        <FileDetailsModal
          file={
            selectedFile
          }
          onClose={() =>
            setSelectedFile(
              null
            )
          }
          onDownload={() =>
            downloadFile(
              selectedFile
            )
          }
          onDelete={() =>
            setDeleteTarget(
              selectedFile
            )
          }
          downloading={
            downloadingId ===
            selectedFile.id
          }
        />
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteModal
          file={
            deleteTarget
          }
          deleting={
            deletingId ===
            deleteTarget.id
          }
          onCancel={() =>
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200]">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.type ===
              "success"
                ? "border-emerald-200 bg-white text-slate-800 dark:border-emerald-500/20 dark:bg-slate-950 dark:text-white"
                : "border-red-200 bg-white text-slate-800 dark:border-red-500/20 dark:bg-slate-950 dark:text-white"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                toast.type ===
                "success"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />

            <span className="text-sm font-medium">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>

        <span className="max-w-[100px] truncate text-xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* =====================================================
   FILTER
===================================================== */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/* =====================================================
   FILE ROW
===================================================== */

function RecentFileRow({
  file,
  onSelect,
  onDownload,
  onDelete,
  downloading,
  deleting,
}: {
  file: RecentFile;
  onSelect: () => void;
  onDownload: () => void;
  onDelete: () => void;
  downloading: boolean;
  deleting: boolean;
}) {
  return (
    <div className="group border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 lg:grid lg:grid-cols-[minmax(280px,1fr)_150px_170px_150px] lg:items-center lg:gap-4 lg:px-5">

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 w-full items-center gap-3 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/5">
          <FileIconType
            type={file.type}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-slate-400 lg:hidden">
            {formatBytesStatic(
              file.size
            )}
          </p>
        </div>
      </button>

      <div className="mt-3 hidden text-xs text-slate-500 dark:text-slate-400 lg:mt-0 lg:block">
        {formatBytesStatic(
          file.size
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 lg:mt-0">
        <Clock3 className="h-3.5 w-3.5 shrink-0" />

        <span>
          {file.modified}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 lg:mt-0">

        <button
          type="button"
          onClick={onDownload}
          disabled={
            downloading
          }
          title="Download"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={
            deleting
          }
          title="Move to Trash"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onSelect}
          title="Details"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}

/* =====================================================
   FILE ICON
===================================================== */

function FileIconType({
  type,
}: {
  type: FileType;
}) {
  if (type === "pdf") {
    return (
      <FileText className="h-5 w-5 text-red-500" />
    );
  }

  if (type === "image") {
    return (
      <FileImage className="h-5 w-5 text-purple-500" />
    );
  }

  if (type === "zip") {
    return (
      <FileArchive className="h-5 w-5 text-yellow-500" />
    );
  }

  if (type === "document") {
    return (
      <FileText className="h-5 w-5 text-blue-500" />
    );
  }

  return (
    <FileIcon className="h-5 w-5 text-blue-500" />
  );
}

/* =====================================================
   DETAILS MODAL
===================================================== */

function FileDetailsModal({
  file,
  onClose,
  onDownload,
  onDelete,
  downloading,
}: {
  file: RecentFile;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
  downloading: boolean;
}) {
  return (
    <ModalOverlay
      onClose={onClose}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              File Details
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Actual file information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">

          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
              <FileIconType
                type={file.type}
              />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {formatBytesStatic(
                  file.size
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <InfoRow
              label="File name"
              value={file.name}
            />

            <InfoRow
              label="File size"
              value={formatBytesStatic(
                file.size
              )}
            />

            <InfoRow
              label="File type"
              value={
                file.fileType ||
                file.type
              }
            />

            <InfoRow
              label="Modified"
              value={file.modified}
            />

            <InfoRow
              label="Status"
              value="Available"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={onDownload}
              disabled={
                downloading
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              Download
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Close
            </button>

          </div>

          <button
            type="button"
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />

            Move to Trash
          </button>

        </div>
      </div>
    </ModalOverlay>
  );
}

/* =====================================================
   DELETE MODAL
===================================================== */

function DeleteModal({
  file,
  deleting,
  onCancel,
  onConfirm,
}: {
  file: RecentFile;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalOverlay
      onClose={
        deleting
          ? () => {}
          : onCancel
      }
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Move to Trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to move{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {file.name}
              </span>{" "}
              to trash?
            </p>
          </div>

        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            Move to Trash
          </button>

        </div>
      </div>
    </ModalOverlay>
  );
}

/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/5">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* =====================================================
   MODAL OVERLAY
===================================================== */

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
      {Array.from({
        length: 7,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/5"
        >
          <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100 dark:bg-white/10" />

          <div className="flex-1">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-white/10" />

            <div className="mt-2 h-3 w-1/5 animate-pulse rounded bg-slate-100 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-white/[0.03]">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Clock3 className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="mt-5 font-semibold text-slate-900 dark:text-white">
        {search
          ? "No recent files found"
          : "No recent files"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        {search
          ? `Nothing matches "${search}".`
          : "Files that you upload or modify will appear here automatically."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

/* =====================================================
   STATIC FORMAT HELPER
===================================================== */

function formatBytesStatic(
  bytes: number
) {
  if (!bytes) {
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
    Math.log(bytes) /
      Math.log(1024)
  );

  const safeIndex =
    Math.min(
      index,
      units.length - 1
    );

  return `${(
    bytes /
    Math.pow(
      1024,
      safeIndex
    )
  ).toFixed(
    safeIndex === 0 ? 0 : 1
  )} ${units[safeIndex]}`;
}
