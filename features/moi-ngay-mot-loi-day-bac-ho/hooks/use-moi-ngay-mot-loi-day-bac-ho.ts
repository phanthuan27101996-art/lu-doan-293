import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import {
  getMoiNgayMotLoiDayBacHoList,
  createMoiNgayMotLoiDayBacHo,
  updateMoiNgayMotLoiDayBacHo,
  deleteMoiNgayMotLoiDayBacHoList,
} from '../services/moi-ngay-mot-loi-day-bac-ho-service';
import type { MoiNgayMotLoiDayBacHoFormValues } from '../core/schema';

export const MOI_NGAY_MOT_LOI_DAY_BAC_HO_QUERY_KEY = ['moi-ngay-mot-loi-day-bac-ho'] as const;

export const useMoiNgayMotLoiDayBacHoList = () =>
  useQuery({
    queryKey: MOI_NGAY_MOT_LOI_DAY_BAC_HO_QUERY_KEY,
    queryFn: getMoiNgayMotLoiDayBacHoList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateMoiNgayMotLoiDayBacHo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MoiNgayMotLoiDayBacHoFormValues) => createMoiNgayMotLoiDayBacHo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOI_NGAY_MOT_LOI_DAY_BAC_HO_QUERY_KEY });
      toast.success(i18n.t('moiNgayMotLoiDayBacHo.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('moiNgayMotLoiDayBacHo.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateMoiNgayMotLoiDayBacHo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoiNgayMotLoiDayBacHoFormValues }) =>
      updateMoiNgayMotLoiDayBacHo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOI_NGAY_MOT_LOI_DAY_BAC_HO_QUERY_KEY });
      toast.success(i18n.t('moiNgayMotLoiDayBacHo.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('moiNgayMotLoiDayBacHo.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteMoiNgayMotLoiDayBacHoList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteMoiNgayMotLoiDayBacHoList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: MOI_NGAY_MOT_LOI_DAY_BAC_HO_QUERY_KEY });
      toast.success(i18n.t('moiNgayMotLoiDayBacHo.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
