import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { getCongVanList, createCongVan, updateCongVan, deleteCongVanList } from '../services/cong-van-service';
import type { CongVanFormValues } from '../core/schema';

export const CONG_VAN_QUERY_KEY = ['cong-van'] as const;

export const useCongVanList = () =>
  useQuery({
    queryKey: CONG_VAN_QUERY_KEY,
    queryFn: getCongVanList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateCongVan = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CongVanFormValues) => createCongVan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONG_VAN_QUERY_KEY });
      toast.success(i18n.t('congVan.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('congVan.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateCongVan = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CongVanFormValues }) => updateCongVan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONG_VAN_QUERY_KEY });
      toast.success(i18n.t('congVan.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('congVan.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteCongVanList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteCongVanList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: CONG_VAN_QUERY_KEY });
      toast.success(i18n.t('congVan.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
