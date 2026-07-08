"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xatolik yuz berdi");
      } else {
        setMessage(data.message || "Agar email tizimda mavjud bo'lsa, parolni tiklash linki yuboriladi");
        setEmail("");
      }
    } catch {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text dark:text-text-dark">Parolni tiklash</h1>
            <p className="text-muted text-sm mt-2">Email manzilingizni kiriting, biz sizga tiklash linkini yuboramiz</p>
          </div>

          {message && (
            <div className="p-3 rounded-lg bg-success/10 text-success text-sm text-center mb-4">{message}</div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email manzilingiz"
                className="input pl-10 w-full"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? <LoaderCircle className="w-5 h-5 animate-spin mx-auto" /> : "Yuborish"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Kirish sahifasiga qaytish
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
