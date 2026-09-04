"use client";

import {
  Check,
  ChevronDown,
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  Grid2X2,
  List,
  Loader2,
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardShell from "@/components/DashboardShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

type Permission = "VIEWER" | "EDITOR";

type SharedFile = {
  id: string;
  fileId: string;

  name: string;
  type: string;
  size: number;

  owner: string;
  ownerEmail: string;

  permission: Permission;
  sharedDate: string;

  status: string;
};

type ShareTab = "ALL" | "BY_ME" | "WITH_ME";

type ApiShareResponse = {
  id?: string;
  fileId?: string;

  name?: string;
  type?: string;
  size?: number;

  owner?: string;
  ownerEmail?: string;

  permission?: string;
  sharedDate?: string;

  status?: string;
};

type ShareModalProps = {
  open: boolean;
  file: SharedFile | null;
  onClose: () => void;
  onSuccess: () => void;
};

type DetailsModalProps = {
  open: boolean;
  file: SharedFile | null;
  onClose: () => void;
  onRemove: (file: SharedFile) => void;
  onPermissionChange: (
    file: SharedFile,
    permission: Permission
  ) => void;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let message =
      `Request failed (${response.status})`;

    try {
      const data = await response.json();

      if (typeof data === "string") {
        message = data;
      } else if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = data.error;
      }
    } catch {
      try {
        const text = await response.text();

        if (text) {
          message = text;
        }
      } catch {
        // Ignore parsing errors.
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (
    contentType.includes("application/json")
  ) {
    return response.json();
  }

  return (await response.text()) as T;
}

function normalizeSharedFile(
  item: ApiShareResponse
): SharedFile | null {
  if (!item?.id || !item?.fileId) {
    return null;
  }

  return {
    id: String(item.id),
    fileId: String(item.fileId),

    name:
      item.name ||
      "Unnamed file",

    type:
      item.type ||
      "application/octet-stream",

    size:
      typeof item.size === "number"
        ? item.size
        : 0,

    owner:
      item.owner ||
      "Unknown user",

    ownerEmail:
      item.ownerEmail ||
      "",

    permission:
      String(item.permission || "VIEWER")
        .toUpperCase() === "EDITOR"
        ? "EDITOR"
        : "VIEWER",

    sharedDate:
      item.sharedDate ||
      new Date().toISOString(),

    status:
      item.status ||
      "ACTIVE",
  };
}

function getFileIcon(
  fileType: string,
  className = "h-6 w-6"
) {
  const type =
    fileType.toLowerCase();

  if (type.includes("folder")) {
    return (
      <Folder
        className={className}
      />
    );
  }

  if (
    type.includes("image") ||
    type.includes("jpg") ||
    type.includes("jpeg") ||
    type.includes("png") ||
    type.includes("gif") ||
    type.includes("webp")
  ) {
    return (
      <FileImage
        className={className}
      />
    );
  }

  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type.includes("csv")
  ) {
    return (
      <FileSpreadsheet
        className={className}
      />
    );
  }

  if (
    type.includes("audio") ||
    type.includes("mp3") ||
    type.includes("wav")
  ) {
    return (
      <FileAudio
        className={className}
      />
    );
  }

  if (
    type.includes("zip") ||
    type.includes("archive") ||
    type.includes("rar") ||
    type.includes("7z")
  ) {
    return (
      <FileArchive
        className={className}
      />
    );
  }

  if (
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("json") ||
    type.includes("html") ||
    type.includes("css") ||
    type.includes("code")
  ) {
    return (
      <FileCode2
        className={className}
      />
    );
  }

  if (
    type.includes("pdf") ||
    type.includes("text") ||
    type.includes("document") ||
    type.includes("word")
  ) {
    return (
      <FileText
        className={className}
      />
    );
  }

  return (
    <File
      className={className}
    />
  );
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

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const value =
    bytes /
    Math.pow(1024, index);

  return `${value >= 10
    ? value.toFixed(0)
    : value.toFixed(1)
  } ${units[index]}`;
}

function formatDate(
  value: string
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function permissionLabel(
  permission: Permission
): string {
  return permission === "EDITOR"
    ? "Editor"
    : "Viewer";
}

/* =========================================================
   SHARE MODAL
========================================================= */

function ShareModal({
  open,
  file,
  onClose,
  onSuccess,
}: ShareModalProps) {
  const [email, setEmail] =
    useState("");

  const [permission, setPermission] =
    useState<Permission>("VIEWER");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPermission("VIEWER");
      setLoading(false);
      setError("");
      setSuccess("");
    }
  }, [open]);

  if (!open || !file) {
    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter an email address."
      );
      return;
    }

    if (
      !cleanEmail.includes("@")
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      const params =
        new URLSearchParams();

      params.set(
        "fileId",
        file.fileId
      );

      params.set(
        "email",
        cleanEmail
      );

      params.set(
        "permission",
        permission
      );

      await apiRequest(
        `/api/shares?${params.toString()}`,
        {
          method: "POST",
        }
      );

      setSuccess(
        "File shared successfully."
      );

      setEmail("");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to share file."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Share file
            </h2>

            <p className="mt-1 max-w-[300px] truncate text-sm text-slate-500 dark:text-slate-400">
              {file.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          {/* File */}
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-700 dark:text-slate-200">
              {getFileIcon(
                file.type,
                "h-5 w-5"
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {file.name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          {/* Email */}
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(
              event: ChangeEvent<HTMLInputElement>
            ) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="Enter user's email"
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          />

          {/* Permission */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Permission
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setPermission("VIEWER")
                }
                className={`rounded-xl border p-3 text-left transition ${
                  permission === "VIEWER"
                    ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Viewer
                  </span>

                  {permission ===
                    "VIEWER" && (
                    <Check className="h-4 w-4" />
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Can view and download
                </p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setPermission("EDITOR")
                }
                className={`rounded-xl border p-3 text-left transition ${
                  permission === "EDITOR"
                    ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Editor
                  </span>

                  {permission ===
                    "EDITOR" && (
                    <Check className="h-4 w-4" />
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Can edit the file
                </p>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Sharing..."
                : "Share file"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

function FileDetailsModal({
  open,
  file,
  onClose,
  onRemove,
  onPermissionChange,
}: DetailsModalProps) {
  const [changingPermission, setChangingPermission] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  if (!open || !file) {
    return null;
  }

  async function handleDownload() {
    try {
      setDownloading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response =
        await fetch(
          `${API_BASE}/api/files/${file.fileId}/download`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to download file."
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = file.name;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to download file."
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handlePermission(
    permission: Permission
  ) {
    if (
      permission === file.permission
    ) {
      return;
    }

    try {
      setChangingPermission(true);

      const params =
        new URLSearchParams();

      params.set(
        "permission",
        permission
      );

      await apiRequest(
        `/api/shares/${file.id}/permission?${params.toString()}`,
        {
          method: "PUT",
        }
      );

      onPermissionChange(
        file,
        permission
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update permission."
      );
    } finally {
      setChangingPermission(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              File details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Shared file information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* File */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {getFileIcon(
                file.type,
                "h-7 w-7"
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Owner
              </span>

              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {file.owner}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {file.ownerEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Shared
              </span>

              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {formatDate(
                  file.sharedDate
                )}
              </span>
            </div>

            <div className="px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Permission
                </span>

                {changingPermission && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={changingPermission}
                  onClick={() =>
                    handlePermission(
                      "VIEWER"
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    file.permission ===
                    "VIEWER"
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  Viewer
                </button>

                <button
                  type="button"
                  disabled={changingPermission}
                  onClick={() =>
                    handlePermission(
                      "EDITOR"
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    file.permission ===
                    "EDITOR"
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  Editor
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              {downloading
                ? "Downloading..."
                : "Download"}
            </button>

            <button
              type="button"
              onClick={() =>
                onRemove(file)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
              Remove share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function SharedPage() {
  const [files, setFiles] =
    useState<SharedFile[]>([]);

  const [activeTab, setActiveTab] =
    useState<ShareTab>("ALL");

  const [search, setSearch] =
    useState("");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">(
      "grid"
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [shareFile, setShareFile] =
    useState<SharedFile | null>(null);

  const [detailsFile, setDetailsFile] =
    useState<SharedFile | null>(null);

  const [menuFileId, setMenuFileId] =
    useState<string | null>(null);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const loadFiles = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        let endpoint =
          "/api/shares";

        if (activeTab === "BY_ME") {
          endpoint =
            "/api/shares/by-me";
        }

        if (activeTab === "WITH_ME") {
          endpoint =
            "/api/shares/with-me";
        }

        let data:
          | ApiShareResponse[]
          | {
              content?: ApiShareResponse[];
              items?: ApiShareResponse[];
              data?: ApiShareResponse[];
            };

        /*
         * /api/shares is not defined in the
         * backend controller above, so ALL
         * combines both endpoints.
         */
        if (activeTab === "ALL") {
          const [
            byMe,
            withMe,
          ] = await Promise.all([
            apiRequest<
              ApiShareResponse[]
            >(
              "/api/shares/by-me"
            ),
            apiRequest<
              ApiShareResponse[]
            >(
              "/api/shares/with-me"
            ),
          ]);

          const combined = [
            ...(Array.isArray(byMe)
              ? byMe
              : []),
            ...(Array.isArray(withMe)
              ? withMe
              : []),
          ];

          const unique =
            new Map<
              string,
              ApiShareResponse
            >();

          combined.forEach(
            (item) => {
              if (
                item?.id &&
                !unique.has(
                  String(item.id)
                )
              ) {
                unique.set(
                  String(item.id),
                  item
                );
              }
            }
          );

          data =
            Array.from(
              unique.values()
            );
        } else {
          data =
            await apiRequest<
              ApiShareResponse[]
            >(endpoint);
        }

        let raw: ApiShareResponse[] =
          [];

        if (Array.isArray(data)) {
          raw = data;
        } else if (
          Array.isArray(
            data?.content
          )
        ) {
          raw = data.content;
        } else if (
          Array.isArray(
            data?.items
          )
        ) {
          raw = data.items;
        } else if (
          Array.isArray(
            data?.data
          )
        ) {
          raw = data.data;
        }

        const normalized =
          raw
            .map(
              normalizeSharedFile
            )
            .filter(
              (
                item
              ): item is SharedFile =>
                item !== null
            );

        setFiles(normalized);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load shared files."
        );

        setFiles([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    function handleClick() {
      setMenuFileId(null);
    }

    document.addEventListener(
      "click",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, []);

  const filteredFiles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return files;
      }

      return files.filter(
        (file) =>
          file.name
            .toLowerCase()
            .includes(query) ||
          file.owner
            .toLowerCase()
            .includes(query) ||
          file.ownerEmail
            .toLowerCase()
            .includes(query)
      );
    }, [files, search]);

  const handleRemoveShare =
    useCallback(
      async (file: SharedFile) => {
        const confirmed =
          window.confirm(
            `Remove sharing for "${file.name}"?`
          );

        if (!confirmed) {
          return;
        }

        try {
          setRemovingId(
            file.id
          );

          await apiRequest(
            `/api/shares/${file.id}`,
            {
              method: "DELETE",
            }
          );

          setFiles((current) =>
            current.filter(
              (item) =>
                item.id !== file.id
            )
          );

          if (
            detailsFile?.id ===
            file.id
          ) {
            setDetailsFile(
              null
            );
          }
        } catch (err) {
          alert(
            err instanceof Error
              ? err.message
              : "Unable to remove share."
          );
        } finally {
          setRemovingId(null);
        }
      },
      [detailsFile]
    );

  const handlePermissionChange =
    useCallback(
      (
        file: SharedFile,
        permission: Permission
      ) => {
        setFiles((current) =>
          current.map(
            (item) =>
              item.id === file.id
                ? {
                    ...item,
                    permission,
                  }
                : item
          )
        );

        setDetailsFile(
          (current) =>
            current?.id === file.id
              ? {
                  ...current,
                  permission,
                }
              : current
        );
      },
      []
    );

  return (
    <DashboardShell>
      <div className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* =========================================
              HEADER
          ========================================= */}

          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    <Share2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Shared Files
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Manage files shared with you and by you.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={loadFiles}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Refresh
              </button>
            </div>
          </div>

          {/* =========================================
              TABS + SEARCH
          ========================================= */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800 lg:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "ALL"
                    )
                  }
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab === "ALL"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  All shared
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "BY_ME"
                    )
                  }
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab ===
                    "BY_ME"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Shared by me
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "WITH_ME"
                    )
                  }
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab ===
                    "WITH_ME"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Shared with me
                </button>
              </div>

              <div className="flex w-full gap-2 lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search shared files..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-600 dark:focus:ring-slate-800"
                  />
                </div>

                <div className="hidden items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-700 sm:flex">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(
                        "grid"
                      )
                    }
                    className={`rounded-lg p-2 ${
                      viewMode ===
                      "grid"
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-400"
                    }`}
                    title="Grid view"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(
                        "list"
                      )
                    }
                    className={`rounded-lg p-2 ${
                      viewMode ===
                      "list"
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-400"
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              ERROR
          ========================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Unable to load shared files
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadFiles}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Retry
              </button>
            </div>
          )}

          {/* =========================================
              LOADING
          ========================================= */}

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Loading shared files...
                </p>
              </div>
            </div>
          ) : filteredFiles.length ===
            0 ? (
            /* =========================================
               EMPTY
            ========================================= */

            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="max-w-sm px-6 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {search ? (
                    <Search className="h-7 w-7" />
                  ) : (
                    <Users className="h-7 w-7" />
                  )}
                </div>

                <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                  {search
                    ? "No files found"
                    : "No shared files"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {search
                    ? "Try a different file name, owner or email address."
                    : activeTab ===
                      "WITH_ME"
                    ? "Files shared with your account will appear here."
                    : "Files you share with other users will appear here."}
                </p>
              </div>
            </div>
          ) : viewMode ===
            "grid" ? (
            /* =========================================
               GRID
            ========================================= */

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFiles.map(
                (file) => (
                  <div
                    key={file.id}
                    className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          setDetailsFile(
                            file
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          {getFileIcon(
                            file.type,
                            "h-6 w-6"
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {file.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatFileSize(
                              file.size
                            )}
                          </p>
                        </div>
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            setMenuFileId(
                              menuFileId ===
                                file.id
                                ? null
                                : file.id
                            );
                          }}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {menuFileId ===
                          file.id && (
                          <div
                            onClick={(
                              event
                            ) =>
                              event.stopPropagation()
                            }
                            className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setShareFile(
                                  file
                                );
                                setMenuFileId(
                                  null
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <Share2 className="h-4 w-4" />
                              Share again
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDetailsFile(
                                  file
                                );
                                setMenuFileId(
                                  null
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <FileText className="h-4 w-4" />
                              Details
                            </button>

                            <button
                              type="button"
                              disabled={
                                removingId ===
                                file.id
                              }
                              onClick={() => {
                                setMenuFileId(
                                  null
                                );
                                handleRemoveShare(
                                  file
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                            >
                              {removingId ===
                              file.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                              Remove share
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Owner */}
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        <User className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {file.owner}
                        </p>

                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {file.ownerEmail}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {permissionLabel(
                            file.permission
                          )}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        {formatDate(
                          file.sharedDate
                        )}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            /* =========================================
               LIST
            ========================================= */

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="hidden grid-cols-[minmax(260px,1.8fr)_1fr_130px_130px_50px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 md:grid">
                <span>File</span>
                <span>Owner</span>
                <span>Permission</span>
                <span>Shared</span>
                <span />
              </div>

              {filteredFiles.map(
                (file) => (
                  <div
                    key={file.id}
                    className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-800 md:grid-cols-[minmax(260px,1.8fr)_1fr_130px_130px_50px] md:items-center"
                  >
                    {/* File */}
                    <button
                      type="button"
                      onClick={() =>
                        setDetailsFile(
                          file
                        )
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {getFileIcon(
                          file.type,
                          "h-5 w-5"
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatFileSize(
                            file.size
                          )}
                        </p>
                      </div>
                    </button>

                    {/* Owner */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {file.owner}
                      </p>

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {file.ownerEmail}
                      </p>
                    </div>

                    {/* Permission */}
                    <div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {permissionLabel(
                          file.permission
                        )}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(
                        file.sharedDate
                      )}
                    </div>

                    {/* Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setMenuFileId(
                            menuFileId ===
                              file.id
                              ? null
                              : file.id
                          );
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {menuFileId ===
                        file.id && (
                        <div
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                          className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShareFile(
                                file
                              );
                              setMenuFileId(
                                null
                              );
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Share2 className="h-4 w-4" />
                            Share again
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDetailsFile(
                                file
                              );
                              setMenuFileId(
                                null
                              );
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <FileText className="h-4 w-4" />
                            Details
                          </button>

                          <button
                            type="button"
                            disabled={
                              removingId ===
                              file.id
                            }
                            onClick={() => {
                              setMenuFileId(
                                null
                              );
                              handleRemoveShare(
                                file
                              );
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                          >
                            {removingId ===
                            file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}

                            Remove share
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Count */}
          {!loading &&
            filteredFiles.length >
              0 && (
              <div className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {filteredFiles.length}
                </span>{" "}
                shared{" "}
                {filteredFiles.length ===
                1
                  ? "file"
                  : "files"}
              </div>
            )}
        </div>
      </div>

      {/* =========================================
          SHARE MODAL
      ========================================= */}

      <ShareModal
        open={
          shareFile !== null
        }
        file={shareFile}
        onClose={() =>
          setShareFile(null)
        }
        onSuccess={loadFiles}
      />

      {/* =========================================
          DETAILS MODAL
      ========================================= */}

      <FileDetailsModal
        open={
          detailsFile !== null
        }
        file={detailsFile}
        onClose={() =>
          setDetailsFile(null)
        }
        onRemove={
          handleRemoveShare
        }
        onPermissionChange={
          handlePermissionChange
        }
      />
    </DashboardShell>
  );
}
