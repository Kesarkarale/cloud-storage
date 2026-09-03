"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type CloudFile = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  userId: string;
  createdAt: string;
};

export default function FilesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080";

  // =========================
  // GET TOKEN
  // =========================

  function getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }

  // =========================
  // GET USER ID FROM JWT
  // =========================

  function getUserIdFromToken(
    token: string
  ): string | null {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return (
        payload.userId ||
        payload.id ||
        payload.sub ||
        null
      );
    } catch {
      return null;
    }
  }

  // =========================
  // LOAD FILES
  // =========================

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const userId = getUserIdFromToken(token);

      if (!userId) {
        setError(
          "Could not identify your account. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/api/files?userId=${encodeURIComponent(
          userId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to load files."
        );
      }

      const data = await response.json();

      setFiles(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load files."
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl, router]);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // =========================
  // UPLOAD
  // =========================

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const userId = getUserIdFromToken(token);

      if (!userId) {
        throw new Error(
          "Could not identify your account."
        );
      }

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("userId", userId);

      const response = await fetch(
        `${apiUrl}/api/files/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const contentType =
          response.headers.get("content-type");

        let message =
          "File upload failed.";

        if (
          contentType?.includes(
            "application/json"
          )
        ) {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } else {
          const text =
            await response.text();

          if (text.trim()) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const uploadedFile =
        await response.json();

      setFiles((previous) => [
        uploadedFile,
        ...previous,
      ]);

      setSuccess(
        `"${selectedFile.name}" uploaded successfully.`
      );
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

  // =========================
  // DELETE
  // =========================

  async function handleDelete(
    file: CloudFile
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.fileName}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(file.id);

    try {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const userId = getUserIdFromToken(token);

      if (!userId) {
        throw new Error(
          "Could not identify your account."
        );
      }

      const response = await fetch(
        `${apiUrl}/api/files/${file.id}?userId=${encodeURIComponent(
          userId
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message || "File deletion failed."
        );
      }

      setFiles((previous) =>
        previous.filter(
          (item) => item.id !== file.id
        )
      );

      setSuccess(
        `"${file.fileName}" deleted successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "File deletion failed."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================
  // DOWNLOAD
  // =========================

  async function handleDownload(
    file: CloudFile
  ) {
    setError("");

    try {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      /*
       * Your current backend does not yet have
       * a download endpoint.
       *
       * This message prevents a broken request.
       */

      setError(
        "Download API is not available yet. Upload and delete are ready."
      );
    } catch {
      setError("Download failed.");
    }
  }

  // =========================
  // FILE SIZE
  // =========================

  function formatFileSize(
    bytes: number
  ) {
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

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    const size =
      bytes /
      Math.pow(1024, index);

    return `${size.toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;
  }

  // =========================
  // FILE TYPE
  // =========================

  function getFileIcon(
    fileType: string,
    fileName: string
  ) {
    const type =
      fileType?.toLowerCase() || "";

    const extension =
      fileName
        .split(".")
        .pop()
        ?.toLowerCase();

    if (type.includes("image")) {
      return "🖼️";
    }

    if (type.includes("pdf")) {
      return "📕";
    }

    if (
      type.includes("word") ||
      extension === "doc" ||
      extension === "docx"
    ) {
      return "📘";
    }

    if (
      type.includes("excel") ||
      type.includes("spreadsheet") ||
      extension === "xls" ||
      extension === "xlsx"
    ) {
      return "📗";
    }

    if (
      type.includes("zip") ||
      type.includes("rar") ||
      extension === "zip" ||
      extension === "rar"
    ) {
      return "🗜️";
    }

    if (
      type.includes("video")
    ) {
      return "🎬";
    }

    if (
      type.includes("audio")
    ) {
      return "🎵";
    }

    if (
      type.includes("text") ||
      extension === "txt"
    ) {
      return "📄";
    }

    return "📁";
  }

  // =========================
  // DATE
  // =========================

  function formatDate(
    date: string
  ) {
    if (!date) {
      return "Unknown";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Unknown";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          HEADER
      ========================= */}

      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              C
            </div>

            <div>
              <p className="font-bold">
                CloudStore
              </p>

              <p className="text-xs text-slate-500">
                Cloud Storage
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Dashboard
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem(
                  "token"
                );

                router.replace("/login");
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Page Header */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="mb-2 text-sm font-medium text-blue-400">
              MY STORAGE
            </p>

            <h1 className="text-3xl font-bold">
              My Files
            </h1>

            <p className="mt-2 text-slate-400">
              Upload, manage and organize
              your cloud files.
            </p>

          </div>

          <div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
            />

            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-xl">
                +
              </span>

              {uploading
                ? "Uploading..."
                : "Upload File"}
            </button>

          </div>

        </div>

        {/* =========================
            ALERTS
        ========================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">

            <span>⚠️</span>

            <p>{error}</p>

          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">

            <span>✓</span>

            <p>{success}</p>

          </div>
        )}

        {/* =========================
            STORAGE CARD
        ========================= */}

        <div className="mb-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

            <p className="text-sm text-slate-400">
              Total files
            </p>

            <p className="mt-2 text-3xl font-bold">
              {files.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

            <p className="text-sm text-slate-400">
              Total storage
            </p>

            <p className="mt-2 text-3xl font-bold">
              {formatFileSize(
                files.reduce(
                  (total, file) =>
                    total +
                    (file.fileSize ||
                      0),
                  0
                )
              )}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

            <p className="text-sm text-slate-400">
              Storage status
            </p>

            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-400">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

              Active

            </p>

          </div>

        </div>

        {/* =========================
            FILE LIST
        ========================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="font-semibold">
                All Files
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {files.length}{" "}
                {files.length === 1
                  ? "file"
                  : "files"}
              </p>

            </div>

            <button
              onClick={loadFiles}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              ↻ Refresh
            </button>

          </div>

          {/* Loading */}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">

              <div className="text-center">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                <p className="text-sm text-slate-500">
                  Loading your files...
                </p>

              </div>

            </div>
          ) : files.length === 0 ? (

            /* Empty State */

            <div className="flex min-h-80 items-center justify-center px-6">

              <div className="max-w-md text-center">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">
                  ☁️
                </div>

                <h3 className="text-xl font-semibold">
                  No files yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Upload your first file to
                  start using your CloudStore.
                </p>

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  Upload your first file
                </button>

              </div>

            </div>

          ) : (

            /* Files */

            <div className="divide-y divide-slate-800">

              {files.map((file) => (

                <div
                  key={file.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-800/30 md:flex-row md:items-center md:justify-between"
                >

                  {/* File Info */}

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                      {getFileIcon(
                        file.fileType,
                        file.fileName
                      )}
                    </div>

                    <div className="min-w-0">

                      <p
                        className="truncate font-medium text-white"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">

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

                        <span className="truncate">
                          {file.fileType ||
                            "Unknown type"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="flex shrink-0 items-center gap-2">

                    <button
                      onClick={() =>
                        handleDownload(file)
                      }
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      Download
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(file)
                      }
                      disabled={
                        deletingId ===
                        file.id
                      }
                      className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      file.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* =========================
            FOOTER NOTE
        ========================= */}

        <p className="mt-6 text-center text-xs text-slate-600">
          Your files are associated with your
          CloudStore account.
        </p>

      </div>

    </main>
  );
}
