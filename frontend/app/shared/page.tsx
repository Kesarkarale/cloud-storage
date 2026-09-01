"use client";

import {
  Check,
  ChevronDown,
  Copy,
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
  Link2,
  MoreVertical,
  Search,
  Share2,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type SharedFile = {
  id: number;
  name: string;
  type: string;
  size: string;
  owner: string;
  ownerEmail: string;
  permission: "Viewer" | "Editor";
  sharedDate: string;
  status: "Active" | "Expired";
};

const initialSharedFiles: SharedFile[] = [
  {
    id: 1,
    name: "Project Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    owner: "You",
    ownerEmail: "you@example.com",
    permission: "Editor",
    sharedDate: "Today",
    status: "Active",
  },
  {
    id: 2,
    name: "Presentation.pptx",
    type: "ppt",
    size: "5.8 MB",
    owner: "Rahul Patil",
    ownerEmail: "rahul@example.com",
    permission: "Viewer",
    sharedDate: "Yesterday",
    status: "Active",
  },
  {
    id: 3,
    name: "Database.sql",
    type: "sql",
    size: "1.2 MB",
    owner: "You",
    ownerEmail: "you@example.com",
    permission: "Editor",
    sharedDate: "Aug 29, 2026",
    status: "Active",
  },
  {
    id: 4,
    name: "UI Design.png",
    type: "image",
    size: "3.1 MB",
    owner: "Priya Sharma",
    ownerEmail: "priya@example.com",
    permission: "Viewer",
    sharedDate: "Aug 27, 2026",
    status: "Active",
  },
  {
    id: 5,
    name: "Source Code.zip",
    type: "zip",
    size: "12.7 MB",
    owner: "You",
    ownerEmail: "you@example.com",
    permission: "Editor",
    sharedDate: "Aug 25, 2026",
    status: "Active",
  },
];

export default function SharedPage() {
  const [files, setFiles] =
    useState<SharedFile[]>(initialSharedFiles);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<
    "all" | "sharedByMe" | "sharedWithMe"
  >("all");

  const [showShareModal, setShowShareModal] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<SharedFile | null>(null);

  const [copied, setCopied] = useState(false);

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (activeTab === "sharedByMe") {
      result = result.filter(
        (file) => file.owner === "You"
      );
    }

    if (activeTab === "sharedWithMe") {
      result = result.filter(
        (file) => file.owner !== "You"
      );
    }

    if (search.trim()) {
      result = result.filter((file) =>
        file.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return result;
  }, [files, search, activeTab]);

  function removeShare(id: number) {
    setFiles((current) =>
      current.filter((file) => file.id !== id)
    );

    setSelectedFile(null);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        "https://cloudvault.app/share/project-report"
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Share2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              </div>

              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Collaboration
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Shared Files
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage files you have shared and files shared with you.
            </p>
          </div>

          <button
            onClick={() =>
              setShowShareModal(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <UserPlus className="h-4 w-4" />
            Share a File
          </button>
        </div>

        {/* Stats */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Share2 />}
            label="Total Shared"
            value={String(files.length)}
            description="Shared files"
          />

          <StatCard
            icon={<Users />}
            label="Shared by Me"
            value={String(
              files.filter(
                (file) => file.owner === "You"
              ).length
            )}
            description="Files you shared"
          />

          <StatCard
            icon={<Download />}
            label="Shared with Me"
            value={String(
              files.filter(
                (file) => file.owner !== "You"
              ).length
            )}
            description="Received files"
          />

          <StatCard
            icon={<Link2 />}
            label="Active Links"
            value={String(
              files.filter(
                (file) => file.status === "Active"
              ).length
            )}
            description="Currently active"
          />
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4 dark:border-white/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Tabs */}
              <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                <TabButton
                  active={activeTab === "all"}
                  onClick={() =>
                    setActiveTab("all")
                  }
                >
                  All Files
                </TabButton>

                <TabButton
                  active={
                    activeTab === "sharedByMe"
                  }
                  onClick={() =>
                    setActiveTab("sharedByMe")
                  }
                >
                  Shared by Me
                </TabButton>

                <TabButton
                  active={
                    activeTab === "sharedWithMe"
                  }
                  onClick={() =>
                    setActiveTab("sharedWithMe")
                  }
                >
                  Shared with Me
                </TabButton>
              </div>

              {/* Search */}
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search shared files..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* File List */}
          {filteredFiles.length === 0 ? (
            <EmptyShared />
          ) : (
            <div>
              {/* Desktop heading */}
              <div className="hidden grid-cols-[minmax(260px,1fr)_180px_130px_150px_60px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5 lg:grid">
                <span>File</span>
                <span>Owner</span>
                <span>Permission</span>
                <span>Shared</span>
                <span />
              </div>

              {filteredFiles.map((file) => (
                <SharedFileRow
                  key={file.id}
                  file={file}
                  onSelect={() =>
                    setSelectedFile(file)
                  }
                  onDelete={() =>
                    removeShare(file.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() =>
            setShowShareModal(false)
          }
          onCopy={copyLink}
          copied={copied}
        />
      )}

      {/* Details Modal */}
      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() =>
            setSelectedFile(null)
          }
          onDelete={() =>
            removeShare(selectedFile.id)
          }
          onCopy={copyLink}
          copied={copied}
        />
      )}
    </DashboardShell>
  );
}

/* ================================= */
/* STAT CARD */
/* ================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <span className="text-blue-600 dark:text-blue-400">
            {icon}
          </span>
        </div>

        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ================================= */
/* TAB BUTTON */
/* ================================= */

function TabButton({
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
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ================================= */
/* SHARED FILE ROW */
/* ================================= */

function SharedFileRow({
  file,
  onSelect,
  onDelete,
}: {
  file: SharedFile;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group border-b border-slate-100 px-4 py-4 last:border-0 dark:border-white/5 lg:grid lg:grid-cols-[minmax(260px,1fr)_180px_130px_150px_60px] lg:items-center lg:gap-4 lg:px-5">

      {/* File */}
      <button
        onClick={onSelect}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
          <FileTypeIcon type={file.type} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {file.size}
          </p>
        </div>
      </button>

      {/* Owner */}
      <div className="mt-3 flex items-center gap-2 lg:mt-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white">
          {getInitials(file.owner)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
            {file.owner}
          </p>

          <p className="truncate text-[10px] text-slate-400">
            {file.ownerEmail}
          </p>
        </div>
      </div>

      {/* Permission */}
      <div className="mt-3 lg:mt-0">
        <PermissionBadge
          permission={file.permission}
        />
      </div>

      {/* Date */}
      <div className="mt-3 text-xs text-slate-400 lg:mt-0">
        {file.sharedDate}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-end gap-1 lg:mt-0">
        <button
          onClick={onSelect}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10"
          title="View details"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          title="Remove share"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ================================= */
/* PERMISSION */
/* ================================= */

function PermissionBadge({
  permission,
}: {
  permission: "Viewer" | "Editor";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
        permission === "Editor"
          ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
          : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      }`}
    >
      {permission}
    </span>
  );
}

/* ================================= */
/* FILE TYPE ICON */
/* ================================= */

function FileTypeIcon({
  type,
}: {
  type: string;
}) {
  if (type === "pdf") {
    return (
      <FileText className="h-5.5 w-5.5 text-red-500" />
    );
  }

  if (type === "image") {
    return (
      <FileImage className="h-5.5 w-5.5 text-purple-500" />
    );
  }

  if (type === "zip") {
    return (
      <FileArchive className="h-5.5 w-5.5 text-yellow-500" />
    );
  }

  return (
    <File className="h-5.5 w-5.5 text-blue-500" />
  );
}

/* ================================= */
/* SHARE MODAL */
/* ================================= */

function ShareModal({
  onClose,
  onCopy,
  copied,
}: {
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] =
    useState<"Viewer" | "Editor">("Viewer");

  return (
    <Modal
      title="Share a File"
      onClose={onClose}
    >
      <div className="space-y-5">

        {/* File selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Select file
          </label>

          <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                <FileText className="h-4.5 w-4.5 text-red-500" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Project Report.pdf
                </p>

                <p className="text-xs text-slate-400">
                  2.4 MB
                </p>
              </div>
            </div>

            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="person@example.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* Permission */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Permission
          </label>

          <div className="grid grid-cols-2 gap-3">
            <PermissionOption
              title="Viewer"
              description="Can view and download"
              selected={
                permission === "Viewer"
              }
              onClick={() =>
                setPermission("Viewer")
              }
            />

            <PermissionOption
              title="Editor"
              description="Can view and edit"
              selected={
                permission === "Editor"
              }
              onClick={() =>
                setPermission("Editor")
              }
            />
          </div>
        </div>

        {/* Share link */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Share link
          </label>

          <div className="flex gap-2">
            <input
              readOnly
              value="cloudvault.app/share/project-report"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            />

            <button
              onClick={onCopy}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}

              {copied
                ? "Copied"
                : "Copy"}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            disabled={!email.trim()}
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Share File
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ================================= */
/* PERMISSION OPTION */
/* ================================= */

function PermissionOption({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check className="h-3 w-3" />
        </span>
      )}

      <p className="text-sm font-semibold text-slate-800 dark:text-white">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </button>
  );
}

/* ================================= */
/* FILE DETAILS MODAL */
/* ================================= */

function FileDetailsModal({
  file,
  onClose,
  onDelete,
  onCopy,
  copied,
}: {
  file: SharedFile;
  onClose: () => void;
  onDelete: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <Modal
      title="Shared File Details"
      onClose={onClose}
    >
      <div>

        {/* File */}
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
            <FileTypeIcon type={file.type} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900 dark:text-white">
              {file.name}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {file.size}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-5 space-y-3">
          <DetailRow
            label="Owner"
            value={file.owner}
          />

          <DetailRow
            label="Owner email"
            value={file.ownerEmail}
          />

          <DetailRow
            label="Permission"
            value={file.permission}
          />

          <DetailRow
            label="Shared date"
            value={file.sharedDate}
          />

          <DetailRow
            label="Status"
            value={file.status}
          />
        </div>

        {/* Link */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold text-slate-500">
            Share Link
          </label>

          <div className="flex gap-2">
            <input
              readOnly
              value="cloudvault.app/share/project-report"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            />

            <button
              onClick={onCopy}
              className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500">
            <Download className="h-4 w-4" />
            Download
          </button>

          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Remove Share
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ================================= */
/* DETAIL ROW */
/* ================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-white/5">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ================================= */
/* EMPTY */
/* ================================= */

function EmptyShared() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Share2 className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="mt-5 font-semibold text-slate-900 dark:text-white">
        No shared files found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        Files that you share or receive from other users
        will appear here.
      </p>
    </div>
  );
}

/* ================================= */
/* MODAL */
/* ================================= */

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================================= */
/* HELPERS */
/* ================================= */

function getInitials(name: string) {
  if (name === "You") {
    return "YO";
  }

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
