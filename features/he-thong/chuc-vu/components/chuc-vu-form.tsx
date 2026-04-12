import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import { PositionFormValues, positionSchema } from '../core/schema';
import { Position } from '../core/types';
import { useCreatePosition, useUpdatePosition } from '../hooks/use-chuc-vu';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../../components/shared/GenericDrawer';
import FormDrawerFooter from '../../../../components/shared/FormDrawerFooter';
import FormSection from '../../../../components/shared/FormSection';
import FormGrid from '../../../../components/shared/FormGrid';

const DEFAULT_VALUES: PositionFormValues = {
  chuc_vu: '',
};

interface Props {
  initialData?: Position | null;
  onClose: () => void;
}

const PositionForm: React.FC<Props> = ({ initialData, onClose }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const createMutation = useCreatePosition(onClose);
  const updateMutation = useUpdatePosition(onClose);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (initialData) {
      reset({ chuc_vu: initialData.chuc_vu ?? '' });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<PositionFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? t('position.form.editTitle') : t('position.form.createTitle')}
      icon={<Briefcase size={20} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="pos-form"
          onCancel={onClose}
          isLoading={isLoading}
          isEdit={isEdit}
          saveLabel={t('position.form.save')}
          createLabel={t('position.form.create')}
        />
      }
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="pos-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title={t('position.detail.basicInfo')} icon={<Briefcase size={14} />} variant="primary">
          <FormGrid cols={1}>
            <Input
              label={t('position.form.name')}
              placeholder={t('position.form.namePlaceholder')}
              icon={<Briefcase size={12} />}
              required
              {...register('chuc_vu')}
              error={errors.chuc_vu?.message}
            />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default PositionForm;
