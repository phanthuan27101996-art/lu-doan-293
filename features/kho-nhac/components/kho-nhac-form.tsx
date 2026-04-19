import React, { useEffect, useMemo, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Music2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { khoNhacFormSchema, type KhoNhacFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { KhoNhac } from '../core/types';
import { getDefaultKhoNhacFormValues, khoNhacToFormValues } from '../utils/kho-nhac-form';
import { useCreateKhoNhac, useUpdateKhoNhac } from '../hooks/use-kho-nhac';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

interface Props {
  initialData?: KhoNhac | null;
  existingItems: KhoNhac[];
  /** Khi tạo mới từ danh sách đã drill vào một bộ sưu tập có tên */
  defaultBoSuuTap?: string;
  onClose: () => void;
}

const KhoNhacForm: React.FC<Props> = ({ initialData, existingItems, defaultBoSuuTap, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateKhoNhac(onClose);
  const updateMutation = useUpdateKhoNhac(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );

  const boSuuTapDatalistId = useId();

  const boSuuTapSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const row of existingItems) {
      const v = (row.bo_suu_tap ?? '').trim();
      if (v) set.add(v);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [existingItems]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<KhoNhacFormValues>({
    resolver: zodResolver(khoNhacFormSchema),
    defaultValues: getDefaultKhoNhacFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(khoNhacToFormValues(initialData));
    } else {
      reset(getDefaultKhoNhacFormValues());
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

  useEffect(() => {
    if (initialData) return;
    if (defaultBoSuuTap) {
      setValue('bo_suu_tap', defaultBoSuuTap, { shouldValidate: true });
    }
  }, [initialData, defaultBoSuuTap, setValue]);

  const onSubmit = async (data: KhoNhacFormValues) => {
    const creatorId = isEdit
      ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
      : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
    const dataWithCreator: KhoNhacFormValues = { ...data, id_nguoi_tao: creatorId };
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
      <Button type="submit" form="kho-nhac-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('khoNhac.dm.form.editTitle') : t('khoNhac.dm.form.createTitle')}
      subtitle={
        isEdit
          ? `${t('khoNhac.dm.form.editSubtitle')} · id ${initialData?.id}`
          : t('khoNhac.dm.form.createSubtitle')
      }
      icon={<Music2 size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="kho-nhac-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('khoNhac.dm.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('khoNhac.dm.form.basicInfo')} icon={<Music2 size={14} />} variant="primary">
          <FormGrid cols={1}>
            <div className="space-y-1">
              <Input
                label={t('khoNhac.dm.form.boSuuTap')}
                placeholder={t('khoNhac.dm.form.boSuuTapPlaceholder')}
                required
                autoComplete="off"
                list={boSuuTapSuggestions.length > 0 ? boSuuTapDatalistId : undefined}
                {...register('bo_suu_tap')}
                error={errors.bo_suu_tap?.message}
              />
              {boSuuTapSuggestions.length > 0 && (
                <datalist id={boSuuTapDatalistId}>
                  {boSuuTapSuggestions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              )}
              {boSuuTapSuggestions.length > 0 && (
                <p className="text-xs text-muted-foreground px-0.5">{t('khoNhac.dm.form.boSuuTapHint')}</p>
              )}
            </div>
            <Input
              label={t('khoNhac.dm.form.tenNhac')}
              placeholder={t('khoNhac.dm.form.tenNhacPlaceholder')}
              required
              {...register('ten_nhac')}
              error={errors.ten_nhac?.message}
            />
            <Textarea
              label={t('khoNhac.dm.form.tacGia')}
              placeholder={t('khoNhac.dm.form.tacGiaPlaceholder')}
              rows={4}
              {...register('tac_gia')}
              error={errors.tac_gia?.message}
            />
            <Textarea
              label={t('khoNhac.dm.form.ghiChu')}
              placeholder={t('khoNhac.dm.form.ghiChuPlaceholder')}
              rows={3}
              {...register('ghi_chu')}
              error={errors.ghi_chu?.message}
            />
            <Input
              label={t('khoNhac.dm.form.link')}
              placeholder={t('khoNhac.dm.form.linkPlaceholder')}
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

export default KhoNhacForm;
