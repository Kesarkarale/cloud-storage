"use client";

import {
  Archive,
  ArrowDownAZ,
  ArrowUpAZ,
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
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type StarredFile = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  parentFolderId?: string | null;
  createdAt: string;
  deleted?: boolean;
  starred: boolean;
};

type StarredFolder = {
  id: string;
  name: string;
  userId: string;
  parentFolderId?: string | null;
  createdAt: string;
  deleted?: boolean;
  starred: boolean;
};

type ItemType = "file" | "folder";

type StarredItem = {
  id: string;
  name: string;
  type: ItemType;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  starred: boolean;
  original: StarredFile | StarredFolder;
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "date-desc"
  | "date-asc"
  | "size-desc"
  | "size-asc";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export default function StarredPage() {
  const [files, setFiles] = useState<StarredFile[]>([]);
  const [folders, setFolders] = useState<StarredFolder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  const [sortBy, setSortBy] =
    useState<SortOption>("name-asc");

  const [sortOpen, setSortOpen] =
    useState(false);

  const [activeMenu, setActiveMenu] =
    useState<string | null>(null);

  const [unstarLoading, setUnstarLoading] =
    useState<string | null>(null);

  // =========================
  // AUTH HEADERS
  // =========================

  const getHeaders = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }, []);

  // =========================
  // FETCH STARRED
  // =========================

  const fetchStarred = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const headers = getHeaders();

        const [filesResponse, foldersResponse] =
          await Promise.all([
            fetch(
              `${API_BASE}/api/files/starred`,
              {
                method: "GET",
                headers,
                credentials: "include",
              }
            ),

            fetch(
              `${API_BASE}/api/folders/starred`,
              {
                method: "GET",
                headers,
                credentials: "include",
              }
            ),
          ]);

        if (!filesResponse.ok) {
          throw new Error(
            "Failed to load starred files"
          );
        }

        if (!foldersResponse.ok) {
          throw new Error(
            "Failed to load starred folders"
          );
        }

        const filesData =
          await filesResponse.json();

        const foldersData =
          await foldersResponse.json();

        setFiles(
          Array.isArray(filesData)
            ? filesData
            : []
        );

        setFolders(
          Array.isArray(foldersData)
            ? foldersData
            : []
        );
      } catch (err) {
        console.error(
          "Starred loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load starred items"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getHeaders]
  );

  useEffect(() => {
    fetchStarred();
  }, [fetchStarred]);

  // =========================
  // COMBINED ITEMS
  // =========================

  const items = useMemo<StarredItem[]>(() => {
    const fileItems: StarredItem[] =
      files.map((file) => ({
        id: file.id,
        name: file.fileName,
        type: "file",
        fileType: file.fileType,
        fileSize: file.fileSize,
        createdAt: file.createdAt,
        starred: file.starred,
        original: file,
      }));

    const folderItems: StarredItem[] =
      folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: "folder",
        createdAt: folder.createdAt,
        starred: folder.starred,
        original: folder,
      }));

    return [
      ...folderItems,
      ...fileItems,
    ];
  }, [files, folders]);

  // =========================
  // FILTER + SORT
  // =========================

  const filteredItems = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    let result = items.filter((item) =>
      item.name
        .toLowerCase()
        .includes(query)
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(
            b.name
          );

        case "name-desc":
          return b.name.localeCompare(
            a.name
          );

        case "date-desc":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );

        case "date-asc":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );

        case "size-desc":
          return (
            (b.fileSize || 0) -
            (a.fileSize || 0)
          );

        case "size-asc":
          return (
            (a.fileSize || 0) -
            (b.fileSize || 0)
          );

        default:
          return 0;
      }
    });

    return result;
  }, [items, search, sortBy]);

  // =========================
  // COUNTS
  // =========================

  const totalCount =
    files.length + folders.length;

  // =========================
  // FORMAT SIZE
  // =========================

  const formatSize = (
    bytes?: number
  ) => {
    if (!bytes || bytes <= 0) {
      return "—";
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

    const safeIndex = Math.min(
      index,
      units.length - 1
    );

    return `${(
      bytes /
      Math.pow(1024, safeIndex)
    ).toFixed(
      safeIndex === 0 ? 0 : 1
    )} ${units[safeIndex]}`;
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "—";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "—";
    }

    return parsed.toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // FILE ICON
  // =========================

  const getFileIcon = (
    fileType?: string,
    size = 34
  ) => {
    const type =
      (fileType || "").toLowerCase();

    if (
      type.includes("image") ||
      type.includes("png") ||
      type.includes("jpg") ||
      type.includes("jpeg") ||
      type.includes("gif") ||
      type.includes("webp")
    ) {
      return (
        <FileImage
          size={size}
          strokeWidth={1.8}
        />
      );
    }

    if (
      type.includes("pdf")
    ) {
      return (
        <FileText
          size={size}
          strokeWidth={1.8}
        />
      );
    }

    if (
      type.includes("word") ||
      type.includes("document") ||
      type.includes("msword")
    ) {
      return (
        <FileText
          size={size}
          strokeWidth={1.8}
        />
      );
    }

    if (
      type.includes("sheet") ||
      type.includes("excel") ||
      type.includes("csv")
    ) {
      return (
        <FileSpreadsheet
          size={size}
          strokeWidth={1.8}
        />
      );
    }

    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("7z") ||
      type.includes("archive")
    ) {
      return (
        <FileArchive
          size={size}
          strokeWidth={1.8}
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
          size={size}
          strokeWidth={1.8}
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
          size={size}
          strokeWidth={1.8}
        />
      );
    }

    return (
      <File
        size={size}
        strokeWidth={1.8}
      />
    );
  };

  // =========================
  // UNSTAR
  // =========================

  const handleUnstar = async (
    item: StarredItem
  ) => {
    try {
      setUnstarLoading(item.id);
      setActiveMenu(null);

      const endpoint =
        item.type === "file"
          ? `${API_BASE}/api/files/${item.id}/star`
          : `${API_BASE}/api/folders/${item.id}/star`;

      const response =
        await fetch(endpoint, {
          method: "DELETE",
          headers: getHeaders(),
          credentials: "include",
        });

      if (!response.ok) {
        throw new Error(
          "Failed to remove star"
        );
      }

      if (item.type === "file") {
        setFiles((prev) =>
          prev.filter(
            (file) =>
              file.id !== item.id
          )
        );
      } else {
        setFolders((prev) =>
          prev.filter(
            (folder) =>
              folder.id !== item.id
          )
        );
      }
    } catch (err) {
      console.error(
        "Unstar error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove star"
      );
    } finally {
      setUnstarLoading(null);
    }
  };

  // =========================
  // DOWNLOAD
  // =========================

  const handleDownload = async (
    item: StarredItem
  ) => {
    if (item.type !== "file") {
      return;
    }

    try {
      setActiveMenu(null);

      const response =
        await fetch(
          `${API_BASE}/api/files/${item.id}/download`,
          {
            method: "GET",
            headers: getHeaders(),
            credentials: "include",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to download file"
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
        item.name;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (err) {
      console.error(
        "Download error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download file"
      );
    }
  };

  // =========================
  // OPEN FOLDER
  // =========================

  const handleOpenFolder = (
    folder: StarredFolder
  ) => {
    window.location.href =
      `/files?folderId=${folder.id}`;
  };

  // =========================
  // CLOSE MENU
  // =========================

  useEffect(() => {
    const handleClick =
      () => setActiveMenu(null);

    if (activeMenu) {
      document.addEventListener(
        "click",
        handleClick
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, [activeMenu]);

  // =========================
  // SORT LABEL
  // =========================

  const sortLabel = () => {
    switch (sortBy) {
      case "name-asc":
        return "Name A–Z";

      case "name-desc":
        return "Name Z–A";

      case "date-desc":
        return "Newest first";

      case "date-asc":
        return "Oldest first";

      case "size-desc":
        return "Largest first";

      case "size-asc":
        return "Smallest first";

      default:
        return "Name A–Z";
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#f8fafc]
        dark:bg-[#0b1120]
        text-slate-900
        dark:text-white
        px-4
        py-5
        sm:px-6
        lg:px-8
      "
    >
      {/* =========================
          HEADER
      ========================= */}

      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-amber-100
                  text-amber-500
                  dark:bg-amber-500/15
                  dark:text-amber-400
                "
              >
                <Star
                  size={25}
                  fill="currentColor"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    sm:text-3xl
                  "
                >
                  Starred
                </h1>

                <p
                  className="
                    mt-0.5
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Your favourite files and
                  folders in one place
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-2
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              <span>
                {totalCount}{" "}
                {totalCount === 1
                  ? "item"
                  : "items"}
              </span>

              <span>•</span>

              <span>
                {files.length}{" "}
                {files.length === 1
                  ? "file"
                  : "files"}
              </span>

              <span>•</span>

              <span>
                {folders.length}{" "}
                {folders.length === 1
                  ? "folder"
                  : "folders"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchStarred(true)
            }
            disabled={refreshing}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-medium
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
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
        </div>

        {/* =========================
            TOOLBAR
        ========================= */}

        <div
          className="
            mt-7
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-3
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            {/* SEARCH */}

            <div
              className="
                relative
                w-full
                md:max-w-md
              "
            >
              <Search
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search starred items..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-10
                  text-sm
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-slate-400
                  focus:bg-white
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:focus:border-slate-500
                  dark:focus:bg-slate-800
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-700
                    dark:hover:text-white
                  "
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              {/* SORT */}

              <div className="relative">

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortOpen(
                      (prev) => !prev
                    );
                  }}
                  className="
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  <ArrowDownAZ
                    size={16}
                  />

                  <span className="hidden sm:inline">
                    {sortLabel()}
                  </span>

                  <ChevronDown
                    size={15}
                  />
                </button>

                {sortOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      z-30
                      mt-2
                      w-48
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-1
                      shadow-xl
                      dark:border-slate-700
                      dark:bg-slate-900
                    "
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    {[
                      [
                        "name-asc",
                        "Name A–Z",
                      ],
                      [
                        "name-desc",
                        "Name Z–A",
                      ],
                      [
                        "date-desc",
                        "Newest first",
                      ],
                      [
                        "date-asc",
                        "Oldest first",
                      ],
                      [
                        "size-desc",
                        "Largest first",
                      ],
                      [
                        "size-asc",
                        "Smallest first",
                      ],
                    ].map(
                      ([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setSortBy(
                              value as SortOption
                            );
                            setSortOpen(
                              false
                            );
                          }}
                          className={`
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            ${
                              sortBy ===
                              value
                                ? "bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white"
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                            }
                          `}
                        >
                          <span>
                            {label}
                          </span>

                          {sortBy ===
                            value && (
                            <span>
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* VIEW */}

              <div
                className="
                  flex
                  h-10
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-1
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setViewMode("grid")
                  }
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    ${
                      viewMode ===
                      "grid"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-400"
                    }
                  `}
                >
                  <Grid2X2
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("list")
                  }
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    ${
                      viewMode ===
                      "list"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-400"
                    }
                  `}
                >
                  <List
                    size={18}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
              dark:border-red-900/50
              dark:bg-red-950/30
              dark:text-red-300
            "
          >
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                shrink-0
                rounded-lg
                p-1
                hover:bg-red-100
                dark:hover:bg-red-900/30
              "
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <div
            className="
              flex
              min-h-[420px]
              items-center
              justify-center
            "
          >
            <div className="text-center">

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  dark:bg-slate-800
                "
              >
                <Loader2
                  size={25}
                  className="animate-spin"
                />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Loading starred items...
              </p>
            </div>
          </div>
        ) : filteredItems.length ===
          0 ? (
          /* =========================
             EMPTY STATE
          ========================= */

          <div
            className="
              mt-6
              flex
              min-h-[440px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              text-center
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-amber-50
                text-amber-500
                dark:bg-amber-500/10
                dark:text-amber-400
              "
            >
              {search ? (
                <Search
                  size={32}
                />
              ) : (
                <Star
                  size={34}
                  fill="currentColor"
                />
              )}
            </div>

            <h2
              className="
                mt-6
                text-lg
                font-semibold
              "
            >
              {search
                ? "No matching items"
                : "Nothing starred yet"}
            </h2>

            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              {search
                ? "Try a different search term to find your starred files or folders."
                : "Star your important files and folders to access them quickly from this section."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  mt-5
                  rounded-xl
                  bg-slate-900
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-slate-700
                  dark:bg-white
                  dark:text-slate-900
                  dark:hover:bg-slate-200
                "
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode ===
          "grid" ? (
          /* =========================
             GRID VIEW
          ========================= */

          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {filteredItems.map(
              (item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="
                    group
                    relative
                    overflow-visible
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-md
                    dark:border-slate-800
                    dark:bg-slate-900
                  "
                >
                  {/* TOP */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                    "
                  >
                    <div
                      className={`
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          item.type ===
                          "folder"
                            ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }
                      `}
                    >
                      {item.type ===
                      "folder" ? (
                        <Folder
                          size={27}
                          fill="currentColor"
                          strokeWidth={1.5}
                        />
                      ) : (
                        getFileIcon(
                          item.fileType,
                          28
                        )
                      )}
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          text-amber-500
                          dark:text-amber-400
                        "
                      >
                        <Star
                          size={17}
                          fill="currentColor"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu ===
                              item.id
                              ? null
                              : item.id
                          );
                        }}
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-400
                          opacity-0
                          transition
                          hover:bg-slate-100
                          hover:text-slate-700
                          group-hover:opacity-100
                          dark:hover:bg-slate-800
                          dark:hover:text-white
                        "
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>
                    </div>
                  </div>

                  {/* MENU */}

                  {activeMenu ===
                    item.id && (
                    <div
                      className="
                        absolute
                        right-4
                        top-14
                        z-40
                        w-44
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        p-1
                        shadow-xl
                        dark:border-slate-700
                        dark:bg-slate-900
                      "
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      {item.type ===
                        "file" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              item
                            )
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-2
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            text-slate-700
                            hover:bg-slate-50
                            dark:text-slate-200
                            dark:hover:bg-slate-800
                          "
                        >
                          <Download
                            size={16}
                          />
                          Download
                        </button>
                      )}

                      {item.type ===
                        "folder" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu(
                              null
                            );
                            handleOpenFolder(
                              item.original as StarredFolder
                            );
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-2
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            text-slate-700
                            hover:bg-slate-50
                            dark:text-slate-200
                            dark:hover:bg-slate-800
                          "
                        >
                          <Folder
                            size={16}
                          />
                          Open folder
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          unstarLoading ===
                          item.id
                        }
                        onClick={() =>
                          handleUnstar(
                            item
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-2
                          rounded-lg
                          px-3
                          py-2.5
                          text-left
                          text-sm
                          text-slate-700
                          hover:bg-slate-50
                          dark:text-slate-200
                          dark:hover:bg-slate-800
                        "
                      >
                        {unstarLoading ===
                        item.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Star
                            size={16}
                          />
                        )}

                        Remove star
                      </button>
                    </div>
                  )}

                  {/* NAME */}

                  <div className="mt-5 min-w-0">
                    <h3
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-900
                        dark:text-white
                      "
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      <span>
                        {item.type ===
                        "folder"
                          ? "Folder"
                          : formatSize(
                              item.fileSize
                            )}
                      </span>

                      <span>•</span>

                      <span>
                        {formatDate(
                          item.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM */}

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      border-t
                      border-slate-100
                      pt-3
                      dark:border-slate-800
                    "
                  >
                    <span
                      className="
                        text-[11px]
                        font-medium
                        uppercase
                        tracking-wider
                        text-slate-400
                      "
                    >
                      {item.type}
                    </span>

                    <button
                      type="button"
                      disabled={
                        unstarLoading ===
                        item.id
                      }
                      onClick={() =>
                        handleUnstar(
                          item
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        text-xs
                        font-medium
                        text-amber-500
                        transition
                        hover:text-amber-600
                        disabled:opacity-50
                        dark:text-amber-400
                      "
                    >
                      <Star
                        size={13}
                        fill="currentColor"
                      />
                      Starred
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          /* =========================
             LIST VIEW
          ========================= */

          <div
            className="
              mt-6
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            {/* LIST HEADER */}

            <div
              className="
                hidden
                grid-cols-[minmax(260px,1fr)_120px_150px_90px]
                items-center
                gap-4
                border-b
                border-slate-200
                bg-slate-50
                px-5
                py-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-400
                md:grid
                dark:border-slate-800
                dark:bg-slate-950
              "
            >
              <span>Name</span>
              <span>Type</span>
              <span>Created</span>
              <span></span>
            </div>

            {filteredItems.map(
              (item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="
                    group
                    relative
                    grid
                    grid-cols-[1fr_auto]
                    items-center
                    gap-4
                    border-b
                    border-slate-100
                    px-4
                    py-4
                    last:border-b-0
                    hover:bg-slate-50
                    md:grid-cols-[minmax(260px,1fr)_120px_150px_90px]
                    md:px-5
                    dark:border-slate-800
                    dark:hover:bg-slate-800/50
                  "
                >
                  {/* NAME */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          item.type ===
                          "folder"
                            ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }
                      `}
                    >
                      {item.type ===
                      "folder" ? (
                        <Folder
                          size={22}
                          fill="currentColor"
                        />
                      ) : (
                        getFileIcon(
                          item.fileType,
                          23
                        )
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                        "
                        title={item.name}
                      >
                        {item.name}
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          text-slate-400
                        "
                      >
                        {item.type ===
                        "folder"
                          ? "Folder"
                          : formatSize(
                              item.fileSize
                            )}
                      </p>
                    </div>
                  </div>

                  {/* TYPE */}

                  <div
                    className="
                      hidden
                      text-sm
                      text-slate-500
                      md:block
                      dark:text-slate-400
                    "
                  >
                    {item.type ===
                    "folder"
                      ? "Folder"
                      : "File"}
                  </div>

                  {/* DATE */}

                  <div
                    className="
                      hidden
                      text-sm
                      text-slate-500
                      md:block
                      dark:text-slate-400
                    "
                  >
                    {formatDate(
                      item.createdAt
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div
                    className="
                      flex
                      items-center
                      justify-end
                      gap-1
                    "
                  >
                    <button
                      type="button"
                      disabled={
                        unstarLoading ===
                        item.id
                      }
                      onClick={() =>
                        handleUnstar(
                          item
                        )
                      }
                      title="Remove star"
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        text-amber-500
                        transition
                        hover:bg-amber-50
                        dark:text-amber-400
                        dark:hover:bg-amber-500/10
                      "
                    >
                      {unstarLoading ===
                      item.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Star
                          size={17}
                          fill="currentColor"
                        />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu ===
                              item.id
                              ? null
                              : item.id
                          );
                        }}
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-400
                          hover:bg-slate-100
                          hover:text-slate-700
                          dark:hover:bg-slate-800
                          dark:hover:text-white
                        "
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {activeMenu ===
                        item.id && (
                        <div
                          className="
                            absolute
                            right-0
                            top-10
                            z-40
                            w-44
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            p-1
                            shadow-xl
                            dark:border-slate-700
                            dark:bg-slate-900
                          "
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          {item.type ===
                            "file" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  item
                                )
                              }
                              className="
                                flex
                                w-full
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                text-slate-700
                                hover:bg-slate-50
                                dark:text-slate-200
                                dark:hover:bg-slate-800
                              "
                            >
                              <Download
                                size={16}
                              />
                              Download
                            </button>
                          )}

                          {item.type ===
                            "folder" && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenu(
                                  null
                                );
                                handleOpenFolder(
                                  item.original as StarredFolder
                                );
                              }}
                              className="
                                flex
                                w-full
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                text-slate-700
                                hover:bg-slate-50
                                dark:text-slate-200
                                dark:hover:bg-slate-800
                              "
                            >
                              <Folder
                                size={16}
                              />
                              Open folder
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleUnstar(
                                item
                              )
                            }
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-3
                              py-2.5
                              text-left
                              text-sm
                              text-slate-700
                              hover:bg-slate-50
                              dark:text-slate-200
                              dark:hover:bg-slate-800
                            "
                          >
                            <Star
                              size={16}
                            />
                            Remove star
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* =========================
            FOOTER INFO
        ========================= */}

        {!loading &&
          filteredItems.length >
            0 && (
            <div
              className="
                py-6
                text-center
                text-xs
                text-slate-400
              "
            >
              Showing{" "}
              {filteredItems.length}{" "}
              of {totalCount} starred{" "}
              {totalCount === 1
                ? "item"
                : "items"}
            </div>
          )}
      </div>
    </div>
  );
}

