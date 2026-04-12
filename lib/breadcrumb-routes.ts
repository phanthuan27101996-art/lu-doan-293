import { SIDEBAR_MENU } from './sidebar-menu';

export type BreadcrumbSegment = {
  to: string;
  labelKey: string;
  /** Truyền vào `t(labelKey, interpolation)` khi có */
  interpolation?: Record<string, string>;
};

export type EmployeeProfilePreviewBreadcrumbPhase = 'loading' | 'ready' | 'notFound' | 'loadError';

type EmployeePreviewNames = {
  ho_ten: string;
  recordId: string;
};

/**
 * Đường dẫn bổ sung (không nằm trong SIDEBAR_MENU) → key i18n.
 */
const EXTRA_PATH_LABEL_KEYS: Record<string, string> = {
  '/cai-dat': 'nav.settings',
  '/ho-so': 'nav.profile',
};

const MENU_PATH_TO_KEY: Record<string, string> = Object.fromEntries(
  SIDEBAR_MENU.map((m) => [m.path, m.nameKey])
);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * Chuỗi breadcrumb theo route một cấp: Trang chủ → trang hiện tại.
 * Đồng bộ nhãn với sidebar (`nameKey`).
 */
export function getBreadcrumbTrail(pathname: string): BreadcrumbSegment[] {
  const path = normalizePathname(pathname);
  if (path === '/') {
    return [{ to: '/', labelKey: 'nav.home' }];
  }
  const labelKey = MENU_PATH_TO_KEY[path] ?? EXTRA_PATH_LABEL_KEYS[path] ?? 'common.unknown';
  return [{ to: '/', labelKey: 'nav.home' }, { to: path, labelKey }];
}

const employeePreviewBase = (employeeId: string): BreadcrumbSegment[] => [
  { to: '/', labelKey: 'nav.home' },
  { to: '/danh-sach-quan-nhan', labelKey: 'nav.module.danhSachQuanNhan' },
  {
    to: `/ho-so-nhan-vien/${employeeId}`,
    labelKey: 'common.loading',
  },
];

/**
 * Breadcrumb cho `/ho-so-nhan-vien/:id` (preview, ngoài Layout).
 */
export function getEmployeeProfilePreviewBreadcrumbs(params: {
  employeeId: string;
  phase: EmployeeProfilePreviewBreadcrumbPhase;
  employee?: EmployeePreviewNames | null;
}): BreadcrumbSegment[] {
  const { employeeId, phase, employee } = params;
  const detailTo = `/ho-so-nhan-vien/${employeeId}`;

  if (phase === 'loading') {
    return employeePreviewBase(employeeId);
  }
  if (phase === 'ready' && employee) {
    return [
      { to: '/', labelKey: 'nav.home' },
      { to: '/danh-sach-quan-nhan', labelKey: 'nav.module.danhSachQuanNhan' },
      {
        to: detailTo,
        labelKey: 'employee.breadcrumb.previewLabel',
        interpolation: { hoTen: employee.ho_ten, recordId: employee.recordId },
      },
    ];
  }
  if (phase === 'notFound') {
    return [
      { to: '/', labelKey: 'nav.home' },
      { to: '/danh-sach-quan-nhan', labelKey: 'nav.module.danhSachQuanNhan' },
      { to: detailTo, labelKey: 'employee.breadcrumb.notFound' },
    ];
  }
  return [
    { to: '/', labelKey: 'nav.home' },
    { to: '/danh-sach-quan-nhan', labelKey: 'nav.module.danhSachQuanNhan' },
    { to: detailTo, labelKey: 'employee.breadcrumb.loadFailed' },
  ];
}
