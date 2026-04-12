import { z } from 'zod';
import i18n from '../../../../lib/i18n';

export const positionSchema = z.object({
  chuc_vu: z
    .string()
    .trim()
    .min(1, { message: i18n.t('position.validation.nameMin') })
    .max(200, { message: i18n.t('position.validation.nameMax') }),
});

export type PositionFormValues = z.infer<typeof positionSchema>;
