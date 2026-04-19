import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Quote, ImageIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import SingleFileInput from '../../../components/ui/SingleFileInput';
import SingleImageInput from '../../../components/ui/SingleImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { moiNgayMotLoiDayBacHoFormSchema, type MoiNgayMotLoiDayBacHoFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { MoiNgayMotLoiDayBacHo } from '../core/types';
import {
  getDefaultMoiNgayMotLoiDayBacHoFormValues,
  moiNgayMotLoiDayBacHoToFormValues,
} from '../utils/moi-ngay-mot-loi-day-bac-ho-form';
import { useCreateMoiNgayMotLoiDayBacHo, useUpdateMoiNgayMotLoiDayBacHo } from '../hooks/use-moi-ngay-mot-loi-day-bac-ho';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';
import { getTodayISO } from '@/lib/utils';
import {
  resolveHinhAnhForSave,
  uploadMoiNgayMotLoiDayBacHoAttachment,
} from '../services/moi-ngay-mot-loi-day-bac-ho-service';
import { parseNamThangKey } from '../utils/ngay-nam-thang';

interface Props {
  initialData?: MoiNgayMotLoiDayBacHo | null;
  existingItems: MoiNgayMotLoiDayBacHo[];
  /** Khi tạo mới: gán kỳ yyyy/mm từ drill (danh sách theo tháng) */
  defaultNamThang?: string | null;
  /** Khi tạo mới từ màn chọn tháng: chỉ gán năm (mặc định ngày 01/01) */
  defaultNam?: number | null;
  onClose: () => void;
}

const MoiNgayMotLoiDayBacHoForm: React.FC<Props> = ({
  initialData,
  existingItems,
  defaultNamThang,
  defaultNam,
  onClose,
}) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateMoiNgayMotLoiDayBacHo(onClose);
  const updateMutation = useUpdateMoiNgayMotLoiDayBacHo(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } =
    useForm<MoiNgayMotLoiDayBacHoFormValues>({
      resolver: zodResolver(moiNgayMotLoiDayBacHoFormSchema),
      defaultValues: getDefaultMoiNgayMotLoiDayBacHoFormValues(getTodayISO()),
    });

  /* eslint-disable react-hooks/incompatible-library -- RHF watch cho ảnh / file */
  const hinhStored = watch('hinh_anh') ?? '';
  const tepStored = watch('tep_dinh_kem') ?? '';
  /* eslint-enable react-hooks/incompatible-library */

  useEffect(() => {
    setPendingFile(null);
    if (initialData) {
      reset(moiNgayMotLoiDayBacHoToFormValues(initialData));
    } else {
      reset(getDefaultMoiNgayMotLoiDayBacHoFormValues(getTodayISO()));
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
    const p = defaultNamThang ? parseNamThangKey(defaultNamThang) : null;
    if (p) {
      const mm = String(p.thang).padStart(2, '0');
      setValue('ngay', `${p.nam}-${mm}-01`, { shouldValidate: true });
    }
  }, [initialData, defaultNamThang, setValue]);

  useEffect(() => {
    if (initialData) return;
    if (defaultNamThang) return;
    if (defaultNam != null) {
      setValue('ngay', `${defaultNam}-01-01`, { shouldValidate: true });
    }
  }, [initialData, defaultNam, defaultNamThang, setValue]);

  const onSubmit = async (data: MoiNgayMotLoiDayBacHoFormValues) => {
    const dup = existingItems.find((r) => r.ngay === data.ngay.trim() && (!initialData || r.id !== initialData.id));
    if (dup) {
      toast.error(t('moiNgayMotLoiDayBacHo.dm.form.duplicateDay'));
      return;
    }

    try {
      const hinhFinal = (await resolveHinhAnhForSave(data.hinh_anh ?? '')).trim();
      let tepFinal = (data.tep_dinh_kem ?? '').trim();
      if (pendingFile) {
        tepFinal = await uploadMoiNgayMotLoiDayBacHoAttachment(pendingFile);
      }
      const merged: MoiNgayMotLoiDayBacHoFormValues = {
        ...data,
        hinh_anh: hinhFinal,
        tep_dinh_kem: tepFinal,
      };
      const creatorId = isEdit
        ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
        : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
      const dataWithCreator: MoiNgayMotLoiDayBacHoFormValues = { ...merged, id_nguoi_tao: creatorId };
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
        form="moi-ngay-mot-loi-day-bac-ho-form"
        isLoading={isLoading}
        className="bg-primary text-white shadow-lg"
      >
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('moiNgayMotLoiDayBacHo.dm.form.editTitle') : t('moiNgayMotLoiDayBacHo.dm.form.createTitle')}
      subtitle={
        isEdit
          ? `${t('moiNgayMotLoiDayBacHo.dm.form.editSubtitle')} · id ${initialData?.id}`
          : t('moiNgayMotLoiDayBacHo.dm.form.createSubtitle')
      }
      icon={<Quote size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="moi-ngay-mot-loi-day-bac-ho-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              {t('moiNgayMotLoiDayBacHo.dm.form.validationError')}
            </p>
          </div>
        )}

        <FormSection title={t('moiNgayMotLoiDayBacHo.dm.form.basicInfo')} icon={<Quote size={14} />} variant="primary">
          <FormGrid cols={1}>
            <Input
              type="date"
              label={t('moiNgayMotLoiDayBacHo.dm.form.ngay')}
              required
              {...register('ngay')}
              error={errors.ngay?.message}
            />
            <p className="text-xs text-muted-foreground px-0.5 -mt-2">{t('moiNgayMotLoiDayBacHo.dm.form.ngayHint')}</p>
            <Textarea
              label={t('moiNgayMotLoiDayBacHo.dm.form.tenTaiLieu')}
              placeholder={t('moiNgayMotLoiDayBacHo.dm.form.tenTaiLieuPlaceholder')}
              rows={5}
              required
              {...register('ten_tai_lieu')}
              error={errors.ten_tai_lieu?.message}
            />
            <SingleImageInput
              label={t('moiNgayMotLoiDayBacHo.dm.form.hinhAnh')}
              icon={<ImageIcon size={14} className="text-muted-foreground" />}
              value={hinhStored.trim() ? hinhStored : null}
              onChange={(url) => setValue('hinh_anh', url ?? '', { shouldValidate: true })}
              disabled={isLoading}
              maxSizeMB={20}
              shape="rounded"
              aspectRatio="16/9"
              placeholder={t('moiNgayMotLoiDayBacHo.dm.form.hinhAnhPlaceholder')}
              hint={t('moiNgayMotLoiDayBacHo.dm.form.hinhAnhHint')}
              error={errors.hinh_anh?.message}
            />
            <input type="hidden" {...register('hinh_anh')} />
            <SingleFileInput
              label={t('moiNgayMotLoiDayBacHo.dm.form.tepDinhKem')}
              storedUrl={tepStored}
              pendingFile={pendingFile}
              onPickFile={setPendingFile}
              onClear={() => {
                setPendingFile(null);
                setValue('tep_dinh_kem', '', { shouldValidate: true });
              }}
              disabled={isLoading}
              pickLabel={t('moiNgayMotLoiDayBacHo.dm.form.pickFile')}
              clearLabel={t('moiNgayMotLoiDayBacHo.dm.form.clearFile')}
              error={errors.tep_dinh_kem?.message}
            />
            <input type="hidden" {...register('tep_dinh_kem')} />
            <Input
              label={t('moiNgayMotLoiDayBacHo.dm.form.link')}
              placeholder={t('moiNgayMotLoiDayBacHo.dm.form.linkPlaceholder')}
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

export default MoiNgayMotLoiDayBacHoForm;
