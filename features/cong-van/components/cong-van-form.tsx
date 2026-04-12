import React, { useEffect, useMemo, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ScrollText } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import SingleFileInput from '../../../components/ui/SingleFileInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { congVanFormSchema, type CongVanFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { CongVan } from '../core/types';
import { getDefaultCongVanFormValues, congVanToFormValues } from '../utils/cong-van-form';
import { useCreateCongVan, useUpdateCongVan } from '../hooks/use-cong-van';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';
import { uploadCongVanFile } from '../services/cong-van-service';
import { getTodayISO } from '@/lib/utils';

interface Props {
  initialData?: CongVan | null;
  existingItems: CongVan[];
  onClose: () => void;
}

const CongVanForm: React.FC<Props> = ({ initialData, existingItems, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateCongVan(onClose);
  const updateMutation = useUpdateCongVan(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );

  const donViDatalistId = useId();

  const donViSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const row of existingItems) {
      const v = (row.don_vi ?? '').trim();
      if (v) set.add(v);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [existingItems]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CongVanFormValues>({
    resolver: zodResolver(congVanFormSchema),
    defaultValues: getDefaultCongVanFormValues(getTodayISO()),
  });

  const tepStored = watch('tep_dinh_kem') ?? '';

  useEffect(() => {
    setPendingFile(null);
    if (initialData) {
      reset(congVanToFormValues(initialData));
    } else {
      reset(getDefaultCongVanFormValues(getTodayISO()));
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

  const onSubmit = async (data: CongVanFormValues) => {
    try {
      let tepFinal = (data.tep_dinh_kem ?? '').trim();
      if (pendingFile) {
        tepFinal = await uploadCongVanFile(pendingFile);
      }
      const merged: CongVanFormValues = {
        ...data,
        tep_dinh_kem: tepFinal,
      };
      const creatorId = isEdit
        ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
        : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
      const dataWithCreator: CongVanFormValues = { ...merged, id_nguoi_tao: creatorId };
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: dataWithCreator });
      } else {
        await createMutation.mutateAsync(dataWithCreator);
      }
      setPendingFile(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const renderFooter = (
    <div className="flex items-center justify-between w-full gap-3">
      <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">
        {BTN_CANCEL()}
      </Button>
      <Button type="submit" form="cong-van-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('congVan.dm.form.editTitle') : t('congVan.dm.form.createTitle')}
      subtitle={isEdit ? `${t('congVan.dm.form.editSubtitle')} · id ${initialData?.id}` : t('congVan.dm.form.createSubtitle')}
      icon={<ScrollText size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="cong-van-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('congVan.dm.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('congVan.dm.form.basicInfo')} icon={<ScrollText size={14} />} variant="primary">
          <FormGrid cols={1}>
            <div className="space-y-1">
              <Input
                label={t('congVan.dm.form.donVi')}
                placeholder={t('congVan.dm.form.donViPlaceholder')}
                required
                autoComplete="off"
                list={donViSuggestions.length > 0 ? donViDatalistId : undefined}
                {...register('don_vi')}
                error={errors.don_vi?.message}
              />
              {donViSuggestions.length > 0 && (
                <datalist id={donViDatalistId}>
                  {donViSuggestions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              )}
              {donViSuggestions.length > 0 && (
                <p className="text-xs text-muted-foreground px-0.5">{t('congVan.dm.form.donViHint')}</p>
              )}
            </div>
            <Input
              type="date"
              label={t('congVan.dm.form.ngay')}
              required
              {...register('ngay')}
              error={errors.ngay?.message}
            />
            <Input
              label={t('congVan.dm.form.tenTaiLieu')}
              placeholder={t('congVan.dm.form.tenTaiLieuPlaceholder')}
              required
              {...register('ten_van_ban')}
              error={errors.ten_van_ban?.message}
            />
            <Textarea
              label={t('congVan.dm.form.ghiChu')}
              placeholder={t('congVan.dm.form.ghiChuPlaceholder')}
              rows={3}
              {...register('ghi_chu')}
              error={errors.ghi_chu?.message}
            />
            <SingleFileInput
              label={t('congVan.dm.form.tepDinhKem')}
              storedUrl={tepStored}
              pendingFile={pendingFile}
              onPickFile={setPendingFile}
              onClear={() => {
                setPendingFile(null);
                setValue('tep_dinh_kem', '', { shouldValidate: true });
              }}
              disabled={isLoading}
              pickLabel={t('congVan.dm.form.pickFile')}
              clearLabel={t('congVan.dm.form.clearFile')}
              error={errors.tep_dinh_kem?.message}
            />
            <input type="hidden" {...register('tep_dinh_kem')} />
            <Input
              label={t('congVan.dm.form.link')}
              placeholder={t('congVan.dm.form.linkPlaceholder')}
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

export default CongVanForm;
