-- Seed mẫu kho_video (idempotent theo cặp bo_suu_tap + ten_video)

INSERT INTO public.kho_video (bo_suu_tap, ten_video, ghi_chu, link, id_nguoi_tao)
SELECT v.bo_suu_tap, v.ten_video, v.ghi_chu, v.link, NULL::bigint
FROM (
  VALUES
    (
      'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
      'Bài 5 - Vũ điệu hòa bình',
      NULL::text,
      'https://www.youtube.com/watch?v=7-EojpWbV-Q'::text
    ),
    (
      'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
      'Bài 4 - Vũ Điệu Lính trẻ',
      NULL::text,
      'https://www.youtube.com/watch?v=4-jX5SrBmZU'::text
    ),
    (
      'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
      'Bài 3 - Vũ Điệu Hành Quân',
      NULL::text,
      'https://www.youtube.com/watch?v=p2qXe9IfjTk'::text
    ),
    (
      'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
      'Bài 2 - Vũ điệu quân dân',
      NULL::text,
      'https://www.youtube.com/watch?v=ZB80hf-6iIc'::text
    ),
    (
      'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
      'Bài 1 - Vũ điệu niềm tin',
      NULL::text,
      'https://www.youtube.com/watch?v=JHM8r15QHP0'::text
    )
) AS v(bo_suu_tap, ten_video, ghi_chu, link)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.kho_video k
  WHERE k.bo_suu_tap = v.bo_suu_tap
    AND k.ten_video = v.ten_video
);
