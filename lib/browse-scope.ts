/**
 * Hằng phạm vi duyệt theo cấp (« Xem tất cả » — danh sách không drill sâu hơn).
 */

/** Tài liệu: cấp 1 — toàn bộ chức vụ */
export const BROWSE_ALL_TAI_LIEU_CHUC_VU = '__all_chuc_vu__' as const;

/** Tài liệu: cấp 2 — toàn bộ nhóm trong chức vụ đã chọn */
export const BROWSE_ALL_TAI_LIEU_NHOM = '__all_nhom__' as const;

/** Mỗi tuần / Mỗi ngày: tất cả tháng trong năm đã chọn */
export const BROWSE_ALL_MONTHS_IN_YEAR = '__all_months__' as const;

/** Danh sách không lọc theo năm (mọi năm có dữ liệu) — dùng selectedNam === -1 */
export const BROWSE_ALL_YEARS_SENTINEL = -1;

/** Kho nhạc / Kho video: toàn bộ bộ sưu tập (không drill theo một bộ) */
export const BROWSE_ALL_BO_SUU_TAP = '__all_bo_suu_tap__' as const;
