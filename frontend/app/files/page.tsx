 "use client";

import {
  AlertCircle,
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronRight,
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
  FolderPlus,
  Grid2X2,
  List,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Star,
  UserPlus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  DragEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import DashboardShell from "@/app/components/DashboardShell";

/* =========================================================
   TYPES
========================================================= */

type UUID = string;

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

interface SharedFileItem {
  id: UUID;
  fileId: UUID;
  name: string;
  type: string;
  size: number;
  owner: string;
  ownerEmail: string;
  permission: "VIEWER" | "EDITOR" | string;
  sharedDate: string;
  status: string;
}

interface BreadcrumbItem {
  id: UUID | null;
  name: string;
}

type SortKey = "name" | "size" | "date";
type SortDirection = "asc" | "desc";
type ViewMode = "grid" | "list";

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/* =========================================================
   STARRED STORAGE
========================================================= */

const STARRED_STORAGE_KEY =
  "cloudstorage-starred-items";

/* =========================================================
   HELPERS
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") return null;

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

function authHeaders(extra?: HeadersInit): HeadersInit {
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

async function parseApiError(response: Response): Promise<string> {
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
    // Ignore parse error.
  }

  return `Request failed (${response.status})`;
}

function normalizeFile(value: any): FileItem {
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
      value?.fileSize ?? value?.size ?? 0
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

function normalizeFolder(value: any): FolderItem {
  return {
    id: String(value?.id ?? ""),
    name:
      value?.name ??
      value?.folderName ??
      value?.folder_name ??
      "Untitled folder",
    folderName: value?.folderName,
    userId: value?.userId,
    parentFolderId:
      value?.parentFolderId ??
      value?.parent_folder_id ??
      null,
    createdAt:
      value?.createdAt ??
      value?.created_at,
  };
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
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
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const size =
    bytes / Math.pow(1024, index);

  return `${size.toFixed(
    index === 0
      ? 0
      : size >= 10
      ? 1
      : 2
  )} ${units[index]}`;
}

function formatDate(value?: string): string {
  if (!value) return "—";

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

function formatDateTime(value?: string): string {
  if (!value) return "—";

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
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");

  if (parts.length < 2) return "";

  return parts.pop()?.toLowerCase() || "";
}

function getFileCategory(
  file: FileItem
): string {
  const type =
    file.fileType?.toLowerCase() || "";

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
  size = 28
) {
  const category =
    getFileCategory(file);

  switch (category) {
    case "image":
      return <FileImage size={size} />;

    case "video":
      return <FileVideo size={size} />;

    case "audio":
      return <FileAudio size={size} />;

    case "pdf":
    case "document":
      return <FileText size={size} />;

    case "spreadsheet":
      return (
        <FileSpreadsheet size={size} />
      );

    case "archive":
      return (
        <FileArchive size={size} />
      );

    case "code":
      return <FileCode2 size={size} />;

    default:
      return <FileIcon size={size} />;
  }
}

function isPreviewable(
  file: FileItem
): boolean {
  const category =
    getFileCategory(file);

  return [
    "image",
    "video",
    "audio",
    "pdf",
  ].includes(category);
}

function getInitials(
  name: string
): string {
  const clean = name.trim();

  if (!clean) return "F";

  const words =
    clean.split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function FilesPage() {
  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [folders, setFolders] =
    useState<FolderItem[]>([]);

  /* -------------------------------------------------------
     STARRED
  ------------------------------------------------------- */

  const [starredItems, setStarredItems] =
    useState<string[]>([]);

  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  const [currentFolderId, setCurrentFolderId] =
    useState<UUID | null>(null);

  const [breadcrumbs, setBreadcrumbs] =
    useState<BreadcrumbItem[]>([
      {
        id: null,
        name: "My Files",
      },
    ]);

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  const [search, setSearch] =
    useState("");

  const [sortKey, setSortKey] =
    useState<SortKey>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [creatingFolder, setCreatingFolder] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<UUID | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<UUID | null>(null);

  /* -------------------------------------------------------
     ERRORS
  ------------------------------------------------------- */

  const [error, setError] =
    useState("");

  /* -------------------------------------------------------
     MODALS
  ------------------------------------------------------- */

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [showFolderModal, setShowFolderModal] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null);

  const [shareFile, setShareFile] =
    useState<FileItem | null>(null);

  const [sharedFiles, setSharedFiles] =
    useState<SharedFileItem[]>([]);

  const [shareEmail, setShareEmail] =
    useState("");

  const [sharePermission, setSharePermission] =
    useState<"VIEWER" | "EDITOR">("VIEWER");

  const [loadingShares, setLoadingShares] =
    useState(false);

  const [sharingFile, setSharingFile] =
    useState(false);

  const [shareActionId, setShareActionId] =
    useState<UUID | null>(null);

  const [previewFile, setPreviewFile] =
    useState<FileItem | null>(null);

  const [deleteConfirmFile, setDeleteConfirmFile] =
    useState<FileItem | null>(null);

  const [deleteConfirmFolder, setDeleteConfirmFolder] =
    useState<FolderItem | null>(null);

  const [deletingFolderId, setDeletingFolderId] =
    useState<UUID | null>(null);

  /* -------------------------------------------------------
     UPLOAD
  ------------------------------------------------------- */

  const [selectedUploadFiles, setSelectedUploadFiles] =
    useState<globalThis.File[]>([]);

  const [isDragging, setIsDragging] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* -------------------------------------------------------
     FOLDER
  ------------------------------------------------------- */

  const [folderName, setFolderName] =
    useState("");

  /* -------------------------------------------------------
     TOAST
  ------------------------------------------------------- */

  const [toast, setToast] =
    useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);

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
      }, 3500);
    },
    []
  );

  /* =======================================================
     LOAD STARRED ITEMS
  ======================================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STARRED_STORAGE_KEY
        );

      if (!stored) return;

      const parsed =
        JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setStarredItems(
          parsed.filter(
            (
              item
            ): item is string =>
              typeof item === "string"
          )
        );
      }
    } catch (err) {
      console.error(
        "Unable to load starred items:",
        err
      );
    }
  }, []);

  /* =======================================================
     STAR / UNSTAR
  ======================================================= */

  const toggleStar = useCallback(
    (
      id: UUID,
      type: "file" | "folder"
    ) => {
      const key = `${type}:${id}`;

      setStarredItems(
        (previous) => {
          const alreadyStarred =
            previous.includes(key);

          const updated =
            alreadyStarred
              ? previous.filter(
                  (item) =>
                    item !== key
                )
              : [
                  ...previous,
                  key,
                ];

          try {
            localStorage.setItem(
              STARRED_STORAGE_KEY,
              JSON.stringify(updated)
            );
          } catch (err) {
            console.error(
              "Unable to save starred item:",
              err
            );
          }

          showToast(
            "success",
            alreadyStarred
              ? "Removed from Starred."
              : "Added to Starred."
          );

          return updated;
        }
      );
    },
    [showToast]
  );

  /* =======================================================
     CHECK STAR
  ======================================================= */

  const isItemStarred =
    useCallback(
      (
        id: UUID,
        type: "file" | "folder"
      ) => {
        return starredItems.includes(
          `${type}:${id}`
        );
      },
      [starredItems]
    );

  /* =======================================================
     AUTH CHECK
  ======================================================= */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setError(
        "You are not authenticated. Please login again."
      );

      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD FOLDERS
  ======================================================= */

  const loadFolders = useCallback(
    async (
      folderId: UUID | null
    ) => {
      const token = getToken();

      if (!token) return;

      try {
        const url = new URL(
          `${API_BASE}/api/folders`
        );

        if (folderId) {
          url.searchParams.set(
            "parentFolderId",
            folderId
          );
        }

        const response =
          await fetch(
            url.toString(),
            {
              method: "GET",
              headers: authHeaders(),
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

        const rawFolders =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.folders
              )
            ? data.folders
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];

        setFolders(
          rawFolders
            .map(normalizeFolder)
            .filter(
              (
                folder: FolderItem
              ) => folder.id
            )
        );
      } catch (err) {
        console.error(
          "Folder loading error:",
          err
        );

        setFolders([]);
      }
    },
    []
  );

  /* =======================================================
     LOAD FILES
  ======================================================= */

  const loadFiles = useCallback(
    async (
      folderId: UUID | null
    ) => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const url = new URL(
          `${API_BASE}/api/files`
        );

        if (folderId) {
          url.searchParams.set(
            "parentFolderId",
            folderId
          );
        }

        const response =
          await fetch(
            url.toString(),
            {
              method: "GET",
              headers: authHeaders(),
              cache: "no-store",
            }
          );

        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response
            )
          );
        }

        const data =
          await response.json();

        const rawFiles =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.files
              )
            ? data.files
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];

        setFiles(
          rawFiles
            .map(normalizeFile)
            .filter(
              (
                file: FileItem
              ) => file.id
            )
        );
      } catch (err: any) {
        console.error(
          "File loading error:",
          err
        );

        setFiles([]);

        setError(
          err?.message ||
            "Unable to load your files."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =======================================================
     LOAD CURRENT FOLDER
  ======================================================= */

  const refreshCurrentFolder =
    useCallback(
      async () => {
        await Promise.all([
          loadFiles(
            currentFolderId
          ),
          loadFolders(
            currentFolderId
          ),
        ]);
      },
      [
        currentFolderId,
        loadFiles,
        loadFolders,
      ]
    );

  /* =======================================================
     INITIAL / FOLDER LOAD
  ======================================================= */

  useEffect(() => {
    refreshCurrentFolder();
  }, [refreshCurrentFolder]);

  /* =======================================================
     NAVIGATE INTO FOLDER
  ======================================================= */

  const openFolder =
    useCallback(
      async (
        folder: FolderItem
      ) => {
        setCurrentFolderId(
          folder.id
        );

        setBreadcrumbs(
          (previous) => {
            const existingIndex =
              previous.findIndex(
                (item) =>
                  item.id ===
                  folder.id
              );

            if (
              existingIndex >= 0
            ) {
              return previous.slice(
                0,
                existingIndex + 1
              );
            }

            return [
              ...previous,
              {
                id: folder.id,
                name: folder.name,
              },
            ];
          }
        );

        setSearch("");
      },
      []
    );

  /* =======================================================
     BREADCRUMB CLICK
  ======================================================= */

  const navigateBreadcrumb =
    useCallback(
      (index: number) => {
        const item =
          breadcrumbs[index];

        if (!item) return;

        setBreadcrumbs(
          breadcrumbs.slice(
            0,
            index + 1
          )
        );

        setCurrentFolderId(
          item.id
        );

        setSearch("");
      },
      [breadcrumbs]
    );

  /* =======================================================
     CREATE FOLDER
  ======================================================= */

  const createFolder =
    async () => {
      const cleanName =
        folderName.trim();

      if (!cleanName) {
        showToast(
          "error",
          "Please enter a folder name."
        );
        return;
      }

      const token = getToken();

      if (!token) {
        showToast(
          "error",
          "Please login again."
        );
        return;
      }

      setCreatingFolder(true);

      try {
        const response =
          await fetch(
            `${API_BASE}/api/folders`,
            {
              method: "POST",
              headers: {
                ...authHeaders(),
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name: cleanName,
                parentFolderId:
                  currentFolderId,
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response
            )
          );
        }

        setFolderName("");
        setShowFolderModal(
          false
        );

        await loadFolders(
          currentFolderId
        );

        showToast(
          "success",
          "Folder created successfully."
        );
      } catch (err: any) {
        console.error(
          "Create folder error:",
          err
        );

        showToast(
          "error",
          err?.message ||
            "Unable to create folder."
        );
      } finally {
        setCreatingFolder(false);
      }
    };

  /* =======================================================
     SELECT UPLOAD FILES
  ======================================================= */

  const addUploadFiles = (
    incoming: globalThis.File[]
  ) => {
    const validFiles =
      incoming.filter(
        (file) =>
          file.size >= 0
      );

    setSelectedUploadFiles(
      (previous) => {
        const merged = [
          ...previous,
          ...validFiles,
        ];

        const unique =
          new Map<
            string,
            globalThis.File
          >();

        for (const file of merged) {
          const key = `${file.name}-${file.size}-${file.lastModified}`;

          if (
            !unique.has(key)
          ) {
            unique.set(
              key,
              file
            );
          }
        }

        return Array.from(
          unique.values()
        );
      }
    );
  };

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleFileInput = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const incoming =
      Array.from(
        event.target.files || []
      );

    addUploadFiles(
      incoming
    );

    event.target.value = "";
  };

  /* =======================================================
     DRAG EVENTS
  ======================================================= */

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const incoming =
      Array.from(
        event.dataTransfer.files || []
      );

    addUploadFiles(
      incoming
    );
  };

  /* =======================================================
     REMOVE SELECTED UPLOAD
  ======================================================= */

  const removeUploadFile = (
    index: number
  ) => {
    setSelectedUploadFiles(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };

  /* =======================================================
     UPLOAD FILES
  ======================================================= */

  const uploadFiles =
    async () => {
      if (
        selectedUploadFiles.length ===
        0
      ) {
        showToast(
          "error",
          "Please select at least one file."
        );
        return;
      }

      const token = getToken();

      if (!token) {
        showToast(
          "error",
          "Please login again."
        );
        return;
      }

      setUploading(true);

      let successCount = 0;
      let failedCount = 0;

      try {
        for (const uploadFile of selectedUploadFiles) {
          try {
            const formData =
              new FormData();

            formData.append(
              "file",
              uploadFile
            );

            if (
              currentFolderId
            ) {
              formData.append(
                "parentFolderId",
                currentFolderId
              );
            }

            const response =
              await fetch(
                `${API_BASE}/api/files/upload`,
                {
                  method: "POST",
                  headers:
                    authHeaders(),
                  body: formData,
                }
              );

            if (!response.ok) {
              throw new Error(
                await parseApiError(
                  response
                )
              );
            }

            successCount++;
          } catch (
            uploadError
          ) {
            console.error(
              `Upload failed for ${uploadFile.name}:`,
              uploadError
            );

            failedCount++;
          }
        }

        setSelectedUploadFiles(
          []
        );

        setShowUploadModal(
          false
        );

        await loadFiles(
          currentFolderId
        );

        if (
          successCount > 0 &&
          failedCount === 0
        ) {
          showToast(
            "success",
            successCount === 1
              ? "File uploaded successfully."
              : `${successCount} files uploaded successfully.`
          );
        } else if (
          successCount > 0 &&
          failedCount > 0
        ) {
          showToast(
            "error",
            `${successCount} uploaded, ${failedCount} failed.`
          );
        } else {
          showToast(
            "error",
            "File upload failed."
          );
        }
      } finally {
        setUploading(false);
      }
    };

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const downloadFile = async (
    file: FileItem,
    event?: MouseEvent
  ) => {
    event?.stopPropagation();

    const token = getToken();

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

      anchor.href = objectUrl;
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
  };

  /* =======================================================
     DELETE CONFIRMATION
  ======================================================= */

  const requestDeleteFile = (
    file: FileItem,
    event?: MouseEvent
  ) => {
    event?.stopPropagation();

    if (deletingId) return;

    setDeleteConfirmFile(
      file
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteFile =
    async () => {
      if (
        !deleteConfirmFile
      )
        return;

      const file =
        deleteConfirmFile;

      const token = getToken();

      if (!token) {
        setDeleteConfirmFile(
          null
        );

        showToast(
          "error",
          "Please login again."
        );

        return;
      }

      setDeletingId(
        file.id
      );

      try {
        const response =
          await fetch(
            `${API_BASE}/api/files/${file.id}`,
            {
              method: "DELETE",
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

        setFiles(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                file.id
            )
        );

        setDeleteConfirmFile(
          null
        );

        setSelectedFile(
          null
        );

        setPreviewFile(
          null
        );

        showToast(
          "success",
          `"${file.fileName}" moved to Trash successfully.`
        );
      } catch (err: any) {
        console.error(
          "Delete error:",
          err
        );

        showToast(
          "error",
          err?.message ||
            "Unable to delete file. Please try again."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =======================================================
     FOLDER DELETE CONFIRMATION
  ======================================================= */

  const requestDeleteFolder = (
    folder: FolderItem,
    event?: MouseEvent
  ) => {
    event?.stopPropagation();

    if (
      deletingId ||
      deletingFolderId
    )
      return;

    setDeleteConfirmFolder(
      folder
    );
  };

  /* =======================================================
     FOLDER DELETE
  ======================================================= */

  const deleteFolder =
    async () => {
      if (
        !deleteConfirmFolder
      )
        return;

      const folder =
        deleteConfirmFolder;

      const token = getToken();

      if (!token) {
        setDeleteConfirmFolder(
          null
        );

        showToast(
          "error",
          "Please login again."
        );

        return;
      }

      setDeletingFolderId(
        folder.id
      );

      try {
        const response =
          await fetch(
            `${API_BASE}/api/folders/${folder.id}`,
            {
              method: "DELETE",
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

        setFolders(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                folder.id
            )
        );

        setDeleteConfirmFolder(
          null
        );

        showToast(
          "success",
          `"${folder.name}" moved to trash successfully.`
        );
      } catch (err: any) {
        console.error(
          "Folder delete error:",
          err
        );

        showToast(
          "error",
          err?.message ||
            "Unable to delete folder. Please try again."
        );
      } finally {
        setDeletingFolderId(
          null
        );
      }
    };

  /* =======================================================
     SHARE FILE
  ======================================================= */

  const openShareModal = async (
    file: FileItem,
    event?: MouseEvent
  ) => {
    event?.stopPropagation();

    setShareFile(file);
    setShareEmail("");
    setSharePermission("VIEWER");
    setSharedFiles([]);
    setLoadingShares(true);

    const token = getToken();

    if (!token) {
      setLoadingShares(false);
      showToast("error", "Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/shares/by-me`,
        {
          method: "GET",
          headers: authHeaders(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = await response.json();
      const rawShares = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const normalized = rawShares
        .map((item: any): SharedFileItem => ({
          id: String(item?.id ?? ""),
          fileId: String(item?.fileId ?? ""),
          name: item?.name ?? "Unnamed file",
          type: item?.type ?? "application/octet-stream",
          size: Number(item?.size ?? 0),
          owner: item?.owner ?? "",
          ownerEmail: item?.ownerEmail ?? "",
          permission: item?.permission ?? "VIEWER",
          sharedDate: item?.sharedDate ?? new Date().toISOString(),
          status: item?.status ?? "ACTIVE",
        }))
        .filter((item: SharedFileItem) => item.fileId === file.id);

      setSharedFiles(normalized);
    } catch (err: any) {
      console.error("Share loading error:", err);
      showToast(
        "error",
        err?.message || "Unable to load sharing details."
      );
    } finally {
      setLoadingShares(false);
    }
  };

  const shareCurrentFile = async () => {
    if (!shareFile) return;

    const email = shareEmail.trim().toLowerCase();

    if (!email) {
      showToast("error", "Please enter an email address.");
      return;
    }

    const token = getToken();

    if (!token) {
      showToast("error", "Please login again.");
      return;
    }

    setSharingFile(true);

    try {
      const params = new URLSearchParams();
      params.set("fileId", shareFile.id);
      params.set("email", email);
      params.set("permission", sharePermission);

      const response = await fetch(
        `${API_BASE}/api/shares?${params.toString()}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = await response.json();
      const shared: SharedFileItem = {
        id: String(data?.id ?? ""),
        fileId: String(data?.fileId ?? shareFile.id),
        name: data?.name ?? shareFile.fileName,
        type: data?.type ?? shareFile.fileType,
        size: Number(data?.size ?? shareFile.fileSize),
        owner: data?.owner ?? "",
        ownerEmail: data?.ownerEmail ?? "",
        permission: data?.permission ?? sharePermission,
        sharedDate: data?.sharedDate ?? new Date().toISOString(),
        status: data?.status ?? "ACTIVE",
      };

      setSharedFiles((previous) => {
        const existingIndex = previous.findIndex(
          (item) => item.id === shared.id
        );
        if (existingIndex < 0) return [...previous, shared];

        const updated = [...previous];
        updated[existingIndex] = shared;
        return updated;
      });

      setShareEmail("");
      showToast(
        "success",
        `File shared successfully with ${email}.`
      );
    } catch (err: any) {
      console.error("Share error:", err);
      showToast(
        "error",
        err?.message || "Unable to share file."
      );
    } finally {
      setSharingFile(false);
    }
  };

  const updateSharePermission = async (
    shareId: UUID,
    permission: "VIEWER" | "EDITOR"
  ) => {
    const token = getToken();
    if (!token) {
      showToast("error", "Please login again.");
      return;
    }

    setShareActionId(shareId);

    try {
      const params = new URLSearchParams();
      params.set("permission", permission);

      const response = await fetch(
        `${API_BASE}/api/shares/${shareId}/permission?${params.toString()}`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = await response.json();
      setSharedFiles((previous) =>
        previous.map((item) =>
          item.id === shareId
            ? {
                ...item,
                permission: data?.permission ?? permission,
              }
            : item
        )
      );

      showToast("success", "Sharing permission updated.");
    } catch (err: any) {
      console.error("Permission update error:", err);
      showToast(
        "error",
        err?.message || "Unable to update permission."
      );
    } finally {
      setShareActionId(null);
    }
  };

  const removeFileShare = async (shareId: UUID) => {
    const token = getToken();
    if (!token) {
      showToast("error", "Please login again.");
      return;
    }

    setShareActionId(shareId);

    try {
      const response = await fetch(
        `${API_BASE}/api/shares/${shareId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      setSharedFiles((previous) =>
        previous.filter((item) => item.id !== shareId)
      );

      showToast("success", "File access removed successfully.");
    } catch (err: any) {
      console.error("Remove share error:", err);
      showToast(
        "error",
        err?.message || "Unable to remove file access."
      );
    } finally {
      setShareActionId(null);
    }
  };

  /* =======================================================
     PREVIEW
  ======================================================= */

  const openPreview = (
    file: FileItem,
    event?: MouseEvent
  ) => {
    event?.stopPropagation();

    if (
      !isPreviewable(file)
    ) {
      setSelectedFile(file);
      return;
    }

    setPreviewFile(file);
  };

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredFolders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result = [
        ...folders,
      ];

      if (query) {
        result =
          result.filter(
            (folder) =>
              folder.name
                .toLowerCase()
                .includes(query)
          );
      }

      result.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

      return result;
    }, [folders, search]);

  const filteredFiles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result = [
        ...files,
      ];

      if (query) {
        result =
          result.filter(
            (file) =>
              file.fileName
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
              a.fileName.localeCompare(
                b.fileName
              );
          }

          if (
            sortKey ===
            "size"
          ) {
            comparison =
              a.fileSize -
              b.fileSize;
          }

          if (
            sortKey ===
            "date"
          ) {
            comparison =
              new Date(
                a.createdAt
              ).getTime() -
              new Date(
                b.createdAt
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
      files,
      search,
      sortKey,
      sortDirection,
    ]);

  /* =======================================================
     SORT
  ======================================================= */

  const changeSort = (
    key: SortKey
  ) => {
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
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      await refreshCurrentFolder();

      showToast(
        "success",
        "Files refreshed."
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
          <div className="px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  {breadcrumbs.map(
                    (item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex items-center"
                      >
                        {index >
                          0 && (
                          <ChevronRight
                            size={15}
                            className="mx-1"
                          />
                        )}

                        <button
                          onClick={() =>
                            navigateBreadcrumb(
                              index
                            )
                          }
                          className={`rounded-md px-1.5 py-1 transition ${
                            index ===
                            breadcrumbs.length -
                              1
                              ? "font-medium text-slate-900 dark:text-white"
                              : "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {item.name}
                        </button>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {breadcrumbs[
                      breadcrumbs.length -
                        1
                    ]?.name ||
                      "My Files"}
                  </h1>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    {files.length}{" "}
                    {files.length ===
                    1
                      ? "file"
                      : "files"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage your files and folders
                  securely.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  onClick={
                    handleRefresh
                  }
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Refresh
                </button>

                <button
                  onClick={() =>
                    setShowFolderModal(
                      true
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FolderPlus
                    size={17}
                  />
                  New folder
                </button>

                <button
                  onClick={() =>
                    setShowUploadModal(
                      true
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Upload
                    size={17}
                  />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-8">

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
                placeholder="Search files and folders..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-slate-700 dark:focus:bg-slate-900 dark:focus:ring-slate-800"
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">

                <button
                  onClick={() =>
                    changeSort(
                      "name"
                    )
                  }
                  className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium ${
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
                  onClick={() =>
                    changeSort(
                      "size"
                    )
                  }
                  className={`hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium sm:flex ${
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
                  onClick={() =>
                    changeSort(
                      "date"
                    )
                  }
                  className={`h-8 rounded-lg px-2.5 text-xs font-medium ${
                    sortKey ===
                    "date"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Date
                  {sortKey ===
                    "date" &&
                    (sortDirection ===
                    "asc"
                      ? " ↑"
                      : " ↓")}
                </button>
              </div>

              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">

                <button
                  onClick={() =>
                    setViewMode(
                      "grid"
                    )
                  }
                  title="Grid view"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
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
                  onClick={() =>
                    setViewMode(
                      "list"
                    )
                  }
                  title="List view"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
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
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  Unable to load files
                </p>

                <p className="mt-1 text-sm opacity-90">
                  {error}
                </p>
              </div>

              <button
                onClick={
                  refreshCurrentFolder
                }
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 dark:border-red-900 dark:hover:bg-red-950"
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
          ) : filteredFolders.length ===
              0 &&
            filteredFiles.length ===
              0 ? (
            <EmptyState
              hasSearch={Boolean(
                search.trim()
              )}
              onUpload={() =>
                setShowUploadModal(
                  true
                )
              }
              onCreateFolder={() =>
                setShowFolderModal(
                  true
                )
              }
            />
          ) : (
            <>
              {/* FOLDERS */}

              {filteredFolders.length >
                0 && (
                <section className="mb-8">

                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Folders
                    </h2>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {
                        filteredFolders.length
                      }{" "}
                      folders
                    </span>
                  </div>

                  <div
                    className={
                      viewMode ===
                      "grid"
                        ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                        : "space-y-2"
                    }
                  >
                    {filteredFolders.map(
                      (folder) =>
                        viewMode ===
                        "grid" ? (
                          <FolderCard
                            key={
                              folder.id
                            }
                            folder={
                              folder
                            }
                            onOpen={
                              openFolder
                            }
                            onDelete={
                              requestDeleteFolder
                            }
                            deleting={
                              deletingFolderId ===
                              folder.id
                            }
                            onToggleStar={
                              toggleStar
                            }
                            isStarred={isItemStarred(
                              folder.id,
                              "folder"
                            )}
                          />
                        ) : (
                          <FolderListItem
                            key={
                              folder.id
                            }
                            folder={
                              folder
                            }
                            onOpen={
                              openFolder
                            }
                            onDelete={
                              requestDeleteFolder
                            }
                            deleting={
                              deletingFolderId ===
                              folder.id
                            }
                            onToggleStar={
                              toggleStar
                            }
                            isStarred={isItemStarred(
                              folder.id,
                              "folder"
                            )}
                          />
                        )
                    )}
                  </div>
                </section>
              )}

              {/* FILES */}

              {filteredFiles.length >
                0 && (
                <section>

                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Files
                    </h2>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {
                        filteredFiles.length
                      }{" "}
                      files
                    </span>
                  </div>

                  {viewMode ===
                  "grid" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                      {filteredFiles.map(
                        (file) => (
                          <FileCard
                            key={
                              file.id
                            }
                            file={file}
                            onPreview={
                              openPreview
                            }
                            onDownload={
                              downloadFile
                            }
                            onDelete={
                              requestDeleteFile
                            }
                            onShare={
                              openShareModal
                            }
                            downloading={
                              downloadingId ===
                              file.id
                            }
                            deleting={
                              deletingId ===
                              file.id
                            }
                            onToggleStar={
                              toggleStar
                            }
                            isStarred={isItemStarred(
                              file.id,
                              "file"
                            )}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                      <div className="hidden grid-cols-[minmax(0,1fr)_140px_160px_100px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800 md:grid">
                        <span>Name</span>
                        <span>Size</span>
                        <span>Modified</span>
                        <span />
                      </div>

                      {filteredFiles.map(
                        (file) => (
                          <FileListItem
                            key={
                              file.id
                            }
                            file={file}
                            onPreview={
                              openPreview
                            }
                            onDownload={
                              downloadFile
                            }
                            onDelete={
                              requestDeleteFile
                            }
                            onShare={
                              openShareModal
                            }
                            downloading={
                              downloadingId ===
                              file.id
                            }
                            deleting={
                              deletingId ===
                              file.id
                            }
                            onToggleStar={
                              toggleStar
                            }
                            isStarred={isItemStarred(
                              file.id,
                              "file"
                            )}
                          />
                        )
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===================================================
          UPLOAD MODAL
      =================================================== */}

      {showUploadModal && (
        <Modal
          title="Upload files"
          onClose={() => {
            if (!uploading) {
              setShowUploadModal(
                false
              );
            }
          }}
        >
          <div className="space-y-5">

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
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                isDragging
                  ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-900"
                  : "border-slate-300 hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-900"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Upload
                  size={25}
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                Drop files here
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                or click to browse from your
                computer
              </p>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                multiple
                className="hidden"
                onChange={
                  handleFileInput
                }
              />
            </div>

            {selectedUploadFiles.length >
              0 && (
              <div className="max-h-64 space-y-2 overflow-y-auto">

                {selectedUploadFiles.map(
                  (
                    file,
                    index
                  ) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <FileIcon
                          size={19}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {file.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatFileSize(
                            file.size
                          )}
                        </p>
                      </div>

                      <button
                        disabled={
                          uploading
                        }
                        onClick={() =>
                          removeUploadFile(
                            index
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-slate-800"
                      >
                        <X
                          size={17}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">

              <button
                disabled={
                  uploading
                }
                onClick={() => {
                  setSelectedUploadFiles(
                    []
                  );
                  setShowUploadModal(
                    false
                  );
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                disabled={
                  uploading ||
                  selectedUploadFiles.length ===
                    0
                }
                onClick={
                  uploadFiles
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {uploading && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {uploading
                  ? "Uploading..."
                  : `Upload ${
                      selectedUploadFiles.length ||
                      ""
                    }${
                      selectedUploadFiles.length >
                      1
                        ? " files"
                        : selectedUploadFiles.length ===
                          1
                        ? " file"
                        : ""
                    }`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================
          NEW FOLDER MODAL
      =================================================== */}

      {showFolderModal && (
        <Modal
          title="Create new folder"
          onClose={() => {
            if (
              !creatingFolder
            ) {
              setShowFolderModal(
                false
              );
              setFolderName("");
            }
          }}
        >
          <div className="space-y-5">

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                <FolderPlus
                  size={21}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  New folder
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create a folder inside{" "}
                  <span className="font-medium">
                    {breadcrumbs[
                      breadcrumbs.length -
                        1
                    ]?.name ||
                      "My Files"}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Folder name
              </label>

              <input
                autoFocus
                value={
                  folderName
                }
                onChange={(
                  event
                ) =>
                  setFolderName(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    createFolder();
                  }
                }}
                placeholder="e.g. Projects"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">

              <button
                disabled={
                  creatingFolder
                }
                onClick={() => {
                  setShowFolderModal(
                    false
                  );
                  setFolderName(
                    ""
                  );
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                disabled={
                  creatingFolder ||
                  !folderName.trim()
                }
                onClick={
                  createFolder
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {creatingFolder && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {creatingFolder
                  ? "Creating..."
                  : "Create folder"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================
          DETAILS MODAL
      =================================================== */}

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
          onPreview={
            openPreview
          }
          onDownload={
            downloadFile
          }
          onDelete={
            requestDeleteFile
          }
          onShare={
            openShareModal
          }
          downloading={
            downloadingId ===
            selectedFile.id
          }
          deleting={
            deletingId ===
            selectedFile.id
          }
        />
      )}

      {/* ===================================================
          SHARE MODAL
      =================================================== */}

      {shareFile && (
        <ShareModal
          file={shareFile}
          email={shareEmail}
          permission={sharePermission}
          shares={sharedFiles}
          loadingShares={loadingShares}
          sharing={sharingFile}
          actionId={shareActionId}
          onEmailChange={setShareEmail}
          onPermissionChange={setSharePermission}
          onShare={shareCurrentFile}
          onUpdatePermission={updateSharePermission}
          onRemoveShare={removeFileShare}
          onClose={() => {
            setShareFile(null);
            setShareEmail("");
            setSharedFiles([]);
          }}
        />
      )}

      {/* ===================================================
          PREVIEW MODAL
      =================================================== */}

      {previewFile && (
        <PreviewModal
          file={
            previewFile
          }
          onClose={() =>
            setPreviewFile(
              null
            )
          }
          onDownload={
            downloadFile
          }
          downloading={
            downloadingId ===
            previewFile.id
          }
        />
      )}

      {/* ===================================================
          DELETE CONFIRMATION MODAL
      =================================================== */}

      {deleteConfirmFolder && (
        <FolderDeleteConfirmModal
          folder={
            deleteConfirmFolder
          }
          deleting={Boolean(
            deletingFolderId
          )}
          onCancel={() =>
            setDeleteConfirmFolder(
              null
            )
          }
          onConfirm={
            deleteFolder
          }
        />
      )}

      {deleteConfirmFile && (
        <DeleteConfirmModal
          file={
            deleteConfirmFile
          }
          deleting={
            deletingId ===
            deleteConfirmFile.id
          }
          onCancel={() => {
            if (
              !deletingId
            ) {
              setDeleteConfirmFile(
                null
              );
            }
          }}
          onConfirm={
            deleteFile
          }
        />
      )}

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
              onClick={() =>
                setToast(null)
              }
              className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">

        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DELETE FOLDER MODAL
========================================================= */

function FolderDeleteConfirmModal({
  folder,
  deleting,
  onCancel,
  onConfirm,
}: {
  folder: FolderItem;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-folder-title"
      >

        <div className="flex justify-center pt-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Trash2
              size={25}
            />
          </div>
        </div>

        <div className="px-6 pb-5 pt-5 text-center">

          <h2
            id="delete-folder-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Move folder to Trash?
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            The folder will be moved to Trash. You can restore it later.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left dark:border-slate-800 dark:bg-slate-900">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
              <FolderOpen
                size={21}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                title={
                  folder.name
                }
              >
                {folder.name}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Folder
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onCancel
            }
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onConfirm
            }
            className="inline-flex min-w-[125px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Moving...
              </>
            ) : (
              <>
                <Trash2
                  size={17}
                />
                Move to Trash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DELETE FILE MODAL
========================================================= */

function DeleteConfirmModal({
  file,
  deleting,
  onCancel,
  onConfirm,
}: {
  file: FileItem;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-file-title"
      >

        <div className="flex justify-center pt-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Trash2
              size={25}
            />
          </div>
        </div>

        <div className="px-6 pb-5 pt-5 text-center">

          <h2
            id="delete-file-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Move file to Trash?
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Are you sure you want to move this file to Trash?
            You can restore it later.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left dark:border-slate-800 dark:bg-slate-900">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
              {getFileIcon(
                file,
                21
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                title={
                  file.fileName
                }
              >
                {file.fileName}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(
                  file.fileSize
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onCancel
            }
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onConfirm
            }
            className="inline-flex min-w-[105px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2
                  size={17}
                />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAR BUTTON
========================================================= */

function StarButton({
  isStarred,
  onClick,
  title = "Add to Starred",
}: {
  isStarred: boolean;
  onClick: (
    event: MouseEvent<HTMLButtonElement>
  ) => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg p-2 transition ${
        isStarred
          ? "text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
          : "text-slate-400 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-amber-400"
      }`}
      title={
        isStarred
          ? "Remove from Starred"
          : title
      }
      aria-label={
        isStarred
          ? "Remove from Starred"
          : "Add to Starred"
      }
    >
      <Star
        size={18}
        className={
          isStarred
            ? "fill-current"
            : ""
        }
      />
    </button>
  );
}

/* =========================================================
   FOLDER CARD
========================================================= */

function FolderCard({
  folder,
  onOpen,
  onDelete,
  deleting,
  onToggleStar,
  isStarred,
}: {
  folder: FolderItem;
  onOpen: (
    folder: FolderItem
  ) => void;
  onDelete: (
    folder: FolderItem,
    event?: MouseEvent
  ) => void;
  deleting: boolean;
  onToggleStar: (
    id: UUID,
    type: "file" | "folder"
  ) => void;
  isStarred: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">

      <div className="flex items-start justify-between">

        <button
          type="button"
          onClick={() =>
            onOpen(folder)
          }
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title={`Open ${folder.name}`}
        >
          <FolderOpen
            size={25}
          />
        </button>

        <div className="flex items-center gap-1">

          <StarButton
            isStarred={
              isStarred
            }
            onClick={(
              event
            ) => {
              event.stopPropagation();

              onToggleStar(
                folder.id,
                "folder"
              );
            }}
          />

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={(
              event
            ) =>
              onDelete(
                folder,
                event
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            title="Delete folder"
            aria-label={`Delete ${folder.name}`}
          >
            {deleting ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={18}
              />
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onOpen(folder)
        }
        className="mt-4 block w-full text-left"
      >
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {folder.name}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Folder
        </p>
      </button>
    </div>
  );
}

/* =========================================================
   FOLDER LIST
========================================================= */

function FolderListItem({
  folder,
  onOpen,
  onDelete,
  deleting,
  onToggleStar,
  isStarred,
}: {
  folder: FolderItem;
  onOpen: (
    folder: FolderItem
  ) => void;
  onDelete: (
    folder: FolderItem,
    event?: MouseEvent
  ) => void;
  deleting: boolean;
  onToggleStar: (
    id: UUID,
    type: "file" | "folder"
  ) => void;
  isStarred: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/70">

      <button
        type="button"
        onClick={() =>
          onOpen(folder)
        }
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Folder
            size={21}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {folder.name}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Folder
          </p>
        </div>
      </button>

      <StarButton
        isStarred={
          isStarred
        }
        onClick={(
          event
        ) => {
          event.stopPropagation();

          onToggleStar(
            folder.id,
            "folder"
          );
        }}
      />

      <button
        type="button"
        disabled={
          deleting
        }
        onClick={(
          event
        ) =>
          onDelete(
            folder,
            event
          )
        }
        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        title="Delete folder"
        aria-label={`Delete ${folder.name}`}
      >
        {deleting ? (
          <Loader2
            size={18}
            className="animate-spin"
          />
        ) : (
          <Trash2
            size={18}
          />
        )}
      </button>

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-400"
      />
    </div>
  );
}

/* =========================================================
   FILE CARD
========================================================= */

function FileCard({
  file,
  onPreview,
  onDownload,
  onDelete,
  onShare,
  downloading,
  deleting,
  onToggleStar,
  isStarred,
}: {
  file: FileItem;
  onPreview: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onDownload: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onDelete: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onShare: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  downloading: boolean;
  deleting: boolean;
  onToggleStar: (
    id: UUID,
    type: "file" | "folder"
  ) => void;
  isStarred: boolean;
}) {
  const category =
    getFileCategory(
      file
    );

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

      <button
        onClick={(
          event
        ) =>
          onPreview(
            file,
            event
          )
        }
        className="block w-full text-left"
      >
        <div className="flex h-40 items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            {getFileIcon(
              file,
              30
            )}
          </div>
        </div>
      </button>

      <div className="p-4">

        <div className="flex items-start gap-3">

          <div className="min-w-0 flex-1">

            <button
              onClick={(
                event
              ) =>
                onPreview(
                  file,
                  event
                )
              }
              className="block w-full truncate text-left text-sm font-semibold text-slate-900 hover:underline dark:text-white"
              title={
                file.fileName
              }
            >
              {file.fileName}
            </button>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatFileSize(
                file.fileSize
              )}{" "}
              •{" "}
              {formatDate(
                file.createdAt
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">

            <StarButton
              isStarred={
                isStarred
              }
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onToggleStar(
                  file.id,
                  "file"
                );
              }}
            />

            <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {category}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">

          {isPreviewable(
            file
          ) && (
            <button
              onClick={(
                event
              ) =>
                onPreview(
                  file,
                  event
                )
              }
              className="flex-1 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Preview
            </button>
          )}

          <button
            onClick={(event) =>
              onShare(file, event)
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Share"
          >
            <Share2 size={17} />
          </button>

          <button
            disabled={
              downloading
            }
            onClick={(
              event
            ) =>
              onDownload(
                file,
                event
              )
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Download"
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

          <button
            disabled={
              deleting
            }
            onClick={(
              event
            ) =>
              onDelete(
                file,
                event
              )
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            title="Delete permanently"
          >
            {deleting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={17}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FILE LIST
========================================================= */

function FileListItem({
  file,
  onPreview,
  onDownload,
  onDelete,
  onShare,
  downloading,
  deleting,
  onToggleStar,
  isStarred,
}: {
  file: FileItem;
  onPreview: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onDownload: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onDelete: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onShare: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  downloading: boolean;
  deleting: boolean;
  onToggleStar: (
    id: UUID,
    type: "file" | "folder"
  ) => void;
  isStarred: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 md:grid-cols-[minmax(0,1fr)_140px_160px_140px] md:items-center md:gap-4 md:px-5">

      <button
        onClick={(
          event
        ) =>
          onPreview(
            file,
            event
          )
        }
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {getFileIcon(
            file,
            20
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {file.fileName}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {file.fileType}
          </p>
        </div>
      </button>

      <div className="text-xs text-slate-600 dark:text-slate-300">
        <span className="mr-2 text-slate-400 md:hidden">
          Size:
        </span>

        {formatFileSize(
          file.fileSize
        )}
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300">
        <span className="mr-2 text-slate-400 md:hidden">
          Modified:
        </span>

        {formatDate(
          file.createdAt
        )}
      </div>

      <div className="flex items-center gap-1 md:justify-end">

        <StarButton
          isStarred={
            isStarred
          }
          onClick={(
            event
          ) => {
            event.stopPropagation();

            onToggleStar(
              file.id,
              "file"
            );
          }}
        />

        <button
          disabled={
            downloading
          }
          onClick={(
            event
          ) =>
            onDownload(
              file,
              event
            )
          }
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Download"
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

        <button
          disabled={
            deleting
          }
          onClick={(
            event
          ) =>
            onDelete(
              file,
              event
            )
          }
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          title="Delete"
        >
          {deleting ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Trash2
              size={17}
            />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SHARE MODAL
========================================================= */

function ShareModal({
  file,
  email,
  permission,
  shares,
  loadingShares,
  sharing,
  actionId,
  onEmailChange,
  onPermissionChange,
  onShare,
  onUpdatePermission,
  onRemoveShare,
  onClose,
}: {
  file: FileItem;
  email: string;
  permission: "VIEWER" | "EDITOR";
  shares: SharedFileItem[];
  loadingShares: boolean;
  sharing: boolean;
  actionId: UUID | null;
  onEmailChange: (value: string) => void;
  onPermissionChange: (value: "VIEWER" | "EDITOR") => void;
  onShare: () => void;
  onUpdatePermission: (
    shareId: UUID,
    permission: "VIEWER" | "EDITOR"
  ) => void;
  onRemoveShare: (shareId: UUID) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Share file"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
            {getFileIcon(file, 22)}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-sm font-bold text-slate-900 dark:text-white"
              title={file.fileName}
            >
              {file.fileName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {formatFileSize(file.fileSize)}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Share with
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <MailIcon />
              <input
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !sharing) onShare();
                }}
                type="email"
                placeholder="Enter registered user's email"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-slate-600 dark:focus:ring-slate-800"
              />
            </div>
            <select
              value={permission}
              onChange={(event) =>
                onPermissionChange(
                  event.target.value as "VIEWER" | "EDITOR"
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button
              onClick={onShare}
              disabled={sharing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {sharing ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <UserPlus size={17} />
              )}
              Share
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Only registered users can be given access.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              People with access
            </h3>
            <span className="text-xs text-slate-400">
              {shares.length}
            </span>
          </div>

          {loadingShares ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-7 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <Loader2 size={18} className="mr-2 animate-spin" />
              Loading sharing details...
            </div>
          ) : shares.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center dark:border-slate-800">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                This file is not shared yet.
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Add a registered user's email above to share it.
              </p>
            </div>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {shares.map((share) => {
                const busy = actionId === share.id;
                const permissionValue =
                  share.permission === "EDITOR" ? "EDITOR" : "VIEWER";

                return (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Share2 size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Shared access
                      </p>
                      <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                        Shared {formatDate(share.sharedDate)}
                      </p>
                    </div>
                    <select
                      value={permissionValue}
                      disabled={busy}
                      onChange={(event) =>
                        onUpdatePermission(
                          share.id,
                          event.target.value as "VIEWER" | "EDITOR"
                        )
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                    </select>
                    <button
                      onClick={() => onRemoveShare(share.id)}
                      disabled={busy}
                      title="Remove access"
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      {busy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function MailIcon() {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      <Mail size={17} />
    </span>
  );
}

/* =========================================================
   FILE DETAILS MODAL
========================================================= */

function FileDetailsModal({
  file,
  onClose,
  onPreview,
  onDownload,
  onDelete,
  onShare,
  downloading,
  deleting,
}: {
  file: FileItem;
  onClose: () => void;
  onPreview: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onDownload: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onDelete: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  onShare: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  downloading: boolean;
  deleting: boolean;
}) {
  return (
    <Modal
      title="File details"
      onClose={
        onClose
      }
    >
      <div className="space-y-5">

        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
            {getFileIcon(
              file,
              27
            )}
          </div>

          <div className="min-w-0">
            <p
              className="truncate text-base font-bold text-slate-900 dark:text-white"
              title={
                file.fileName
              }
            >
              {file.fileName}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {file.fileType}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <InfoBox
            label="Size"
            value={formatFileSize(
              file.fileSize
            )}
          />

          <InfoBox
            label="Type"
            value={getFileCategory(
              file
            ).toUpperCase()}
          />

          <InfoBox
            label="Created"
            value={formatDate(
              file.createdAt
            )}
          />

          <InfoBox
            label="Time"
            value={formatDateTime(
              file.createdAt
            )}
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">

          <button
            onClick={() => onShare(file)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Share2 size={17} />
            Share
          </button>

          {isPreviewable(
            file
          ) && (
            <button
              onClick={() =>
                onPreview(file)
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Preview
            </button>
          )}

          <button
            onClick={(event) =>
              onShare(file, event)
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Share"
          >
            <Share2 size={17} />
          </button>

          <button
            disabled={
              downloading
            }
            onClick={() =>
              onDownload(file)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
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

            Download
          </button>

          <button
            disabled={
              deleting
            }
            onClick={() =>
              onDelete(file)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {deleting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={17}
              />
            )}

            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PREVIEW MODAL
========================================================= */

function PreviewModal({
  file,
  onClose,
  onDownload,
  downloading,
}: {
  file: FileItem;
  onClose: () => void;
  onDownload: (
    file: FileItem,
    event?: MouseEvent
  ) => void;
  downloading: boolean;
}) {
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    let objectUrl:
      | string
      | null = null;

    const loadPreview =
      async () => {
        const token =
          getToken();

        if (!token) {
          if (active) {
            setError(
              "Please login again."
            );

            setLoading(
              false
            );
          }

          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_BASE}/api/files/${file.id}/preview`,
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

          objectUrl =
            window.URL.createObjectURL(
              blob
            );

          if (active) {
            setPreviewUrl(
              objectUrl
            );
          }
        } catch (err: any) {
          console.error(
            "Preview error:",
            err
          );

          if (active) {
            setError(
              err?.message ||
                "Unable to preview this file."
            );
          }
        } finally {
          if (active) {
            setLoading(
              false
            );
          }
        }
      };

    loadPreview();

    return () => {
      active = false;

      if (objectUrl) {
        window.URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [file.id]);

  const category =
    getFileCategory(
      file
    );

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-950">

      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
            {getFileIcon(
              file,
              18
            )}
          </div>

          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold text-white"
              title={
                file.fileName
              }
            >
              {file.fileName}
            </p>

            <p className="text-xs text-slate-400">
              {formatFileSize(
                file.fileSize
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <button
            disabled={
              downloading
            }
            onClick={() =>
              onDownload(file)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Download
                size={16}
              />
            )}

            <span className="hidden sm:inline">
              Download
            </span>
          </button>

          <button
            onClick={
              onClose
            }
            className="rounded-xl p-2.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">

        {loading ? (
          <div className="text-center text-white">

            <Loader2
              size={35}
              className="mx-auto animate-spin text-slate-400"
            />

            <p className="mt-3 text-sm text-slate-400">
              Loading preview...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">

            <AlertCircle
              size={30}
              className="mx-auto text-red-400"
            />

            <p className="mt-3 text-sm font-semibold text-white">
              Preview unavailable
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {error}
            </p>
          </div>
        ) : previewUrl ? (
          <div className="flex h-full w-full items-center justify-center">

            {category ===
              "image" && (
              <img
                src={
                  previewUrl
                }
                alt={
                  file.fileName
                }
                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
              />
            )}

            {category ===
              "video" && (
              <video
                src={
                  previewUrl
                }
                controls
                playsInline
                className="max-h-full max-w-full rounded-xl shadow-2xl"
              />
            )}

            {category ===
              "audio" && (
              <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <FileAudio
                    size={36}
                  />
                </div>

                <p className="mt-5 font-bold text-slate-900">
                  {file.fileName}
                </p>

                <audio
                  src={
                    previewUrl
                  }
                  controls
                  className="mt-6 w-full"
                />
              </div>
            )}

            {category ===
              "pdf" && (
              <iframe
                src={
                  previewUrl
                }
                title={
                  file.fileName
                }
                className="h-full w-full max-w-6xl rounded-xl bg-white shadow-2xl"
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

      {Array.from({
        length: 8,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800" />

            <div className="space-y-3 p-4">

              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

              <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  hasSearch,
  onUpload,
  onCreateFolder,
}: {
  hasSearch: boolean;
  onUpload: () => void;
  onCreateFolder: () => void;
}) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">

      <div className="max-w-md text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">

          {hasSearch ? (
            <Search
              size={31}
            />
          ) : (
            <FolderOpen
              size={31}
            />
          )}
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
          {hasSearch
            ? "No matching files"
            : "This folder is empty"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {hasSearch
            ? "Try a different search term."
            : "Upload your first file or create a folder to get started."}
        </p>

        {!hasSearch && (
          <div className="mt-5 flex justify-center gap-2">

            <button
              onClick={
                onCreateFolder
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FolderPlus
                size={17}
              />
              New folder
            </button>

            <button
              onClick={
                onUpload
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Upload
                size={17}
              />
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
