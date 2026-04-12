# 5F Template – Ứng dụng quản lý nội bộ

Ứng dụng web quản lý nghiệp vụ nội bộ Lữ đoàn: Trang chủ, các module chức năng, nhân sự/chức vụ/phân quyền, Cài đặt, Hồ sơ. Giao diện tiếng Việt, dark mode, tùy chọn màu chủ đạo.

## Yêu cầu

- Node.js (khuyến nghị LTS)

## Chạy dự án

1. Cài đặt phụ thuộc:
   ```bash
   npm install
   ```
2. Chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt theo địa chỉ in ra (thường là `http://localhost:5173`).

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server (Vite) |
| `npm run build` | Build production (output trong `dist/`) |
| `npm run preview` | Xem bản build (sau khi chạy `npm run build`) |
| `npm run test` | Chạy test (Vitest) |
| `npm run test:watch` | Chạy test ở chế độ watch |

## Tài liệu

- [Quy ước giao diện (UI Conventions)](docs/UI-CONVENTIONS.md) – Dialog/Drawer, Section, Design system (border radius, button, error message).

## Cấu trúc chính

- `App.tsx` – Router, theme, ngôn ngữ, route bảo vệ.
- `components/` – Layout, UI dùng chung (Button, Input, Table, …), shared (ConfirmDialog, ErrorState, …).
- `features/he-thong/` – Module Hệ thống: nhân viên, phòng ban, chức vụ, cấp bậc, thông tin công ty, sao lưu, phân quyền.
- `lib/` – Tiện ích, i18n, theme, dialog-sizes, sidebar menu.
- `locales/` – Bản dịch (vi.json, en.json).
- `pages/` – Trang đơn (Home, Login, Settings, Profile, …).
- `store/` – Zustand (auth, UI, confirm).
