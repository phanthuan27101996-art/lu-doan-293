-- Đăng ký: khách (anon) xem danh sách chức vụ; sau khi tạo user auth → tự thêm dòng danh_sach_quan_nhan
-- từ user_metadata (full_name, phone, id_chuc_vu) do app gửi lúc signUp.

-- ---------------------------------------------------------------------------
-- chuc_vu: cho phép đọc khi chưa đăng nhập (trang đăng ký)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "chuc_vu_select_anon" ON public.chuc_vu;

CREATE POLICY "chuc_vu_select_anon"
  ON public.chuc_vu
  FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------------------
-- Trigger auth: INSERT vào danh_sach_quan_nhan (SECURITY DEFINER, bỏ qua RLS)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user_to_quan_nhan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full text;
  v_phone text;
  v_cv text;
  v_cv_id bigint;
BEGIN
  v_full := COALESCE(trim(NEW.raw_user_meta_data->>'full_name'), '');
  v_phone := NULLIF(trim(NEW.raw_user_meta_data->>'phone'), '');
  v_cv := NULLIF(trim(NEW.raw_user_meta_data->>'id_chuc_vu'), '');

  IF v_full = '' OR v_phone IS NULL OR length(v_phone) < 10 THEN
    RETURN NEW;
  END IF;

  v_cv_id := NULL;
  IF v_cv IS NOT NULL AND v_cv ~ '^[0-9]+$' THEN
    v_cv_id := v_cv::bigint;
  END IF;

  INSERT INTO public.danh_sach_quan_nhan (ho_va_ten, so_dien_thoai, avatar, id_chuc_vu)
  VALUES (v_full, v_phone, NULL, v_cv_id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Không hủy đăng ký auth nếu insert danh sách lỗi (FK, trùng, …)
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_quan_nhan ON auth.users;

CREATE TRIGGER on_auth_user_created_quan_nhan
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_auth_user_to_quan_nhan();
