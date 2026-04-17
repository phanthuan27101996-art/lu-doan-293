import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { List, BarChart3 } from 'lucide-react';
import TabGroup, { Tab } from '../../../components/ui/TabGroup';
import EmployeeForm from './components/nhan-vien-form';
import EmployeeDetail from './components/nhan-vien-detail';
import EmployeeToolbar from './components/nhan-vien-toolbar';
import EmployeeTable from './components/nhan-vien-table';
import EmployeeStats from './components/nhan-vien-stats';
import BulkEditSheet from './components/nhan-vien-bulk-edit';
import ImportDialog from '../../../components/shared/ImportDialog';
import ExportDialog from '../../../components/shared/ExportDialog';

import { useEmployees, useDeleteWithUndo, useSetEmployeeIsAdmin } from './hooks/use-nhan-vien';
import { useEmployeeStore } from './store/useEmployeeStore';
import { Employee } from './core/types';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../../lib/button-labels';
import { formatDate, getLanguage } from '../../../lib/utils';
import { useListWithFilter } from '../../../lib/hooks';
import { matchesSearchTerm } from '../../../lib/searchUtils';
import { useExportData } from '../../../lib/useExportData';
import { useModulePermission } from '@/hooks/use-module-permission';
import { useAuthStore } from '@/store/useStore';
import { findEmployeeByAuthIdentity } from '@/lib/phone-auth';

type FormOrigin = 'list' | 'detail';

const NHAN_VIEN_SEARCHABLE_KEYS: string[] = [
  'id',
  'ho_ten',
  'ten_chuc_vu',
  'chuc_vu_id',
  'so_dien_thoai',
  'is_admin',
  'tg_tao',
  'tg_cap_nhat',
];

function getEmployeeSortValue(emp: Employee, column: string): string | number {
  switch (column) {
    case 'lien_he':
      return emp.so_dien_thoai ?? '';
    case 'is_admin':
      return emp.is_admin === true ? 1 : 0;
    case 'id':
      return emp.id;
    case 'ho_ten':
      return emp.ho_ten ?? '';
    case 'ten_chuc_vu':
      return emp.ten_chuc_vu ?? '';
    case 'tg_tao':
      return emp.tg_tao ?? '';
    case 'tg_cap_nhat':
      return emp.tg_cap_nhat ?? '';
    default:
      return '';
  }
}

const EmployeePage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useModulePermission('danh-sach-quan-nhan');

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ho_ten', label: t('employee.name'), required: true },
      { key: 'so_dien_thoai', label: t('employee.phone'), required: true },
      { key: 'chuc_vu_id', label: t('employee.position') },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'ho_ten', label: t('employee.name') },
      { key: 'so_dien_thoai', label: t('employee.phone') },
      { key: 'ten_chuc_vu', label: t('employee.position') },
      { key: 'is_admin_text', label: t('employee.store.adminCol') },
      { key: 'tg_tao_text', label: t('employee.store.createdCol') },
      { key: 'tg_cap_nhat_text', label: t('employee.store.updatedCol') },
    ],
    [t],
  );

  const VALID_TABS = ['list', 'stats'] as const;
  type TabId = (typeof VALID_TABS)[number];

  const TABS: Tab[] = useMemo(() => [
    { id: 'list', label: t('employee.tabList'), icon: List },
    { id: 'stats', label: t('employee.tabStats'), icon: BarChart3 },
  ], [t]);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    (VALID_TABS as readonly string[]).includes(tabFromUrl ?? '') ? (tabFromUrl as TabId) : 'list'
  );

  useEffect(() => {
    if ((VALID_TABS as readonly string[]).includes(tabFromUrl ?? '')) setActiveTab(tabFromUrl as TabId);
  }, [tabFromUrl]);

  const handleTabChange = useCallback((id: string) => {
    if (!(VALID_TABS as readonly string[]).includes(id)) return;
    setActiveTab(id as TabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', id);
      return next;
    });
  }, [setSearchParams]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns, setFilter } = useEmployeeStore();

  const user = useAuthStore((s) => s.user);
  const { data: employees = [], isLoading } = useEmployees();
  const { deleteWithUndo } = useDeleteWithUndo();
  const setAdminMut = useSetEmployeeIsAdmin();
  const confirm = useConfirmStore(state => state.confirm);

  const currentEmployee = useMemo(
    () => findEmployeeByAuthIdentity(user, employees),
    [user, employees],
  );

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  // Đồng bộ viewing với list sau refetch (action từ detail hoặc từ nơi khác)
  useEffect(() => {
    if (!viewingEmp) return;
    const fresh = employees.find((e) => e.id === viewingEmp.id);
    if (fresh && fresh !== viewingEmp) setViewingEmp(fresh);
  }, [employees, viewingEmp?.id]);

  const filterFn = useCallback((emp: Employee, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(emp as Record<string, unknown>, term, NHAN_VIEN_SEARCHABLE_KEYS);
    const matchesPosition =
      f.position.length === 0 || (emp.chuc_vu_id != null && f.position.includes(emp.chuc_vu_id));
    return matchesSearch && matchesPosition;
  }, []);

  const filteredEmployees = useListWithFilter(employees, searchTerm, filters, filterFn);

  // Client-side sort (map id cột UI → trường Employee, ví dụ lien_he → so_dien_thoai)
  const sortedEmployees = useMemo(() => {
    if (!sort.column || !sort.direction) return filteredEmployees;
    const col = sort.column;
    const sorted = [...filteredEmployees];
    sorted.sort((a, b) => {
      const aVal = getEmployeeSortValue(a, col);
      const bVal = getEmployeeSortValue(b, col);
      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), getLanguage());
      }
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [filteredEmployees, sort]);

  // Export data — hook tái sử dụng, lazy khi showExport
  const exportMapFn = useCallback(
    (emp: Employee) => ({
      id: emp.id,
      ho_ten: emp.ho_ten,
      so_dien_thoai: emp.so_dien_thoai,
      ten_chuc_vu: emp.ten_chuc_vu ?? '',
      is_admin_text: emp.is_admin ? t('employee.detail.adminYes') : t('employee.detail.adminNo'),
      tg_tao_text: emp.tg_tao ? formatDate(emp.tg_tao) : '',
      tg_cap_nhat_text: emp.tg_cap_nhat ? formatDate(emp.tg_cap_nhat) : '',
    }),
    [t],
  );

  const { exportData, paginatedData: paginatedExportData, selectedData: selectedExportData } = useExportData({
    data: filteredEmployees,
    isOpen: showExport,
    mapFn: exportMapFn,
    pagination,
    selectedIds,
    keyExtractor: (emp) => emp.id,
  });

  const visibleColumnKeys = useMemo(() => columns.filter(c => c.visible).map(c => c.id), [columns]);

  const handleEdit = (item: Employee) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewingEmp ? 'detail' : 'list');
    setEditingEmp(item);
    setShowForm(true);
  };

  const handleView = (item: Employee) => {
    setViewingEmp(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    confirm({
        title: t('employee.deleteConfirmTitle'),
        message: `${t('employee.deleteConfirmMessage')} "${emp.ho_ten}"? ${t('employee.deleteConfirmNote')}`,
        variant: "danger",
        confirmText: CONFIRM_DELETE(),
        onConfirm: async () => {
            await deleteWithUndo([emp], {
              onDone: () => {
                if (viewingEmp?.id === id) setViewingEmp(null);
                if (editingEmp?.id === id) setShowForm(false);
              }
            });
        }
    });
  };

  const handleToggleAdmin = useCallback(() => {
    if (!viewingEmp || !perm.isAdmin) return;
    const nextAdmin = !viewingEmp.is_admin;
    if (currentEmployee?.id === viewingEmp.id && !nextAdmin) {
      toast.error(t('employee.adminCannotRevokeSelf'));
      return;
    }
    confirm({
      title: nextAdmin ? t('employee.adminConfirmGrantTitle') : t('employee.adminConfirmRevokeTitle'),
      message: nextAdmin
        ? t('employee.adminConfirmGrantMessage', { name: viewingEmp.ho_ten })
        : t('employee.adminConfirmRevokeMessage', { name: viewingEmp.ho_ten }),
      variant: nextAdmin ? 'info' : 'warning',
      confirmText: t('employee.adminConfirmButton'),
      onConfirm: async () => {
        await setAdminMut.mutateAsync({ id: viewingEmp.id, isAdmin: nextAdmin });
      },
    });
  }, [viewingEmp, perm.isAdmin, currentEmployee?.id, confirm, setAdminMut, t]);

  const handleDeleteMany = (ids: string[]) => {
      if (!perm.canDelete) return;
      const emps = employees.filter(e => ids.includes(e.id));
      confirm({
          title: t('employee.bulkDeleteTitle'),
          message: t('employee.bulkDeleteMessage', { count: ids.length }),
          variant: "danger",
          confirmText: CONFIRM_DELETE_ALL(),
          onConfirm: async () => {
              await deleteWithUndo(emps, { onDone: clearSelection });
          }
      });
  };

  const handleImportData = async (data: Record<string, any>[]) => {
    if (!perm.canCreate) return;
    // In real app, call API to bulk create employees
    toast.success(t('employee.importSuccess', { count: data.length }));
  };

  if (perm.isLoading) {
    return (
      <div className="flex flex-col h-page relative items-center justify-center min-h-[40vh]" aria-busy="true">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      {/* Tab Switcher – z-0 để luôn nằm dưới overlay (drawer, dialog) */}
      <div className="shrink-0 relative z-0">
        <TabGroup tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {activeTab === 'list' ? (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
          <EmployeeToolbar
            employees={employees}
            onAdd={() => {
              if (!perm.canCreate) return;
              setFormOrigin('list');
              setEditingEmp(null);
              setShowForm(true);
            }}
            onExport={() => {
              setShowExport(true);
            }}
            onImport={() => {
              if (!perm.canCreate) return;
              setShowImport(true);
            }}
            onDeleteMany={handleDeleteMany}
            onBulkEdit={perm.canUpdate ? () => setShowBulkEdit(true) : undefined}
            canCreate={perm.canCreate}
            canDelete={perm.canDelete}
            canImport={perm.canCreate}
            canExport={perm.canView}
            canUpdate={perm.canUpdate}
          />

          <div className="flex-1 min-h-0">
            <EmployeeTable
              data={sortedEmployees}
              isLoading={isLoading}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              canUpdate={perm.canUpdate}
              canDelete={perm.canDelete}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <EmployeeStats
            employees={employees}
            isLoading={isLoading}
            onDrillDownChucVu={(chucVuId) => {
              setFilter('position', [chucVuId]);
              handleTabChange('list');
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {showForm && ((editingEmp != null && perm.canUpdate) || (editingEmp == null && perm.canCreate)) ? (
            <EmployeeForm 
                initialData={editingEmp} 
                onClose={() => {
                  setShowForm(false);
                  if (formOrigin === 'detail' && editingEmp) {
                    // Quay về Detail với data mới nhất từ cache
                    const freshData = employees.find(e => e.id === editingEmp.id);
                    setViewingEmp(freshData ?? null);
                  }
                  setEditingEmp(null);
                }} 
            />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {viewingEmp && !showForm && (
            <EmployeeDetail 
                data={viewingEmp}
                onClose={() => setViewingEmp(null)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canUpdate={perm.canUpdate}
                canDelete={perm.canDelete}
                canToggleAdmin={perm.isAdmin}
                onToggleAdmin={perm.isAdmin ? handleToggleAdmin : undefined}
                isTogglingAdmin={setAdminMut.isPending}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImport && (
          <ImportDialog
            open={showImport}
            onClose={() => setShowImport(false)}
            columns={IMPORT_COLUMNS}
            onImport={handleImportData}
            templateFileName={t('employee.importTemplateName')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExport && (
          <ExportDialog
            open={showExport}
            onClose={() => setShowExport(false)}
            columns={EXPORT_COLUMNS}
            data={exportData}
            paginatedData={paginatedExportData}
            selectedData={selectedExportData}
            fileName={t('employee.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {perm.canUpdate && showBulkEdit && selectedIds.size > 0 && (
          <BulkEditSheet
            selectedEmployees={employees.filter(e => selectedIds.has(e.id))}
            onClose={() => setShowBulkEdit(false)}
            onSuccess={clearSelection}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeePage;
