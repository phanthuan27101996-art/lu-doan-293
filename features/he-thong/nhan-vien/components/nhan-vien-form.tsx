import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { UserCircle, Briefcase, Phone } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Combobox from '../../../../components/ui/Combobox';
import SingleImageInput from '../../../../components/ui/SingleImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../../components/shared/GenericDrawer';
import FormSection from '../../../../components/shared/FormSection';
import FormGrid from '../../../../components/shared/FormGrid';
import { employeeSchema, EmployeeFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../../lib/button-labels';
import { Employee } from '../core/types';
import { getDefaultEmployeeFormValues, employeeToFormValues } from '../utils/employee-to-form';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/use-nhan-vien';
import { usePositions } from '../../chuc-vu/hooks/use-chuc-vu';

interface Props {
  initialData?: Employee | null;
  prefillData?: Partial<EmployeeFormValues>;
  onClose: () => void;
}

const EmployeeForm: React.FC<Props> = ({ initialData, prefillData, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateEmployee(onClose);
  const updateMutation = useUpdateEmployee(onClose);

  const { data: positions = [] } = usePositions();

  const positionOptions = positions.map((p) => ({
    label: p.ten_chuc_vu,
    value: p.id,
    subLabel: p.ma_chuc_vu,
  }));

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: getDefaultEmployeeFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(employeeToFormValues(initialData));
    } else if (prefillData) {
      reset({ ...getDefaultEmployeeFormValues(), ...prefillData });
    } else {
      reset(getDefaultEmployeeFormValues());
    }
  }, [initialData, prefillData, reset]);

  const onSubmit = (data: EmployeeFormValues) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const avatarVal = watch('anh_dai_dien');

  const renderFooter = (
    <div className="flex items-center justify-between w-full gap-3">
      <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">
        {BTN_CANCEL()}
      </Button>
      <Button type="submit" form="emp-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('employee.form.editTitle') : t('employee.form.createTitle')}
      subtitle={isEdit ? `${t('employee.form.editSubtitle')} · id ${initialData?.id}` : t('employee.form.createSubtitle')}
      icon={<UserCircle size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="emp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('employee.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('employee.detail.basicInfo')} icon={<UserCircle size={14} />} variant="primary">
          <FormGrid cols={1}>
            <Input
              label={t('employee.name')}
              placeholder={t('employee.form.namePlaceholder')}
              required
              {...register('ho_ten')}
              error={errors.ho_ten?.message}
            />
            <Input
              label={t('employee.phone')}
              placeholder={t('employee.form.phonePlaceholder')}
              icon={<Phone size={12} />}
              required
              {...register('so_dien_thoai')}
              error={errors.so_dien_thoai?.message}
            />
            <Combobox
              label={t('employee.position')}
              options={positionOptions}
              value={watch('chuc_vu_id')}
              onChange={(v) => setValue('chuc_vu_id', v, { shouldValidate: true })}
              placeholder={t('employee.form.positionPlaceholder')}
              icon={<Briefcase size={16} className="text-muted-foreground" />}
              error={errors.chuc_vu_id?.message}
              required
            />
            <SingleImageInput
              label={t('employee.form.avatar')}
              value={avatarVal || ''}
              onChange={(url) => setValue('anh_dai_dien', url || '', { shouldValidate: true })}
              helperText={t('employee.form.avatarHint')}
            />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default EmployeeForm;
