import React, { useEffect, useMemo, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { thiTracNghiemFormSchema, type ThiTracNghiemFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { ThiTracNghiem } from '../core/types';
import { getDefaultThiTracNghiemFormValues, thiTracNghiemToFormValues } from '../utils/thi-trac-nghiem-form';
import { useCreateThiTracNghiem, useUpdateThiTracNghiem } from '../hooks/use-thi-trac-nghiem';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

interface Props {
  initialData?: ThiTracNghiem | null;
  existingItems: ThiTracNghiem[];
  onClose: () => void;
}

const ThiTracNghiemForm: React.FC<Props> = ({ initialData, existingItems, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateThiTracNghiem(onClose);
  const updateMutation = useUpdateThiTracNghiem(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );

  const nhomDatalistId = useId();

  const nhomSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const row of existingItems) {
      const v = (row.nhom ?? '').trim();
      if (v) set.add(v);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [existingItems]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ThiTracNghiemFormValues>({
    resolver: zodResolver(thiTracNghiemFormSchema),
    defaultValues: getDefaultThiTracNghiemFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(thiTracNghiemToFormValues(initialData));
    } else {
      reset(getDefaultThiTracNghiemFormValues());
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (initialData) return;
    if (currentQuanNhanId) {
      setValue('id_nguoi_tao', currentQuanNhanId, { shouldValidate: true });
    } else {
      setValue('id_nguoi_tao', '', { shouldValidate: true });
    }
  }, [initialData, currentQuanNhanId, setValue]);

  const onSubmit = async (data: ThiTracNghiemFormValues) => {
    const creatorId = isEdit
      ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
      : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
    const dataWithCreator: ThiTracNghiemFormValues = { ...data, id_nguoi_tao: creatorId };
    if (isEdit && initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, data: dataWithCreator });
    } else {
      await createMutation.mutateAsync(dataWithCreator);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const renderFooter = (
    <div className="flex items-center justify-between w-full gap-3">
      <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">
        {BTN_CANCEL()}
      </Button>
      <Button type="submit" form="thi-trac-nghiem-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('thiTracNghiem.dm.form.editTitle') : t('thiTracNghiem.dm.form.createTitle')}
      subtitle={
        isEdit
          ? `${t('thiTracNghiem.dm.form.editSubtitle')} · id ${initialData?.id}`
          : t('thiTracNghiem.dm.form.createSubtitle')
      }
      icon={<ClipboardList size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="thi-trac-nghiem-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('thiTracNghiem.dm.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('thiTracNghiem.dm.form.basicInfo')} icon={<ClipboardList size={14} />} variant="primary">
          <FormGrid cols={1}>
            <div className="space-y-1">
              <Input
                label={t('thiTracNghiem.dm.form.nhom')}
                placeholder={t('thiTracNghiem.dm.form.nhomPlaceholder')}
                required
                autoComplete="off"
                list={nhomSuggestions.length > 0 ? nhomDatalistId : undefined}
                {...register('nhom')}
                error={errors.nhom?.message}
              />
              {nhomSuggestions.length > 0 && (
                <datalist id={nhomDatalistId}>
                  {nhomSuggestions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              )}
              {nhomSuggestions.length > 0 && (
                <p className="text-xs text-muted-foreground px-0.5">{t('thiTracNghiem.dm.form.nhomHint')}</p>
              )}
            </div>
            <Input
              label={t('thiTracNghiem.dm.form.tenDeThi')}
              placeholder={t('thiTracNghiem.dm.form.tenDeThiPlaceholder')}
              required
              {...register('ten_de_thi')}
              error={errors.ten_de_thi?.message}
            />
            <Input
              label={t('thiTracNghiem.dm.form.link')}
              placeholder={t('thiTracNghiem.dm.form.linkPlaceholder')}
              {...register('link')}
              error={errors.link?.message}
            />
            <input type="hidden" {...register('id_nguoi_tao')} />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default ThiTracNghiemForm;
