"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";

async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Foydalanuvchi ma'lumotlarini yuklashda xatolik");
  return res.json();
}

async function updateUser(data: Partial<User>) {
  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Ma'lumotlarni saqlashda xatolik");
  }
  return res.json();
}

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 60 * 1000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
}
