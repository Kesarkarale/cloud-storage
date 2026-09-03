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
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

/* =========================================================
   TYPES
========================================================= */

type FileType =
  | "folder"
  | "pdf"
  | "image"
  | "document"
  | "zip";

type FileItem = {
  id: number;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  parentId: number | null;

  /*
   * Used for local image preview.
   *
   * Later when connected with Spring Boot,
   * this can contain your real storage URL.
   */
  previewUrl?: string;

  /*
   * Original File object.
   * Useful for downloading locally uploaded files.
   */
  fileObject?: File;
};

/* =========================================================
   INITIAL FILES
========================================================= */

const initialFiles: FileItem[] = [
  {
    id: 1,
    name: "Documents",
    type: "folder",
    size: "—",
    modified: "Today",
    parentId: null,
  },

  {
    id: 2,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "Today",
    parentId: null,
  },

  {
    id: 3,
    name: "Presentation.pptx",
    type: "document",
    size: "5.8 MB",
    modified: "Yesterday",
    parentId: null,
  },

  {
    id: 4,
    name: "Project Images",
    type: "folder",
    size: "—",
    modified: "Yesterday",
    parentId: null,
  },

  {
    id: 5,
    name: "Database.sql",
    type: "document",
    size: "1.2 MB",
    modified: "Aug 29, 2026",
    parentId: null,
  },

  {
    id: 6,
    name: "Images.zip",
    type: "zip",
    size: "18.5 MB",
    modified: "Aug 28, 2026",
    parentId: null,
  },

  {
    id: 7,
    name: "Profile Image.png",
    type: "image",
    size: "1.8 MB",
    modified: "Aug 27, 2026",
    parentId: null,
  },

  {
    id: 8,
    name: "Resume.pdf",
    type: "pdf",
    size: "890 KB",
    modified: "Aug 25, 2026",
    parentId: null,
  },

  /* =======================================================
     DEMO FILES INSIDE DOCUMENTS
  ======================================================= */

  {
    id: 9,
    name: "College Notes",
    type: "folder",
    size: "—",
    modified: "Today",
    parentId: 1,
  },

  {
    id: 10,
    name: "Assignment.docx",
    type: "document",
    size: "1.4 MB",
    modified: "Today",
    parentId: 1,
  },

  {
    id: 11,
    name: "Java Notes.pdf",
    type: "pdf",
    size: "3.2 MB",
    modified: "Yesterday",
    parentId: 1,
  },

  /* =======================================================
     DEMO FILES INSIDE PROJECT IMAGES
  ======================================================= */

  {
    id: 12,
    name: "Screenshot.png",
    type: "image",
    size: "950 KB",
    modified: "Yesterday",
    parentId: 4,
  },

  {
    id: 13,
    name: "Dashboard.jpg",
    type: "image",
    size: "1.7 MB",
    modified: "Aug 28, 2026",
    parentId: 4,
  },

  /* =======================================================
     NESTED FOLDER
  ======================================================= */

  {
    id: 14,
    name: "Semester 5",
    type: "folder",
    size: "—",
    modified: "Today",
    parentId: 9,
  },

  {
    id: 15,
    name: "DBMS.pdf",
    type: "pdf",
    size: "2.1 MB",
    modified: "Today",
    parentId: 9,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function FilesPage() {
  const [files, setFiles] =
    useState<FileItem[]>(initialFiles);

  const [search, setSearch] =
    useState("");

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [sortBy, setSortBy] =
    useState("recent");

  /*
   * null = root / My Files
   */
  const [currentFolderId, setCurrentFolderId] =
    useState<number | null>(null);

  /*
   * Navigation history
   */
  const [folderHistory, setFolderHistory] =
    useState<number[]>([]);

  const [showUpload, setShowUpload] =
    useState(false);

  const [showFolder, setShowFolder] =
    useState(false);

  const [folderName, setFolderName] =
    useState("");

  /*
   * Details modal
   */
  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null);

  /*
   * Image preview modal
   */
  const [previewImage, setPreviewImage] =
    useState<FileItem | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     CLEANUP OBJECT URLS
  ======================================================= */

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (
          file.previewUrl &&
          file.previewUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(
            file.previewUrl
          );
        }
      });
    };
  }, []);

  /* =======================================================
     CURRENT FOLDER
  ======================================================= */

  const currentFolder = useMemo(() => {
    if (currentFolderId === null) {
      return null;
    }

    return (
      files.find(
        (file) =>
          file.id === currentFolderId &&
          file.type === "folder"
      ) ?? null
    );
  }, [files, currentFolderId]);

  /* =======================================================
     CURRENT FOLDER FILES
  ======================================================= */

  const currentFiles = useMemo(() => {
    return files.filter(
      (file) =>
        file.parentId === currentFolderId
    );
  }, [files, currentFolderId]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredFiles = useMemo(() => {
    let result = currentFiles.filter((file) =>
      file.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "size") {
      result = [...result].sort(
        (a, b) =>
          getSizeInBytes(a.size) -
          getSizeInBytes(b.size)
      );
    }

    if (sortBy === "recent") {
      result = [...result].sort(
        (a, b) => b.id - a.id
      );

      /*
       * Keep folders above files.
       */
      result = [...result].sort((a, b) => {
        if (
          a.type === "folder" &&
          b.type !== "folder"
        ) {
          return -1;
        }

        if (
          a.type !== "folder" &&
          b.type === "folder"
        ) {
          return 1;
        }

        return 0;
      });
    }

    return result;
  }, [
    currentFiles,
    search,
    sortBy,
  ]);

  /* =======================================================
     CREATE FOLDER
  ======================================================= */

  function createFolder() {
    const cleanName =
      folderName.trim();

    if (!cleanName) {
      return;
    }

    const duplicate = files.some(
      (file) =>
        file.parentId === currentFolderId &&
        file.type === "folder" &&
        file.name.toLowerCase() ===
          cleanName.toLowerCase()
    );

    if (duplicate) {
      alert(
        "A folder with this name already exists."
      );
      return;
    }

    const newFolder: FileItem = {
      id: Date.now(),
      name: cleanName,
      type: "folder",
      size: "—",
      modified: "Just now",
      parentId: currentFolderId,
    };

    setFiles((current) => [
      newFolder,
      ...current,
    ]);

    setFolderName("");
    setShowFolder(false);
  }

  /* =======================================================
     UPLOAD FILES
  ======================================================= */

  function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files;

    if (
      !selected ||
      selected.length === 0
    ) {
      return;
    }

    const uploadedFiles: FileItem[] =
      Array.from(selected).map(
        (file, index) => {
          const type =
            getFileType(file.name);

          /*
           * Create preview URL ONLY for images.
           */
          const previewUrl =
            type === "image"
              ? URL.createObjectURL(file)
              : undefined;

          return {
            id:
              Date.now() + index,
            name: file.name,
            type,
            size: formatFileSize(
              file.size
            ),
            modified: "Just now",
            parentId:
              currentFolderId,
            previewUrl,
            fileObject: file,
          };
        }
      );

    setFiles((current) => [
      ...uploadedFiles,
      ...current,
    ]);

    setShowUpload(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* =======================================================
     OPEN FILE / FOLDER
  ======================================================= */

  function handleFileClick(
    file: FileItem
  ) {
    /*
     * Folder -> open folder
     */
    if (file.type === "folder") {
      openFolder(file);
      return;
    }

    /*
     * Image -> image preview
     */
    if (file.type === "image") {
      setPreviewImage(file);
      return;
    }

    /*
     * Other files -> details modal
     */
    setSelectedFile(file);
  }

  /* =======================================================
     OPEN FOLDER
  ======================================================= */

  function openFolder(
    folder: FileItem
  ) {
    if (folder.type !== "folder") {
      return;
    }

    if (currentFolderId !== null) {
      setFolderHistory(
        (history) => [
          ...history,
          currentFolderId,
        ]
      );
    }

    setCurrentFolderId(
      folder.id
    );

    setSearch("");

    setSelectedFile(null);
    setPreviewImage(null);
  }

  /* =======================================================
     DOUBLE CLICK
  ======================================================= */

  function handleDoubleClick(
    file: FileItem
  ) {
    /*
     * For folders double click also opens.
     *
     * For images double click preview.
     */
    if (file.type === "folder") {
      openFolder(file);
      return;
    }

    if (file.type === "image") {
      setPreviewImage(file);
    }
  }

  /* =======================================================
     BACK
  ======================================================= */

  function goBack() {
    if (
      folderHistory.length === 0
    ) {
      setCurrentFolderId(null);
      return;
    }

    const history = [
      ...folderHistory,
    ];

    const previousFolderId =
      history.pop() ?? null;

    setFolderHistory(history);

    setCurrentFolderId(
      previousFolderId
    );

    setSearch("");
    setSelectedFile(null);
    setPreviewImage(null);
  }

  /* =======================================================
     HOME
  ======================================================= */

  function goHome() {
    setCurrentFolderId(null);
    setFolderHistory([]);
    setSearch("");
    setSelectedFile(null);
    setPreviewImage(null);
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function deleteFile(id: number) {
    const itemToDelete =
      files.find(
        (file) => file.id === id
      );

    /*
     * Revoke image URL before deleting.
     */
    if (
      itemToDelete?.previewUrl &&
      itemToDelete.previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        itemToDelete.previewUrl
      );
    }

    setFiles((current) => {
      const idsToDelete =
        new Set<number>();

      function collectChildren(
        parentId: number
      ) {
        idsToDelete.add(
          parentId
        );

        current
          .filter(
            (file) =>
              file.parentId ===
              parentId
          )
          .forEach((child) => {
            if (
              child.type ===
              "folder"
            ) {
              collectChildren(
                child.id
              );
            } else {
              idsToDelete.add(
                child.id
              );
            }
          });
      }

      collectChildren(id);

      return current.filter(
        (file) =>
          !idsToDelete.has(
            file.id
          )
      );
    });

    setSelectedFile(null);
    setPreviewImage(null);
  }

  /* =======================================================
     DOWNLOAD LOCAL FILE
  ======================================================= */

  function downloadFile(
    file: FileItem
  ) {
    /*
     * If actual File object exists,
     * download it locally.
     */
    if (file.fileObject) {
      const url =
        URL.createObjectURL(
          file.fileObject
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        file.name;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      return;
    }

    /*
     * If preview URL exists,
     * download from it.
     */
    if (file.previewUrl) {
      const link =
        document.createElement(
          "a"
        );

      link.href =
        file.previewUrl;

      link.download =
        file.name;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();
    }
  }

  /* =======================================================
     BREADCRUMB
  ======================================================= */

  const breadcrumb =
    useMemo(() => {
      const result: FileItem[] =
        [];

      let folder =
        currentFolder;

      while (folder) {
        result.unshift(
          folder
        );

        folder =
          files.find(
            (file) =>
              file.id ===
                folder?.parentId &&
              file.type ===
                "folder"
          ) ?? null;
      }

      return result;
    }, [
      currentFolder,
      files,
    ]);

  /* =======================================================
     STORAGE
  ======================================================= */

  const totalStorageBytes =
    10 *
    1024 *
    1024 *
    1024;

  const usedStorageBytes =
    files.reduce(
      (total, file) => {
        if (
          file.type ===
          "folder"
        ) {
          return total;
        }

        return (
          total +
          getSizeInBytes(
            file.size
          )
        );
      },
      0
    );

  const usedPercentage =
    Math.min(
      100,
      Math.round(
        (usedStorageBytes /
          totalStorageBytes) *
          100
      )
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

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

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Upload, organize and manage your files securely.
            </p>
          </div>

          {/* ACTIONS */}

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

        {/* =================================================
            STORAGE CARD
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
                  {formatStorage(
                    usedStorageBytes
                  )}{" "}
                  used of 10 GB
                </p>
              </div>

            </div>

            <div className="w-full sm:max-w-sm">

              <div className="mb-2 flex justify-between text-xs">

                <span className="text-slate-400">
                  {usedPercentage}% used
                </span>

                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {formatStorage(
                    Math.max(
                      0,
                      totalStorageBytes -
                        usedStorageBytes
                    )
                  )}{" "}
                  free
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${usedPercentage}%`,
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

          {/* SEARCH */}

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

            {/* SORT */}

            <div className="relative">

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
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

            {/* VIEW */}

            <div className="flex h-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">

              <button
                onClick={() =>
                  setView("grid")
                }
                className={`rounded-lg px-3 transition ${
                  view === "grid"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                onClick={() =>
                  setView("list")
                }
                className={`rounded-lg px-3 transition ${
                  view === "list"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
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

          {currentFolderId !== null && (
            <button
              onClick={goBack}
              className="mr-1 inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <button
            onClick={goHome}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition ${
              currentFolderId ===
              null
                ? "text-slate-900 dark:text-white"
                : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
            }`}
          >
            <Home className="h-4 w-4" />
            My Files
          </button>

          {breadcrumb.map(
            (folder, index) => (
              <div
                key={folder.id}
                className="flex items-center gap-2"
              >
                <span className="text-slate-300 dark:text-slate-700">
                  /
                </span>

                <button
                  onClick={() => {
                    const indexInPath =
                      breadcrumb.findIndex(
                        (item) =>
                          item.id ===
                          folder.id
                      );

                    const parentIds =
                      breadcrumb
                        .slice(
                          0,
                          indexInPath
                        )
                        .map(
                          (item) =>
                            item.id
                        );

                    setFolderHistory(
                      parentIds
                    );

                    setCurrentFolderId(
                      folder.id
                    );

                    setSearch("");
                    setSelectedFile(
                      null
                    );
                    setPreviewImage(
                      null
                    );
                  }}
                  className={`max-w-[180px] truncate text-sm ${
                    index ===
                    breadcrumb.length -
                      1
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {folder.name}
                </button>
              </div>
            )
          )}

        </div>

        {/* =================================================
            CURRENT FOLDER HEADER
        ================================================= */}

        {currentFolder && (
          <div className="mt-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentFolder.name}
              </h2>

              <p className="text-xs text-slate-400">
                {currentFiles.length}{" "}
                {currentFiles.length ===
                1
                  ? "item"
                  : "items"}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            FILE AREA
        ================================================= */}

        {filteredFiles.length ===
        0 ? (
          <EmptyState
            search={search}
            onUpload={() =>
              setShowUpload(true)
            }
            onNewFolder={() =>
              setShowFolder(true)
            }
          />
        ) : view === "grid" ? (

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredFiles.map(
              (file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClick={() =>
                    handleFileClick(
                      file
                    )
                  }
                  onDoubleClick={() =>
                    handleDoubleClick(
                      file
                    )
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

            {filteredFiles.map(
              (file) => (
                <ListFile
                  key={file.id}
                  file={file}
                  onClick={() =>
                    handleFileClick(
                      file
                    )
                  }
                  onDoubleClick={() =>
                    handleDoubleClick(
                      file
                    )
                  }
                />
              )
            )}

          </div>
        )}

        {/* =================================================
            UPLOAD MODAL
        ================================================= */}

        {showUpload && (
          <UploadModal
            inputRef={
              fileInputRef
            }
            onClose={() =>
              setShowUpload(false)
            }
            onUpload={
              handleFileUpload
            }
          />
        )}

        {/* =================================================
            FOLDER MODAL
        ================================================= */}

        {showFolder && (
          <FolderModal
            value={folderName}
            setValue={setFolderName}
            onClose={() =>
              setShowFolder(false)
            }
            onCreate={
              createFolder
            }
          />
        )}

        {/* =================================================
            FILE DETAILS
        ================================================= */}

        {selectedFile && (
          <FileDetailsModal
            file={selectedFile}
            onClose={() =>
              setSelectedFile(null)
            }
            onDelete={() =>
              deleteFile(
                selectedFile.id
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
            file={previewImage}
            onClose={() =>
              setPreviewImage(null)
            }
            onDownload={() =>
              downloadFile(
                previewImage
              )
            }
            onDelete={() =>
              deleteFile(
                previewImage.id
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
  onClick,
  onDoubleClick,
}: {
  file: FileItem;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const isFolder =
    file.type === "folder";

  const isImage =
    file.type === "image";

  return (
    <button
      onClick={onClick}
      onDoubleClick={
        onDoubleClick
      }
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
    >

      {/* IMAGE PREVIEW */}

      {isImage &&
      file.previewUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">

          <img
            src={file.previewUrl}
            alt={file.name}
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
              type={file.type}
            />
          </div>

          <MoreHorizontal className="h-5 w-5 text-slate-300 transition group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300" />

        </div>
      )}

      <div
        className={
          isImage &&
          file.previewUrl
            ? "mt-4"
            : "mt-5"
        }
      >

        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">

          <span className="truncate text-xs text-slate-400">
            {isFolder
              ? "Folder"
              : file.size}
          </span>

          <span className="shrink-0 text-xs text-slate-400">
            {file.modified}
          </span>

        </div>

      </div>

    </button>
  );
}

/* =========================================================
   LIST FILE
========================================================= */

function ListFile({
  file,
  onClick,
  onDoubleClick,
}: {
  file: FileItem;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const isImage =
    file.type === "image";

  const isFolder =
    file.type === "folder";

  return (
    <button
      onClick={onClick}
      onDoubleClick={
        onDoubleClick
      }
      className="grid w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 md:grid-cols-[1fr_140px_160px_50px] md:items-center md:gap-4"
    >

      <div className="flex min-w-0 items-center gap-3">

        {isImage &&
        file.previewUrl ? (
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">

            <img
              src={file.previewUrl}
              alt={file.name}
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
              type={file.type}
            />
          </div>
        )}

        <span className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.name}
        </span>

      </div>

      <span className="hidden text-xs text-slate-400 md:block">
        {isFolder
          ? "—"
          : file.size}
      </span>

      <span className="hidden text-xs text-slate-400 md:block">
        {file.modified}
      </span>

      <MoreHorizontal className="hidden h-5 w-5 text-slate-400 md:block" />

    </button>
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
  if (type === "folder") {
    return (
      <Folder className="h-6 w-6" />
    );
  }

  if (type === "image") {
    return (
      <FileImage className="h-6 w-6" />
    );
  }

  if (
    type === "pdf" ||
    type === "document"
  ) {
    return (
      <FileText className="h-6 w-6" />
    );
  }

  if (type === "zip") {
    return (
      <Archive className="h-6 w-6" />
    );
  }

  return (
    <File className="h-6 w-6" />
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
    <div className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

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
          ? "Try searching with a different file or folder name."
          : "Add files or create a new folder to organize your storage."}
      </p>

      {!search && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">

          <button
            onClick={onNewFolder}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>

          <button
            onClick={onUpload}
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
  onClose,
  onUpload,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onUpload: (
    event: React.ChangeEvent<HTMLInputElement>
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
          Files will be uploaded into the current folder.
        </p>

        <button
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-6 w-full rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-sm font-semibold text-slate-600 transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-blue-500/5"
        >
          <Upload className="mx-auto mb-3 h-6 w-6 text-slate-400" />

          Click to choose files

          <span className="mt-2 block text-xs font-normal text-slate-400">
            Images, PDF, documents, ZIP and more
          </span>
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
    <Modal onClose={onClose}>

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New Folder
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Create a folder in the current location.
          </p>
        </div>

      </div>

      <input
        autoFocus
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
        onKeyDown={(e) => {
          if (
            e.key ===
            "Enter"
          ) {
            onCreate();
          }
        }}
        placeholder="e.g. College Notes"
        className="mt-6 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          Cancel
        </button>

        <button
          onClick={onCreate}
          disabled={!value.trim()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create Folder
        </button>

      </div>

    </Modal>
  );
}

/* =========================================================
   FILE DETAILS MODAL
========================================================= */

function FileDetailsModal({
  file,
  onClose,
  onDelete,
  onDownload,
}: {
  file: FileItem;
  onClose: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const isFolder =
    file.type === "folder";

  return (
    <Modal onClose={onClose}>

      <div className="flex items-start justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <FileIcon
              type={file.type}
            />
          </div>

          <div className="min-w-0">

            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {file.name}
            </h2>

            <p className="text-xs text-slate-400">
              {isFolder
                ? "Folder"
                : "File"}
            </p>

          </div>

        </div>

      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-white/5">

        <DetailRow
          label="Type"
          value={
            isFolder
              ? "Folder"
              : file.type.toUpperCase()
          }
        />

        <DetailRow
          label="Size"
          value={file.size}
        />

        <DetailRow
          label="Modified"
          value={file.modified}
        />

        <DetailRow
          label="Status"
          value="Available"
        />

      </div>

      {!isFolder && (
        <div className="mt-6 grid grid-cols-2 gap-3">

          <button
            onClick={onDownload}
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
      )}

      <button
        onClick={onDelete}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        Move to Trash
      </button>

    </Modal>
  );
}

/* =========================================================
   IMAGE PREVIEW MODAL
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">

        {/* =================================================
            PREVIEW HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <FileImage className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-white">
                {file.name}
              </p>

              <p className="text-xs text-slate-400">
                {file.size}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* =================================================
            IMAGE
        ================================================= */}

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-black p-4 sm:p-8">

          {file.previewUrl ? (
            <img
              src={file.previewUrl}
              alt={file.name}
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">

              <FileImage className="h-16 w-16 text-slate-600" />

              <p className="mt-4 text-sm text-slate-400">
                Image preview unavailable
              </p>

            </div>
          )}

        </div>

        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950 px-4 py-3 sm:px-5">

          <div className="text-xs text-slate-500">
            {file.modified}
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">
                Download
              </span>
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">
                Delete
              </span>
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
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0 dark:border-white/5">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[200px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

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
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {children}

      </div>

    </div>
  );
}

/* =========================================================
   FILE TYPE
========================================================= */

function getFileType(
  fileName: string
): FileType {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

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

/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(
  bytes: number
) {
  if (bytes === 0) {
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

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

/* =========================================================
   SIZE STRING -> BYTES
========================================================= */

function getSizeInBytes(
  size: string
) {
  if (
    !size ||
    size === "—"
  ) {
    return 0;
  }

  const match =
    size.match(
      /^([\d.]+)\s*(Bytes|KB|MB|GB|TB)$/i
    );

  if (!match) {
    return 0;
  }

  const value =
    Number(match[1]);

  const unit =
    match[2].toUpperCase();

  const multipliers: Record<
    string,
    number
  > = {
    BYTES: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return (
    value *
    (multipliers[unit] || 1)
  );
}

/* =========================================================
   STORAGE FORMAT
========================================================= */

function formatStorage(
  bytes: number
) {
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
