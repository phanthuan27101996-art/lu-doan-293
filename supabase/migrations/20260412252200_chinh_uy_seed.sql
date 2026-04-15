-- Dữ liệu mẫu Chính ủy (idempotent theo cặp thu_tu + ho_va_ten)

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  1,
  'Nguyễn Kim Tân',
  'Chính ủy_Images/d65ebc8e.Hình ảnh.133851.jpg',
  NULL,
  '1993 - 1998',
  NULL,
  'Phó Trung đoàn trưởng về Chính trị',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 1 AND c.ho_va_ten = 'Nguyễn Kim Tân'
);

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  2,
  'Trần Văn Hòa',
  'Chính ủy_Images/f8f5fb5c.Hình ảnh.134011.jpg',
  NULL,
  '1998 - 2000',
  NULL,
  'Phó Trung đoàn trưởng về Chính trị',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 2 AND c.ho_va_ten = 'Trần Văn Hòa'
);

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  3,
  'Hoàng Quốc Việt',
  'Chính ủy_Images/fa558c02.Hình ảnh.134000.jpg',
  NULL,
  '2000 - 2005',
  NULL,
  'Phó Trung đoàn trưởng về Chính trị',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 3 AND c.ho_va_ten = 'Hoàng Quốc Việt'
);

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  4,
  'Nguyễn Thanh Tùng',
  'Chính ủy_Images/46b2af10.Hình ảnh.134107.jpg',
  NULL,
  '2011 - 2014',
  NULL,
  'Chính ủy Lữ đoàn',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 4 AND c.ho_va_ten = 'Nguyễn Thanh Tùng'
);

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  5,
  'Lê Thanh Hải',
  'Chính ủy_Images/af222ad3.Hình ảnh.134156.jpg',
  NULL,
  '2014 - 2016',
  NULL,
  'Chính ủy Lữ đoàn',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 5 AND c.ho_va_ten = 'Lê Thanh Hải'
);

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  6,
  'Nguyễn Viết Cảnh',
  'Chính ủy_Images/67978eca.Hình ảnh.134213.jpg',
  NULL,
  '2016 - 2023',
  NULL,
  'Chính ủy Lữ đoàn',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 6 AND c.ho_va_ten = 'Nguyễn Viết Cảnh'
);

INSERT INTO public.chinh_uy (thu_tu, ho_va_ten, hinh_anh, nam_sinh, thoi_gian_dam_nhiem, cap_bac_hien_tai, chuc_vu_cuoi_cung, ghi_chu)
SELECT
  7,
  'Đinh Trần Y',
  'Chính ủy_Images/c5d72e9a.Hình ảnh.153022.jpg',
  NULL,
  '2023 - nay',
  NULL,
  'Chính ủy Lữ đoàn',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.chinh_uy c WHERE c.thu_tu = 7 AND c.ho_va_ten = 'Đinh Trần Y'
);
