import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { getTaiLieuList, createTaiLieu, updateTaiLieu, deleteTaiLieuList } from '../services/tai-lieu-service';
import type { TaiLieuFormValues } from '../core/schema';

export const TAI_LIEU_QUERY_KEY = ['tai-lieu'] as const;

export const useTaiLieuList = () =>
  useQuery({
    queryKey: TAI_LIEU_QUERY_KEY,
    queryFn: getTaiLieuList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateTaiLieu = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaiLieuFormValues) => createTaiLieu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAI_LIEU_QUERY_KEY });
      toast.success(i18n.t('taiLieu.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('taiLieu.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateTaiLieu = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaiLieuFormValues }) => updateTaiLieu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAI_LIEU_QUERY_KEY });
      toast.success(i18n.t('taiLieu.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('taiLieu.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteTaiLieuList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteTaiLieuList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: TAI_LIEU_QUERY_KEY });
      toast.success(i18n.t('taiLieu.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
