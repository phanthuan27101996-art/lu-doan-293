/**
 * Constants for Employee Stats / Dashboard
 */

import i18n from '../../../../lib/i18n';

export type DateRangePresetId = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'custom';

export const DATE_RANGE_PRESETS: { id: DateRangePresetId; label: string }[] = [
  { id: 'this_week', get label() { return i18n.t('employee.stats.preset.thisWeek'); } },
  { id: 'last_week', get label() { return i18n.t('employee.stats.preset.lastWeek'); } },
  { id: 'this_month', get label() { return i18n.t('employee.stats.preset.thisMonth'); } },
  { id: 'last_month', get label() { return i18n.t('employee.stats.preset.lastMonth'); } },
  { id: 'this_quarter', get label() { return i18n.t('employee.stats.preset.thisQuarter'); } },
  { id: 'last_quarter', get label() { return i18n.t('employee.stats.preset.lastQuarter'); } },
  { id: 'this_year', get label() { return i18n.t('employee.stats.preset.thisYear'); } },
  { id: 'custom', get label() { return i18n.t('employee.stats.preset.custom'); } },
];

export const DEPT_COLORS = [
  '#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

import type { TrangThaiNhanVien } from './constants';

export const STATUS_COLORS: Record<TrangThaiNhanVien, string> = {
  'Đang làm việc': '#10b981',
  'Thử việc': '#3b82f6',
  'Nghỉ phép': '#f59e0b',
  'Nghỉ việc': '#94a3b8',
};

export const STATUS_LABELS: Record<TrangThaiNhanVien, string> = {
  'Đang làm việc': i18n.t('employee.statusActive'),
  'Thử việc': i18n.t('employee.statusProbation'),
  'Nghỉ phép': i18n.t('employee.statusLeave'),
  'Nghỉ việc': i18n.t('employee.statusResigned'),
};

export const GENDER_COLORS: Record<string, string> = {
  Nam: '#6366f1',
  Nữ: '#ec4899',
  Khác: '#94a3b8',
};

export const GENDER_LABELS: Record<string, string> = {
  get Nam() { return i18n.t('employee.genderMale'); },
  get Nữ() { return i18n.t('employee.genderFemale'); },
  get Khác() { return i18n.t('employee.genderOther'); },
};

/** KPI ids used for visibility config (localStorage) */
export const DEFAULT_KPI_IDS = ['total', 'active', 'probation', 'inactive'] as const;
export const STATS_KPI_STORAGE_KEY = 'nhan-vien-stats-kpi';

/** Max months non-admin can select for date range (security) */
export const MAX_DATE_RANGE_MONTHS_NON_ADMIN = 12;

/** Chiều cao chuẩn cho biểu đồ stats (Recharts ResponsiveContainer) */
export const STATS_CHART_HEIGHT = 200;
