"use client";

import { useQuery } from "@tanstack/react-query";
import { Streak } from "@/types";

async function fetchStreak(): Promise<Streak> {
  const res = await fetch("/api/streak");
  if (!res.ok) throw new Error("Streak ma'lumotlarini yuklashda xatolik");
  return res.json();
}

export function useStreak() {
  return useQuery<Streak>({
    queryKey: ["streak"],
    queryFn: fetchStreak,
    staleTime: 60 * 1000,
  });
}
