import type { LucideIcon } from 'lucide-react';
import {
  Home as HomeIcon,
  Landmark,
  Newspaper,
  FileText,
  ScrollText,
  Scale,
  Quote,
  ClipboardList,
  UsersRound,
  Video,
  Music,
  MessageSquarePlus,
  Users,
  BadgeCheck,
  Shield,
} from 'lucide-react';

export interface MenuItem {
  path: string;
  nameKey: string;
  descriptionKey?: string;
  icon: LucideIcon;
  /** Giữ cho tương thích / mở rộng (sidebar hiện không dùng) */
  gradient: string;
  /** Màu ô icon trên thẻ dạng danh sách (SubModuleCard): class `bg-*-500` */
  listColor?: string;
}

/**
 * Menu sidebar và thẻ Trang chủ — một cấp, không submenu.
 * Thứ tự khớp yêu cầu nghiệp vụ Lữ đoàn.
 */
export const SIDEBAR_MENU: MenuItem[] = [
  {
    path: '/',
    nameKey: 'nav.home',
    descriptionKey: 'page.home.homeDesc',
    icon: HomeIcon,
    gradient: 'bg-gradient-to-br from-primary/90 to-primary',
  },
  {
    path: '/truyen-thong',
    nameKey: 'nav.module.truyenThong',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: Landmark,
    gradient: 'bg-gradient-to-br from-amber-600 to-amber-900',
    listColor: 'bg-amber-500',
  },
  {
    path: '/trang-tin',
    nameKey: 'nav.module.trangTin',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: Newspaper,
    gradient: 'bg-gradient-to-br from-sky-600 to-sky-900',
    listColor: 'bg-cyan-500',
  },
  {
    path: '/tai-lieu',
    nameKey: 'nav.module.taiLieu',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: FileText,
    gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-900',
    listColor: 'bg-emerald-500',
  },
  {
    path: '/cong-van',
    nameKey: 'nav.module.congVan',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: ScrollText,
    gradient: 'bg-gradient-to-br from-violet-600 to-violet-900',
    listColor: 'bg-violet-500',
  },
  {
    path: '/moi-tuan-mot-dieu-luat',
    nameKey: 'nav.module.moiTuanMotDieuLuat',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: Scale,
    gradient: 'bg-gradient-to-br from-slate-600 to-slate-900',
    listColor: 'bg-slate-500',
  },
  {
    path: '/moi-ngay-mot-loi-day-bac-ho',
    nameKey: 'nav.module.moiNgayMotLoiDayBacHo',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: Quote,
    gradient: 'bg-gradient-to-br from-rose-600 to-rose-900',
    listColor: 'bg-rose-500',
  },
  {
    path: '/thi-trac-nghiem',
    nameKey: 'nav.module.thiTracNghiem',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: ClipboardList,
    gradient: 'bg-gradient-to-br from-indigo-600 to-indigo-900',
    listColor: 'bg-indigo-500',
  },
  {
    path: '/doan-co-so',
    nameKey: 'nav.module.doanCoSo',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: UsersRound,
    gradient: 'bg-gradient-to-br from-teal-600 to-teal-900',
    listColor: 'bg-teal-500',
  },
  {
    path: '/kho-video',
    nameKey: 'nav.module.khoVideo',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: Video,
    gradient: 'bg-gradient-to-br from-red-600 to-red-900',
    listColor: 'bg-red-500',
  },
  {
    path: '/kho-nhac',
    nameKey: 'nav.module.khoNhac',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: Music,
    gradient: 'bg-gradient-to-br from-fuchsia-600 to-fuchsia-900',
    listColor: 'bg-fuchsia-500',
  },
  {
    path: '/gop-y',
    nameKey: 'nav.module.gopY',
    descriptionKey: 'page.home.modulePlaceholderDesc',
    icon: MessageSquarePlus,
    gradient: 'bg-gradient-to-br from-orange-600 to-orange-900',
    listColor: 'bg-orange-500',
  },
  {
    path: '/danh-sach-quan-nhan',
    nameKey: 'nav.module.danhSachQuanNhan',
    descriptionKey: 'page.home.danhSachQuanNhanDesc',
    icon: Users,
    gradient: 'bg-gradient-to-br from-green-600 to-green-900',
    listColor: 'bg-emerald-500',
  },
  {
    path: '/chuc-vu',
    nameKey: 'nav.module.chucVu',
    descriptionKey: 'page.home.chucVuDesc',
    icon: BadgeCheck,
    gradient: 'bg-gradient-to-br from-blue-600 to-blue-900',
    listColor: 'bg-blue-500',
  },
  {
    path: '/phan-quyen',
    nameKey: 'nav.module.phanQuyen',
    descriptionKey: 'page.home.phanQuyenDesc',
    icon: Shield,
    gradient: 'bg-gradient-to-br from-zinc-600 to-zinc-900',
    listColor: 'bg-slate-500',
  },
];
