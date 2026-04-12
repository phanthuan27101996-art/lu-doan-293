import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import {
  getTrangTinList,
  createTrangTin,
  updateTrangTin,
  deleteTrangTinList,
} from '../services/trang-tin-service';
import type { TrangTinFormValues } from '../core/schema';

export const TRANG_TIN_QUERY_KEY = ['trang-tin'] as const;

export const useTrangTinList = () =>
  useQuery({
    queryKey: TRANG_TIN_QUERY_KEY,
    queryFn: getTrangTinList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateTrangTin = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, hinhAnhUrls }: { data: TrangTinFormValues; hinhAnhUrls: string[] }) =>
      createTrangTin(data, hinhAnhUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANG_TIN_QUERY_KEY });
      toast.success(i18n.t('trangTin.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('trangTin.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateTrangTin = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      hinhAnhUrls,
    }: {
      id: string;
      data: TrangTinFormValues;
      hinhAnhUrls: string[];
    }) => updateTrangTin(id, data, hinhAnhUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANG_TIN_QUERY_KEY });
      toast.success(i18n.t('trangTin.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('trangTin.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteTrangTinList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteTrangTinList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: TRANG_TIN_QUERY_KEY });
      toast.success(i18n.t('trangTin.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
