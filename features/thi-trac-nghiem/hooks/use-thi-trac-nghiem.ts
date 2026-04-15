import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import {
  getThiTracNghiemList,
  createThiTracNghiem,
  updateThiTracNghiem,
  deleteThiTracNghiemList,
} from '../services/thi-trac-nghiem-service';
import type { ThiTracNghiemFormValues } from '../core/schema';

export const THI_TRAC_NGHIEM_QUERY_KEY = ['thi-trac-nghiem'] as const;

export const useThiTracNghiemList = () =>
  useQuery({
    queryKey: THI_TRAC_NGHIEM_QUERY_KEY,
    queryFn: getThiTracNghiemList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateThiTracNghiem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ThiTracNghiemFormValues) => createThiTracNghiem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THI_TRAC_NGHIEM_QUERY_KEY });
      toast.success(i18n.t('thiTracNghiem.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('thiTracNghiem.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateThiTracNghiem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ThiTracNghiemFormValues }) => updateThiTracNghiem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THI_TRAC_NGHIEM_QUERY_KEY });
      toast.success(i18n.t('thiTracNghiem.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('thiTracNghiem.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteThiTracNghiemList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteThiTracNghiemList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: THI_TRAC_NGHIEM_QUERY_KEY });
      toast.success(i18n.t('thiTracNghiem.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
