"use client";

import {
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
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
  function getIcon() {
    const type = file.type.toLowerCase();

    if (
      type.includes("image") ||
      file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      return <FileImage className="h-6 w-6 text-purple-500" />;
    }

    if (
      type.includes("pdf") ||
      file.name.endsWith(".pdf")
    ) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }

    if (
      type.includes("zip") ||
      file.name.match(/\.(zip|rar|7z)$/i)
    ) {
      return <FileArchive className="h-6 w-6 text-yellow-500" />;
    }

    return <File className="h-6 w-6 text-blue-500" />;
  }

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
          {getIcon()}
        </div>

        <button className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-white/10">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 min-w-0">
        <p
          title={file.name}
          className="truncate text-sm font-semibold text-slate-800 dark:text-white"
        >
          {file.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {file.size} · {file.updated}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
        <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-yellow-500 dark:hover:bg-white/10">
          <Star
            className={`h-4 w-4 ${
              file.starred
                ? "fill-yellow-400 text-yellow-400"
                : ""
            }`}
          />
        </button>

        <div className="flex gap-1">
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10">
            <Download className="h-4 w-4" />
          </button>

          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
