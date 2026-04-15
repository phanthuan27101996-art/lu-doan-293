import { z } from 'zod';
import i18n from '../../../lib/i18n';

export const khoNhacFormSchema = z.object({
  bo_suu_tap: z.string().trim().min(1, { message: i18n.t('khoNhac.dm.validation.boSuuTapRequired') }),
  ten_nhac: z.string().trim().min(1, { message: i18n.t('khoNhac.dm.validation.tenNhacRequired') }),
  tac_gia: z.string().trim(),
  ghi_chu: z.string().trim(),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('khoNhac.dm.validation.linkInvalid') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type KhoNhacFormValues = z.infer<typeof khoNhacFormSchema>;
