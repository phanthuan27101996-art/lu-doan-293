-- Đăng ký xong → coi email đã xác nhận ngay (phù hợp luồng SĐT → pseudo-email, không gửi mail thật).
-- Cách khác không cần migration: Supabase Dashboard → Authentication → Providers → Email → tắt "Confirm email".

CREATE OR REPLACE FUNCTION public.handle_auth_user_auto_confirm_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    UPDATE auth.users
    SET email_confirmed_at = timezone('utc'::text, now())
    WHERE id = NEW.id
      AND email_confirmed_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm_email ON auth.users;

CREATE TRIGGER on_auth_user_created_auto_confirm_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_auth_user_auto_confirm_email();
