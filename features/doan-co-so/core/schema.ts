import { z } from 'zod';
import i18n from '../../../lib/i18n';

export const doanCoSoFormSchema = z.object({
  ngay: z.string().min(1, { message: i18n.t('doanCoSo.dm.validation.ngayRequired') }),
  nhom: z.string().trim().min(1, { message: i18n.t('doanCoSo.dm.validation.nhomRequired') }),
  ten: z.string().trim().min(1, { message: i18n.t('doanCoSo.dm.validation.tenRequired') }),
  ghi_chu: z.string().trim(),
  link: z
    .string()
    .trim()
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), { message: i18n.t('doanCoSo.dm.validation.linkInvalid') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type DoanCoSoFormValues = z.infer<typeof doanCoSoFormSchema>;
