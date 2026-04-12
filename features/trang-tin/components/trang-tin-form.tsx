import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Newspaper } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import MultiImageInput, { type ImageItem } from '../../../components/ui/MultiImageInput';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../components/shared/GenericDrawer';
import FormSection from '../../../components/shared/FormSection';
import FormGrid from '../../../components/shared/FormGrid';
import { trangTinFormSchema, type TrangTinFormValues } from '../core/schema';
import { BTN_CANCEL, BTN_SAVE, BTN_CREATE } from '../../../lib/button-labels';
import type { TrangTin } from '../core/types';
import {
  getDefaultTrangTinFormValues,
  trangTinToFormValues,
  hinhAnhToImageItems,
} from '../utils/trang-tin-form';
import { useCreateTrangTin, useUpdateTrangTin } from '../hooks/use-trang-tin';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';
import { collectImageUrlsFromItems } from '../services/trang-tin-service';
import { useAuthStore } from '../../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

interface Props {
  initialData?: TrangTin | null;
  onClose: () => void;
}

const TrangTinForm: React.FC<Props> = ({ initialData, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreateTrangTin(onClose);
  const updateMutation = useUpdateTrangTin(onClose);
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

  const currentQuanNhanId = useMemo(
    () => resolveQuanNhanIdForUser(authUser, employees),
    [authUser, employees],
  );
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TrangTinFormValues>({
    resolver: zodResolver(trangTinFormSchema),
    defaultValues: getDefaultTrangTinFormValues(),
  });

  useEffect(() => {
    if (initialData) {
      reset(trangTinToFormValues(initialData));
      setImageItems(hinhAnhToImageItems(initialData.hinh_anh ?? []));
    } else {
      reset(getDefaultTrangTinFormValues());
      setImageItems([]);
    }
  }, [initialData, reset]);

  /** Thêm mới: luôn gán id_nguoi_tao theo user đang đăng nhập (khớp SĐT ↔ quân nhân). */
  useEffect(() => {
    if (initialData) return;
    if (currentQuanNhanId) {
      setValue('id_nguoi_tao', currentQuanNhanId, { shouldValidate: true });
    } else {
      setValue('id_nguoi_tao', '', { shouldValidate: true });
    }
  }, [initialData, currentQuanNhanId, setValue]);

  const onSubmit = async (data: TrangTinFormValues) => {
    try {
      const hinhAnhUrls = await collectImageUrlsFromItems(imageItems);
      const creatorId = isEdit
        ? (initialData?.id_nguoi_tao ?? data.id_nguoi_tao ?? '')
        : (resolveQuanNhanIdForUser(authUser, employees) ?? '');
      const dataWithCreator: TrangTinFormValues = { ...data, id_nguoi_tao: creatorId };
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
      <Button type="submit" form="trang-tin-form" isLoading={isLoading} className="bg-primary text-white shadow-lg">
        {isEdit ? BTN_SAVE() : BTN_CREATE()}
      </Button>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? t('trangTin.form.editTitle') : t('trangTin.form.createTitle')}
      subtitle={isEdit ? `${t('trangTin.form.editSubtitle')} · id ${initialData?.id}` : t('trangTin.form.createSubtitle')}
      icon={<Newspaper size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="trang-tin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {Object.keys(errors).length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg leading-none">!</span>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{t('trangTin.form.validationError')}</p>
          </div>
        )}

        <FormSection title={t('trangTin.form.basicInfo')} icon={<Newspaper size={14} />} variant="primary">
          <FormGrid cols={1}>
            {/*
              Thứ tự khớp cột bảng public.trang_tin (không hiển thị id, tg_tao, tg_cap_nhat):
              ngay_dang, tieu_de, mo_ta_ngan, hinh_anh, link; id_nguoi_tao ẩn (tự gán)
            */}
            <Input
              type="date"
              label={t('trangTin.form.ngayDang')}
              required
              {...register('ngay_dang')}
              error={errors.ngay_dang?.message}
            />
            <Input
              label={t('trangTin.form.tieuDe')}
              placeholder={t('trangTin.form.tieuDePlaceholder')}
              required
              {...register('tieu_de')}
              error={errors.tieu_de?.message}
            />
            <Textarea
              label={t('trangTin.form.moTaNgan')}
              placeholder={t('trangTin.form.moTaPlaceholder')}
              rows={5}
              {...register('mo_ta_ngan')}
              error={errors.mo_ta_ngan?.message}
            />
            <MultiImageInput
              label={t('trangTin.form.hinhAnh')}
              value={imageItems}
              onChange={setImageItems}
              maxFiles={10}
              maxSizeMB={5}
              hint={t('trangTin.form.hinhAnhHint')}
              columns={3}
            />
            <Input
              label={t('trangTin.form.link')}
              placeholder={t('trangTin.form.linkPlaceholder')}
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

export default TrangTinForm;
