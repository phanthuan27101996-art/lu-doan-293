-- Dữ liệu mẫu lãnh đạo Lữ đoàn (idempotent theo cặp thu_tu + ho_va_ten)

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  1,
  'Phạm Văn Chuyên',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1974,
  'Đại tá',
  'Lữ đoàn trưởng',
  '',
  'Giữ chức vụ Lữ đoàn trưởng từ năm 2023 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 1 AND d.ho_va_ten = 'Phạm Văn Chuyên'
);

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  2,
  'Đinh Trần Y',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1971,
  'Đại tá',
  'Chính ủy Lữ đoàn',
  '',
  'Giữ chức vụ Chính ủy Lữ đoàn từ năm 2023 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 2 AND d.ho_va_ten = 'Đinh Trần Y'
);

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  3,
  'Đỗ Văn Thọ',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1977,
  'Thượng tá',
  'Phó Lữ đoàn trưởng kiêm Tham mưu trưởng',
  '',
  'Giữ chức vụ Phó Lữ đoàn trưởng kiêm Tham mưu trưởng từ năm 2023 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 3 AND d.ho_va_ten = 'Đỗ Văn Thọ'
);

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  4,
  'Lê Xuân Hưng',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1975,
  'Thượng tá',
  'Phó Chính ủy Lữ đoàn',
  '',
  'Giữ chức vụ Phó Chính ủy Lữ đoàn từ năm 2023 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 4 AND d.ho_va_ten = 'Lê Xuân Hưng'
);

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  5,
  'Phạm Xuân Bộ',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1972,
  'Thượng tá',
  'Phó Lữ đoàn trưởng Quân sự',
  '',
  'Giữ chức vụ Phó Lữ đoàn trưởng Quân sự từ năm 2020 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 5 AND d.ho_va_ten = 'Phạm Xuân Bộ'
);

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  6,
  'Đỗ Ngọc Lập',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1975,
  'Thượng tá',
  'Phó Lữ đoàn trưởng',
  '',
  'Giữ chức vụ Phó Lữ đoàn trưởng từ năm 2022 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 6 AND d.ho_va_ten = 'Đỗ Ngọc Lập'
);

INSERT INTO public.lanh_dao_luu_doan (thu_tu, ho_va_ten, hinh_anh, nam_sinh, cap_bac_hien_tai, chuc_vu, lich_su_cong_tac, ghi_chu)
SELECT
  7,
  'Nguyễn Hồng Sơn',
  'https://cdn-icons-png.flaticon.com/256/6211/6211662.png',
  1976,
  'Thượng tá',
  'Phó Lữ đoàn trưởng',
  '',
  'Giữ chức vụ Phó Lữ đoàn trưởng từ năm 2024 đến nay'
WHERE NOT EXISTS (
  SELECT 1 FROM public.lanh_dao_luu_doan d WHERE d.thu_tu = 7 AND d.ho_va_ten = 'Nguyễn Hồng Sơn'
);
