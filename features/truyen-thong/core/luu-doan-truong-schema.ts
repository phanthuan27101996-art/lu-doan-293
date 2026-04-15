import { z } from 'zod';

const emptyToNull = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return null;
  return v;
};

export const luuDoanTruongFormSchema = z.object({
  thu_tu: z.coerce.number().int().min(1).max(999),
  ho_va_ten: z.string().trim().min(1, 'Bắt buộc').max(200),
  hinh_anh: z.preprocess(emptyToNull, z.union([z.null(), z.string().trim().max(12_000_000)])),
  nam_sinh: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.union([z.null(), z.coerce.number().int().min(1900).max(2035)]),
  ),
  thoi_gian_dam_nhiem: z.string().trim().min(1, 'Bắt buộc').max(120),
  cap_bac_hien_tai: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  chuc_vu_cuoi_cung: z.preprocess(emptyToNull, z.string().trim().max(200).nullable()),
  ghi_chu: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
});

export type LuuDoanTruongFormValues = z.infer<typeof luuDoanTruongFormSchema>;
