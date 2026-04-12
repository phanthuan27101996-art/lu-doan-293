-- Avatar mặc định khi đăng ký: lấy từ user_metadata.avatar_url (app gửi lúc signUp), fallback URL cố định.

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
  v_avatar text;
  v_default_avatar constant text := 'https://ui-avatars.com/api/?name=QN&background=0d9488&color=fff&size=128';
BEGIN
  v_full := COALESCE(trim(NEW.raw_user_meta_data->>'full_name'), '');
  v_phone := NULLIF(trim(NEW.raw_user_meta_data->>'phone'), '');
  v_cv := NULLIF(trim(NEW.raw_user_meta_data->>'id_chuc_vu'), '');
  v_avatar := NULLIF(trim(NEW.raw_user_meta_data->>'avatar_url'), '');

  IF v_full = '' OR v_phone IS NULL OR length(v_phone) < 10 THEN
    RETURN NEW;
  END IF;

  v_cv_id := NULL;
  IF v_cv IS NOT NULL AND v_cv ~ '^[0-9]+$' THEN
    v_cv_id := v_cv::bigint;
  END IF;

  INSERT INTO public.danh_sach_quan_nhan (ho_va_ten, so_dien_thoai, avatar, id_chuc_vu)
  VALUES (
    v_full,
    v_phone,
    COALESCE(v_avatar, v_default_avatar),
    v_cv_id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;
