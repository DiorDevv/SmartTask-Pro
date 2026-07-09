"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-text dark:text-text-dark">Xatolik yuz berdi</h2>
        <p className="text-muted text-sm">{error.message}</p>
        <button onClick={reset} className="btn-primary btn-md">Qayta urinish</button>
      </div>
    </div>
  );
}