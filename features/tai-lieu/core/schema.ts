import { z } from 'zod';
import i18n from '../../../lib/i18n';

export const taiLieuFormSchema = z.object({
  id_chuc_vu: z.string().trim().min(1, { message: i18n.t('taiLieu.dm.validation.chucVuRequired') }),
  nhom_tai_lieu: z.string().trim().min(1, { message: i18n.t('taiLieu.dm.validation.nhomRequired') }),
  ten_tai_lieu: z.string().trim().min(1, { message: i18n.t('taiLieu.dm.validation.tenRequired') }),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('taiLieu.dm.validation.linkInvalid') }),
  ghi_chu: z.string().trim(),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type TaiLieuFormValues = z.infer<typeof taiLieuFormSchema>;
