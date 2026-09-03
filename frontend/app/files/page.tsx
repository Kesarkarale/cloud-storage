"use client";

import {
  Archive,
  ChevronRight,
  Download,
  File,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Grid2X2,
  HardDrive,
  List,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
  X,
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

type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};

type FileItem = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  folderId: string | null;
  createdAt: string;
};

type SelectedItem =
  | {
      kind: "file";
      item: FileItem;
    }
  | {
      kind: "folder";
      item: FolderItem;
    };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export default function FilesPage() {
  const [folders, setFolders] =
    useState<FolderItem[]>([]);

  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [currentFolderId, setCurrentFolderId] =
    useState<string | null>(null);

  const [folderPath, setFolderPath] =
    useState<FolderItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [sortBy, setSortBy] =
    useState<"recent" | "name" | "size">(
      "recent"
    );

  const [showUpload, setShowUpload] =
    useState(false);

  const [showFolder, setShowFolder] =
    useState(false);

  const [folderName, setFolderName] =
    useState("");

  const [selected, setSelected] =
    useState<SelectedItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [previewFile, setPreviewFile] =
    useState<FileItem | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // ==========================================
  // TOKEN
  // ==========================================

  function getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }

  // ==========================================
  // AUTH REQUEST
  // ==========================================

  async function apiFetch(
    url: string,
    options: RequestInit = {}
  ) {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Please login again."
      );
    }

    const headers = new Headers(
      options.headers
    );

    headers.set(
      "Authorization",
      `Bearer ${token}`
    );

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = useCallback(
    async (folderId: string | null) => {
      try {
        setLoading(true);
        setError("");

        const folderQuery =
          folderId
            ? `?folderId=${encodeURIComponent(
                folderId
              )}`
            : "";

        const [
          foldersResponse,
          filesResponse,
        ] = await Promise.all([
          apiFetch(
            `${API_URL}/api/folders${folderQuery}`
          ),

          apiFetch(
            `${API_URL}/api/files${folderQuery}`
          ),
        ]);

        if (
          foldersResponse.status === 401 ||
          filesResponse.status === 401
        ) {
          localStorage.removeItem("token");
          window.location.href =
            "/login";

          return;
        }

        if (!foldersResponse.ok) {
          throw new Error(
            "Could not load folders."
          );
        }

        if (!filesResponse.ok) {
          throw new Error(
            "Could not load files."
          );
        }

        const foldersData =
          await foldersResponse.json();

        const filesData =
          await filesResponse.json();

        setFolders(
          Array.isArray(foldersData)
            ? foldersData
            : []
        );

        setFiles(
          Array.isArray(filesData)
            ? filesData
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadData(null);
  }, [loadData]);

  // ==========================================
  // OPEN FOLDER
  // ==========================================

  async function openFolder(
    folder: FolderItem
  ) {
    setCurrentFolderId(folder.id);

    setFolderPath((current) => [
      ...current,
      folder,
    ]);

    setSearch("");

    await loadData(folder.id);
  }

  // ==========================================
  // BREADCRUMB NAVIGATION
  // ==========================================

  async function navigateToBreadcrumb(
    index: number
  ) {
    if (index === -1) {
      setCurrentFolderId(null);
      setFolderPath([]);
      setSearch("");

      await loadData(null);

      return;
    }

    const target =
      folderPath[index];

    const newPath =
      folderPath.slice(
        0,
        index + 1
      );

    setFolderPath(newPath);
    setCurrentFolderId(target.id);
    setSearch("");

    await loadData(target.id);
  }

  // ==========================================
  // CREATE FOLDER
  // ==========================================

  async function createFolder() {
    const cleanName =
      folderName.trim();

    if (!cleanName) {
      return;
    }

    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/folders`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
              parentId:
                currentFolderId,
            }),
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Could not create folder."
        );
      }

      setFolderName("");
      setShowFolder(false);

      await loadData(
        currentFolderId
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create folder."
      );
    }
  }

  // ==========================================
  // UPLOAD
  // ==========================================

  async function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles =
      event.target.files;

    if (
      !selectedFiles ||
      selectedFiles.length === 0
    ) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      for (
        const file of Array.from(
          selectedFiles
        )
      ) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        if (currentFolderId) {
          formData.append(
            "folderId",
            currentFolderId
          );
        }

        const response =
          await apiFetch(
            `${API_URL}/api/files/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

        if (!response.ok) {
          const message =
            await response.text();

          throw new Error(
            message ||
              `Upload failed for ${file.name}`
          );
        }
      }

      setShowUpload(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      await loadData(
        currentFolderId
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

  // ==========================================
  // DELETE FILE
  // ==========================================

  async function deleteFile(
    file: FileItem
  ) {
    const confirmed =
      window.confirm(
        `Delete "${file.fileName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/files/${file.id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Could not delete file."
        );
      }

      setSelected(null);

      await loadData(
        currentFolderId
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  }

  // ==========================================
  // DELETE FOLDER
  // ==========================================

  async function deleteFolder(
    folder: FolderItem
  ) {
    const confirmed =
      window.confirm(
        `Delete folder "${folder.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/folders/${folder.id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Could not delete folder."
        );
      }

      setSelected(null);

      await loadData(
        currentFolderId
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  }

  // ==========================================
  // DOWNLOAD
  // ==========================================

  async function downloadFile(
    file: FileItem
  ) {
    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/files/${file.id}/download`
        );

      if (!response.ok) {
        throw new Error(
          "Could not download file."
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
      anchor.download =
        file.fileName;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Download failed."
      );
    }
  }

  // ==========================================
  // IMAGE PREVIEW
  // ==========================================

  async function previewImage(
    file: FileItem
  ) {
    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/files/${file.id}/download`
        );

      if (!response.ok) {
        throw new Error(
          "Could not preview image."
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      setPreviewUrl(url);
      setPreviewFile(file);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Preview failed."
      );
    }
  }

  // ==========================================
  // CLOSE PREVIEW
  // ==========================================

  function closePreview() {
    if (previewUrl) {
      window.URL.revokeObjectURL(
        previewUrl
      );
    }

    setPreviewUrl(null);
    setPreviewFile(null);
  }

  // ==========================================
  // SORT + SEARCH
  // ==========================================

  const filteredFolders =
    useMemo(() => {
      return [...folders]
        .filter((folder) =>
          folder.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
        .sort((a, b) =>
          a.name.localeCompare(
            b.name
          )
        );
    }, [folders, search]);

  const filteredFiles =
    useMemo(() => {
      let result =
        files.filter((file) =>
          file.fileName
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        );

      if (sortBy === "name") {
        result = [...result].sort(
          (a, b) =>
            a.fileName.localeCompare(
              b.fileName
            )
        );
      }

      if (sortBy === "size") {
        result = [...result].sort(
          (a, b) =>
            b.fileSize -
            a.fileSize
        );
      }

      if (sortBy === "recent") {
        result = [...result].sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
      }

      return result;
    }, [files, search, sortBy]);

  // ==========================================
  // STORAGE
  // ==========================================

  const totalSize =
    files.reduce(
      (total, file) =>
        total + file.fileSize,
      0
    );

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

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
              Store, organize and manage
              your files securely.
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
          <div className="mt-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
              className="ml-4"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STORAGE CARD */}

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
                    totalSize
                  )}{" "}
                  used
                </p>
              </div>
            </div>

            <div className="w-full sm:max-w-sm">

              <div className="mb-2 flex justify-between text-xs">

                <span className="text-slate-400">
                  {files.length} files
                </span>

                <span className="font-medium text-slate-600 dark:text-slate-300">
                  10 GB storage
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(
                      (totalSize /
                        (10 *
                          1024 *
                          1024 *
                          1024)) *
                        100,
                      100
                    )}%`,
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
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search files and folders..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target
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

        <div className="mt-6 flex items-center gap-1 overflow-x-auto text-sm">

          <button
            onClick={() =>
              navigateToBreadcrumb(-1)
            }
            className="shrink-0 font-semibold text-slate-900 hover:text-blue-600 dark:text-white"
          >
            My Files
          </button>

          {folderPath.map(
            (folder, index) => (
              <div
                key={folder.id}
                className="flex shrink-0 items-center"
              >
                <ChevronRight className="mx-1 h-4 w-4 text-slate-300" />

                <button
                  onClick={() =>
                    navigateToBreadcrumb(
                      index
                    )
                  }
                  className={`${
                    index ===
                    folderPath.length - 1
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-blue-600"
                  }`}
                >
                  {folder.name}
                </button>
              </div>
            )
          )}
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5"
              />
            ))}
          </div>
        ) : filteredFolders.length === 0 &&
          filteredFiles.length === 0 ? (
          <EmptyState
            search={search}
            onUpload={() =>
              setShowUpload(true)
            }
          />
        ) : view === "grid" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {filteredFolders.map(
              (folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpen={() =>
                    openFolder(folder)
                  }
                  onDelete={() =>
                    deleteFolder(
                      folder
                    )
                  }
                />
              )
            )}

            {filteredFiles.map(
              (file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClick={() =>
                    setSelected({
                      kind: "file",
                      item: file,
                    })
                  }
                  onPreview={() =>
                    isImage(file.fileType)
                      ? previewImage(
                          file
                        )
                      : setSelected({
                          kind: "file",
                          item: file,
                        })
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            {filteredFolders.map(
              (folder) => (
                <ListFolder
                  key={folder.id}
                  folder={folder}
                  onOpen={() =>
                    openFolder(folder)
                  }
                  onDelete={() =>
                    deleteFolder(
                      folder
                    )
                  }
                />
              )
            )}

            {filteredFiles.map(
              (file) => (
                <ListFile
                  key={file.id}
                  file={file}
                  onClick={() =>
                    setSelected({
                      kind: "file",
                      item: file,
                    })
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}

      {showUpload && (
        <UploadModal
          inputRef={fileInputRef}
          uploading={uploading}
          onClose={() =>
            setShowUpload(false)
          }
          onUpload={
            handleFileUpload
          }
        />
      )}

      {/* FOLDER MODAL */}

      {showFolder && (
        <FolderModal
          value={folderName}
          setValue={setFolderName}
          onClose={() =>
            setShowFolder(false)
          }
          onCreate={createFolder}
        />
      )}

      {/* DETAILS */}

      {selected?.kind === "file" && (
        <FileDetailsModal
          file={selected.item}
          onClose={() =>
            setSelected(null)
          }
          onDownload={() =>
            downloadFile(
              selected.item
            )
          }
          onPreview={() =>
            isImage(
              selected.item.fileType
            )
              ? previewImage(
                  selected.item
                )
              : undefined
          }
          onDelete={() =>
            deleteFile(
              selected.item
            )
          }
        />
      )}

      {/* IMAGE PREVIEW */}

      {previewUrl &&
        previewFile && (
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
    </DashboardShell>
  );
}

/* ================================================= */
/* FOLDER CARD */
/* ================================================= */

function FolderCard({
  folder,
  onOpen,
  onDelete,
}: {
  folder: FolderItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
    >
      <button
        onDoubleClick={onOpen}
        onClick={onOpen}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Folder className="h-6 w-6" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {folder.name}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Folder
          </p>
        </div>
      </button>
    </div>
  );
}

/* ================================================= */
/* FILE CARD */
/* ================================================= */

function FileCard({
  file,
  onClick,
  onPreview,
}: {
  file: FileItem;
  onClick: () => void;
  onPreview: () => void;
}) {
  const image =
    isImage(file.fileType);

  return (
    <button
      onClick={
        image
          ? onPreview
          : onClick
      }
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
    >
      {image ? (
        <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-white/5">
          <ImageThumbnail
            file={file}
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-50 dark:bg-white/[0.02]">
          <FileIcon
            fileType={
              file.fileType
            }
          />
        </div>
      )}

      <div className="p-4">

        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.fileName}
        </p>

        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>
            {formatFileSize(
              file.fileSize
            )}
          </span>

          <span>
            {formatDate(
              file.createdAt
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ================================================= */
/* IMAGE THUMBNAIL */
/* ================================================= */

function ImageThumbnail({
  file,
}: {
  file: FileItem;
}) {
  const [src, setSrc] =
    useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null =
      null;

    async function load() {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) return;

        const response =
          await fetch(
            `${API_URL}/api/files/${file.id}/download`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) return;

        const blob =
          await response.blob();

        objectUrl =
          URL.createObjectURL(
            blob
          );

        setSrc(objectUrl);
      } catch {
        // ignore thumbnail error
      }
    }

    load();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [file.id]);

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center">
        <FileImage className="h-10 w-10 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={file.fileName}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
  );
}

/* ================================================= */
/* LIST FOLDER */
/* ================================================= */

function ListFolder({
  folder,
  onOpen,
  onDelete,
}: {
  folder: FolderItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">

      <button
        onDoubleClick={onOpen}
        onClick={onOpen}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Folder className="h-5 w-5" />
        </div>

        <span className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {folder.name}
        </span>
      </button>

      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ================================================= */
/* LIST FILE */
/* ================================================= */

function ListFile({
  file,
  onClick,
}: {
  file: FileItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
    >
      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <FileIcon
            fileType={
              file.fileType
            }
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {file.fileName}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatFileSize(
              file.fileSize
            )}
          </p>
        </div>
      </div>

      <span className="hidden text-xs text-slate-400 sm:block">
        {formatDate(
          file.createdAt
        )}
      </span>
    </button>
  );
}

/* ================================================= */
/* FILE ICON */
/* ================================================= */

function FileIcon({
  fileType,
}: {
  fileType: string;
}) {
  if (
    fileType.startsWith(
      "image/"
    )
  ) {
    return (
      <FileImage className="h-10 w-10" />
    );
  }

  if (
    fileType.includes("pdf")
  ) {
    return (
      <FileText className="h-10 w-10" />
    );
  }

  if (
    fileType.includes("zip") ||
    fileType.includes("rar")
  ) {
    return (
      <Archive className="h-10 w-10" />
    );
  }

  return (
    <File className="h-10 w-10" />
  );
}

/* ================================================= */
/* EMPTY STATE */
/* ================================================= */

function EmptyState({
  search,
  onUpload,
}: {
  search: string;
  onUpload: () => void;
}) {
  return (
    <div className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "Your storage is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        {search
          ? "Try another search."
          : "Upload your first file or create a folder to get started."}
      </p>

      {!search && (
        <button
          onClick={onUpload}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
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
  onClose,
  onUpload,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  onClose: () => void;
  onUpload: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <Modal onClose={onClose}>

      <div className="text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
          <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          Upload Files
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Upload one or multiple files.
        </p>

        <button
          disabled={uploading}
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-6 w-full rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-sm font-semibold text-slate-600 transition hover:border-blue-500 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-blue-500/5"
        >
          {uploading
            ? "Uploading..."
            : "Click to choose files"}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onUpload}
        />
      </div>
    </Modal>
  );
}

/* ================================================= */
/* FOLDER MODAL */
/* ================================================= */

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
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCreate();
          }
        }}
        placeholder="Folder name"
        className="mt-6 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
        >
          Cancel
        </button>

        <button
          onClick={onCreate}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Create Folder
        </button>
      </div>
    </Modal>
  );
}

/* ================================================= */
/* FILE DETAILS */
/* ================================================= */

function FileDetailsModal({
  file,
  onClose,
  onDownload,
  onPreview,
  onDelete,
}: {
  file: FileItem;
  onClose: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const image =
    isImage(file.fileType);

  return (
    <Modal onClose={onClose}>

      <div className="flex items-start gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <FileIcon
            fileType={
              file.fileType
            }
          />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            {file.fileName}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {file.fileType}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-white/5">

        <DetailRow
          label="Size"
          value={formatFileSize(
            file.fileSize
          )}
        />

        <DetailRow
          label="Created"
          value={formatDate(
            file.createdAt
          )}
        />

        <DetailRow
          label="Status"
          value="Available"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">

        {image && (
          <button
            onClick={onPreview}
            className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Preview
          </button>
        )}

        <button
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      <button
        onClick={onDelete}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        Delete File
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
  file: FileItem;
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

      <div className="flex max-h-[90vh] max-w-6xl flex-col items-center">

        <div className="overflow-hidden rounded-2xl bg-black/30 shadow-2xl">
          <img
            src={url}
            alt={file.fileName}
            className="max-h-[75vh] max-w-[90vw] object-contain"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">

          <span className="max-w-xs truncate text-sm font-medium text-white">
            {file.fileName}
          </span>

          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
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

      <span className="max-w-[220px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
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
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
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

function isImage(
  fileType: string
) {
  return fileType.startsWith(
    "image/"
  );
}

function formatFileSize(
  bytes: number
) {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
