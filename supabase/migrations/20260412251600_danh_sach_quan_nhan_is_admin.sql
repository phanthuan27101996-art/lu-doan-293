-- Quản trị: chỉ quân nhân có is_admin mới được dùng module Phân quyền (app + RLS mở rộng sau).
ALTER TABLE public.danh_sach_quan_nhan
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.danh_sach_quan_nhan.is_admin IS 'TRUE = tài khoản quản trị: được xem / thao tác module Phân quyền trên app.';

CREATE INDEX IF NOT EXISTS idx_dsqn_is_admin ON public.danh_sach_quan_nhan USING btree (is_admin)
  WHERE is_admin = true;
