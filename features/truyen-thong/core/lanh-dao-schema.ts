import { z } from 'zod';

const emptyToNull = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return null;
  return v;
};

export const lanhDaoLuuDoanFormSchema = z.object({
  thu_tu: z.coerce.number().int().min(1).max(999),
  ho_va_ten: z.string().trim().min(1, 'Bắt buộc').max(200),
  /** Cho phép data URL tạm khi chọn ảnh (SingleImageInput); sau upload URL ngắn. */
  hinh_anh: z.preprocess(emptyToNull, z.union([z.null(), z.string().trim().max(12_000_000)])),
  nam_sinh: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.union([z.null(), z.coerce.number().int().min(1900).max(2035)]),
  ),
  cap_bac_hien_tai: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  chuc_vu: z.preprocess(emptyToNull, z.string().trim().max(200).nullable()),
  lich_su_cong_tac: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
  ghi_chu: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
});

export type LanhDaoLuuDoanFormValues = z.infer<typeof lanhDaoLuuDoanFormSchema>;
