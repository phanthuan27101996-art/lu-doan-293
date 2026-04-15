import { z } from 'zod';
import i18n from '@/lib/i18n';

const urlOrDataOrEmpty = (s: string) =>
  s === '' || /^https?:\/\/.+/i.test(s) || s.startsWith('data:');

export const moiTuanMotDieuLuatFormSchema = z.object({
  nam: z.coerce
    .number()
    .int()
    .min(2000, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.namRange') })
    .max(2100, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.namRange') }),
  thang: z.coerce
    .number()
    .int()
    .min(1, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.thangRange') })
    .max(12, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.thangRange') }),
  tuan: z.coerce
    .number()
    .int()
    .min(1, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.tuanRange') })
    .max(6, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.tuanRange') }),
  ten_dieu_luat: z.string().trim().min(1, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.tenRequired') }),
  ghi_chu: z.string().trim(),
  hinh_anh: z
    .string()
    .trim()
    .refine(urlOrDataOrEmpty, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.hinhAnhInvalid') }),
  tep_dinh_kem: z
    .string()
    .trim()
    .refine(urlOrDataOrEmpty, { message: i18n.t('moiTuanMotDieuLuat.dm.validation.tepInvalid') }),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), {
      message: i18n.t('moiTuanMotDieuLuat.dm.validation.linkInvalid'),
    }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type MoiTuanMotDieuLuatFormValues = z.infer<typeof moiTuanMotDieuLuatFormSchema>;
