import {
  Cloud,
  FileText,
  Image,
  Video,
} from "lucide-react";

export default function StorageCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Storage usage
          </p>

          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            2.4 GB
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full w-[24%] rounded-full bg-blue-600" />
      </div>

      <p className="mt-2 text-xs text-slate-400">
        24% of 10 GB used
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <FileText className="mb-2 h-4 w-4 text-blue-500" />
          <p className="text-xs font-semibold text-slate-800 dark:text-white">
            1.1 GB
          </p>
          <p className="text-[10px] text-slate-400">
            Documents
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <Image className="mb-2 h-4 w-4 text-purple-500" />
          <p className="text-xs font-semibold text-slate-800 dark:text-white">
            800 MB
          </p>
          <p className="text-[10px] text-slate-400">
            Images
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <Video className="mb-2 h-4 w-4 text-orange-500" />
          <p className="text-xs font-semibold text-slate-800 dark:text-white">
            500 MB
          </p>
          <p className="text-[10px] text-slate-400">
            Videos
          </p>
        </div>
      </div>
    </div>
  );
}
