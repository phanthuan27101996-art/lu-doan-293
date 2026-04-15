import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '../../../lib/i18n';
import {
  listLanhDaoLuuDoan,
  createLanhDaoLuuDoan,
  updateLanhDaoLuuDoan,
  deleteLanhDaoLuuDoan,
} from '../services/lanh-dao-luu-doan-service';
import type { LanhDaoLuuDoanFormValues } from '../core/lanh-dao-schema';

export const LANH_DAO_LUU_DOAN_QUERY_KEY = ['truyen-thong', 'lanh-dao-luu-doan'] as const;

export const useLanhDaoLuuDoanList = () =>
  useQuery({
    queryKey: LANH_DAO_LUU_DOAN_QUERY_KEY,
    queryFn: listLanhDaoLuuDoan,
    staleTime: 1000 * 60,
  });

export const useCreateLanhDaoLuuDoan = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LanhDaoLuuDoanFormValues) => createLanhDaoLuuDoan(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANH_DAO_LUU_DOAN_QUERY_KEY });
      toast.success(i18n.t('truyenThong.lanhDao.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.lanhDao.toast.error')}: ${err.message}`),
  });
};

export const useUpdateLanhDaoLuuDoan = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LanhDaoLuuDoanFormValues }) => updateLanhDaoLuuDoan(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANH_DAO_LUU_DOAN_QUERY_KEY });
      toast.success(i18n.t('truyenThong.lanhDao.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.lanhDao.toast.error')}: ${err.message}`),
  });
};

export const useDeleteLanhDaoLuuDoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteLanhDaoLuuDoan(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANH_DAO_LUU_DOAN_QUERY_KEY });
      toast.success(i18n.t('truyenThong.lanhDao.toast.deleteSuccess'));
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.lanhDao.toast.error')}: ${err.message}`),
  });
};
