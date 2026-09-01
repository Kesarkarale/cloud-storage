"use client";

import Link from "next/link";
import {
  Archive,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Copy,
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  Grid2X2,
  Home,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type Theme = "light" | "dark";

type FileType =
  | "folder"
  | "pdf"
  | "image"
  | "document"
  | "archive"
  | "file";

type DriveFile = {
  id: number;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  location: string;
  starred: boolean;
  shared: boolean;
};

/* =========================================================
   DEMO DATA
========================================================= */

const initialFiles: DriveFile[] = [
  {
    id: 1,
    name: "College Project",
    type: "folder",
    size: "—",
    modified: "Today",
    location: "My Drive",
    starred: true,
    shared: false,
  },
  {
    id: 2,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "Today",
    location: "My Drive",
    starred: true,
    shared: true,
  },
  {
    id: 3,
    name: "Presentation.pptx",
    type: "document",
    size: "5.8 MB",
    modified: "Yesterday",
    location: "My Drive",
    starred: false,
    shared: true,
  },
  {
    id: 4,
    name: "Database.sql",
    type: "file",
    size: "1.2 MB",
    modified: "Yesterday",
    location: "My Drive",
    starred: false,
    shared: false,
  },
  {
    id: 5,
    name: "Project Images",
    type: "folder",
    size: "—",
    modified: "Aug 30",
    location: "My Drive",
    starred: false,
    shared: false,
  },
  {
    id: 6,
    name: "UI Design.png",
    type: "image",
    size: "3.1 MB",
    modified: "Aug 29",
    location: "My Drive",
    starred: true,
    shared: false,
  },
  {
    id: 7,
    name: "Source Code.zip",
    type: "archive",
    size: "18.5 MB",
    modified: "Aug 28",
    location: "My Drive",
    starred: false,
    shared: true,
  },
  {
    id: 8,
    name: "Notes.docx",
    type: "document",
    size: "820 KB",
    modified: "Aug 27",
    location: "My Drive",
    starred: false,
    shared: false,
  },
];

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [theme, setTheme] = useState<Theme>("dark");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [activePage, setActivePage] =
    useState("My Drive");

  const [files, setFiles] =
    useState<DriveFile[]>(initialFiles);

  const [search, setSearch] = useState("");

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [shareOpen, setShareOpen] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<DriveFile | null>(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     THEME
  ======================================================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "cloudvault-theme"
      ) as Theme | null;

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "cloudvault-theme",
      theme
    );
  }, [theme]);

  /* =======================================================
     FILTER FILES
  ======================================================= */

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (activePage === "Starred") {
      result = result.filter(
        (file) => file.starred
      );
    }

    if (activePage === "Shared with me") {
      result = result.filter(
        (file) => file.shared
      );
    }

    if (activePage === "Trash") {
      result = [];
    }

    if (search.trim()) {
      const query =
        search.toLowerCase();

      result = result.filter((file) =>
        file.name
          .toLowerCase()
          .includes(query)
      );
    }

    return result;
  }, [files, activePage, search]);

  /* =======================================================
     TOGGLE STAR
  ======================================================= */

  function toggleStar(id: number) {
    setFiles((current) =>
      current.map((file) =>
        file.id === id
          ? {
              ...file,
              starred: !file.starred,
            }
          : file
      )
    );
  }

  /* =======================================================
     OPEN SHARE
  ======================================================= */

  function openShare(file: DriveFile) {
    setSelectedFile(file);
    setShareOpen(true);
  }

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  function downloadFile(file: DriveFile) {
    alert(
      `Download API will be connected for: ${file.name}`
    );
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function deleteFile(id: number) {
    setFiles((current) =>
      current.filter(
        (file) => file.id !== id
      )
    );
  }

  /* =======================================================
     UPLOAD
  ======================================================= */

  function handleFiles(
    selectedFiles: FileList | null
  ) {
    if (!selectedFiles) return;

    const newFiles: DriveFile[] =
      Array.from(selectedFiles).map(
        (file, index) => ({
          id:
            Date.now() + index,
          name: file.name,
          type: getFileType(file.name),
          size: formatFileSize(
            file.size
          ),
          modified: "Just now",
          location: "My Drive",
          starred: false,
          shared: false,
        })
      );

    setFiles((current) => [
      ...newFiles,
      ...current,
    ]);

    setUploadOpen(false);
  }

  function handleInputUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(false);

    handleFiles(
      event.dataTransfer.files
    );
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function navigate(page: string) {
    setActivePage(page);
    setSidebarOpen(false);
    setSearch("");
  }

  /* =======================================================
     THEME CLASSES
  ======================================================= */

  const dark = theme === "dark";

  return (
    <div
      className={
        dark
          ? "min-h-screen bg-[#070b14] text-white"
          : "min-h-screen bg-[#f7f9fc] text-slate-900"
      }
    >
      {/* ===================================================
          MOBILE OVERLAY
      ==================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      ==================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] border-r transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          dark
            ? "border-white/[0.07] bg-[#090e19]"
            : "border-slate-200 bg-white"
        }`}
      >
        {/* Logo */}

        <div
          className={`flex h-[76px] items-center justify-between border-b px-6 ${
            dark
              ? "border-white/[0.07]"
              : "border-slate-200"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Cloud className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                Cloud<span className="text-blue-500">
                  Vault
                </span>
              </p>

              <p
                className={`text-[10px] ${
                  dark
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                Secure Storage
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload */}

        <div className="px-5 py-5">
          <button
            type="button"
            onClick={() =>
              setUploadOpen(true)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />

            New
          </button>
        </div>

        {/* Navigation */}

        <nav className="px-3">

          <SidebarItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={
              activePage === "Dashboard"
            }
            dark={dark}
            onClick={() =>
              navigate("Dashboard")
            }
          />

          <SidebarItem
            icon={<Home />}
            label="My Drive"
            active={
              activePage === "My Drive"
            }
            dark={dark}
            onClick={() =>
              navigate("My Drive")
            }
          />

          <SidebarItem
            icon={<Star />}
            label="Starred"
            active={
              activePage === "Starred"
            }
            dark={dark}
            onClick={() =>
              navigate("Starred")
            }
          />

          <SidebarItem
            icon={<Users />}
            label="Shared with me"
            active={
              activePage === "Shared with me"
            }
            dark={dark}
            onClick={() =>
              navigate("Shared with me")
            }
          />

          <SidebarItem
            icon={<Archive />}
            label="Recent"
            active={
              activePage === "Recent"
            }
            dark={dark}
            onClick={() =>
              navigate("Recent")
            }
          />

          <SidebarItem
            icon={<Trash2 />}
            label="Trash"
            active={
              activePage === "Trash"
            }
            dark={dark}
            onClick={() =>
              navigate("Trash")
            }
          />
        </nav>

        {/* Divider */}

        <div
          className={`mx-5 my-5 h-px ${
            dark
              ? "bg-white/[0.06]"
              : "bg-slate-200"
          }`}
        />

        {/* Bottom */}

        <nav className="px-3">

          <SidebarItem
            icon={<Settings />}
            label="Settings"
            active={
              activePage === "Settings"
            }
            dark={dark}
            onClick={() =>
              navigate("Settings")
            }
          />

          <SidebarItem
            icon={<ShieldCheck />}
            label="Security"
            active={
              activePage === "Security"
            }
            dark={dark}
            onClick={() =>
              navigate("Security")
            }
          />
        </nav>

        {/* Storage */}

        <div className="absolute bottom-5 left-4 right-4">

          <div
            className={`rounded-2xl border p-4 ${
              dark
                ? "border-white/[0.07] bg-white/[0.025]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">

              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-500" />

                <span className="text-xs font-semibold">
                  Storage
                </span>
              </div>

              <span
                className={`text-[10px] ${
                  dark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                65%
              </span>
            </div>

            <div
              className={`h-1.5 overflow-hidden rounded-full ${
                dark
                  ? "bg-white/[0.08]"
                  : "bg-slate-200"
              }`}
            >
              <div className="h-full w-[65%] rounded-full bg-blue-600" />
            </div>

            <p
              className={`mt-2 text-[10px] ${
                dark
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
            >
              6.5 GB of 10 GB used
            </p>

            <button
              type="button"
              className="mt-3 text-[11px] font-semibold text-blue-500 hover:text-blue-400"
            >
              Manage storage
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      ==================================================== */}

      <div className="lg:pl-[270px]">

        {/* =================================================
            TOPBAR
        ================================================== */}

        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
            dark
              ? "border-white/[0.07] bg-[#070b14]/85"
              : "border-slate-200 bg-white/85"
          }`}
        >
          <div className="flex h-[76px] items-center gap-4 px-4 sm:px-6 lg:px-8">

            {/* Mobile menu */}

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}

            <div className="relative max-w-2xl flex-1">

              <Search
                className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  dark
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search files and folders..."
                className={`h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition ${
                  dark
                    ? "border-white/[0.08] bg-white/[0.035] text-white placeholder:text-slate-600 focus:border-blue-500/50"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                }`}
              />
            </div>

            {/* Right actions */}

            <div className="flex items-center gap-1 sm:gap-2">

              {/* Theme */}

              <button
                type="button"
                onClick={() =>
                  setTheme(
                    dark
                      ? "light"
                      : "dark"
                  )
                }
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  dark
                    ? "text-slate-400 hover:bg-white/5 hover:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-label="Toggle theme"
              >
                {dark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {/* Notification */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setNotificationOpen(
                      !notificationOpen
                    )
                  }
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
                    dark
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Bell className="h-4 w-4" />

                  <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                </button>

                {notificationOpen && (
                  <div
                    className={`absolute right-0 top-12 w-80 rounded-2xl border p-4 shadow-2xl ${
                      dark
                        ? "border-white/[0.08] bg-[#0d1422]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Notifications
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setNotificationOpen(
                            false
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div
                      className={`mt-4 rounded-xl p-3 ${
                        dark
                          ? "bg-white/[0.03]"
                          : "bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-medium">
                        Welcome to CloudVault
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          dark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Your cloud storage is ready.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}

              <div className="relative ml-1">

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                  className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white/5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    U
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold">
                      User
                    </p>

                    <p
                      className={`text-[10px] ${
                        dark
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      Account
                    </p>
                  </div>

                  <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
                </button>

                {profileOpen && (
                  <div
                    className={`absolute right-0 top-12 w-56 rounded-2xl border p-2 shadow-2xl ${
                      dark
                        ? "border-white/[0.08] bg-[#0d1422]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("Settings")
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>

                    <div
                      className={`my-1 h-px ${
                        dark
                          ? "bg-white/[0.07]"
                          : "bg-slate-200"
                      }`}
                    />

                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================== */}

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">

          {/* Breadcrumb */}

          <div className="mb-7 flex items-center gap-2 text-xs">

            <Home
              className={`h-3.5 w-3.5 ${
                dark
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
            />

            <ChevronRight
              className={`h-3 w-3 ${
                dark
                  ? "text-slate-700"
                  : "text-slate-300"
              }`}
            />

            <span
              className={
                dark
                  ? "font-medium text-slate-300"
                  : "font-medium text-slate-600"
              }
            >
              {activePage}
            </span>
          </div>

          {/* Heading */}

          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
                Cloud Storage
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {activePage === "My Drive"
                  ? "My Drive"
                  : activePage}
              </h1>

              <p
                className={`mt-2 text-sm ${
                  dark
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                Manage and organize your files
                securely.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setUploadOpen(true)
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>

              <button
                type="button"
                onClick={() =>
                  setUploadOpen(true)
                }
                className={`hidden items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium sm:flex ${
                  dark
                    ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <Folder className="h-4 w-4" />
                New folder
              </button>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================== */}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              dark={dark}
              icon={<FolderOpen />}
              title="Total Files"
              value="128"
              detail="+12 this month"
            />

            <StatCard
              dark={dark}
              icon={<Share2 />}
              title="Shared Files"
              value="24"
              detail="8 with you"
            />

            <StatCard
              dark={dark}
              icon={<Star />}
              title="Starred"
              value="18"
              detail="Important files"
            />

            <StatCard
              dark={dark}
              icon={<Cloud />}
              title="Storage Used"
              value="6.5 GB"
              detail="of 10 GB"
              progress
            />
          </div>

          {/* =================================================
              STORAGE BANNER
          ================================================== */}

          <div
            className={`mb-8 overflow-hidden rounded-2xl border p-5 ${
              dark
                ? "border-blue-500/10 bg-gradient-to-r from-blue-500/[0.08] to-transparent"
                : "border-blue-100 bg-gradient-to-r from-blue-50 to-white"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Your files are protected
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      dark
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    Your storage is secured with
                    authenticated access.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">

                <div className="hidden w-32 sm:block">

                  <div
                    className={`mb-1.5 h-1.5 rounded-full ${
                      dark
                        ? "bg-white/[0.08]"
                        : "bg-slate-200"
                    }`}
                  >
                    <div className="h-full w-[65%] rounded-full bg-blue-500" />
                  </div>

                  <p className="text-[10px] text-slate-500">
                    65% used
                  </p>
                </div>

                <button
                  type="button"
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              FILE SECTION
          ================================================== */}

          <section>

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  {activePage === "My Drive"
                    ? "Your Files"
                    : activePage}
                </h2>

                <p
                  className={`mt-1 text-xs ${
                    dark
                      ? "text-slate-600"
                      : "text-slate-400"
                  }`}
                >
                  {filteredFiles.length} items
                </p>
              </div>

              <div className="flex items-center gap-2">

                {/* Sort */}

                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                    dark
                      ? "border-white/[0.08] bg-white/[0.025] text-slate-400"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  Modified
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* View */}

                <div
                  className={`flex rounded-lg border p-1 ${
                    dark
                      ? "border-white/[0.08] bg-white/[0.025]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setView("grid")
                    }
                    className={`rounded-md p-1.5 ${
                      view === "grid"
                        ? "bg-blue-500/10 text-blue-500"
                        : "text-slate-500"
                    }`}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setView("list")
                    }
                    className={`rounded-md p-1.5 ${
                      view === "list"
                        ? "bg-blue-500/10 text-blue-500"
                        : "text-slate-500"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty Trash */}

            {activePage === "Trash" ? (
              <EmptyState
                dark={dark}
                icon={<Trash2 />}
                title="Trash is empty"
                description="Deleted files will appear here."
              />
            ) : filteredFiles.length ===
              0 ? (
              <EmptyState
                dark={dark}
                icon={<Search />}
                title="No files found"
                description="Try another search term."
              />
            ) : view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {filteredFiles.map(
                  (file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      dark={dark}
                      onStar={() =>
                        toggleStar(file.id)
                      }
                      onShare={() =>
                        openShare(file)
                      }
                      onDownload={() =>
                        downloadFile(file)
                      }
                      onDelete={() =>
                        deleteFile(file.id)
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div
                className={`overflow-hidden rounded-2xl border ${
                  dark
                    ? "border-white/[0.07]"
                    : "border-slate-200"
                }`}
              >
                {filteredFiles.map(
                  (file) => (
                    <ListFile
                      key={file.id}
                      file={file}
                      dark={dark}
                      onStar={() =>
                        toggleStar(file.id)
                      }
                      onShare={() =>
                        openShare(file)
                      }
                      onDownload={() =>
                        downloadFile(file)
                      }
                      onDelete={() =>
                        deleteFile(file.id)
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* Footer */}

          <footer
            className={`mt-14 border-t pt-6 text-center text-xs ${
              dark
                ? "border-white/[0.06] text-slate-700"
                : "border-slate-200 text-slate-400"
            }`}
          >
            CloudVault • Secure Cloud Storage
          </footer>
        </main>
      </div>

      {/* =====================================================
          UPLOAD MODAL
      ====================================================== */}

      {uploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

          <div
            className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${
              dark
                ? "border-white/[0.08] bg-[#0c1320]"
                : "border-slate-200 bg-white"
            }`}
          >

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-bold">
                  Upload files
                </h3>

                <p
                  className={`mt-1 text-xs ${
                    dark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  Upload your files securely.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUploadOpen(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() =>
                setDragActive(false)
              }
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : dark
                  ? "border-white/[0.1] bg-white/[0.02] hover:border-blue-500/40"
                  : "border-slate-200 bg-slate-50 hover:border-blue-400"
              }`}
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Upload className="h-6 w-6 text-blue-500" />
              </div>

              <p className="mt-5 text-sm font-semibold">
                Drop files here
              </p>

              <p
                className={`mt-2 text-xs ${
                  dark
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                or click to browse from your computer
              </p>

              <p className="mt-4 text-[10px] text-slate-500">
                Supports documents, images, archives and
                other files
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleInputUpload}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setUploadOpen(false)
              }
              className={`mt-5 w-full rounded-xl border py-3 text-sm font-medium ${
                dark
                  ? "border-white/[0.08] hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          SHARE MODAL
      ====================================================== */}

      {shareOpen && selectedFile && (
        <ShareModal
          file={selectedFile}
          dark={dark}
          onClose={() =>
            setShareOpen(false)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active,
  dark,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  dark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-blue-500/10 font-semibold text-blue-500"
          : dark
          ? "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  detail,
  dark,
  progress = false,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  detail: string;
  dark: boolean;
  progress?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        dark
          ? "border-white/[0.07] bg-white/[0.025]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">

        <div>
          <p
            className={`text-xs ${
              dark
                ? "text-slate-500"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      </div>

      {progress ? (
        <div className="mt-4">

          <div
            className={`h-1.5 rounded-full ${
              dark
                ? "bg-white/[0.07]"
                : "bg-slate-100"
            }`}
          >
            <div className="h-full w-[65%] rounded-full bg-blue-500" />
          </div>

          <p
            className={`mt-2 text-[10px] ${
              dark
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            {detail}
          </p>
        </div>
      ) : (
        <p
          className={`mt-3 text-[11px] ${
            dark
              ? "text-slate-600"
              : "text-slate-400"
          }`}
        >
          {detail}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FILE CARD
========================================================= */

function FileCard({
  file,
  dark,
  onStar,
  onShare,
  onDownload,
  onDelete,
}: {
  file: DriveFile;
  dark: boolean;
  onStar: () => void;
  onShare: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <div
      className={`group relative rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 ${
        dark
          ? "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
      }`}
    >

      {/* Preview */}

      <div
        className={`relative mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl ${
          dark
            ? "bg-white/[0.025]"
            : "bg-slate-50"
        }`}
      >
        <FileIcon
          type={file.type}
          large
        />

        {file.starred && (
          <div className="absolute right-3 top-3 rounded-lg bg-black/10 p-1.5 backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Name */}

      <div className="flex items-start justify-between gap-2">

        <div className="min-w-0">

          <p className="truncate text-sm font-semibold">
            {file.name}
          </p>

          <p
            className={`mt-1 text-[11px] ${
              dark
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            {file.type === "folder"
              ? "Folder"
              : `${file.size} • ${file.modified}`}
          </p>
        </div>

        {/* Menu */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="rounded-lg p-1.5 text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <FileMenu
              dark={dark}
              onClose={() =>
                setMenuOpen(false)
              }
              onShare={onShare}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>

      {/* Actions */}

      <div
        className={`mt-4 flex items-center justify-between border-t pt-3 ${
          dark
            ? "border-white/[0.05]"
            : "border-slate-100"
        }`}
      >

        <button
          type="button"
          onClick={onStar}
          className="rounded-lg p-1.5"
          title="Star"
        >
          <Star
            className={`h-4 w-4 ${
              file.starred
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-500"
            }`}
          />
        </button>

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={onShare}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LIST FILE
========================================================= */

function ListFile({
  file,
  dark,
  onStar,
  onShare,
  onDownload,
  onDelete,
}: {
  file: DriveFile;
  dark: boolean;
  onStar: () => void;
  onShare: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center ${
        dark
          ? "border-white/[0.05] hover:bg-white/[0.02]"
          : "border-slate-100 hover:bg-slate-50"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            dark
              ? "bg-white/[0.04]"
              : "bg-slate-50"
          }`}
        >
          <FileIcon type={file.type} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {file.name}
          </p>

          <p
            className={`mt-1 text-xs ${
              dark
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            {file.size} • {file.modified}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">

        <button
          type="button"
          onClick={onStar}
          className="rounded-lg p-2 text-slate-500 hover:bg-yellow-500/10"
        >
          <Star
            className={`h-4 w-4 ${
              file.starred
                ? "fill-yellow-400 text-yellow-400"
                : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={onShare}
          className="rounded-lg p-2 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="rounded-lg p-2 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   FILE MENU
========================================================= */

function FileMenu({
  dark,
  onClose,
  onShare,
  onDownload,
  onDelete,
}: {
  dark: boolean;
  onClose: () => void;
  onShare: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`absolute right-0 top-9 z-20 w-44 rounded-xl border p-1.5 shadow-2xl ${
        dark
          ? "border-white/[0.08] bg-[#0d1422]"
          : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          onShare();
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>

      <button
        type="button"
        onClick={() => {
          onDownload();
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5"
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </button>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(
            "CloudVault share link"
          );
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy link
      </button>

      <div
        className={`my-1 h-px ${
          dark
            ? "bg-white/[0.06]"
            : "bg-slate-100"
        }`}
      />

      <button
        type="button"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 hover:bg-red-500/5"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Move to trash
      </button>
    </div>
  );
}

/* =========================================================
   SHARE MODAL
========================================================= */

function ShareModal({
  file,
  dark,
  onClose,
}: {
  file: DriveFile;
  dark: boolean;
  onClose: () => void;
}) {
  const [permission, setPermission] =
    useState<"Viewer" | "Editor">(
      "Viewer"
    );

  const [email, setEmail] =
    useState("");

  const [linkCopied, setLinkCopied] =
    useState(false);

  function copyLink() {
    navigator.clipboard?.writeText(
      "https://cloudvault.app/share/file"
    );

    setLinkCopied(true);

    setTimeout(
      () => setLinkCopied(false),
      1800
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
          dark
            ? "border-white/[0.08] bg-[#0c1320]"
            : "border-slate-200 bg-white"
        }`}
      >

        <div className="flex items-start justify-between">

          <div>
            <h3 className="text-xl font-bold">
              Share file
            </h3>

            <p
              className={`mt-1 max-w-[300px] truncate text-xs ${
                dark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              {file.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Email */}

        <div className="mt-6">

          <label className="mb-2 block text-xs font-semibold">
            Add people
          </label>

          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter email address"
            className={`h-11 w-full rounded-xl border px-4 text-sm outline-none ${
              dark
                ? "border-white/[0.08] bg-white/[0.03] placeholder:text-slate-700 focus:border-blue-500"
                : "border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:border-blue-400"
            }`}
          />
        </div>

        {/* Permission */}

        <div className="mt-5">

          <label className="mb-2 block text-xs font-semibold">
            Permission
          </label>

          <div className="grid grid-cols-2 gap-2">

            <PermissionButton
              active={
                permission === "Viewer"
              }
              title="Viewer"
              description="Can view & download"
              dark={dark}
              onClick={() =>
                setPermission("Viewer")
              }
            />

            <PermissionButton
              active={
                permission === "Editor"
              }
              title="Editor"
              description="Can modify files"
              dark={dark}
              onClick={() =>
                setPermission("Editor")
              }
            />
          </div>
        </div>

        {/* Share button */}

        <button
          type="button"
          onClick={() =>
            alert(
              `Share ${file.name} with ${email} as ${permission}`
            )
          }
          className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Share
        </button>

        {/* Public link */}

        <div
          className={`my-6 h-px ${
            dark
              ? "bg-white/[0.07]"
              : "bg-slate-200"
          }`}
        />

        <div>

          <p className="text-xs font-semibold">
            Public link
          </p>

          <p
            className={`mt-1 text-[11px] ${
              dark
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            Anyone with the link can access
            this file.
          </p>

          <button
            type="button"
            onClick={copyLink}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold ${
              dark
                ? "border-white/[0.08] hover:bg-white/5"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Link copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy share link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PERMISSION BUTTON
========================================================= */

function PermissionButton({
  active,
  title,
  description,
  dark,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  dark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition ${
        active
          ? "border-blue-500 bg-blue-500/10"
          : dark
          ? "border-white/[0.08] bg-white/[0.02]"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-xs font-semibold ${
          active
            ? "text-blue-500"
            : ""
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-1 text-[10px] ${
          dark
            ? "text-slate-600"
            : "text-slate-400"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
  dark,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed p-14 text-center ${
        dark
          ? "border-white/[0.08]"
          : "border-slate-200"
      }`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p
        className={`mt-2 text-sm ${
          dark
            ? "text-slate-600"
            : "text-slate-400"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FILE ICON
========================================================= */

function FileIcon({
  type,
  large = false,
}: {
  type: FileType;
  large?: boolean;
}) {
  const className = large
    ? "h-12 w-12"
    : "h-5 w-5";

  if (type === "folder") {
    return (
      <Folder
        className={`${className} text-blue-500`}
      />
    );
  }

  if (type === "pdf") {
    return (
      <FileText
        className={`${className} text-red-400`}
      />
    );
  }

  if (type === "image") {
    return (
      <FileImage
        className={`${className} text-purple-400`}
      />
    );
  }

  if (type === "document") {
    return (
      <FileText
        className={`${className} text-blue-400`}
      />
    );
  }

  if (type === "archive") {
    return (
      <FileArchive
        className={`${className} text-yellow-500`}
      />
    );
  }

  return (
    <File
      className={`${className} text-slate-400`}
    />
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getFileType(
  filename: string
): FileType {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  if (
    ["png", "jpg", "jpeg", "gif", "webp"].includes(
      extension
    )
  ) {
    return "image";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (
    ["doc", "docx", "ppt", "pptx", "txt"].includes(
      extension
    )
  ) {
    return "document";
  }

  if (
    ["zip", "rar", "7z"].includes(
      extension
    )
  ) {
    return "archive";
  }

  return "file";
}

function formatFileSize(
  bytes: number
): string {
  if (bytes === 0) return "0 Bytes";

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
  ).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}
