import { z } from 'zod';
import i18n from '../../../lib/i18n';

const MAX_LEN = 200_000;

export const truyenThongFormSchema = z.object({
  thong_tin: z.string().max(MAX_LEN, {
    message: i18n.t('truyenThong.validation.maxLength', { max: MAX_LEN }),
  }),
});

export type TruyenThongFormValues = z.infer<typeof truyenThongFormSchema>;
