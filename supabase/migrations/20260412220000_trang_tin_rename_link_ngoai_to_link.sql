-- Đổi tên cột link_ngoai → link (nếu bảng đã tạo từ migration cũ)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trang_tin'
      AND column_name = 'link_ngoai'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trang_tin'
      AND column_name = 'link'
  ) THEN
    ALTER TABLE public.trang_tin RENAME COLUMN link_ngoai TO link;
  END IF;
END;
$$;
