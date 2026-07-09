import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
      </div>
    </div>
  );
}