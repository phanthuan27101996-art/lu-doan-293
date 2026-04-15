import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { getKhoVideoList, createKhoVideo, updateKhoVideo, deleteKhoVideoList } from '../services/kho-video-service';
import type { KhoVideoFormValues } from '../core/schema';

export const KHO_VIDEO_QUERY_KEY = ['kho-video'] as const;

export const useKhoVideoList = () =>
  useQuery({
    queryKey: KHO_VIDEO_QUERY_KEY,
    queryFn: getKhoVideoList,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateKhoVideo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KhoVideoFormValues) => createKhoVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHO_VIDEO_QUERY_KEY });
      toast.success(i18n.t('khoVideo.dm.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('khoVideo.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useUpdateKhoVideo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KhoVideoFormValues }) => updateKhoVideo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHO_VIDEO_QUERY_KEY });
      toast.success(i18n.t('khoVideo.dm.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('khoVideo.dm.toast.errorPrefix')}: ${err.message}`),
  });
};

export const useDeleteKhoVideoList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteKhoVideoList(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: KHO_VIDEO_QUERY_KEY });
      toast.success(i18n.t('khoVideo.dm.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
