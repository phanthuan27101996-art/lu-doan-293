import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '../../../lib/i18n';
import { getPrimaryTruyenThong, upsertPrimaryTruyenThong } from '../services/truyen-thong-service';
import type { TruyenThongFormValues } from '../core/schema';

export const TRUYEN_THONG_QUERY_KEY = ['truyen-thong', 'primary'] as const;

export const usePrimaryTruyenThong = () =>
  useQuery({
    queryKey: TRUYEN_THONG_QUERY_KEY,
    queryFn: getPrimaryTruyenThong,
    staleTime: 1000 * 60,
  });

export const useUpsertPrimaryTruyenThong = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TruyenThongFormValues) => upsertPrimaryTruyenThong(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUYEN_THONG_QUERY_KEY });
      toast.success(i18n.t('truyenThong.toast.saveSuccess'));
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(`${i18n.t('truyenThong.toast.saveError')}: ${err.message}`),
  });
};
