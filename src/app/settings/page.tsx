"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  AlertCircle,
} from "lucide-react";
import { useThemeStore } from "@/store/theme-store";
import { useUser, useUpdateUser } from "@/hooks/use-settings";

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("Asia/Tashkent");
  const [lang, setLang] = useState("uz");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setTimezone(user.timezone || "Asia/Tashkent");
      setLang(user.language || "uz");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    await updateUser.mutateAsync({ name, timezone } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as any);
    await updateUser.mutateAsync({ theme: newTheme } as any);
  };

  const handleLanguageChange = async (newLang: string) => {
    setLang(newLang);
    await updateUser.mutateAsync({ language: newLang } as any);
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
                        if (file.size > 1_048_576) { alert("Rasm hajmi 1MB dan oshmasligi kerak"); return; }
                        const formData = new FormData();
                        formData.append("avatar", file);
                        const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
                        if (res.ok) { window.location.reload(); }
                        else { const d = await res.json(); alert(d.error || "Xatolik"); }
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
                    { value: "light", label: "Yorug'", icon: Sun },
                    { value: "dark", label: "Qorong'u", icon: Moon },
                    { value: "system", label: "Tizim", icon: Monitor },
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
                <button className="btn-danger btn-sm" onClick={async () => { if (confirm("Hisobingizni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.")) { await fetch("/api/user", { method: "DELETE" }); window.location.href = "/auth/login"; } }}>Hisobni o'chirish</button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="btn-secondary btn-md">
                  <Database className="w-4 h-4" />
                  Ma'lumotlarni eksport qilish
                </button>
                <button className="btn-secondary btn-md">
                  <Database className="w-4 h-4" />
                  Ma'lumotlarni import qilish
                </button>
                <button className="btn-secondary btn-md">Arxivni tozalash</button>
                <button className="btn-secondary btn-md">Barcha ma'lumotlarni yuklab olish</button>
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
    </div>
  );
}
