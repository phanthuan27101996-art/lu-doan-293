import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '../../../lib/i18n';
import { listChinhUy, createChinhUy, updateChinhUy, deleteChinhUy } from '../services/chinh-uy-service';
import type { ChinhUyFormValues } from '../core/chinh-uy-schema';

export const CHINH_UY_QUERY_KEY = ['truyen-thong', 'chinh-uy'] as const;

export const useChinhUyList = () =>
  useQuery({
    queryKey: CHINH_UY_QUERY_KEY,
    queryFn: listChinhUy,
    staleTime: 1000 * 60,
  });

export const useCreateChinhUy = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChinhUyFormValues) => createChinhUy(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHINH_UY_QUERY_KEY });
      toast.success(i18n.t('truyenThong.chinhUy.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.chinhUy.toast.error')}: ${err.message}`),
  });
};

export const useUpdateChinhUy = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChinhUyFormValues }) => updateChinhUy(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHINH_UY_QUERY_KEY });
      toast.success(i18n.t('truyenThong.chinhUy.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.chinhUy.toast.error')}: ${err.message}`),
  });
};

export const useDeleteChinhUy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteChinhUy(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHINH_UY_QUERY_KEY });
      toast.success(i18n.t('truyenThong.chinhUy.toast.deleteSuccess'));
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.chinhUy.toast.error')}: ${err.message}`),
  });
};
