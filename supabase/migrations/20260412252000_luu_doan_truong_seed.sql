-- Dữ liệu mẫu Lữ đoàn trưởng (idempotent theo cặp thu_tu + ho_va_ten)

INSERT INTO public.luu_doan_truong (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  1,
  'Cao Văn Hậu',
  'Lữ đoàn trường_Images/1.Hình ảnh.133134.jpg',
  NULL,
  '1993 - 1998',
  NULL,
  'Trung đoàn trưởng',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.luu_doan_truong d WHERE d.thu_tu = 1 AND d.ho_va_ten = 'Cao Văn Hậu'
);

INSERT INTO public.luu_doan_truong (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  2,
  'Tống Văn Thiệu',
  'Lữ đoàn trường_Images/5dd99896.Hình ảnh.133343.jpg',
  NULL,
  '1998 - 2003',
  NULL,
  'Trung đoàn trưởng',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.luu_doan_truong d WHERE d.thu_tu = 2 AND d.ho_va_ten = 'Tống Văn Thiệu'
);

INSERT INTO public.luu_doan_truong (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  3,
  'Nguyễn Trọng Tấn',
  'Lữ đoàn trường_Images/3fb2c4a7.Hình ảnh.133426.jpg',
  NULL,
  '2004 - 2011',
  NULL,
  'Trung đoàn trưởng',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.luu_doan_truong d WHERE d.thu_tu = 3 AND d.ho_va_ten = 'Nguyễn Trọng Tấn'
);

INSERT INTO public.luu_doan_truong (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  4,
  'Trịnh Văn Sơn',
  'Lữ đoàn trường_Images/5882b3ac.Hình ảnh.133529.jpg',
  NULL,
  '2011 - 2016',
  NULL,
  'Lữ đoàn trưởng',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.luu_doan_truong d WHERE d.thu_tu = 4 AND d.ho_va_ten = 'Trịnh Văn Sơn'
);

INSERT INTO public.luu_doan_truong (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  5,
  'Nguyễn Thế Lương',
  'Lữ đoàn trường_Images/16d329de.Hình ảnh.133542.jpg',
  NULL,
  '2016 - 2023',
  NULL,
  'Lữ đoàn trưởng',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.luu_doan_truong d WHERE d.thu_tu = 5 AND d.ho_va_ten = 'Nguyễn Thế Lương'
);

INSERT INTO public.luu_doan_truong (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  6,
  'Phạm Văn Chuyên',
  'Lữ đoàn trường_Images/9f5d626a.Hình ảnh.145415.jpg',
  NULL,
  '2023 - nay',
  NULL,
  'Lữ đoàn trưởng',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.luu_doan_truong d WHERE d.thu_tu = 6 AND d.ho_va_ten = 'Phạm Văn Chuyên'
);
