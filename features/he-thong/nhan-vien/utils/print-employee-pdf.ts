/**
 * Xuất hồ sơ quân nhân ra PDF / preview HTML (dữ liệu gọn theo bảng danh_sach_quan_nhan).
 */
import type { Employee } from '../core/types';
import { formatDate, formatDateTime, getAvatarUrl } from '@/lib/utils';
import i18n from '../../../../lib/i18n';
import { APP_DISPLAY_NAME } from '../../../../lib/branding';

export interface EmployeePdfSectionRow {
  label: string;
  value: string;
}

export interface EmployeePdfSection {
  title: string;
  rows: EmployeePdfSectionRow[];
}

const PDF_MARGIN_X = 14;
const PDF_PRIMARY_COLOR: [number, number, number] = [59, 130, 246];

export function buildEmployeeProfileSections(emp: Employee): EmployeePdfSection[] {
  return [
    {
      title: i18n.t('employee.pdf.personalInfo'),
      rows: [
        { label: i18n.t('employee.detail.fullName'), value: emp.ho_ten },
        { label: i18n.t('employee.detail.phone'), value: emp.so_dien_thoai },
        { label: i18n.t('employee.detail.position'), value: emp.ten_chuc_vu || '—' },
        { label: 'id', value: emp.id },
      ],
    },
    {
      title: i18n.t('employee.pdf.contactInfo'),
      rows: [{ label: i18n.t('employee.detail.phone'), value: emp.so_dien_thoai }],
    },
    {
      title: i18n.t('employee.detail.systemInfo'),
      rows: [
        { label: i18n.t('employee.store.createdCol'), value: emp.tg_tao ? formatDateTime(emp.tg_tao) : '—' },
        { label: i18n.t('employee.store.updatedCol'), value: emp.tg_cap_nhat ? formatDate(emp.tg_cap_nhat) : '—' },
      ],
    },
  ];
}

export async function printEmployeePDF(emp: Employee): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(...PDF_PRIMARY_COLOR);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(APP_DISPLAY_NAME, PDF_MARGIN_X, 12);
  doc.setFontSize(11);
  doc.text(i18n.t('employee.detail.title'), PDF_MARGIN_X, 20);

  let y = 34;
  doc.setTextColor(30, 30, 30);
  const sections = buildEmployeeProfileSections(emp);
  for (const section of sections) {
    doc.setFontSize(11);
    doc.setTextColor(...PDF_PRIMARY_COLOR);
    doc.text(section.title, PDF_MARGIN_X, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Thông tin', 'Giá trị']],
      body: section.rows.map((r) => [r.label, r.value]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: PDF_PRIMARY_COLOR },
      margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  const imgUrl = emp.anh_dai_dien || getAvatarUrl(emp.ho_ten);
  try {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          doc.addImage(img, 'JPEG', pageW - 40, 32, 28, 28);
        } catch {
          /* ignore */
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = imgUrl;
    });
  } catch {
    /* ignore */
  }

  doc.save(`HoSo_${emp.id}.pdf`);
}
