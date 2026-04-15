import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import MultiImageInput, { type ImageItem } from '../../../components/ui/MultiImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { gopYFormSchema, type GopYFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { GopY } from '../core/types';
import { getDefaultGopYFormValues, gopYToFormValues, hinhAnhToImageItems } from '../utils/gop-y-form';
import { useCreateGopY, useUpdateGopY } from '../hooks/use-gop-y';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { collectImageUrlsFromItems } from '../services/gop-y-service';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

interface Props {
  initialData?: GopY | null;
  onClose: () => void;
}

const GopYForm: React.FC<Props> = ({ initialData, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateGopY(onClose);
  const updateMutation = useUpdateGopY(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);

  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    initialData ? hinhAnhToImageItems(initialData.hinh_anh ?? []) : [],
  );

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );

  const uploadFolderId = initialData?.id ?? 'new';

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<GopYFormValues>({
    resolver: zodResolver(gopYFormSchema),
    defaultValues: getDefaultGopYFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(gopYToFormValues(initialData));
    } else {
      reset(getDefaultGopYFormValues());
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

  const onSubmit = async (data: GopYFormValues) => {
    try {
      const hinhAnhUrls = await collectImageUrlsFromItems(imageItems, uploadFolderId);
      const creatorId = isEdit
        ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
        : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
      const dataWithCreator: GopYFormValues = { ...data, id_nguoi_tao: creatorId };
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
      <Button type="submit" form="gop-y-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('gopY.dm.form.editTitle') : t('gopY.dm.form.createTitle')}
      subtitle={isEdit ? `${t('gopY.dm.form.editSubtitle')} · id ${initialData?.id}` : t('gopY.dm.form.createSubtitle')}
      icon={<MessageSquarePlus size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="gop-y-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('gopY.dm.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('gopY.dm.form.basicInfo')} icon={<MessageSquarePlus size={14} />} variant="primary">
          <FormGrid cols={1}>
            <Input
              type="date"
              label={t('gopY.dm.form.ngay')}
              required
              {...register('ngay')}
              error={errors.ngay?.message}
            />
            <Input
              label={t('gopY.dm.form.tieuDe')}
              placeholder={t('gopY.dm.form.tieuDePlaceholder')}
              required
              {...register('tieu_de_gop_y')}
              error={errors.tieu_de_gop_y?.message}
            />
            <Textarea
              label={t('gopY.dm.form.chiTiet')}
              placeholder={t('gopY.dm.form.chiTietPlaceholder')}
              rows={5}
              {...register('chi_tiet_gop_y')}
              error={errors.chi_tiet_gop_y?.message}
            />
            <MultiImageInput
              label={t('gopY.dm.form.hinhAnh')}
              value={imageItems}
              onChange={setImageItems}
              maxFiles={10}
              maxSizeMB={5}
              hint={t('gopY.dm.form.hinhAnhHint')}
              columns={3}
            />
            <input type="hidden" {...register('id_nguoi_tao')} />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default GopYForm;
