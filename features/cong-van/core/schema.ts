import { z } from 'zod';
import i18n from '@/lib/i18n';

const isoDate = z
  .string()
  .trim()
  .min(1, { message: i18n.t('congVan.dm.validation.ngayRequired') })
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s), { message: i18n.t('congVan.dm.validation.ngayInvalid') });

export const congVanFormSchema = z.object({
  don_vi: z.string().trim().min(1, { message: i18n.t('congVan.dm.validation.donViRequired') }),
  ngay: isoDate,
  ten_van_ban: z.string().trim().min(1, { message: i18n.t('congVan.dm.validation.tenRequired') }),
  ghi_chu: z.string().trim(),
  tep_dinh_kem: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s) || s.startsWith('data:'), {
      message: i18n.t('congVan.dm.validation.tepInvalid'),
    }),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('congVan.dm.validation.linkInvalid') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type CongVanFormValues = z.infer<typeof congVanFormSchema>;
