import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPositions, createPosition, updatePosition, deletePositions } from '../services/chuc-vu-service';
import { PositionFormValues } from '../core/schema';
import { toast } from 'sonner';
import i18n from '../../../../lib/i18n';

export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: getPositions,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePosition = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success(i18n.t('position.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });
};

export const useUpdatePosition = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PositionFormValues }) => updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success(i18n.t('position.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deletePositions(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success(i18n.t('position.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
