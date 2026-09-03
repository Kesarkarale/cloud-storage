"use client";

import {
  Archive,
  ChevronDown,
  ChevronLeft,
  Download,
  File,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Grid2X2,
  HardDrive,
  Home,
  List,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

/* =========================================================
   TYPES
========================================================= */

type FileType =
  | "folder"
  | "pdf"
  | "image"
  | "document"
  | "zip";

type BackendFile = {
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

  modified?: string;
  updatedAt?: string;
  createdAt?: string;

  parentId?: string | number | null;
  folderId?: string | number | null;

  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  previewUrl?: string;

  folder?: boolean;
  isFolder?: boolean;
};

type FileItem = {
  id: string;
  name: string;
  type: FileType;
  size: string;
  sizeBytes: number;
  modified: string;
  parentId: string | null;
  previewUrl?: string;
  downloadUrl?: string;
};

type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  modified: string;
};

type BreadcrumbItem = {
  id: string | null;
  name: string;
};

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
    const value =
      window.localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers = new Headers(
    options.headers
  );

  if (
    !(options.body instanceof FormData)
  ) {
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
      const obj =
        data as Record<
          string,
          unknown
        >;

      message =
        String(
          obj.message ||
            obj.error ||
            obj.detail ||
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

/* =========================================================
   HELPERS
========================================================= */

function normalizeId(
  value:
    | string
    | number
    | null
    | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return String(value);
}

function getFileType(
  fileName: string,
  mimeType = ""
): FileType {
  const mime =
    mimeType.toLowerCase();

  if (
    mime.startsWith("image/")
  ) {
    return "image";
  }

  if (
    mime === "application/pdf"
  ) {
    return "pdf";
  }

  if (
    mime.includes("zip") ||
    mime.includes("compressed")
  ) {
    return "zip";
  }

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
    [
      "png",
      "jpg",
      "jpeg",
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

  return "document";
}

function formatFileSize(
  bytes: number
): string {
  if (!Number.isFinite(bytes)) {
    return "0 B";
  }

  if (bytes <= 0) {
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

  const trimmed =
    value.trim();

  if (!trimmed) {
    return 0;
  }

  const directNumber =
    Number(trimmed);

  if (
    Number.isFinite(
      directNumber
    )
  ) {
    return directNumber;
  }

  const match =
    trimmed.match(
      /^([\d.]+)\s*(B|KB|MB|GB|TB)$/i
    );

  if (!match) {
    return 0;
  }

  const amount =
    Number(match[1]);

  const unit =
    match[2].toUpperCase();

  const multiplier: Record<
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
    (multiplier[unit] || 1)
  );
}

function formatDate(
  value:
    | string
    | undefined
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

  const difference =
    Math.max(
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

function normalizeFile(
  raw: BackendFile
): FileItem {
  const id = String(
    raw.id
  );

  const name =
    raw.name ||
    raw.fileName ||
    raw.filename ||
    "Untitled";

  const mime =
    raw.mimeType ||
    raw.contentType ||
    raw.type ||
    "";

  const type =
    raw.folder ||
    raw.isFolder
      ? "folder"
      : getFileType(
          name,
          mime
        );

  const sizeBytes =
    parseSize(
      raw.size ??
        raw.fileSize
    );

  const previewUrl =
    raw.previewUrl ||
    raw.fileUrl ||
    raw.url;

  const downloadUrl =
    raw.downloadUrl ||
    raw.fileUrl ||
    raw.url;

  return {
    id,
    name,
    type,
    size:
      type === "folder"
        ? "—"
        : formatFileSize(
            sizeBytes
          ),
    sizeBytes,
    modified: formatDate(
      raw.updatedAt ||
        raw.createdAt ||
        raw.modified
    ),
    parentId:
      normalizeId(
        raw.parentId ??
          raw.folderId
      ),
    previewUrl:
      type === "image"
        ? previewUrl
        : undefined,
    downloadUrl,
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function FilesPage() {
  const [
    files,
    setFiles,
  ] = useState<FileItem[]>([]);

  const [
    folders,
    setFolders,
  ] = useState<FolderItem[]>([]);

  const [
    currentFolderId,
    setCurrentFolderId,
  ] = useState<string | null>(
    null
  );

  const [
    folderHistory,
    setFolderHistory,
  ] = useState<
    Array<string | null>
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState<
    "recent" | "name" | "size"
  >("recent");

  const [
    view,
    setView,
  ] = useState<
    "grid" | "list"
  >("grid");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showUpload,
    setShowUpload,
  ] = useState(false);

  const [
    showFolder,
    setShowFolder,
  ] = useState(false);

  const [
    folderName,
    setFolderName,
  ] = useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<FileItem | null>(
    null
  );

  const [
    previewImage,
    setPreviewImage,
  ] = useState<FileItem | null>(
    null
  );

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* =======================================================
     LOAD FILES
  ======================================================= */

  const loadFiles =
    useCallback(
      async (
        silent = false
      ) => {
        try {
          if (!silent) {
            setLoading(true);
          }

          setError("");

          /*
           * Backend must return only the
           * authenticated user's files.
           */
          const response =
            await apiRequest<
              unknown
            >("/api/files");

          let rawFiles: BackendFile[] =
            [];

          if (
            Array.isArray(response)
          ) {
            rawFiles =
              response as BackendFile[];
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
              rawFiles =
                data.content as BackendFile[];
            } else if (
              Array.isArray(
                data.files
              )
            ) {
              rawFiles =
                data.files as BackendFile[];
            } else if (
              Array.isArray(
                data.data
              )
            ) {
              rawFiles =
                data.data as BackendFile[];
            }
          }

          const normalized =
            rawFiles
              .map(
                normalizeFile
              )
              .filter(
                (item) =>
                  item.type !==
                  "folder"
              );

          const backendFolders =
            rawFiles
              .filter(
                (item) =>
                  Boolean(
                    item.folder ||
                      item.isFolder
                  )
              )
              .map(
                (item) => ({
                  id: String(
                    item.id
                  ),
                  name:
                    item.name ||
                    item.fileName ||
                    item.filename ||
                    "Folder",
                  parentId:
                    normalizeId(
                      item.parentId ??
                        item.folderId
                    ),
                  modified:
                    formatDate(
                      item.updatedAt ||
                        item.createdAt ||
                        item.modified
                    ),
                })
              );

          setFiles(normalized);
          setFolders(
            backendFolders
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to load files.";

          setError(message);
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      []
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  /* =======================================================
     REFRESH AFTER WINDOW FOCUS
  ======================================================= */

  useEffect(() => {
    const handleFocus =
      () => {
        loadFiles(true);
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadFiles]);

  /* =======================================================
     CURRENT FOLDER
  ======================================================= */

  const currentFolder =
    useMemo(() => {
      if (
        currentFolderId === null
      ) {
        return null;
      }

      return (
        folders.find(
          (folder) =>
            folder.id ===
            currentFolderId
        ) ?? null
      );
    }, [
      currentFolderId,
      folders,
    ]);

  /* =======================================================
     CURRENT ITEMS
  ======================================================= */

  const currentItems =
    useMemo(() => {
      const currentFiles =
        files.filter(
          (file) =>
            file.parentId ===
            currentFolderId
        );

      const currentFolders =
        folders
          .filter(
            (folder) =>
              folder.parentId ===
              currentFolderId
          )
          .map(
            (folder): FileItem => ({
              id: folder.id,
              name: folder.name,
              type: "folder",
              size: "—",
              sizeBytes: 0,
              modified:
                folder.modified,
              parentId:
                folder.parentId,
            })
          );

      return [
        ...currentFolders,
        ...currentFiles,
      ];
    }, [
      currentFolderId,
      files,
      folders,
    ]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      let result =
        currentItems.filter(
          (item) =>
            item.name
              .toLowerCase()
              .includes(
                search
                  .toLowerCase()
                  .trim()
              )
        );

      if (
        sortBy === "name"
      ) {
        result =
          [...result].sort(
            (a, b) => {
              if (
                a.type ===
                  "folder" &&
                b.type !==
                  "folder"
              ) {
                return -1;
              }

              if (
                a.type !==
                  "folder" &&
                b.type ===
                  "folder"
              ) {
                return 1;
              }

              return a.name.localeCompare(
                b.name
              );
            }
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
              if (
                a.type ===
                  "folder" &&
                b.type !==
                  "folder"
              ) {
                return -1;
              }

              if (
                a.type !==
                  "folder" &&
                b.type ===
                  "folder"
              ) {
                return 1;
              }

              return (
                b.modified.localeCompare(
                  a.modified
                )
              );
            }
          );
      }

      return result;
    }, [
      currentItems,
      search,
      sortBy,
    ]);

  /* =======================================================
     BREADCRUMB
  ======================================================= */

  const breadcrumbs =
    useMemo(() => {
      const result: BreadcrumbItem[] =
        [
          {
            id: null,
            name: "My Files",
          },
        ];

      if (
        currentFolderId === null
      ) {
        return result;
      }

      const chain: FolderItem[] =
        [];

      let id:
        | string
        | null =
        currentFolderId;

      while (id !== null) {
        const folder =
          folders.find(
            (item) =>
              item.id === id
          );

        if (!folder) {
          break;
        }

        chain.unshift(
          folder
        );

        id =
          folder.parentId;
      }

      chain.forEach(
        (folder) => {
          result.push({
            id: folder.id,
            name: folder.name,
          });
        }
      );

      return result;
    }, [
      currentFolderId,
      folders,
    ]);

  /* =======================================================
     STORAGE
  ======================================================= */

  const usedBytes =
    files.reduce(
      (total, file) =>
        total +
        file.sizeBytes,
      0
    );

  const totalStorage =
    10 *
    1024 *
    1024 *
    1024;

  const percentage =
    Math.min(
      100,
      Math.round(
        (usedBytes /
          totalStorage) *
          100
      )
    );

  /* =======================================================
     OPEN FOLDER
  ======================================================= */

  function openFolder(
    folderId: string
  ) {
    setFolderHistory(
      (history) => [
        ...history,
        currentFolderId,
      ]
    );

    setCurrentFolderId(
      folderId
    );

    setSearch("");

    setSelectedFile(null);
    setPreviewImage(null);
  }

  /* =======================================================
     BACK
  ======================================================= */

  function goBack() {
    setFolderHistory(
      (history) => {
        if (
          history.length ===
          0
        ) {
          setCurrentFolderId(
            null
          );

          return [];
        }

        const next =
          [...history];

        const previous =
          next.pop() ?? null;

        setCurrentFolderId(
          previous
        );

        return next;
      }
    );

    setSearch("");
  }

  /* =======================================================
     HOME
  ======================================================= */

  function goHome() {
    setCurrentFolderId(
      null
    );

    setFolderHistory(
      []
    );

    setSearch("");

    setSelectedFile(null);
    setPreviewImage(null);
  }

  /* =======================================================
     CREATE FOLDER
  ======================================================= */

  async function createFolder() {
    const name =
      folderName.trim();

    if (!name) {
      return;
    }

    try {
      setError("");

      /*
       * Expected backend:
       * POST /api/folders
       *
       * {
       *   "name": "...",
       *   "parentId": "..."
       * }
       */

      await apiRequest(
        "/api/folders",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            parentId:
              currentFolderId,
          }),
        }
      );

      setFolderName("");
      setShowFolder(false);

      await loadFiles(
        true
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create folder."
      );
    }
  }

  /* =======================================================
     UPLOAD
  ======================================================= */

  async function uploadFiles(
    selectedFiles: File[]
  ) {
    if (
      selectedFiles.length ===
      0
    ) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      for (
        const file of selectedFiles
      ) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        /*
         * Folder relationship.
         */
        if (
          currentFolderId !==
          null
        ) {
          formData.append(
            "parentId",
            currentFolderId
          );

          formData.append(
            "folderId",
            currentFolderId
          );
        }

        await apiRequest(
          "/api/files/upload",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      setShowUpload(false);

      await loadFiles(
        true
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleInputUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files;

    if (!selected) {
      return;
    }

    uploadFiles(
      Array.from(selected)
    );

    event.target.value = "";
  }

  /* =======================================================
     DRAG & DROP
  ======================================================= */

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFiles =
      Array.from(
        event.dataTransfer.files
      );

    uploadFiles(
      droppedFiles
    );
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteItem(
    item: FileItem
  ) {
    const confirmed =
      window.confirm(
        `Delete "${item.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        item.id
      );

      setError("");

      /*
       * Backend is responsible for:
       * - checking ownership
       * - deleting metadata
       * - deleting physical file
       * - handling folders recursively
       */

      await apiRequest(
        `/api/files/${encodeURIComponent(
          item.id
        )}`,
        {
          method: "DELETE",
        }
      );

      setSelectedFile(
        null
      );

      setPreviewImage(
        null
      );

      await loadFiles(
        true
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  /* =======================================================
     CLICK ITEM
  ======================================================= */

  function handleItemClick(
    item: FileItem
  ) {
    if (
      item.type ===
      "folder"
    ) {
      openFolder(
        item.id
      );

      return;
    }

    if (
      item.type ===
      "image"
    ) {
      setPreviewImage(
        item
      );

      return;
    }

    setSelectedFile(
      item
    );
  }

  /* =======================================================
     DOUBLE CLICK
  ======================================================= */

  function handleItemDoubleClick(
    item: FileItem
  ) {
    if (
      item.type ===
      "folder"
    ) {
      openFolder(
        item.id
      );

      return;
    }

    if (
      item.type ===
      "image"
    ) {
      setPreviewImage(
        item
      );
    }
  }

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  async function downloadFile(
    item: FileItem
  ) {
    if (
      !item.downloadUrl
    ) {
      /*
       * Fallback to backend endpoint.
       */
      const url =
        `${API_BASE}/api/files/${encodeURIComponent(
          item.id
        )}/download`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    window.open(
      item.downloadUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Cloud Storage
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              My Files
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Securely store, organize and access your files from anywhere.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                setShowFolder(
                  true
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </button>

            <button
              onClick={() =>
                setShowUpload(
                  true
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}

              Upload
            </button>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =================================================
            STORAGE
        ================================================= */}

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
                  {formatFileSize(
                    usedBytes
                  )}{" "}
                  used of 10 GB
                </p>

              </div>

            </div>

            <div className="w-full sm:max-w-sm">

              <div className="mb-2 flex justify-between text-xs">

                <span className="text-slate-400">
                  {percentage}% used
                </span>

                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {formatFileSize(
                    Math.max(
                      0,
                      totalStorage -
                        usedBytes
                    )
                  )}{" "}
                  free
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">

            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search files and folders..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={() =>
                loadFiles()
              }
              disabled={loading}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <div className="relative">

              <select
                value={sortBy}
                onChange={(event) =>
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

            <div className="flex h-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">

              <button
                onClick={() =>
                  setView(
                    "grid"
                  )
                }
                className={`rounded-lg px-3 ${
                  view ===
                  "grid"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                onClick={() =>
                  setView(
                    "list"
                  )
                }
                className={`rounded-lg px-3 ${
                  view ===
                  "list"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400"
                }`}
              >
                <List className="h-4 w-4" />
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mt-6 flex flex-wrap items-center gap-2">

          {currentFolderId !==
            null && (
            <button
              onClick={
                goBack
              }
              className="mr-1 inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {breadcrumbs.map(
            (
              breadcrumb,
              index
            ) => (
              <div
                key={
                  breadcrumb.id ??
                  "root"
                }
                className="flex items-center gap-2"
              >

                {index >
                  0 && (
                  <span className="text-slate-300 dark:text-slate-700">
                    /
                  </span>
                )}

                <button
                  onClick={() => {
                    if (
                      breadcrumb.id ===
                      null
                    ) {
                      goHome();
                      return;
                    }

                    const indexInPath =
                      breadcrumbs.findIndex(
                        (
                          item
                        ) =>
                          item.id ===
                          breadcrumb.id
                      );

                    const previousIds =
                      breadcrumbs
                        .slice(
                          1,
                          indexInPath
                        )
                        .map(
                          (
                            item
                          ) =>
                            item.id
                        )
                        .filter(
                          (
                            id
                          ): id is string =>
                            id !==
                            null
                        );

                    setFolderHistory(
                      previousIds
                    );

                    setCurrentFolderId(
                      breadcrumb.id
                    );

                    setSearch(
                      ""
                    );
                  }}
                  className={`max-w-[180px] truncate text-sm ${
                    index ===
                    breadcrumbs.length -
                      1
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "font-medium text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {breadcrumb.name}
                </button>

              </div>
            )
          )}

        </div>

        {/* =================================================
            DROP ZONE
        ================================================= */}

        <div
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={
            handleDrop
          }
          className={`mt-6 rounded-2xl border-2 border-dashed p-2 transition ${
            dragActive
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/5"
              : "border-transparent"
          }`}
        >

          {/* =================================================
              CONTENT
          ================================================= */}

          {loading ? (

            <LoadingState />

          ) : filteredItems.length ===
            0 ? (

            <EmptyState
              search={search}
              onUpload={() =>
                setShowUpload(
                  true
                )
              }
              onNewFolder={() =>
                setShowFolder(
                  true
                )
              }
            />

          ) : view ===
            "grid" ? (

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredItems.map(
                (item) => (
                  <FileCard
                    key={
                      item.id
                    }
                    file={
                      item
                    }
                    deleting={
                      deletingId ===
                      item.id
                    }
                    onClick={() =>
                      handleItemClick(
                        item
                      )
                    }
                    onDoubleClick={() =>
                      handleItemDoubleClick(
                        item
                      )
                    }
                    onDelete={() =>
                      deleteItem(
                        item
                      )
                    }
                  />
                )
              )}

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

              <div className="hidden grid-cols-[1fr_140px_160px_60px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-white/10 md:grid">
                <span>
                  Name
                </span>
                <span>
                  Size
                </span>
                <span>
                  Modified
                </span>
                <span />
              </div>

              {filteredItems.map(
                (item) => (
                  <ListFile
                    key={
                      item.id
                    }
                    file={
                      item
                    }
                    deleting={
                      deletingId ===
                      item.id
                    }
                    onClick={() =>
                      handleItemClick(
                        item
                      )
                    }
                    onDoubleClick={() =>
                      handleItemDoubleClick(
                        item
                      )
                    }
                    onDelete={() =>
                      deleteItem(
                        item
                      )
                    }
                  />
                )
              )}

            </div>
          )}

        </div>

        {/* =================================================
            UPLOAD MODAL
        ================================================= */}

        {showUpload && (
          <UploadModal
            inputRef={
              fileInputRef
            }
            uploading={
              uploading
            }
            onClose={() =>
              setShowUpload(
                false
              )
            }
            onUpload={
              handleInputUpload
            }
            onDrop={
              uploadFiles
            }
          />
        )}

        {/* =================================================
            FOLDER MODAL
        ================================================= */}

        {showFolder && (
          <FolderModal
            value={
              folderName
            }
            setValue={
              setFolderName
            }
            onClose={() => {
              setShowFolder(
                false
              );
              setFolderName(
                ""
              );
            }}
            onCreate={
              createFolder
            }
          />
        )}

        {/* =================================================
            DETAILS MODAL
        ================================================= */}

        {selectedFile && (
          <FileDetailsModal
            file={
              selectedFile
            }
            deleting={
              deletingId ===
              selectedFile.id
            }
            onClose={() =>
              setSelectedFile(
                null
              )
            }
            onDelete={() =>
              deleteItem(
                selectedFile
              )
            }
            onDownload={() =>
              downloadFile(
                selectedFile
              )
            }
          />
        )}

        {/* =================================================
            IMAGE PREVIEW
        ================================================= */}

        {previewImage && (
          <ImagePreviewModal
            file={
              previewImage
            }
            onClose={() =>
              setPreviewImage(
                null
              )
            }
            onDownload={() =>
              downloadFile(
                previewImage
              )
            }
            onDelete={() =>
              deleteItem(
                previewImage
              )
            }
          />
        )}

      </div>
    </DashboardShell>
  );
}

/* =========================================================
   FILE CARD
========================================================= */

function FileCard({
  file,
  deleting,
  onClick,
  onDoubleClick,
  onDelete,
}: {
  file: FileItem;
  deleting: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onDelete: () => void;
}) {
  const isFolder =
    file.type ===
    "folder";

  const isImage =
    file.type ===
    "image";

  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
      onDoubleClick={
        onDoubleClick
      }
    >

      <button
        onClick={onClick}
        className="w-full text-left"
      >

        {isImage &&
        file.previewUrl ? (

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">

            <img
              src={
                file.previewUrl
              }
              alt={
                file.name
              }
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">

              <div className="scale-75 rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
                <ZoomIn className="h-5 w-5 text-slate-800" />
              </div>

            </div>

          </div>

        ) : (

          <div className="flex items-start justify-between">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isFolder
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              <FileIcon
                type={
                  file.type
                }
              />
            </div>

            <MoreHorizontal className="h-5 w-5 text-slate-300" />

          </div>
        )}

        <div className="mt-4">

          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {
              file.name
            }
          </p>

          <div className="mt-2 flex items-center justify-between gap-2">

            <span className="truncate text-xs text-slate-400">
              {isFolder
                ? "Folder"
                : file.size}
            </span>

            <span className="shrink-0 text-xs text-slate-400">
              {
                file.modified
              }
            </span>

          </div>

        </div>

      </button>

      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 dark:border-white/5">

        {!isFolder && (
          <button
            onClick={
              onDelete
            }
            disabled={
              deleting
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            title="Delete"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   LIST FILE
========================================================= */

function ListFile({
  file,
  deleting,
  onClick,
  onDoubleClick,
  onDelete,
}: {
  file: FileItem;
  deleting: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onDelete: () => void;
}) {
  const isFolder =
    file.type ===
    "folder";

  const isImage =
    file.type ===
    "image";

  return (
    <div
      onDoubleClick={
        onDoubleClick
      }
      className="grid w-full gap-3 border-b border-slate-100 px-5 py-4 transition last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 md:grid-cols-[1fr_140px_160px_60px] md:items-center md:gap-4"
    >

      <button
        onClick={onClick}
        className="flex min-w-0 items-center gap-3 text-left"
      >

        {isImage &&
        file.previewUrl ? (

          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">

            <img
              src={
                file.previewUrl
              }
              alt={
                file.name
              }
              className="h-full w-full object-cover"
            />

          </div>

        ) : (

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isFolder
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            <FileIcon
              type={
                file.type
              }
            />
          </div>
        )}

        <span className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {
            file.name
          }
        </span>

      </button>

      <span className="hidden text-xs text-slate-400 md:block">
        {isFolder
          ? "—"
          : file.size}
      </span>

      <span className="hidden text-xs text-slate-400 md:block">
        {
          file.modified
        }
      </span>

      <button
        onClick={
          onDelete
        }
        disabled={
          deleting
        }
        className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 md:flex"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

    </div>
  );
}

/* =========================================================
   FILE ICON
========================================================= */

function FileIcon({
  type,
}: {
  type: FileType;
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

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Loading your files...
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Securely fetching your storage.
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  search,
  onUpload,
  onNewFolder,
}: {
  search: string;
  onUpload: () => void;
  onNewFolder: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        {search ? (
          <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        ) : (
          <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "Your storage is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        {search
          ? "Try a different file or folder name."
          : "Upload your first file or create a folder to get started."}
      </p>

      {!search && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">

          <button
            onClick={
              onNewFolder
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>

          <button
            onClick={
              onUpload
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   UPLOAD MODAL
========================================================= */

function UploadModal({
  inputRef,
  uploading,
  onClose,
  onUpload,
  onDrop,
}: {
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  uploading: boolean;
  onClose: () => void;
  onUpload: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onDrop: (
    files: File[]
  ) => void;
}) {
  const [
    localDrag,
    setLocalDrag,
  ] = useState(false);

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setLocalDrag(false);

    const files =
      Array.from(
        event.dataTransfer.files
      );

    onDrop(files);
  }

  return (
    <Modal
      onClose={
        uploading
          ? undefined
          : onClose
      }
    >

      <div className="text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          {uploading
            ? "Uploading..."
            : "Upload Files"}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Files will be stored in the current folder.
        </p>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setLocalDrag(
              true
            );
          }}
          onDragLeave={() =>
            setLocalDrag(
              false
            )
          }
          onDrop={
            handleDrop
          }
          className={`mt-6 rounded-2xl border-2 border-dashed px-5 py-10 transition ${
            localDrag
              ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
              : "border-slate-300 dark:border-white/10"
          }`}
        >

          <button
            disabled={
              uploading
            }
            onClick={() =>
              inputRef.current?.click()
            }
            className="w-full text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300"
          >

            <Upload className="mx-auto mb-4 h-7 w-7 text-slate-400" />

            Click to choose files

            <span className="mt-2 block text-xs font-normal text-slate-400">
              Or drag and drop files here
            </span>

          </button>

        </div>

        <input
          ref={
            inputRef
          }
          type="file"
          multiple
          className="hidden"
          onChange={
            onUpload
          }
          disabled={
            uploading
          }
        />

        {!uploading && (
          <button
            onClick={
              onClose
            }
            className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        )}

      </div>

    </Modal>
  );
}

/* =========================================================
   FOLDER MODAL
========================================================= */

function FolderModal({
  value,
  setValue,
  onClose,
  onCreate,
}: {
  value: string;
  setValue: (
    value: string
  ) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <Modal
      onClose={
        onClose
      }
    >

      <div className="flex items-start gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New Folder
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Create a folder inside the current location.
          </p>
        </div>

      </div>

      <input
        autoFocus
        value={
          value
        }
        onChange={(event) =>
          setValue(
            event.target.value
          )
        }
        onKeyDown={(event) => {
          if (
            event.key ===
            "Enter"
          ) {
            onCreate();
          }
        }}
        placeholder="Folder name"
        className="mt-6 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />

      <div className="mt-6 flex gap-3">

        <button
          onClick={
            onClose
          }
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          Cancel
        </button>

        <button
          onClick={
            onCreate
          }
          disabled={
            !value.trim()
          }
          className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create
        </button>

      </div>

    </Modal>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

function FileDetailsModal({
  file,
  deleting,
  onClose,
  onDelete,
  onDownload,
}: {
  file: FileItem;
  deleting: boolean;
  onClose: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  return (
    <Modal
      onClose={
        deleting
          ? undefined
          : onClose
      }
    >

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <FileIcon
            type={
              file.type
            }
          />
        </div>

        <div className="min-w-0">

          <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            {
              file.name
            }
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {
              file.type ===
              "pdf"
                ? "PDF document"
                : file.type ===
                  "zip"
                ? "Archive"
                : "Document"
            }
          </p>

        </div>

      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-white/5">

        <DetailRow
          label="Name"
          value={
            file.name
          }
        />

        <DetailRow
          label="Type"
          value={
            file.type.toUpperCase()
          }
        />

        <DetailRow
          label="Size"
          value={
            file.size
          }
        />

        <DetailRow
          label="Modified"
          value={
            file.modified
          }
        />

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <button
          onClick={
            onDownload
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          Download
        </button>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

      </div>

      <button
        onClick={
          onDelete
        }
        disabled={
          deleting
        }
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}

        Delete
      </button>

    </Modal>
  );
}

/* =========================================================
   IMAGE PREVIEW
========================================================= */

function ImagePreviewModal({
  file,
  onClose,
  onDownload,
  onDelete,
}: {
  file: FileItem;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <FileImage className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-white">
                {
                  file.name
                }
              </p>

              <p className="text-xs text-slate-400">
                {
                  file.size
                }
              </p>

            </div>

          </div>

          <button
            onClick={
              onClose
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        <div className="flex min-h-[350px] flex-1 items-center justify-center overflow-auto bg-black p-4 sm:p-8">

          {file.previewUrl ? (
            <img
              src={
                file.previewUrl
              }
              alt={
                file.name
              }
              className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          ) : (
            <div className="text-center">

              <FileImage className="mx-auto h-16 w-16 text-slate-600" />

              <p className="mt-4 text-sm text-slate-400">
                Image preview is unavailable.
              </p>

            </div>
          )}

        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">

          <p className="text-xs text-slate-500">
            {
              file.modified
            }
          </p>

          <div className="flex items-center gap-2">

            <button
              onClick={
                onDownload
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Download
            </button>

            <button
              onClick={
                onDelete
              }
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-200 py-3 last:border-0 dark:border-white/5">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[220px] truncate text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   GENERIC MODAL
========================================================= */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          onClose &&
          event.target ===
            event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        {onClose && (
          <button
            onClick={
              onClose
            }
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {children}

      </div>

    </div>
  );
}
