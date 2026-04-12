import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import i18n from "./i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Locale cố định tiếng Việt — dùng cho Intl, localeCompare, toLocaleDateString */
export function getLocale(): string {
  return 'vi-VN'
}

/** Mã ngôn ngữ hiển thị (luôn vi). */
export function getLanguage(): string {
  return 'vi'
}

/** Hash chuỗi thành số (deterministic) – dùng cho màu avatar */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Bảng màu nền avatar (hex không #) – tương phản tốt với chữ trắng */
const AVATAR_BG_PALETTE = [
  '0f172a', '1e40af', '7c3aed', '059669', '0891b2', 'dc2626', 'ea580c', '4f46e5',
  'be185d', '0d9488', '7c2d12', '475569', '15803d', 'c026d3', '0369a1', 'b45309',
]

/** URL avatar fallback (logo chữ) từ ui-avatars.com – cùng tên = cùng màu, thống nhất toàn app */
export function getAvatarUrl(displayName: string, size?: number): string {
  const name = (displayName || 'User').trim() || 'User'
  const idx = hashString(name) % AVATAR_BG_PALETTE.length
  const background = AVATAR_BG_PALETTE[idx]
  const params = new URLSearchParams({
    name: name,
    background,
    color: 'fff',
  })
  if (size != null && size > 0) params.set('size', String(size))
  return `https://ui-avatars.com/api/?${params.toString()}`
}

/** dayjs theo giờ địa phương trình duyệt */
function parseLocal(value: string | Date | dayjs.Dayjs): dayjs.Dayjs {
  return dayjs(value)
}

function dayjsNow(): dayjs.Dayjs {
  return dayjs()
}

function getDisplayDateFormat(): string {
  return 'DD/MM/YYYY'
}
function getDisplayDateTimeFormat(): string {
  return 'DD/MM/YYYY HH:mm'
}
function getDisplayDateTimeFormatShort(): string {
  return 'HH:mm - DD/MM/YYYY'
}
function getDisplayDateFormatShort(): string {
  return 'DD/MM'
}
function getDisplayTimeDateShortFormat(): string {
  return 'HH:mm DD/MM'
}
function getDisplayDateShortTimeFormat(): string {
  return 'DD/MM HH:mm'
}

/** Định dạng ngày hiển thị (DD/MM/YYYY) */
export const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY'
export const DATETIME_DISPLAY_FORMAT = 'DD/MM/YYYY HH:mm'
export const DATETIME_DISPLAY_FORMAT_SHORT = 'HH:mm - DD/MM/YYYY'

export function formatDate(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format(getDisplayDateFormat())
}

export function formatDateTime(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format(getDisplayDateTimeFormat())
}

export function formatDateTimeShort(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format(getDisplayDateTimeFormatShort())
}

/** Chỉ giờ (HH:mm) */
export function formatTime(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format('HH:mm')
}

/** Ngày tháng ngắn (vi: DD/MM, en: MM/DD) */
export function formatDateShort(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format(getDisplayDateFormatShort())
}

/** Tháng/năm (MM/YYYY) – giữ chung cho cả hai locale */
export function formatMonthYear(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format('MM/YYYY')
}

/** Tháng/năm 2 chữ số (MM/YY) */
export function formatMonthYearShort(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format('MM/YY')
}

/** HH:mm + ngày tháng ngắn (vi: HH:mm DD/MM, en: HH:mm MM/DD) */
export function formatTimeDateShort(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format(getDisplayTimeDateShortFormat())
}

/** Ngày tháng ngắn + HH:mm (vi: DD/MM HH:mm, en: MM/DD HH:mm) */
export function formatDateShortTime(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format(getDisplayDateShortTimeFormat())
}

/** Ngày hôm nay dạng ISO (YYYY-MM-DD) theo giờ địa phương */
export function getTodayISO(): string {
  return dayjsNow().format('YYYY-MM-DD')
}

/** Giá trị ngày cho input type="date" (YYYY-MM-DD) */
export function formatDateForInput(value: string | Date | dayjs.Dayjs | null | undefined): string {
  if (value == null) return ''
  return parseLocal(value).format('YYYY-MM-DD')
}

/** Phần ngày/tháng/năm cho dòng "Ngày DD tháng MM năm YYYY" (in ấn) */
export function getTodayParts(): { day: string; month: string; year: string } {
  const d = dayjsNow()
  return { day: d.format('DD'), month: d.format('MM'), year: d.format('YYYY') }
}

/** Ngày sau N ngày (vi: dd/mm/yyyy, en: mm/dd/yyyy) */
export function addDaysFormatted(days: number): string {
  return dayjsNow().add(days, 'day').format(getDisplayDateFormat())
}

/** Thâm niên từ ngày vào làm: "X năm Y tháng" / "X years Y months" */
export function getTenureText(startDate: string | Date | dayjs.Dayjs | null | undefined): string {
  if (startDate == null) return ''
  const now = dayjsNow()
  const start = parseLocal(startDate)
  const years = now.diff(start, 'year')
  const months = now.diff(start, 'month') % 12
  return `${years} ${i18n.t('tenure.year')} ${months} ${i18n.t('tenure.month')}`
}

/** Ngày hiện tại dạng YYYYMMDD (tên file export/backup) */
export function getTodayFileDate(): string {
  return dayjsNow().format('YYYYMMDD')
}

/** Ngày hiện tại dạng YYYY-MM-DD (tên file export) */
export function getTodayISODate(): string {
  return dayjsNow().format('YYYY-MM-DD')
}

/** Thời điểm hiện tại (giờ địa phương) — dùng cho preset khoảng ngày thống kê. */
export function getNowAsLocalDate(): Date {
  return new Date()
}

const APP_SANS_FONT_STACK = "'Inter', 'Noto Sans', system-ui, sans-serif"

/** Font stack cố định cho export HTML/PDF (khớp giao diện app) */
export function getFontStack(): string {
  return APP_SANS_FONT_STACK
}

// Định dạng số thành tiền tệ VND (locale vi-VN)
export function formatCurrency(value: number) {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export function exportToExcel(data: any[], filename: string) {
  if (!data || !data.length) return;
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${getTodayISODate()}.xlsx`);
  });
}

export function exportToPDF(data: any[], filename: string, title?: string) {
  if (!data || !data.length) return;
  Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]).then(([jspdfModule, autoTableModule]) => {
    const jsPDF = (jspdfModule as { default?: typeof import('jspdf') }).default;
    if (!jsPDF) return;
    const headers = Object.keys(data[0]);
    const doc = new jsPDF({ orientation: headers.length > 5 ? 'l' : 'p', unit: 'mm', format: 'a4' });
    if (title) { doc.setFontSize(12); doc.text(title, 14, 15); }
    const autoTable = autoTableModule.default;
    autoTable(doc, {
      head: [headers],
      body: data.map(row => headers.map(h => String(row[h] ?? ''))),
      startY: title ? 22 : 10,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`${filename}_${getTodayISODate()}.pdf`);
  }).catch(() => {});
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  // Lấy header từ key của object đầu tiên
  const headers = Object.keys(data[0]);
  
  // Tạo nội dung CSV với BOM để hỗ trợ tiếng Việt trong Excel
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      let cell = row[fieldName];
      // Xử lý null/undefined
      if (cell === null || cell === undefined) cell = '';
      // Convert sang string và escape dấu ngoặc kép
      cell = cell.toString().replace(/"/g, '""');
      // Bọc trong ngoặc kép nếu có ký tự đặc biệt
      if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
      return cell;
    }).join(','))
  ].join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${getTodayISODate()}.csv`);
  document.body.appendChild(link);
  
  link.click();
  document.body.removeChild(link);
}
