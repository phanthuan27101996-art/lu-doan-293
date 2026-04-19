import { z } from 'zod';
import i18n from '@/lib/i18n';

const isoDate = z
  .string()
  .trim()
  .min(1, { message: i18n.t('moiNgayMotLoiDayBacHo.dm.validation.ngayRequired') })
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s), { message: i18n.t('moiNgayMotLoiDayBacHo.dm.validation.ngayInvalid') });

const urlOrDataOrEmpty = (s: string) =>
  s === '' || /^https?:\/\/.+/i.test(s) || s.startsWith('data:');

export const moiNgayMotLoiDayBacHoFormSchema = z.object({
  ngay: isoDate,
  ten_tai_lieu: z.string().trim().min(1, { message: i18n.t('moiNgayMotLoiDayBacHo.dm.validation.tenRequired') }),
  hinh_anh: z
    .string()
    .trim()
    .refine(urlOrDataOrEmpty, { message: i18n.t('moiNgayMotLoiDayBacHo.dm.validation.hinhAnhInvalid') }),
  tep_dinh_kem: z
    .string()
    .trim()
    .refine(urlOrDataOrEmpty, { message: i18n.t('moiNgayMotLoiDayBacHo.dm.validation.tepInvalid') }),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), {
      message: i18n.t('moiNgayMotLoiDayBacHo.dm.validation.linkInvalid'),
    }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type MoiNgayMotLoiDayBacHoFormValues = z.infer<typeof moiNgayMotLoiDayBacHoFormSchema>;
