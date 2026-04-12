import { useMemo } from 'react';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';
import type { Employee } from '../core/types';
import type { DeptChartItem, DeptSummaryRow } from '../core/stats-types';
import { DEPT_COLORS, DEFAULT_KPI_IDS } from '../core/stats-constants';
import type { StatsDateRange, KpiItem, StatsTrends, StatsMiniSummary } from '../core/stats-types';
import { getMonthKeysEndingAt } from '../utils/stats-date-range';
import i18n from '../../../../lib/i18n';

function hireDateStr(emp: Employee): string {
  if (emp.tg_tao) return String(emp.tg_tao).slice(0, 10);
  return '1970-01-01';
}

function isOnOrBefore(dateStr: string, asAt: Date): boolean {
  const y = asAt.getFullYear();
  const m = asAt.getMonth() + 1;
  const d = asAt.getDate();
  const limit = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const limitShort = `${y}-${String(m).padStart(2, '0')}`;
  return dateStr <= limit || dateStr.startsWith(limitShort);
}

interface UseEmployeeStatsParams {
  employees: Employee[];
  filterPosition: string[];
  filterStatus: string[];
  dateRange: StatsDateRange;
  visibleKpiIds?: string[];
}

export function useEmployeeStats({
  employees,
  filterPosition,
  filterStatus: _filterStatus,
  dateRange,
  visibleKpiIds = [...DEFAULT_KPI_IDS],
}: UseEmployeeStatsParams) {
  const filtered = useMemo(() => {
    const asAt = dateRange.end;
    return employees.filter((emp) => {
      const hire = hireDateStr(emp);
      if (!isOnOrBefore(hire, asAt)) return false;
      const matchPosition =
        filterPosition.length === 0 || (emp.chuc_vu_id && filterPosition.includes(emp.chuc_vu_id));
      return matchPosition;
    });
  }, [employees, filterPosition, dateRange.end]);

  const total = filtered.length;
  const active = total;
  const probation = 0;
  const inactive = 0;

  const pct = (n: number) => (total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%');

  const trends = useMemo((): StatsTrends => {
    const end = dateRange.end;
    const thisMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(end.getFullYear(), end.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const hiredThisMonth = filtered.filter((e) => hireDateStr(e).startsWith(thisMonth)).length;
    const hiredPrevMonth = filtered.filter((e) => hireDateStr(e).startsWith(prevMonth)).length;

    return {
      totalDelta: hiredThisMonth,
      activeDelta: hiredThisMonth - hiredPrevMonth,
      hiredThisMonth,
      hiredPrevMonth,
      totalYoY: 0,
      activeYoY: undefined,
    };
  }, [filtered, dateRange.end]);

  const deptData = useMemo((): DeptChartItem[] => {
    const map: Record<string, { value: number; drillChucVuId: string | null }> = {};
    filtered.forEach((e) => {
      const name = e.ten_chuc_vu || i18n.t('employee.unassigned');
      if (!map[name]) map[name] = { value: 0, drillChucVuId: e.chuc_vu_id ?? null };
      map[name].value++;
    });
    return Object.entries(map)
      .map(([name, { value, drillChucVuId }]) => ({ name, value, drillChucVuId }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const statusData = useMemo(
    () => [
      {
        key: 'all',
        name: i18n.t('employee.stats.totalEmployees'),
        value: total,
        fill: '#3b82f6',
      },
    ],
    [total],
  );

  const monthKeys = useMemo(() => getMonthKeysEndingAt(dateRange.end, 12), [dateRange.end]);

  const hiringData = useMemo(
    () =>
      monthKeys.map(({ key, label }) => ({
        label,
        count: filtered.filter((e) => hireDateStr(e).startsWith(key)).length,
      })),
    [filtered, monthKeys],
  );

  const genderData = useMemo(() => {
    if (filtered.length === 0) return [];
    return [{ name: i18n.t('employee.stats.totalEmployees'), value: filtered.length, fill: '#6366f1' }];
  }, [filtered]);

  const deptSummary = useMemo((): DeptSummaryRow[] => {
    const map: Record<
      string,
      { total: number; active: number; probation: number; inactive: number; drillChucVuId: string | null }
    > = {};
    filtered.forEach((e) => {
      const name = e.ten_chuc_vu || i18n.t('employee.unassigned');
      if (!map[name]) {
        map[name] = { total: 0, active: 0, probation: 0, inactive: 0, drillChucVuId: e.chuc_vu_id ?? null };
      }
      map[name].total++;
      map[name].active++;
    });
    return Object.entries(map)
      .map(([name, stats]) => ({
        name,
        drillChucVuId: stats.drillChucVuId,
        total: stats.total,
        active: stats.active,
        probation: stats.probation,
        inactive: stats.inactive,
        rate: stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : '0',
      }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const miniSummary = useMemo((): StatsMiniSummary => {
    const topDept = deptData[0] ?? null;
    return {
      hiredThisMonth: trends.hiredThisMonth,
      maleCount: total,
      femaleCount: 0,
      topDept,
    };
  }, [deptData, trends.hiredThisMonth, total]);

  const allKpis: KpiItem[] = useMemo(
    () => [
      {
        id: 'total',
        label: i18n.t('employee.stats.totalEmployees'),
        value: total,
        icon: Users,
        color: 'text-primary',
        bg: 'bg-primary/10',
        pct: null,
        delta: trends.totalDelta,
      },
      {
        id: 'active',
        label: i18n.t('employee.stats.working'),
        value: active,
        icon: UserCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        pct: pct(active),
        delta: trends.activeDelta,
      },
      {
        id: 'probation',
        label: i18n.t('employee.stats.probation'),
        value: probation,
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        pct: pct(probation),
        delta: null,
      },
      {
        id: 'inactive',
        label: i18n.t('employee.stats.leaveResigned'),
        value: inactive,
        icon: UserX,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        pct: pct(inactive),
        delta: null,
      },
    ],
    [total, active, probation, inactive, pct, trends],
  );

  const kpis = useMemo(() => allKpis.filter((k) => visibleKpiIds.includes(k.id)), [allKpis, visibleKpiIds]);

  return {
    filtered,
    total,
    active,
    probation,
    inactive,
    pct,
    trends,
    deptData,
    statusData,
    hiringData,
    genderData,
    deptSummary,
    miniSummary,
    kpis,
    DEPT_COLORS,
  };
}
