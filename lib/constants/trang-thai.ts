/**
 * Hằng số trạng thái lưu trên Supabase/DB bằng tiếng Việt có dấu.
 * Chỉ giữ các constant dùng chung nhiều module; trạng thái theo từng nghiệp vụ nằm trong core/constants.ts của từng feature.
 */

/** Hai trạng thái bật/tắt (Active/Inactive) – dùng cho Phòng ban, Chức vụ, Chi nhánh, Cấp bậc, Kho, Hàng hóa, v.v. */
export const TRANG_THAI_HOAT_DONG = ['Ngừng hoạt động', 'Đang hoạt động'] as const;
export type TrangThaiHoatDong = (typeof TRANG_THAI_HOAT_DONG)[number];

/** Trạng thái phiếu 3 bước (Chờ duyệt, Đã duyệt, Không duyệt) – Phiếu đề xuất VT, Phiếu kho, v.v. */
export const TRANG_THAI_PHIEU_3 = ['Chờ duyệt', 'Đã duyệt', 'Không duyệt'] as const;
export type TrangThaiPhieu3 = (typeof TRANG_THAI_PHIEU_3)[number];

/** Map số cũ (0/1) sang TrangThaiHoatDong – dùng khi migrate mock hoặc đọc dữ liệu cũ */
export function soSangTrangThaiHoatDong(n: number): TrangThaiHoatDong {
  return n === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động';
}

/** Map TrangThaiHoatDong sang số (0/1) – chỉ dùng tạm nếu cần tương thích ngược */
export function trangThaiHoatDongSangSo(t: TrangThaiHoatDong): 0 | 1 {
  return t === 'Đang hoạt động' ? 1 : 0;
}
