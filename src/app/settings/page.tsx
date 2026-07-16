"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Smartphone,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Languages,
  LoaderCircle,
  CheckCircle2,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileDown,
  Archive,
  Trash2,
  KeyRound,
  X,
} from "lucide-react";
import { useThemeStore } from "@/store/theme-store";
import { useUser, useUpdateUser } from "@/hooks/use-settings";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { User as UserType } from "@/types";

const settingsSections = [
  { id: "profile", label: "Profil", icon: User },
  { id: "appearance", label: "Ko'rinish", icon: Palette },
  { id: "notifications", label: "Bildirishnomalar", icon: Bell },
  { id: "language", label: "Til va mintaqa", icon: Globe },
  { id: "security", label: "Xavfsizlik", icon: Shield },
  { id: "data", label: "Ma'lumotlar", icon: Database },
  { id: "devices", label: "Qurilmalar", icon: Smartphone },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const { theme, setTheme } = useThemeStore();
  const { data: user, isLoading } = useUser();
  const updateUser = useUpdateUser();
  const { update } = useSession();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("Asia/Tashkent");
  const [lang, setLang] = useState("uz");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState<"json" | "csv" | "xlsx" | null>(null);
  const [importing, setImporting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setTimezone(user.timezone || "Asia/Tashkent");
      setLang(user.language || "uz");
    }
  }, [user]);

  const handleExport = async (format: "json" | "csv" | "xlsx") => {
    setExporting(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Eksportda xatolik");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reja-export-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${format === "json" ? "JSON" : "CSV"} formatida eksport qilindi`);
    } catch {
      toast.error("Eksportda xatolik yuz berdi");
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json" && ext !== "xlsx") {
      toast.error("Faqat JSON yoki XLSX fayl import qilish mumkin");
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        toast.error(result.error || "Importda xatolik");
      }
    } catch {
      toast.error("Faylni o'qishda xatolik. Fayl formatini tekshiring");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Yangi parollar mos kelmadi");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Parol yangilandi");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (user?.hasPassword && !deletePassword) {
      toast.error("Parolni kiriting");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword || undefined }),
      });
      if (res.ok) {
        window.location.href = "/auth/login";
        return;
      }
      const d = await res.json();
      toast.error(d.error || "Xatolik");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveProfile = async () => {
    await updateUser.mutateAsync({ name, timezone } as Partial<UserType>);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    await updateUser.mutateAsync({ theme: newTheme } as Partial<UserType>);
  };

  const handleLanguageChange = async (newLang: string) => {
    setLang(newLang);
    await updateUser.mutateAsync({ language: newLang } as Partial<UserType>);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Sozlamalar</h1>
        <p className="text-muted text-sm mt-1">Hisob va ilova sozlamalarini boshqaring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-2 space-y-0.5">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeSection === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Profil sozlamalari</h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderCircle className="w-6 h-6 animate-spin text-muted" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                        {(user?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" id="avatar-upload" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 1_048_576) { toast.error("Rasm hajmi 1MB dan oshmasligi kerak"); return; }
                        const formData = new FormData();
                        formData.append("avatar", file);
                        const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
                        if (res.ok) {
                          const data = await res.json();
                          update({ avatar: data.avatar, picture: data.avatar });
                          queryClient.invalidateQueries({ queryKey: ["user"] });
                          toast.success("Rasm yangilandi");
                        } else {
                          const d = await res.json();
                          toast.error(d.error || "Xatolik");
                        }
                      }} />
                      <button className="btn-secondary btn-sm" onClick={() => document.getElementById("avatar-upload")?.click()}>Rasmni o'zgartirish</button>
                      <p className="text-xs text-muted mt-1">PNG, JPG, WEBP. 1MB gacha</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1.5">Ism</label>
                      <input type="text" className="input" placeholder="Ismingiz" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
                      <input type="email" className="input" placeholder="email@example.com" value={email} disabled readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1.5">Vaqt mintaqasi</label>
                      <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                        <option>Asia/Tashkent</option>
                        <option>Asia/Almaty</option>
                        <option>Europe/Moscow</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        Saqlandi
                      </span>
                    )}
                    <button className="btn-primary btn-md" onClick={handleSaveProfile} disabled={updateUser.isPending}>
                      {updateUser.isPending ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeSection === "appearance" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Ko'rinish sozlamalari</h3>

              <div>
                <label className="block text-sm font-medium text-muted mb-3">Mavzu</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light" as const, label: "Yorug'", icon: Sun },
                    { value: "dark" as const, label: "Qorong'u", icon: Moon },
                    { value: "system" as const, label: "Tizim", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === value
                          ? "border-primary bg-primary/5"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${theme === value ? "text-primary" : "text-muted"}`} />
                      <span className={`text-sm font-medium ${theme === value ? "text-primary" : "text-muted"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Bildirishnoma sozlamalari</h3>

              {[
                { title: "Push bildirishnomalar", desc: "Brauzer orqali bildirishnomalar" },
                { title: "Email bildirishnomalar", desc: "Kunlik xulosa va eslatmalar" },
                { title: "Telegram bot", desc: "Telegram orqali eslatmalar" },
                { title: "SMS bildirishnomalar", desc: "Muhim eslatmalar SMS orqali" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text dark:text-text-dark">{item.title}</p>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              ))}
            </motion.div>
          )}

          {activeSection === "language" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Til va mintaqa</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">
                    <Languages className="w-4 h-4 inline mr-1" />
                    Til
                  </label>
                  <select className="input" value={lang} onChange={(e) => handleLanguageChange(e.target.value)}>
                    <option value="uz">O'zbekcha</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Xavfsizlik sozlamalari</h3>

              {user?.hasPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-muted flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Parolni almashtirish
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted mb-1.5">Joriy parol</label>
                      <input
                        type="password"
                        className="input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1.5">Yangi parol</label>
                      <input
                        type="password"
                        className="input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1.5">Yangi parolni tasdiqlang</label>
                      <input
                        type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary btn-md" disabled={changingPassword}>
                      {changingPassword ? "Yangilanmoqda..." : "Parolni yangilash"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted pb-4 border-b border-gray-100 dark:border-gray-700">
                  Hisobingiz ijtimoiy tarmoq orqali yaratilgan, shuning uchun parol o'rnatilmagan.
                </p>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text dark:text-text-dark">Ikki faktorli autentifikatsiya (2FA)</p>
                  <p className="text-xs text-muted">Hisobingizni qo'shimcha himoya qilish</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
                  Hisobni o'chirish
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === "data" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Ma'lumotlar boshqaruvi</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted mb-3">Eksport</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-50"
                      onClick={() => handleExport("json")}
                      disabled={exporting !== null}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <FileJson className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-dark">
                          {exporting === "json" ? "Yuklanmoqda..." : "JSON"}
                        </p>
                        <p className="text-xs text-muted truncate">To'liq ma'lumotlar (subtasks, tags, reminders)</p>
                      </div>
                      {exporting === "json" ? (
                        <LoaderCircle className="w-5 h-5 animate-spin text-muted" />
                      ) : (
                        <Download className="w-5 h-5 text-muted" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-50"
                      onClick={() => handleExport("csv")}
                      disabled={exporting !== null}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-light">
                          {exporting === "csv" ? "Yuklanmoqda..." : "CSV"}
                        </p>
                        <p className="text-xs text-muted truncate">Excel/Google Sheets uchun mos</p>
                      </div>
                      {exporting === "csv" ? (
                        <LoaderCircle className="w-5 h-5 animate-spin text-muted" />
                      ) : (
                        <Download className="w-5 h-5 text-muted" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50"
                      onClick={() => handleExport("xlsx")}
                      disabled={exporting !== null}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <FileDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-light">
                          {exporting === "xlsx" ? "Yuklanmoqda..." : "Excel (XLSX)"}
                        </p>
                        <p className="text-xs text-muted truncate">4 varaqli professional hisobot</p>
                      </div>
                      {exporting === "xlsx" ? (
                        <LoaderCircle className="w-5 h-5 animate-spin text-muted" />
                      ) : (
                        <Download className="w-5 h-5 text-muted" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h4 className="text-sm font-medium text-muted mb-3">Import</h4>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.xlsx"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all w-full disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      {importing ? (
                        <LoaderCircle className="w-5 h-5 animate-spin text-violet-600 dark:text-violet-400" />
                      ) : (
                        <Upload className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text dark:text-text-light">
                        {importing ? "Import qilinmoqda..." : "JSON yoki XLSX import"}
                      </p>
                      <p className="text-xs text-muted truncate">Avvalgi eksport qilingan faylni yuklang (JSON yoki Excel)</p>
                    </div>
                  </motion.button>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h4 className="text-sm font-medium text-muted mb-3">Xavfli hudud</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all"
                      onClick={async () => {
                        if (!confirm("Barcha arxivlangan vazifalarni tozalashni xohlaysizmi?")) return;
                        try {
                          const res = await fetch("/api/tasks?scope=archived", { method: "DELETE" });
                          if (!res.ok) throw new Error();
                          const data = await res.json();
                          toast.success(`${data.deleted} ta arxivlangan vazifa o'chirildi`);
                          queryClient.invalidateQueries({ queryKey: ["tasks"] });
                        } catch {
                          toast.error("Arxivni tozalashda xatolik yuz berdi");
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <Archive className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-light">Arxivni tozalash</p>
                        <p className="text-xs text-muted">Barcha arxivivangan vazifalarni o'chirish</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                      onClick={() => handleExport("json")}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <FileDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-light">Barcha ma'lumotlarni yuklab olish</p>
                        <p className="text-xs text-muted">Butun hisobingizni zaxiralash</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                      onClick={async () => {
                        if (!confirm("Barcha vazifalar, kategoriyalar va taglarni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi!")) return;
                        try {
                          const res = await fetch("/api/clear-data", { method: "POST" });
                          if (!res.ok) throw new Error();
                          toast.success("Barcha ma'lumotlar o'chirildi");
                          queryClient.invalidateQueries({ queryKey: ["tasks"] });
                        } catch {
                          toast.error("Ma'lumotlarni o'chirishda xatolik");
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-light">Barcha ma'lumotlarni o'chirish</p>
                        <p className="text-xs text-muted">Vazifalar, kategoriya va taglarni butunlay o'chirish</p>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "devices" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-text dark:text-text-dark">Faol sessiyalar</h3>

              {[
                { device: "Chrome - Windows", lastActive: "Hozir", current: true },
                { device: "Safari - iPhone", lastActive: "2 soat oldin", current: false },
                { device: "Firefox - Linux", lastActive: "3 kun oldin", current: false },
              ].map((session) => (
                <div key={session.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-xs text-success">(Joriy)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted">{session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="text-sm text-danger hover:underline">Chiqish</button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { if (!deleting) { setShowDeleteModal(false); setDeletePassword(""); } }}
            role="dialog"
            aria-modal="true"
            aria-label="Hisobni o'chirishni tasdiqlash"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-modal border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Hisobni o'chirish</h2>
                <button
                  onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }}
                className="p-6 space-y-4"
              >
                <p className="text-sm text-muted">
                  Bu amalni qaytarib bo'lmaydi. Barcha vazifalaringiz, kategoriyalaringiz va hisobingiz butunlay o'chiriladi.
                </p>
                {user?.hasPassword && (
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1.5">Parolingizni kiriting</label>
                    <input
                      type="password"
                      className="input"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      autoComplete="current-password"
                      autoFocus
                      required
                    />
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn-secondary btn-md"
                    onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                    disabled={deleting}
                  >
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn-danger btn-md" disabled={deleting}>
                    {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
