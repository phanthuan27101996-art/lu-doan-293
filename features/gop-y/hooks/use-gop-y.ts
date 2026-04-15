import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import {
  getGopYList,
  createGopY,
  updateGopY,
  deleteGopYList,
  patchGopY,
  updateGopYReply,
  type GopYPatch,
} from '../services/gop-y-service';
import type { GopYFormValues } from '../core/schema';

export const GOP_Y_QUERY_KEY = ['gop-y'] as const;

export const useGopYList = () =>
  useQuery({
    queryKey: GOP_Y_QUERY_KEY,
    queryFn: getGopYList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateGopY = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, hinhAnhUrls }: { data: GopYFormValues; hinhAnhUrls: string[] }) =>
      createGopY(data, hinhAnhUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOP_Y_QUERY_KEY });
      toast.success(i18n.t('gopY.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('gopY.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateGopY = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      hinhAnhUrls,
    }: {
      id: string;
      data: GopYFormValues;
      hinhAnhUrls: string[];
    }) => updateGopY(id, data, hinhAnhUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOP_Y_QUERY_KEY });
      toast.success(i18n.t('gopY.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('gopY.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const usePatchGopY = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: GopYPatch }) => patchGopY(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOP_Y_QUERY_KEY });
      toast.success(i18n.t('gopY.dm.toast.patchSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('gopY.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateGopYReply = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, traLoi }: { id: string; traLoi: string }) => updateGopYReply(id, traLoi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOP_Y_QUERY_KEY });
      toast.success(i18n.t('gopY.dm.toast.replySuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('gopY.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteGopYList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteGopYList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: GOP_Y_QUERY_KEY });
      toast.success(i18n.t('gopY.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
