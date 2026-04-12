/**
 * Cấu hình phân quyền theo menu thực tế: một cấp module (không submenu).
 */

export interface PermissionModuleItem {
  id: string;
  nameKey: string;
}

export interface PermissionModuleGroup {
  groupTitleKey: string;
  modules: PermissionModuleItem[];
}

export interface PermissionFunction {
  id: string;
  nameKey: string;
  color: string;
  groups: PermissionModuleGroup[];
}

/** 6 quyền dùng cho tất cả module: Xem, Thêm, Sửa, Xoá, Quản trị, Tất cả */
export const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete', 'admin', 'all'] as const;
export type PermissionActionType = (typeof PERMISSION_ACTIONS)[number];

/** Một chức năng gốc chứa toàn bộ module phẳng (id trùng segment đường dẫn). */
export const PERMISSION_FUNCTIONS: PermissionFunction[] = [
  {
    id: 'ung-dung',
    nameKey: 'permission.appRootName',
    color: 'slate',
    groups: [
      {
        groupTitleKey: 'permission.matrix.appModulesGroup',
        modules: [
          { id: 'truyen-thong', nameKey: 'nav.module.truyenThong' },
          { id: 'trang-tin', nameKey: 'nav.module.trangTin' },
          { id: 'tai-lieu', nameKey: 'nav.module.taiLieu' },
          { id: 'cong-van', nameKey: 'nav.module.congVan' },
          { id: 'moi-tuan-mot-dieu-luat', nameKey: 'nav.module.moiTuanMotDieuLuat' },
          { id: 'moi-ngay-mot-loi-day-bac-ho', nameKey: 'nav.module.moiNgayMotLoiDayBacHo' },
          { id: 'thi-trac-nghiem', nameKey: 'nav.module.thiTracNghiem' },
          { id: 'doan-co-so', nameKey: 'nav.module.doanCoSo' },
          { id: 'kho-video', nameKey: 'nav.module.khoVideo' },
          { id: 'kho-nhac', nameKey: 'nav.module.khoNhac' },
          { id: 'gop-y', nameKey: 'nav.module.gopY' },
          { id: 'danh-sach-quan-nhan', nameKey: 'nav.module.danhSachQuanNhan' },
          { id: 'chuc-vu', nameKey: 'nav.module.chucVu' },
          { id: 'phan-quyen', nameKey: 'nav.module.phanQuyen' },
        ],
      },
    ],
  },
];

/** Danh sách phẳng tất cả module (id, nameKey) cho service / quyen_han */
export function getAllPermissionModules(): { id: string; nameKey: string }[] {
  const list: { id: string; nameKey: string }[] = [];
  PERMISSION_FUNCTIONS.forEach((fn) => {
    fn.groups.forEach((gr) => {
      gr.modules.forEach((m) => list.push({ id: m.id, nameKey: m.nameKey }));
    });
  });
  return list;
}
