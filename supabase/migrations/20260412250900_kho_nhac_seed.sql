-- Dữ liệu mẫu kho nhạc (idempotent theo bo_suu_tap + ten_nhac)

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT 'Bài hát về Lữ đoàn', 'Tiếng hát Đoàn Công binh Thăng Long', 'Sáng tác: Tố Hải', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = 'Bài hát về Lữ đoàn' AND k.ten_nhac = 'Tiếng hát Đoàn Công binh Thăng Long');

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  'Bài hát về Lữ đoàn',
  'Tình yêu người chiến sĩ Công binh',
  $tac$Nhạc: Phan Tuấn Uyên
Lời: Lê Xuân Hưng (Phó Chính ủy Lữ đoàn)$tac$,
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = 'Bài hát về Lữ đoàn' AND k.ten_nhac = 'Tình yêu người chiến sĩ Công binh');

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT 'Bài hát về Binh chủng Công binh', 'Công binh Việt Nam Anh hùng', 'Sáng tác: Thuận Yến', NULL, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = 'Bài hát về Binh chủng Công binh' AND k.ten_nhac = 'Công binh Việt Nam Anh hùng'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  'Bài hát về Binh chủng Công binh',
  'Chiến sĩ Công binh làm theo lời Bác',
  $tac$Nhạc: Nguyễn Đức Thực
Lời: Nguyễn Bá Hiểu$tac$,
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = 'Bài hát về Binh chủng Công binh' AND k.ten_nhac = 'Chiến sĩ Công binh làm theo lời Bác'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Tiến quân ca (Quốc ca)',
  'Nhạc và lời: Văn Cao',
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Tiến quân ca (Quốc ca)'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Quốc tế ca',
  $tac$Nhạc: Pi - e Đờ - gây - tê
Thơ: Ơ - gien Pốt - chi - e$tac$,
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Quốc tế ca'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Chào mừng Đảng Cộng sản Việt Nam',
  'Nhạc và lời: Đỗ Minh',
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Chào mừng Đảng Cộng sản Việt Nam'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Ca ngợi Hồ Chủ Tịch',
  $tac$Nhạc: Lưu Hữu Phước
Lời: Lưu Hữu Phước - Nguyễn Đình Thi$tac$,
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Ca ngợi Hồ Chủ Tịch'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Vì nhân dân quên mình',
  'Nhạc và lời: Doãn Quang Khải',
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Vì nhân dân quên mình'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Tiến bước dưới quân kỳ',
  'Nhạc và lời: Doãn Nho',
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Tiến bước dưới quân kỳ'
);

INSERT INTO public.kho_nhac (bo_suu_tap, ten_nhac, tac_gia, ghi_chu, link, id_nguoi_tao)
SELECT
  '15 bài hát quy định trong QĐND Việt Nam',
  'Giải phóng Điện Biên',
  'Nhạc và lời: Đỗ Nhuận',
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kho_nhac k WHERE k.bo_suu_tap = '15 bài hát quy định trong QĐND Việt Nam' AND k.ten_nhac = 'Giải phóng Điện Biên'
);
