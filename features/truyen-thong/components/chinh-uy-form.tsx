import React, { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ImageIcon, Shield } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import SingleImageInput from '../../../components/ui/SingleImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { chinhUyFormSchema, type ChinhUyFormValues } from '../core/chinh-uy-schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { ChinhUy } from '../core/chinh-uy-types';
import { getDefaultChinhUyFormValues, chinhUyToFormValues } from '../utils/chinh-uy-form';
import { useCreateChinhUy, useUpdateChinhUy } from '../hooks/use-chinh-uy';
import { resolveTruyenThongHinhAnhForSave } from '../services/truyen-thong-image-upload';

interface Props {
  initialData?: ChinhUy | null;
  defaultThuTu: number;
  onClose: () => void;
  stackLevel?: number;
}

const ChinhUyForm: React.FC<Props> = ({ initialData, defaultThuTu, onClose, stackLevel = 0 }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateChinhUy(onClose);
  const updateMutation = useUpdateChinhUy(onClose);

  const defaults = useMemo(
    () => (initialData ? chinhUyToFormValues(initialData) : getDefaultChinhUyFormValues(defaultThuTu)),
    [initialData, defaultThuTu],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ChinhUyFormValues>({
    resolver: zodResolver(chinhUyFormSchema) as Resolver<ChinhUyFormValues>,
    defaultValues: defaults,
  });

  /* eslint-disable react-hooks/incompatible-library */
  const hinhStored = watch('hinh_anh') ?? '';
  /* eslint-enable react-hooks/incompatible-library */

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const onSubmit = async (data: ChinhUyFormValues) => {
    try {
      const hinhFinal = (await resolveTruyenThongHinhAnhForSave(data.hinh_anh ?? '', 'chinh-uy')).trim();
      const merged: ChinhUyFormValues = {
        ...data,
        hinh_anh: hinhFinal || null,
      };
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: merged });
      } else {
        await createMutation.mutateAsync(merged);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const busy = pending || isSubmitting;

  const footer = (
    <div className="flex w-full items-center justify-end gap-2">
      <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
        {BTN_CANCEL()}
      </Button>
      <Button type="submit" form="chinh-uy-form" disabled={busy} isLoading={busy}>
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('truyenThong.chinhUy.form.titleEdit') : t('truyenThong.chinhUy.form.titleCreate')}
      subtitle={isEdit ? initialData?.ho_va_ten : undefined}
      icon={<Shield size={18} aria-hidden />}
      onClose={onClose}
      footer={footer}
      maxWidthClass={DRAWER_WIDTH_FORM}
      stackLevel={stackLevel}
    >
      <form id="chinh-uy-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormSection title={t('truyenThong.chinhUy.form.sectionMain')}>
          <FormGrid cols={2}>
            <Input
              label={t('truyenThong.chinhUy.field.thuTu')}
              type="number"
              min={1}
              required
              error={errors.thu_tu?.message}
              {...register('thu_tu')}
            />
            <Input
              label={t('truyenThong.chinhUy.field.namSinh')}
              type="number"
              min={1900}
              max={2035}
              placeholder="1974"
              error={errors.nam_sinh?.message}
              {...register('nam_sinh')}
            />
          </FormGrid>
          <Input
            label={t('truyenThong.chinhUy.field.hoVaTen')}
            required
            error={errors.ho_va_ten?.message}
            {...register('ho_va_ten')}
          />
          <SingleImageInput
            label={t('truyenThong.chinhUy.field.hinhAnh')}
            icon={<ImageIcon size={14} className="text-muted-foreground" aria-hidden />}
            value={hinhStored.trim() ? hinhStored : null}
            onChange={(url) => setValue('hinh_anh', url ?? null, { shouldValidate: true })}
            disabled={busy}
            maxSizeMB={5}
            shape="rounded"
            aspectRatio="3/4"
            placeholder={t('truyenThong.form.hinhAnhPlaceholder')}
            hint={t('truyenThong.form.hinhAnhHint')}
            error={errors.hinh_anh?.message as string | undefined}
          />
          <Input
            label={t('truyenThong.chinhUy.field.thoiGianDamNhiem')}
            required
            placeholder="1993 - 1998"
            error={errors.thoi_gian_dam_nhiem?.message}
            {...register('thoi_gian_dam_nhiem')}
          />
          <FormGrid cols={2}>
            <Input
              label={t('truyenThong.chinhUy.field.capBac')}
              error={errors.cap_bac_hien_tai?.message as string | undefined}
              {...register('cap_bac_hien_tai')}
            />
            <Input
              label={t('truyenThong.chinhUy.field.chucVuCuoiCung')}
              error={errors.chuc_vu_cuoi_cung?.message as string | undefined}
              {...register('chuc_vu_cuoi_cung')}
            />
          </FormGrid>
          <Textarea
            label={t('truyenThong.chinhUy.field.ghiChu')}
            rows={3}
            error={errors.ghi_chu?.message as string | undefined}
            {...register('ghi_chu')}
          />
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default ChinhUyForm;
