"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Component, useEffect } from "react";
import { Toaster } from "sonner";
import { useThemeStore } from "@/store/theme-store";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    setTheme(stored || "system");
  }, [setTheme]);

  return <>{children}</>;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("ErrorBoundary:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-text dark:text-text-dark">Xatolik yuz berdi</h1>
            <p className="text-muted">Nimadir noto'g'ri ketdi. Sahifani yangilang.</p>
            <button
              className="btn-primary btn-md"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Qayta urinish
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            {children}
            <Toaster richColors position="top-right" />
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
