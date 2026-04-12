import { z } from 'zod';
import i18n from '../../../../lib/i18n';

const PHONE_REGEX = /^0\d{9}$/;

export const employeeSchema = z.object({
  ho_ten: z.string().trim().min(2, { message: i18n.t('employee.validation.nameMin') }),
  so_dien_thoai: z
    .string()
    .trim()
    .min(1, { message: i18n.t('employee.validation.phoneRequired') })
    .regex(PHONE_REGEX, { message: i18n.t('employee.validation.phoneInvalid') }),
  chuc_vu_id: z.string().min(1, { message: i18n.t('employee.validation.positionRequired') }),
  anh_dai_dien: z.string().optional().nullable(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
