import { z } from 'zod';
import i18n from '../../../lib/i18n';

export const thiTracNghiemFormSchema = z.object({
  nhom: z.string().trim().min(1, { message: i18n.t('thiTracNghiem.dm.validation.nhomRequired') }),
  ten_de_thi: z.string().trim().min(1, { message: i18n.t('thiTracNghiem.dm.validation.tenRequired') }),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('thiTracNghiem.dm.validation.linkInvalid') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type ThiTracNghiemFormValues = z.infer<typeof thiTracNghiemFormSchema>;
