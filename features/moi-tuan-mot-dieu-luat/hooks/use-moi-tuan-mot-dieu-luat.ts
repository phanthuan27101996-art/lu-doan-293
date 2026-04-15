import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import {
  getMoiTuanMotDieuLuatList,
  createMoiTuanMotDieuLuat,
  updateMoiTuanMotDieuLuat,
  deleteMoiTuanMotDieuLuatList,
} from '../services/moi-tuan-mot-dieu-luat-service';
import type { MoiTuanMotDieuLuatFormValues } from '../core/schema';

export const MOI_TUAN_MOT_DIEU_LUAT_QUERY_KEY = ['moi-tuan-mot-dieu-luat'] as const;

export const useMoiTuanMotDieuLuatList = () =>
  useQuery({
    queryKey: MOI_TUAN_MOT_DIEU_LUAT_QUERY_KEY,
    queryFn: getMoiTuanMotDieuLuatList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateMoiTuanMotDieuLuat = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MoiTuanMotDieuLuatFormValues) => createMoiTuanMotDieuLuat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOI_TUAN_MOT_DIEU_LUAT_QUERY_KEY });
      toast.success(i18n.t('moiTuanMotDieuLuat.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('moiTuanMotDieuLuat.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateMoiTuanMotDieuLuat = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoiTuanMotDieuLuatFormValues }) =>
      updateMoiTuanMotDieuLuat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOI_TUAN_MOT_DIEU_LUAT_QUERY_KEY });
      toast.success(i18n.t('moiTuanMotDieuLuat.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('moiTuanMotDieuLuat.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteMoiTuanMotDieuLuatList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteMoiTuanMotDieuLuatList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: MOI_TUAN_MOT_DIEU_LUAT_QUERY_KEY });
      toast.success(i18n.t('moiTuanMotDieuLuat.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
