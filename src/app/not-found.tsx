import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-bold text-text dark:text-text-dark">Sahifa topilmadi</h2>
        <p className="text-muted">Qidirgan sahifangiz mavjud emas yoki o'chirilgan.</p>
        <Link href="/dashboard" className="btn-primary btn-md inline-flex">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
