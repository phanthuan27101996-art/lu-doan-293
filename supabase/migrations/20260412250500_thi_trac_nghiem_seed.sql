-- Dữ liệu mẫu đề thi trắc nghiệm (idempotent theo link)

INSERT INTO public.thi_trac_nghiem (nhom, ten_de_thi, link, id_nguoi_tao)
SELECT
  'CHIẾN SĨ MỚI',
  'KIỂM TRA NHẬN THỨC SAU MỘT THÁNG HUẤN  LUYỆN',
  'https://myaloha.vn/cuoc-thi/kiem-tra-nhan-thuc-chinh-tri-chien-si-moi-nam-2025-100244',
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM public.thi_trac_nghiem t
  WHERE t.link = 'https://myaloha.vn/cuoc-thi/kiem-tra-nhan-thuc-chinh-tri-chien-si-moi-nam-2025-100244'
);

INSERT INTO public.thi_trac_nghiem (nhom, ten_de_thi, link, id_nguoi_tao)
SELECT
  'CÁN BỘ, ĐOÀN VIÊN',
  '“Tự hào Việt Nam” kỷ niệm 50 năm Ngày Giải phóng miền Nam, thống nhất đất nước; 80 năm Cách mạng tháng Tám thành công và Quốc khánh nước Cộng hòa xã hội chủ nghĩa Việt Nam',
  'https://thitructuyen.baocaovien.vn/lam-bai-kiem-tra/cuoc-thi-truc-tuyen-tu-hao-viet-nam',
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM public.thi_trac_nghiem t
  WHERE t.link = 'https://thitructuyen.baocaovien.vn/lam-bai-kiem-tra/cuoc-thi-truc-tuyen-tu-hao-viet-nam'
);
