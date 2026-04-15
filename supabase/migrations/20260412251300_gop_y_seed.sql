-- Seed mẫu góp ý (idempotent theo tieu_de_gop_y + ngay)

INSERT INTO public.gop_y (ngay, tieu_de_gop_y, chi_tiet_gop_y, hinh_anh, trang_thai, tra_loi, id_nguoi_tao)
SELECT v.ngay, v.tieu_de_gop_y, v.chi_tiet_gop_y, v.hinh_anh::jsonb, v.trang_thai, v.tra_loi, NULL::bigint
FROM (
  VALUES
    (
      '2025-05-26'::date,
      'mục đoàn cơ sở'::text,
      'tài liệu còn ít'::text,
      '[]'::text,
      'da_tra_loi'::text,
      'cảm ơn bạn đã đóng góp tôi sẽ up tài liệu lên cho bạn bây giờ'::text
    )
) AS v(ngay, tieu_de_gop_y, chi_tiet_gop_y, hinh_anh, trang_thai, tra_loi)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.gop_y g
  WHERE g.ngay = v.ngay
    AND g.tieu_de_gop_y = v.tieu_de_gop_y
);
