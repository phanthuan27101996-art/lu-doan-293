-- Dữ liệu mẫu Đoàn cơ sở (idempotent theo cặp ngay + ten)

INSERT INTO public.doan_co_so (ngay, nhom, ten, ghi_chu, link, hinh_anh, id_nguoi_tao)
SELECT
  '2025-05-03'::date,
  'Tài liệu đoàn',
  'hshshs',
  'hshshs',
  NULL,
  '[]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.doan_co_so d WHERE d.ngay = '2025-05-03'::date AND d.ten = 'hshshs'
);

INSERT INTO public.doan_co_so (ngay, nhom, ten, ghi_chu, link, hinh_anh, id_nguoi_tao)
SELECT
  '2025-05-05'::date,
  'Hoạt động đoàn',
  'LIÊN CHI ĐOÀN TIỂU ĐOÀN 32',
  'Phát động thi đua đột kích chào mừng đại hội đại biểu đảng bộ Lữ đoàn nhiệm kỳ 2025-2030',
  NULL,
  '[]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM public.doan_co_so d
  WHERE d.ngay = '2025-05-05'::date AND d.ten = 'LIÊN CHI ĐOÀN TIỂU ĐOÀN 32'
);
