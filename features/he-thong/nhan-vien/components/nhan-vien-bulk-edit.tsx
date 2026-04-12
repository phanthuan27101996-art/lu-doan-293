import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, Save, X } from 'lucide-react';
import GenericDrawer from '../../../../components/shared/GenericDrawer';
import FormSection from '../../../../components/shared/FormSection';
import Combobox from '../../../../components/ui/Combobox';
import Button from '../../../../components/ui/Button';
import { usePositions } from '../../chuc-vu/hooks/use-chuc-vu';
import { getAvatarUrl } from '../../../../lib/utils';
import { useBulkUpdateEmployees } from '../hooks/use-nhan-vien';
import { Employee } from '../core/types';

export interface BulkEditFields {
  chuc_vu_id?: string;
}

interface Props {
  selectedEmployees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

const BulkEditSheet: React.FC<Props> = ({ selectedEmployees, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [fields, setFields] = useState<BulkEditFields>({});
  const [enabledFields, setEnabledFields] = useState<Set<keyof BulkEditFields>>(new Set());

  const { data: positions = [] } = usePositions();
  const bulkMutation = useBulkUpdateEmployees(() => {
    onSuccess();
    onClose();
  });

  const positionOptions = positions.map((p) => ({ label: p.ten_chuc_vu, value: p.id }));

  const toggleField = (field: keyof BulkEditFields) => {
    const next = new Set(enabledFields);
    if (next.has(field)) {
      next.delete(field);
      const nextFields = { ...fields };
      delete nextFields[field];
      setFields(nextFields);
    } else {
      next.add(field);
    }
    setEnabledFields(next);
  };

  const handleSubmit = () => {
    const ids = selectedEmployees.map((e) => e.id);
    const payload: Partial<BulkEditFields> = {};
    enabledFields.forEach((key) => {
      if (fields[key] !== undefined && fields[key] !== '') {
        payload[key] = fields[key] as BulkEditFields[typeof key];
      }
    });
    if (Object.keys(payload).length === 0) return;
    bulkMutation.mutate({ ids, fields: payload });
  };

  const hasChanges =
    enabledFields.size > 0 && Array.from(enabledFields).some((k) => fields[k] !== undefined && fields[k] !== '');

  const renderFieldToggle = (field: keyof BulkEditFields, label: string) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={enabledFields.has(field)}
        onChange={() => toggleField(field)}
        className="w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer"
      />
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </label>
  );

  const footer = (
    <div className="flex items-center justify-between w-full gap-3">
      <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">
        <X size={16} className="mr-2" /> {t('common.cancel')}
      </Button>
      <Button
        onClick={handleSubmit}
        isLoading={bulkMutation.isPending}
        disabled={!hasChanges}
        className="bg-primary text-white shadow-lg"
      >
        <Save size={16} className="mr-2" /> {t('employee.bulk.applyButton', { count: selectedEmployees.length })}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={t('employee.bulk.title')}
      subtitle={`${selectedEmployees.length} ${t('employee.bulk.subtitle')}`}
      icon={<Users size={20} />}
      onClose={onClose}
      footer={footer}
      maxWidthClass="sm:w-[36rem] sm:min-w-[36rem] sm:max-w-[36rem]"
    >
      <div className="space-y-1">
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('employee.bulk.selectedLabel')}</p>
          <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
            {selectedEmployees.map((emp) => (
              <span key={emp.id} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-2 py-1 text-xs">
                <img
                  src={emp.anh_dai_dien || getAvatarUrl(emp.ho_ten ?? '')}
                  className="w-5 h-5 rounded-full object-cover"
                  alt={emp.ho_ten}
                />
                <span className="font-medium text-foreground">{emp.ho_ten}</span>
                <span className="text-muted-foreground font-mono">({emp.id})</span>
              </span>
            ))}
          </div>
        </div>

        <FormSection title={t('employee.bulk.workSection')} icon={<Briefcase size={14} />}>
          <div className="space-y-2">
            {renderFieldToggle('chuc_vu_id', t('employee.bulk.changePosition'))}
            {enabledFields.has('chuc_vu_id') && (
              <Combobox
                options={positionOptions}
                value={fields.chuc_vu_id || ''}
                onChange={(val) => setFields((prev) => ({ ...prev, chuc_vu_id: val }))}
                placeholder={t('employee.form.positionPlaceholder')}
                icon={<Briefcase size={16} className="text-muted-foreground" />}
              />
            )}
          </div>
        </FormSection>
      </div>
    </GenericDrawer>
  );
};

export default BulkEditSheet;
