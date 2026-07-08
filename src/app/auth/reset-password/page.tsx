"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, LoaderCircle, Eye, EyeOff } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500">Yaroqsiz havola. Parolni tiklash tokeni topilmadi.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }
    if (password !== confirm) {
      setError("Parollar bir-biriga mos kelmadi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xatolik yuz berdi");
      } else {
        setMessage("Parol muvaffaqiyatli yangilandi!");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="p-3 rounded-lg bg-success/10 text-success text-sm text-center">{message}</div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm text-center">{error}</div>
      )}

      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Yangi parol"
          className="input pl-10 pr-10 w-full"
          required
          minLength={6}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Parolni takrorlang"
          className="input pl-10 w-full"
          required
          minLength={6}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
        {loading ? <LoaderCircle className="w-5 h-5 animate-spin mx-auto" /> : "Parolni yangilash"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text dark:text-text-dark">Parolni tiklash</h1>
            <p className="text-muted text-sm mt-2">Yangi parol kiriting</p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center py-8">
              <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            </div>
          }>
            <ResetForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
