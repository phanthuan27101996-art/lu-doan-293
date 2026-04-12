import React, { useEffect, useMemo, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { taiLieuFormSchema, type TaiLieuFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { TaiLieu } from '../core/types';
import { getDefaultTaiLieuFormValues, taiLieuToFormValues } from '../utils/tai-lieu-form';
import { useCreateTaiLieu, useUpdateTaiLieu } from '../hooks/use-tai-lieu';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

interface Props {
  initialData?: TaiLieu | null;
  /** Các bản ghi hiện có — dùng để gợi ý nhóm (datalist) theo giá trị đã có trong bảng */
  existingItems: TaiLieu[];
  onClose: () => void;
}

const TaiLieuForm: React.FC<Props> = ({ initialData, existingItems, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateTaiLieu(onClose);
  const updateMutation = useUpdateTaiLieu(onClose);
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
      const v = (row.nhom_tai_lieu ?? '').trim();
      if (v) set.add(v);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [existingItems]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TaiLieuFormValues>({
    resolver: zodResolver(taiLieuFormSchema),
    defaultValues: getDefaultTaiLieuFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(taiLieuToFormValues(initialData));
    } else {
      reset(getDefaultTaiLieuFormValues());
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

  const onSubmit = async (data: TaiLieuFormValues) => {
    const creatorId = isEdit
      ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
      : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
    const dataWithCreator: TaiLieuFormValues = { ...data, id_nguoi_tao: creatorId };
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
      <Button type="submit" form="tai-lieu-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('taiLieu.dm.form.editTitle') : t('taiLieu.dm.form.createTitle')}
      subtitle={isEdit ? `${t('taiLieu.dm.form.editSubtitle')} · id ${initialData?.id}` : t('taiLieu.dm.form.createSubtitle')}
      icon={<FileText size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="tai-lieu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('taiLieu.dm.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('taiLieu.dm.form.basicInfo')} icon={<FileText size={14} />} variant="primary">
          <FormGrid cols={1}>
            <div className="space-y-1">
              <Input
                label={t('taiLieu.dm.form.nhomTaiLieu')}
                placeholder={t('taiLieu.dm.form.nhomTaiLieuPlaceholder')}
                required
                autoComplete="off"
                list={nhomSuggestions.length > 0 ? nhomDatalistId : undefined}
                {...register('nhom_tai_lieu')}
                error={errors.nhom_tai_lieu?.message}
              />
              {nhomSuggestions.length > 0 && (
                <datalist id={nhomDatalistId}>
                  {nhomSuggestions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              )}
              {nhomSuggestions.length > 0 && (
                <p className="text-xs text-muted-foreground px-0.5">{t('taiLieu.dm.form.nhomTaiLieuHint')}</p>
              )}
            </div>
            <Input
              label={t('taiLieu.dm.form.tenTaiLieu')}
              placeholder={t('taiLieu.dm.form.tenTaiLieuPlaceholder')}
              required
              {...register('ten_tai_lieu')}
              error={errors.ten_tai_lieu?.message}
            />
            <Input
              label={t('taiLieu.dm.form.link')}
              placeholder={t('taiLieu.dm.form.linkPlaceholder')}
              {...register('link')}
              error={errors.link?.message}
            />
            <Textarea
              label={t('taiLieu.dm.form.ghiChu')}
              placeholder={t('taiLieu.dm.form.ghiChuPlaceholder')}
              rows={3}
              {...register('ghi_chu')}
              error={errors.ghi_chu?.message}
            />
            <input type="hidden" {...register('id_nguoi_tao')} />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default TaiLieuForm;
