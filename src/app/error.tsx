"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Xatolik yuz berdi</h1>
        <p className="text-muted">Nimadir noto'g'ri ketdi. Qayta urinib ko'ring.</p>
        <button onClick={reset} className="btn-primary btn-md">
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
