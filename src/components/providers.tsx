"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
