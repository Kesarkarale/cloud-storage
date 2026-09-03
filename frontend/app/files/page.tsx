"use client";

import {
  Archive,
  ArrowLeft,
  ChevronDown,
  Download,
  File as FileIconLucide,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  Grid2X2,
  HardDrive,
  Image as ImageIcon,
  List,
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
  Loader2,
  RefreshCw,
  FileArchive,
} from "lucide-react";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

type ApiFile = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  userId: string;
  parentFolderId: string | null;
  createdAt: string;
};

type ApiFolder = {
  id: string;
  name: string;
  userId: string;
  parentFolderId: string | null;
  createdAt: string;
};

type ExplorerItem =
  | {
      kind: "folder";
      id: string;
      name: string;
      size: number;
      modified: string;
      folder: ApiFolder;
    }
  | {
      kind: "file";
      id: string;
      name: string;
      size: number;
      modified: string;
      file: ApiFile;
    };

type SortType = "recent" | "name" | "size";
type ViewType = "grid" | "list";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export default function FilesPage() {
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [folders, setFolders] = useState<ApiFolder[]>([]);

  const [currentFolderId, setCurrentFolderId] =
    useState<string | null>(null);

  const [folderStack, setFolderStack] = useState<ApiFolder[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortType>("recent");

  const [view, setView] =
    useState<ViewType>("grid");

  const [showUpload, setShowUpload] =
    useState(false);

  const [showFolder, setShowFolder] =
    useState(false);

  const [folderName, setFolderName] =
    useState("");

  const [selectedItem, setSelectedItem] =
    useState<ExplorerItem | null>(null);

  const [previewFile, setPreviewFile] =
    useState<ApiFile | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [creatingFolder, setCreatingFolder] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  };

  const apiRequest = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please login again."
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
          const text = await response.text();

          if (text) {
            message = text;
          }
        } catch {
          // Ignore parsing error
        }

        throw new Error(message);
      }

      return response;
    },
    []
  );

  const loadExplorer = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const query = currentFolderId
          ? `?parentFolderId=${encodeURIComponent(
              currentFolderId
            )}`
          : "";

        const [folderResponse, fileResponse] =
          await Promise.all([
            apiRequest(
              `/api/folders${query}`
            ),
            apiRequest(
              `/api/files${query}`
            ),
          ]);

        const folderData =
          (await folderResponse.json()) as ApiFolder[];

        const fileData =
          (await fileResponse.json()) as ApiFile[];

        setFolders(folderData);
        setFiles(fileData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your files."
        );
      } finally {
        setLoading(false);
      }
    },
    [apiRequest, currentFolderId]
  );

  useEffect(() => {
    loadExplorer();
  }, [loadExplorer]);

  const items = useMemo<ExplorerItem[]>(
    () => [
      ...folders.map((folder) => ({
        kind: "folder" as const,
        id: folder.id,
        name: folder.name,
        size: 0,
        modified: folder.createdAt,
        folder,
      })),

      ...files.map((file) => ({
        kind: "file" as const,
        id: file.id,
        name: file.fileName,
        size: file.fileSize,
        modified: file.createdAt,
        file,
      })),
    ],
    [folders, files]
  );

  const filteredItems = useMemo(() => {
    let result = items.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "size") {
      result = [...result].sort(
        (a, b) => b.size - a.size
      );
    }

    if (sortBy === "recent") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.modified).getTime() -
          new Date(a.modified).getTime()
      );
    }

    return result;
  }, [items, search, sortBy]);

  const totalStorage = useMemo(
    () =>
      files.reduce(
        (total, file) =>
          total + (file.fileSize || 0),
        0
      ),
    [files]
  );

  async function uploadFiles(
    selectedFiles: FileList | File[]
  ) {
    if (!selectedFiles.length) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      for (const file of Array.from(
        selectedFiles
      )) {
        const formData = new FormData();

        formData.append("file", file);

        if (currentFolderId) {
          formData.append(
            "parentFolderId",
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

      await loadExplorer();

      setShowUpload(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "File upload failed."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInput(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      uploadFiles(event.target.files);
    }
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragActive(false);

    if (
      event.dataTransfer.files &&
      event.dataTransfer.files.length
    ) {
      uploadFiles(
        event.dataTransfer.files
      );
    }
  }

  async function createFolder() {
    const cleanName =
      folderName.trim();

    if (!cleanName) {
      setError("Please enter a folder name.");
      return;
    }

    setCreatingFolder(true);
    setError("");

    try {
      await apiRequest(
        "/api/folders",
        {
          method: "POST",
          headers: {
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

      setFolderName("");
      setShowFolder(false);

      await loadExplorer();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create folder."
      );
    } finally {
      setCreatingFolder(false);
    }
  }

  async function deleteSelected() {
    if (!selectedItem) {
      return;
    }

    const confirmed = window.confirm(
      selectedItem.kind === "folder"
        ? `Delete "${selectedItem.name}" and everything inside it?`
        : `Move "${selectedItem.name}" to trash?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      if (selectedItem.kind === "folder") {
        await apiRequest(
          `/api/folders/${selectedItem.id}`,
          {
            method: "DELETE",
          }
        );
      } else {
        await apiRequest(
          `/api/files/${selectedItem.id}`,
          {
            method: "DELETE",
          }
        );
      }

      setSelectedItem(null);

      await loadExplorer();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete operation failed."
      );
    }
  }

  async function downloadFile(
    file: ApiFile
  ) {
    try {
      setError("");

      const response =
        await apiRequest(
          `/api/files/${file.id}/download`
        );

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = file.fileName;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Download failed."
      );
    }
  }

  async function openImage(
    file: ApiFile
  ) {
    try {
      setError("");

      const response =
        await apiRequest(
          `/api/files/${file.id}/preview`
        );

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      setPreviewFile(file);
      setPreviewUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not preview image."
      );
    }
  }

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPreviewFile(null);
  }

  function openFolder(
    folder: ApiFolder
  ) {
    setFolderStack((current) => [
      ...current,
      folder,
    ]);

    setCurrentFolderId(folder.id);
    setSearch("");
    setSelectedItem(null);
  }

  function goBack() {
    const newStack =
      folderStack.slice(
        0,
        -1
      );

    const parent =
      newStack.length
        ? newStack[newStack.length - 1]
        : null;

    setFolderStack(newStack);

    setCurrentFolderId(
      parent?.id || null
    );

    setSearch("");
    setSelectedItem(null);
  }

  function goToRoot() {
    setFolderStack([]);
    setCurrentFolderId(null);
    setSearch("");
    setSelectedItem(null);
  }

  function handleItemClick(
    item: ExplorerItem
  ) {
    if (item.kind === "folder") {
      openFolder(item.folder);
      return;
    }

    if (
      isImageFile(
        item.file.fileType,
        item.file.fileName
      )
    ) {
      openImage(item.file);
      return;
    }

    setSelectedItem(item);
  }

  const currentFolder =
    folderStack.length
      ? folderStack[
          folderStack.length - 1
        ]
      : null;

  const storageLimit =
    10 * 1024 * 1024 * 1024;

  const storagePercent = Math.min(
    100,
    Math.round(
      (totalStorage /
        storageLimit) *
        100
    )
  );

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}

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

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Store, organize and manage your
              files securely.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                setShowFolder(true)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </button>

            <button
              onClick={() =>
                setShowUpload(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STORAGE */}

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
                  {formatFileSize(totalStorage)} used of 10 GB
                </p>
              </div>
            </div>

            <div className="w-full sm:max-w-sm">

              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">
                  {storagePercent}% used
                </span>

                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {formatFileSize(
                    Math.max(
                      0,
                      storageLimit -
                        totalStorage
                    )
                  )}{" "}
                  free
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${storagePercent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search files and folders..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={loadExplorer}
              disabled={loading}
              title="Refresh"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as SortType
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

        {/* BREADCRUMB */}

        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">

          {currentFolderId && (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <button
            onClick={goToRoot}
            className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
          >
            My Files
          </button>

          {folderStack.map(
            (folder, index) => (
              <div
                key={folder.id}
                className="flex items-center gap-2"
              >
                <span className="text-slate-300 dark:text-slate-700">
                  /
                </span>

                <span
                  className={
                    index ===
                    folderStack.length - 1
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-400"
                  }
                >
                  {folder.name}
                </span>
              </div>
            )
          )}
        </div>

        {/* CURRENT FOLDER TITLE */}

        {currentFolder && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Folder className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                {currentFolder.name}
              </h2>

              <p className="text-xs text-slate-400">
                {folders.length + files.length} items
              </p>
            </div>
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="mt-6 flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

              <p className="text-sm text-slate-400">
                Loading your files...
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            search={search}
            onUpload={() =>
              setShowUpload(true)
            }
            onFolder={() =>
              setShowFolder(true)
            }
          />
        ) : view === "grid" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {filteredItems.map(
              (item) => (
                <ExplorerCard
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  onClick={() =>
                    handleItemClick(item)
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            <div className="hidden grid-cols-[1fr_140px_160px_50px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-white/10 md:grid">
              <span>Name</span>
              <span>Size</span>
              <span>Modified</span>
              <span />
            </div>

            {filteredItems.map(
              (item) => (
                <ExplorerListRow
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  onClick={() =>
                    handleItemClick(item)
                  }
                />
              )
            )}
          </div>
        )}

        {/* UPLOAD MODAL */}

        {showUpload && (
          <UploadModal
            inputRef={fileInputRef}
            uploading={uploading}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onClose={() =>
              setShowUpload(false)
            }
            onUpload={uploadFiles}
            onInputChange={
              handleFileInput
            }
          />
        )}

        {/* FOLDER MODAL */}

        {showFolder && (
          <FolderModal
            value={folderName}
            setValue={setFolderName}
            loading={creatingFolder}
            onClose={() =>
              setShowFolder(false)
            }
            onCreate={createFolder}
          />
        )}

        {/* DETAILS */}

        {selectedItem && (
          <DetailsModal
            item={selectedItem}
            onClose={() =>
              setSelectedItem(null)
            }
            onDelete={deleteSelected}
            onDownload={
              selectedItem.kind === "file"
                ? () =>
                    downloadFile(
                      selectedItem.file
                    )
                : undefined
            }
            onPreview={
              selectedItem.kind === "file" &&
              isImageFile(
                selectedItem.file.fileType,
                selectedItem.file.fileName
              )
                ? () =>
                    openImage(
                      selectedItem.file
                    )
                : undefined
            }
          />
        )}

        {/* IMAGE PREVIEW */}

        {previewFile &&
          previewUrl && (
            <ImagePreviewModal
              file={previewFile}
              url={previewUrl}
              onClose={closePreview}
              onDownload={() =>
                downloadFile(
                  previewFile
                )
              }
            />
          )}
      </div>
    </DashboardShell>
  );
}

/* ================================================= */
/* EXPLORER CARD */
/* ================================================= */

function ExplorerCard({
  item,
  onClick,
}: {
  item: ExplorerItem;
  onClick: () => void;
}) {
  const isFolder =
    item.kind === "folder";

  const isImage =
    item.kind === "file" &&
    isImageFile(
      item.file.fileType,
      item.file.fileName
    );

  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
    >
      <div className="flex items-start justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl ${
            isFolder
              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
          }`}
        >
          {isImage ? (
            <ImageIcon className="h-6 w-6" />
          ) : (
            <ExplorerIcon item={item} />
          )}
        </div>

        <MoreHorizontal className="h-5 w-5 text-slate-300 dark:text-slate-600" />
      </div>

      <div className="mt-5">

        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {item.name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">
            {isFolder
              ? "Folder"
              : formatFileSize(
                  item.size
                )}
          </span>

          <span className="text-xs text-slate-400">
            {formatDate(
              item.modified
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ================================================= */
/* LIST ROW */
/* ================================================= */

function ExplorerListRow({
  item,
  onClick,
}: {
  item: ExplorerItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 md:grid-cols-[1fr_140px_160px_50px] md:items-center md:gap-4"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <ExplorerIcon item={item} />
        </div>

        <span className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {item.name}
        </span>
      </div>

      <span className="hidden text-xs text-slate-400 md:block">
        {item.kind === "folder"
          ? "—"
          : formatFileSize(
              item.size
            )}
      </span>

      <span className="hidden text-xs text-slate-400 md:block">
        {formatDate(
          item.modified
        )}
      </span>

      <MoreHorizontal className="hidden h-5 w-5 text-slate-400 md:block" />
    </button>
  );
}

/* ================================================= */
/* ICON */
/* ================================================= */

function ExplorerIcon({
  item,
}: {
  item: ExplorerItem;
}) {
  if (item.kind === "folder") {
    return (
      <Folder className="h-6 w-6" />
    );
  }

  const type =
    item.file.fileType.toLowerCase();

  const name =
    item.file.fileName.toLowerCase();

  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("7z") ||
    /\.(zip|rar|7z)$/i.test(name)
  ) {
    return (
      <FileArchive className="h-6 w-6" />
    );
  }

  if (
    type.includes("pdf") ||
    /\.pdf$/i.test(name)
  ) {
    return (
      <FileText className="h-6 w-6" />
    );
  }

  if (
    isImageFile(
      type,
      name
    )
  ) {
    return (
      <FileImage className="h-6 w-6" />
    );
  }

  return (
    <FileIconLucide className="h-6 w-6" />
  );
}

/* ================================================= */
/* EMPTY */
/* ================================================= */

function EmptyState({
  search,
  onUpload,
  onFolder,
}: {
  search: string;
  onUpload: () => void;
  onFolder: () => void;
}) {
  return (
    <div className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "This folder is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        {search
          ? "Try another file or folder name."
          : "Upload files or create a folder to start organizing your cloud storage."}
      </p>

      {!search && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">

          <button
            onClick={onFolder}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>

          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================= */
/* UPLOAD MODAL */
/* ================================================= */

function UploadModal({
  inputRef,
  uploading,
  dragActive,
  setDragActive,
  onClose,
  onUpload,
  onInputChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  dragActive: boolean;
  setDragActive: (
    value: boolean
  ) => void;
  onClose: () => void;
  onUpload: (
    files: FileList | File[]
  ) => void;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <Modal onClose={onClose}>

      <div className="text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          ) : (
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          Upload Files
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Upload one or multiple files to this folder.
        </p>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() =>
            setDragActive(false)
          }
          onDrop={handleDropInternal(
            setDragActive,
            onUpload
          )}
          onClick={() =>
            !uploading &&
            inputRef.current?.click()
          }
          className={`mt-6 cursor-pointer rounded-2xl border-2 border-dashed px-5 py-10 transition ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
              : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 dark:border-white/10 dark:hover:bg-blue-500/5"
          }`}
        >
          <Upload className="mx-auto h-7 w-7 text-blue-600 dark:text-blue-400" />

          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Drop files here or click to browse
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Images, PDF, documents, ZIP and more
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={onInputChange}
        />

        {uploading && (
          <p className="mt-4 text-xs font-medium text-blue-600">
            Uploading files...
          </p>
        )}
      </div>
    </Modal>
  );
}

function handleDropInternal(
  setDragActive: (
    value: boolean
  ) => void,
  onUpload: (
    files: FileList | File[]
  ) => void
) {
  return (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setDragActive(false);

    if (
      event.dataTransfer.files &&
      event.dataTransfer.files.length
    ) {
      onUpload(
        event.dataTransfer.files
      );
    }
  };
}

/* ================================================= */
/* FOLDER MODAL */
/* ================================================= */

function FolderModal({
  value,
  setValue,
  loading,
  onClose,
  onCreate,
}: {
  value: string;
  setValue: (value: string) => void;
  loading: boolean;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Create New Folder
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Create a folder inside the current location.
      </p>

      <input
        autoFocus
        value={value}
        disabled={loading}
        onChange={(e) =>
          setValue(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCreate();
          }
        }}
        placeholder="Folder name"
        className="mt-6 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
        >
          Cancel
        </button>

        <button
          onClick={onCreate}
          disabled={
            loading ||
            !value.trim()
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          Create Folder
        </button>
      </div>
    </Modal>
  );
}

/* ================================================= */
/* DETAILS */
/* ================================================= */

function DetailsModal({
  item,
  onClose,
  onDelete,
  onDownload,
  onPreview,
}: {
  item: ExplorerItem;
  onClose: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
}) {
  const isFolder =
    item.kind === "folder";

  return (
    <Modal onClose={onClose}>

      <div className="flex items-start gap-3">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <ExplorerIcon item={item} />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            {item.name}
          </h2>

          <p className="text-xs text-slate-400">
            {isFolder
              ? "Folder"
              : item.file.fileType}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-white/5">

        <DetailRow
          label="Type"
          value={
            isFolder
              ? "Folder"
              : "File"
          }
        />

        <DetailRow
          label="Size"
          value={
            isFolder
              ? "—"
              : formatFileSize(
                  item.size
                )
          }
        />

        <DetailRow
          label="Modified"
          value={formatDate(
            item.modified
          )}
        />

        <DetailRow
          label="Status"
          value="Available"
        />
      </div>

      {!isFolder && (
        <div className="mt-6 grid grid-cols-2 gap-3">

          {onPreview && (
            <button
              onClick={onPreview}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <ImageIcon className="h-4 w-4" />
              Preview
            </button>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
        </div>
      )}

      <button
        onClick={onDelete}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        Move to Trash
      </button>
    </Modal>
  );
}

/* ================================================= */
/* IMAGE PREVIEW */
/* ================================================= */

function ImagePreviewModal({
  file,
  url,
  onClose,
  onDownload,
}: {
  file: ApiFile;
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-2xl">

        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {file.fileName}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {formatFileSize(
                file.fileSize
              )}
            </p>
          </div>

          <button
            onClick={onDownload}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto p-5">

          <img
            src={url}
            alt={file.fileName}
            className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================= */
/* DETAIL ROW */
/* ================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0 dark:border-white/5">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ================================================= */
/* MODAL */
/* ================================================= */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>
  );
}

/* ================================================= */
/* HELPERS */
/* ================================================= */

function isImageFile(
  fileType: string,
  fileName: string
) {
  const type =
    fileType.toLowerCase();

  const name =
    fileName.toLowerCase();

  return (
    type.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(
      name
    )
  );
}

function formatFileSize(
  bytes: number
) {
  if (!bytes || bytes < 1) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
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

  return `${value.toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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
