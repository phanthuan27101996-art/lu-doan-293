import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { getKhoNhacList, createKhoNhac, updateKhoNhac, deleteKhoNhacList } from '../services/kho-nhac-service';
import type { KhoNhacFormValues } from '../core/schema';

export const KHO_NHAC_QUERY_KEY = ['kho-nhac'] as const;

export const useKhoNhacList = () =>
  useQuery({
    queryKey: KHO_NHAC_QUERY_KEY,
    queryFn: getKhoNhacList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateKhoNhac = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KhoNhacFormValues) => createKhoNhac(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHO_NHAC_QUERY_KEY });
      toast.success(i18n.t('khoNhac.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('khoNhac.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateKhoNhac = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KhoNhacFormValues }) => updateKhoNhac(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHO_NHAC_QUERY_KEY });
      toast.success(i18n.t('khoNhac.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('khoNhac.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteKhoNhacList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteKhoNhacList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: KHO_NHAC_QUERY_KEY });
      toast.success(i18n.t('khoNhac.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
