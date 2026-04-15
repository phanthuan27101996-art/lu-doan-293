
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PHAN_QUYEN_ROLES_QUERY_KEY } from "@/lib/module-permissions";
import { getRoles, createRole, deleteRoles, updateModulePermissions, getLogs } from "../services/phan-quyen-service";
import { RoleFormValues } from "../core/schema";
import { ModulePermission } from "../core/types";
import { toast } from "sonner";
import i18n from '../../../../lib/i18n';

export const useRoles = () => {
  return useQuery({
    queryKey: PHAN_QUYEN_ROLES_QUERY_KEY,
    queryFn: getRoles,
  });
};

export const useCreateRole = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, permissions }: { data: RoleFormValues, permissions: ModulePermission[] }) => createRole(data, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHAN_QUYEN_ROLES_QUERY_KEY });
      toast.success(i18n.t('permission.toast.createSuccess'));
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => toast.error(err.message)
  });
};

export const useDeleteRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteRoles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHAN_QUYEN_ROLES_QUERY_KEY });
      toast.success(i18n.t('permission.toast.deleteSuccess'));
    }
  });
};

export const useUpdateModulePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, updates }: { moduleId: string; updates: { roleId: string; actions: string[] }[] }) =>
      updateModulePermissions(moduleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHAN_QUYEN_ROLES_QUERY_KEY });
      toast.success(i18n.t('permission.toast.updateSuccess'));
    },
    onError: (err: any) => toast.error(err.message)
  });
};

export const useAccessLogs = () => {
  return useQuery({
    queryKey: ['access-logs'],
    queryFn: getLogs,
    refetchInterval: 30000, // Refresh mỗi 30s
  });
};
