import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import {
  getDoanCoSoList,
  createDoanCoSo,
  updateDoanCoSo,
  deleteDoanCoSoList,
} from '../services/doan-co-so-service';
import type { DoanCoSoFormValues } from '../core/schema';

export const DOAN_CO_SO_QUERY_KEY = ['doan-co-so'] as const;

export const useDoanCoSoList = () =>
  useQuery({
    queryKey: DOAN_CO_SO_QUERY_KEY,
    queryFn: getDoanCoSoList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateDoanCoSo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, hinhAnhUrls }: { data: DoanCoSoFormValues; hinhAnhUrls: string[] }) =>
      createDoanCoSo(data, hinhAnhUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOAN_CO_SO_QUERY_KEY });
      toast.success(i18n.t('doanCoSo.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('doanCoSo.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateDoanCoSo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      hinhAnhUrls,
    }: {
      id: string;
      data: DoanCoSoFormValues;
      hinhAnhUrls: string[];
    }) => updateDoanCoSo(id, data, hinhAnhUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOAN_CO_SO_QUERY_KEY });
      toast.success(i18n.t('doanCoSo.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('doanCoSo.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteDoanCoSoList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteDoanCoSoList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: DOAN_CO_SO_QUERY_KEY });
      toast.success(i18n.t('doanCoSo.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
