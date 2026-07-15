import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/api/usersApi";

const USERS_KEY = ["users"];

export function useUsersList(search: string) {
  return useQuery({
    queryKey: [...USERS_KEY, { search }],
    queryFn: () => listUsers(search),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("Akun berhasil dibuat");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal membuat akun"),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("Akun berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui akun"),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => resetUserPassword(id, password),
    onSuccess: () => toast.success("Password berhasil direset"),
    onError: (e: Error) => toast.error(e.message || "Gagal mereset password"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("Akun berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus akun"),
  });
}
