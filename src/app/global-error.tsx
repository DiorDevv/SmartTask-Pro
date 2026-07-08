"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Global error boundary caught:", error);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-text dark:text-text-dark">Xatolik yuz berdi</h1>
            <p className="text-muted">Nimadir noto'g'ri ketdi. Qayta urinib ko'ring.</p>
            <button onClick={reset} className="btn-primary btn-md">
              Qayta urinish
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
