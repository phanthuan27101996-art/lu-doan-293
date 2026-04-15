import React, { useEffect, useMemo, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { UsersRound } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import MultiImageInput, { type ImageItem } from '../../../components/ui/MultiImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { doanCoSoFormSchema, type DoanCoSoFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { DoanCoSo } from '../core/types';
import {
  getDefaultDoanCoSoFormValues,
  doanCoSoToFormValues,
  hinhAnhToImageItems,
} from '../utils/doan-co-so-form';
import { useCreateDoanCoSo, useUpdateDoanCoSo } from '../hooks/use-doan-co-so';
import { collectImageUrlsFromItems } from '../services/doan-co-so-service';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

interface Props {
  initialData?: DoanCoSo | null;
  existingItems: DoanCoSo[];
  onClose: () => void;
}

const DoanCoSoForm: React.FC<Props> = ({ initialData, existingItems, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateDoanCoSo(onClose);
  const updateMutation = useUpdateDoanCoSo(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

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

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<DoanCoSoFormValues>({
    resolver: zodResolver(doanCoSoFormSchema),
    defaultValues: getDefaultDoanCoSoFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(doanCoSoToFormValues(initialData));
      setImageItems(hinhAnhToImageItems(initialData.hinh_anh ?? []));
    } else {
      reset(getDefaultDoanCoSoFormValues());
      setImageItems([]);
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

  const onSubmit = async (data: DoanCoSoFormValues) => {
    try {
      const hinhAnhUrls = await collectImageUrlsFromItems(imageItems);
      const creatorId = isEdit
        ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
        : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
      const dataWithCreator: DoanCoSoFormValues = { ...data, id_nguoi_tao: creatorId };
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: dataWithCreator, hinhAnhUrls });
      } else {
        await createMutation.mutateAsync({ data: dataWithCreator, hinhAnhUrls });
      }
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
      <Button type="submit" form="doan-co-so-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('doanCoSo.dm.form.editTitle') : t('doanCoSo.dm.form.createTitle')}
      subtitle={
        isEdit
          ? `${t('doanCoSo.dm.form.editSubtitle')} · id ${initialData?.id}`
          : t('doanCoSo.dm.form.createSubtitle')
      }
      icon={<UsersRound size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="doan-co-so-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('doanCoSo.dm.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('doanCoSo.dm.form.basicInfo')} icon={<UsersRound size={14} />} variant="primary">
          <FormGrid cols={1}>
            <Input
              type="date"
              label={t('doanCoSo.dm.form.ngay')}
              required
              {...register('ngay')}
              error={errors.ngay?.message}
            />
            <div className="space-y-1">
              <Input
                label={t('doanCoSo.dm.form.nhom')}
                placeholder={t('doanCoSo.dm.form.nhomPlaceholder')}
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
                <p className="text-xs text-muted-foreground px-0.5">{t('doanCoSo.dm.form.nhomHint')}</p>
              )}
            </div>
            <Input
              label={t('doanCoSo.dm.form.ten')}
              placeholder={t('doanCoSo.dm.form.tenPlaceholder')}
              required
              {...register('ten')}
              error={errors.ten?.message}
            />
            <Textarea
              label={t('doanCoSo.dm.form.ghiChu')}
              placeholder={t('doanCoSo.dm.form.ghiChuPlaceholder')}
              rows={3}
              {...register('ghi_chu')}
              error={errors.ghi_chu?.message}
            />
            <Input
              label={t('doanCoSo.dm.form.link')}
              placeholder={t('doanCoSo.dm.form.linkPlaceholder')}
              {...register('link')}
              error={errors.link?.message}
            />
            <MultiImageInput
              label={t('doanCoSo.dm.form.hinhAnh')}
              value={imageItems}
              onChange={setImageItems}
              maxFiles={10}
              maxSizeMB={5}
              hint={t('doanCoSo.dm.form.hinhAnhHint')}
              columns={3}
            />
            <input type="hidden" {...register('id_nguoi_tao')} />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default DoanCoSoForm;
