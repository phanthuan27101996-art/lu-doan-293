-- Dữ liệu mẫu (tuỳ chọn): 3 tuần đầu tháng 1/2025 — chỉ text, file/ảnh bổ sung sau qua app
INSERT INTO public.moi_tuan_mot_dieu_luat (nam, thang, tuan, ten_dieu_luat, ghi_chu)
VALUES
  (
    2025,
    1,
    1,
    'Điều 6. Xử phạt, trừ điểm giấy phép lái xe của người điều khiển xe ô tô, xe chở người bốn bánh có gắn động cơ, xe chở hàng bốn bánh có gắn động cơ và các loại xe tương tự xe ô tô vi phạm quy tắc giao thông đường bộ',
    'Nghị định 168/2024/NĐ-CP ngày 26/12/2024 của Chính phủ quy định xử phạt vi phạm hành chính về trật tự, an toàn giao thông trong lĩnh vực giao thông đường bộ; trừ điểm, phục hồi điểm giấy phép lái xe'
  ),
  (
    2025,
    1,
    2,
    'Điều 7. Xử phạt, trừ điểm giấy phép lái của người điều khiển xe mô tô, xe gắn máy, các loại xe tương tự xe mô tô và các loại xe tương tự xe gắn máy vi phạm quy tắc giao thông đường bộ',
    'Nghị định 168/2024/NĐ-CP ngày 26/12/2024 của Chính phủ quy định xử phạt vi phạm hành chính về trật tự, an toàn giao thông trong lĩnh vực giao thông đường bộ; trừ điểm, phục hồi điểm giấy phép lái xe'
  ),
  (
    2025,
    1,
    3,
    'Điều 8. Xử phạt người điều khiển xe máy chuyên dùng vi phạm quy tắc giao thông đường bộ',
    'Nghị định 168/2024/NĐ-CP ngày 26/12/2024 của Chính phủ quy định xử phạt vi phạm hành chính về trật tự, an toàn giao thông trong lĩnh vực giao thông đường bộ; trừ điểm, phục hồi điểm giấy phép lái xe'
  )
ON CONFLICT (nam, thang, tuan) DO NOTHING;
