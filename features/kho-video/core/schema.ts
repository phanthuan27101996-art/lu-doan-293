import { z } from 'zod';
import i18n from '../../../lib/i18n';

export const khoVideoFormSchema = z.object({
  bo_suu_tap: z.string().trim().min(1, { message: i18n.t('khoVideo.dm.validation.boSuuTapRequired') }),
  ten_video: z.string().trim().min(1, { message: i18n.t('khoVideo.dm.validation.tenVideoRequired') }),
  ghi_chu: z.string().trim(),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('khoVideo.dm.validation.linkInvalid') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type KhoVideoFormValues = z.infer<typeof khoVideoFormSchema>;
