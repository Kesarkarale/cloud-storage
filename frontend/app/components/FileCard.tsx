"use client";

import {
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileText,
  FileVideo,
  MoreVertical,
  Star,
  Trash2,
} from "lucide-react";

type FileItem = {
  name: string;
  type: string;
  size: string;
  updated: string;
  starred?: boolean;
};

export default function FileCard({
  file,
}: {
  file: FileItem;
}) {
  const fileName = file.name || "Untitled file";

  const extension =
    fileName.includes(".")
      ? fileName.split(".").pop()?.toUpperCase() || "FILE"
      : "FILE";

  function getIcon() {
    const type = file.type.toLowerCase();
    const name = fileName.toLowerCase();

    if (
      type.includes("image") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)$/i.test(name)
    ) {
      return (
        <FileImage className="h-6 w-6 text-purple-500 dark:text-purple-400" />
      );
    }

    if (
      type.includes("video") ||
      /\.(mp4|mkv|mov|avi|webm|flv)$/i.test(name)
    ) {
      return (
        <FileVideo className="h-6 w-6 text-pink-500 dark:text-pink-400" />
      );
    }

    if (
      type.includes("audio") ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)
    ) {
      return (
        <FileAudio className="h-6 w-6 text-orange-500 dark:text-orange-400" />
      );
    }

    if (
      type.includes("pdf") ||
      name.endsWith(".pdf")
    ) {
      return (
        <FileText className="h-6 w-6 text-red-500 dark:text-red-400" />
      );
    }

    if (
      type.includes("zip") ||
      type.includes("archive") ||
      /\.(zip|rar|7z|tar|gz)$/i.test(name)
    ) {
      return (
        <FileArchive className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
      );
    }

    if (
      type.includes("javascript") ||
      type.includes("typescript") ||
      type.includes("json") ||
      type.includes("html") ||
      type.includes("css") ||
      /\.(js|jsx|ts|tsx|json|html|css|scss|java|py|php|cpp|c)$/i.test(name)
    ) {
      return (
        <FileCode2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
      );
    }

    return (
      <File className="h-6 w-6 text-blue-500 dark:text-blue-400" />
    );
  }

  function getIconBackground() {
    const type = file.type.toLowerCase();
    const name = fileName.toLowerCase();

    if (
      type.includes("image") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)$/i.test(name)
    ) {
      return "bg-purple-50 ring-purple-100 dark:bg-purple-500/10 dark:ring-purple-500/20";
    }

    if (
      type.includes("video") ||
      /\.(mp4|mkv|mov|avi|webm|flv)$/i.test(name)
    ) {
      return "bg-pink-50 ring-pink-100 dark:bg-pink-500/10 dark:ring-pink-500/20";
    }

    if (
      type.includes("audio") ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)
    ) {
      return "bg-orange-50 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20";
    }

    if (
      type.includes("pdf") ||
      name.endsWith(".pdf")
    ) {
      return "bg-red-50 ring-red-100 dark:bg-red-500/10 dark:ring-red-500/20";
    }

    if (
      type.includes("zip") ||
      type.includes("archive") ||
      /\.(zip|rar|7z|tar|gz)$/i.test(name)
    ) {
      return "bg-yellow-50 ring-yellow-100 dark:bg-yellow-500/10 dark:ring-yellow-500/20";
    }

    if (
      type.includes("javascript") ||
      type.includes("typescript") ||
      type.includes("json") ||
      type.includes("html") ||
      type.includes("css") ||
      /\.(js|jsx|ts|tsx|json|html|css|scss|java|py|php|cpp|c)$/i.test(name)
    ) {
      return "bg-emerald-50 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20";
    }

    return "bg-blue-50 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20";
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/15 dark:hover:bg-white/[0.06]">
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/10" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${getIconBackground()}`}
        >
          {getIcon()}
        </div>

        <div className="flex items-center gap-1">
          {file.starred && (
            <div className="flex h-8 w-8 items-center justify-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}

          <button
            type="button"
            aria-label={`More options for ${fileName}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* File information */}
      <div className="relative mt-4 min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p
            title={fileName}
            className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-white"
          >
            {fileName}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
            {extension}
          </span>

          <span className="truncate">
            {file.size}
          </span>

          <span className="text-slate-300 dark:text-slate-600">
            •
          </span>

          <span className="truncate">
            {file.updated}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
        <button
          type="button"
          aria-label={
            file.starred
              ? `Remove ${fileName} from starred`
              : `Add ${fileName} to starred`
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-yellow-50 hover:text-yellow-500 dark:hover:bg-yellow-500/10"
        >
          <Star
            className={`h-4 w-4 transition-all ${
              file.starred
                ? "fill-yellow-400 text-yellow-400"
                : ""
            }`}
          />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Download ${fileName}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-500/10"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label={`Delete ${fileName}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
