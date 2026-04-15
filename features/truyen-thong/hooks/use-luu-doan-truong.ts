import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '../../../lib/i18n';
import {
  listLuuDoanTruong,
  createLuuDoanTruong,
  updateLuuDoanTruong,
  deleteLuuDoanTruong,
} from '../services/luu-doan-truong-service';
import type { LuuDoanTruongFormValues } from '../core/luu-doan-truong-schema';

export const LUU_DOAN_TRUONG_QUERY_KEY = ['truyen-thong', 'luu-doan-truong'] as const;

export const useLuuDoanTruongList = () =>
  useQuery({
    queryKey: LUU_DOAN_TRUONG_QUERY_KEY,
    queryFn: listLuuDoanTruong,
    staleTime: 1000 * 60,
  });

export const useCreateLuuDoanTruong = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LuuDoanTruongFormValues) => createLuuDoanTruong(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LUU_DOAN_TRUONG_QUERY_KEY });
      toast.success(i18n.t('truyenThong.luuDoanTruong.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.luuDoanTruong.toast.error')}: ${err.message}`),
  });
};

export const useUpdateLuuDoanTruong = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LuuDoanTruongFormValues }) => updateLuuDoanTruong(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LUU_DOAN_TRUONG_QUERY_KEY });
      toast.success(i18n.t('truyenThong.luuDoanTruong.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.luuDoanTruong.toast.error')}: ${err.message}`),
  });
};

export const useDeleteLuuDoanTruong = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteLuuDoanTruong(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LUU_DOAN_TRUONG_QUERY_KEY });
      toast.success(i18n.t('truyenThong.luuDoanTruong.toast.deleteSuccess'));
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.luuDoanTruong.toast.error')}: ${err.message}`),
  });
};
