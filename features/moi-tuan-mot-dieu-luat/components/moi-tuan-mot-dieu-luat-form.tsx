import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Scale, ImageIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import SingleFileInput from '../../../components/ui/SingleFileInput';
import SingleImageInput from '../../../components/ui/SingleImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { moiTuanMotDieuLuatFormSchema, type MoiTuanMotDieuLuatFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { MoiTuanMotDieuLuat } from '../core/types';
import {
  getDefaultMoiTuanMotDieuLuatFormValues,
  moiTuanMotDieuLuatToFormValues,
} from '../utils/moi-tuan-mot-dieu-luat-form';
import { useCreateMoiTuanMotDieuLuat, useUpdateMoiTuanMotDieuLuat } from '../hooks/use-moi-tuan-mot-dieu-luat';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';
import { resolveHinhAnhForSave, uploadMoiTuanMotDieuLuatAttachment } from '../services/moi-tuan-mot-dieu-luat-service';

interface Props {
  initialData?: MoiTuanMotDieuLuat | null;
  existingItems: MoiTuanMotDieuLuat[];
  onClose: () => void;
}

const MoiTuanMotDieuLuatForm: React.FC<Props> = ({ initialData, existingItems, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateMoiTuanMotDieuLuat(onClose);
  const updateMutation = useUpdateMoiTuanMotDieuLuat(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } =
    useForm<MoiTuanMotDieuLuatFormValues>({
      resolver: zodResolver(moiTuanMotDieuLuatFormSchema),
      defaultValues: getDefaultMoiTuanMotDieuLuatFormValues(),
    });

  /* eslint-disable react-hooks/incompatible-library -- RHF watch cho ảnh / file */
  const hinhStored = watch('hinh_anh') ?? '';
  const tepStored = watch('tep_dinh_kem') ?? '';
  /* eslint-enable react-hooks/incompatible-library */

  useEffect(() => {
    setPendingFile(null);
    if (initialData) {
      reset(moiTuanMotDieuLuatToFormValues(initialData));
    } else {
      reset(getDefaultMoiTuanMotDieuLuatFormValues());
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

  const onSubmit = async (data: MoiTuanMotDieuLuatFormValues) => {
    const dup = existingItems.find(
      (r) =>
        r.nam === data.nam &&
        r.thang === data.thang &&
        r.tuan === data.tuan &&
        (!initialData || r.id !== initialData.id),
    );
    if (dup) {
      toast.error(t('moiTuanMotDieuLuat.dm.form.duplicateWeek'));
      return;
    }

    try {
      const hinhFinal = (await resolveHinhAnhForSave(data.hinh_anh ?? '')).trim();
      let tepFinal = (data.tep_dinh_kem ?? '').trim();
      if (pendingFile) {
        tepFinal = await uploadMoiTuanMotDieuLuatAttachment(pendingFile);
      }
      const merged: MoiTuanMotDieuLuatFormValues = {
        ...data,
        hinh_anh: hinhFinal,
        tep_dinh_kem: tepFinal,
      };
      const creatorId = isEdit
        ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
        : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
      const dataWithCreator: MoiTuanMotDieuLuatFormValues = { ...merged, id_nguoi_tao: creatorId };
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
      <Button
        type="submit"
        form="moi-tuan-mot-dieu-luat-form"
        isLoading={isLoading}
        className="bg-primary text-white shadow-lg"
      >
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('moiTuanMotDieuLuat.dm.form.editTitle') : t('moiTuanMotDieuLuat.dm.form.createTitle')}
      subtitle={
        isEdit
          ? `${t('moiTuanMotDieuLuat.dm.form.editSubtitle')} · id ${initialData?.id}`
          : t('moiTuanMotDieuLuat.dm.form.createSubtitle')
      }
      icon={<Scale size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="moi-tuan-mot-dieu-luat-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              {t('moiTuanMotDieuLuat.dm.form.validationError')}
            </p>
          </div>
        )}

        <FormSection title={t('moiTuanMotDieuLuat.dm.form.basicInfo')} icon={<Scale size={14} />} variant="primary">
          <FormGrid cols={1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="number"
                label={t('moiTuanMotDieuLuat.dm.form.nam')}
                required
                min={2000}
                max={2100}
                {...register('nam', { valueAsNumber: true })}
                error={errors.nam?.message}
              />
              <Input
                type="number"
                label={t('moiTuanMotDieuLuat.dm.form.thang')}
                required
                min={1}
                max={12}
                {...register('thang', { valueAsNumber: true })}
                error={errors.thang?.message}
              />
              <Input
                type="number"
                label={t('moiTuanMotDieuLuat.dm.form.tuan')}
                required
                min={1}
                max={6}
                {...register('tuan', { valueAsNumber: true })}
                error={errors.tuan?.message}
              />
            </div>
            <p className="text-xs text-muted-foreground px-0.5 -mt-2">{t('moiTuanMotDieuLuat.dm.form.weekHint')}</p>
            <Input
              label={t('moiTuanMotDieuLuat.dm.form.tenDieuLuat')}
              placeholder={t('moiTuanMotDieuLuat.dm.form.tenDieuLuatPlaceholder')}
              required
              {...register('ten_dieu_luat')}
              error={errors.ten_dieu_luat?.message}
            />
            <Textarea
              label={t('moiTuanMotDieuLuat.dm.form.ghiChu')}
              placeholder={t('moiTuanMotDieuLuat.dm.form.ghiChuPlaceholder')}
              rows={3}
              {...register('ghi_chu')}
              error={errors.ghi_chu?.message}
            />
            <SingleImageInput
              label={t('moiTuanMotDieuLuat.dm.form.hinhAnh')}
              icon={<ImageIcon size={14} className="text-muted-foreground" />}
              value={hinhStored.trim() ? hinhStored : null}
              onChange={(url) => setValue('hinh_anh', url ?? '', { shouldValidate: true })}
              disabled={isLoading}
              maxSizeMB={20}
              shape="rounded"
              aspectRatio="16/9"
              placeholder={t('moiTuanMotDieuLuat.dm.form.hinhAnhPlaceholder')}
              hint={t('moiTuanMotDieuLuat.dm.form.hinhAnhHint')}
              error={errors.hinh_anh?.message}
            />
            <input type="hidden" {...register('hinh_anh')} />
            <SingleFileInput
              label={t('moiTuanMotDieuLuat.dm.form.tepDinhKem')}
              storedUrl={tepStored}
              pendingFile={pendingFile}
              onPickFile={setPendingFile}
              onClear={() => {
                setPendingFile(null);
                setValue('tep_dinh_kem', '', { shouldValidate: true });
              }}
              disabled={isLoading}
              pickLabel={t('moiTuanMotDieuLuat.dm.form.pickFile')}
              clearLabel={t('moiTuanMotDieuLuat.dm.form.clearFile')}
              error={errors.tep_dinh_kem?.message}
            />
            <input type="hidden" {...register('tep_dinh_kem')} />
            <Input
              label={t('moiTuanMotDieuLuat.dm.form.link')}
              placeholder={t('moiTuanMotDieuLuat.dm.form.linkPlaceholder')}
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

export default MoiTuanMotDieuLuatForm;
