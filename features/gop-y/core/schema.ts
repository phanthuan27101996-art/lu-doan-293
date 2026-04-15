import { z } from 'zod';
import i18n from '../../../lib/i18n';

/** Form tạo/sửa nội dung góp ý (không chỉnh trạng thái / trả lời — dùng detail). */
export const gopYFormSchema = z.object({
  ngay: z.string().min(1, { message: i18n.t('gopY.dm.validation.ngayRequired') }),
  tieu_de_gop_y: z.string().trim().min(1, { message: i18n.t('gopY.dm.validation.tieuDeRequired') }).max(2000),
  chi_tiet_gop_y: z.string().trim().min(1, { message: i18n.t('gopY.dm.validation.chiTietRequired') }),
  id_nguoi_tao: z.string().trim().optional().or(z.literal('')),
});

export type GopYFormValues = z.infer<typeof gopYFormSchema>;
