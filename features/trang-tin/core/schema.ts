import { z } from 'zod';
import i18n from '../../../lib/i18n';

export const trangTinFormSchema = z.object({
  ngay_dang: z.string().min(1, { message: i18n.t('trangTin.validation.ngayRequired') }),
  tieu_de: z.string().trim().min(1, { message: i18n.t('trangTin.validation.tieuDeRequired') }).max(2000),
  mo_ta_ngan: z.string().trim().min(1, { message: i18n.t('trangTin.validation.moTaRequired') }),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('trangTin.validation.linkInvalid') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type TrangTinFormValues = z.infer<typeof trangTinFormSchema>;
