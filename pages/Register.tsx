
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { APP_DISPLAY_NAME } from '../lib/branding';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { VnPhoneDigitInput } from '../components/ui/VnPhoneDigitInput';
import { toast } from 'sonner';
import { isValidVnPhone, normalizeVnPhone } from '../lib/phone-auth';
import { isPhoneTakenForRegister } from '../lib/registered-phones';
import { getAuthService } from '../lib/supabase/auth';
import { useEmployees } from '../features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { usePositions } from '../features/he-thong/chuc-vu/hooks/use-chuc-vu';
import { cn } from '../lib/utils';

type RegisterValues = {
  fullName: string;
  chucVuId: string;
  password: string;
  confirmPassword: string;
};

function isDuplicatePhoneAuthError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('already registered') ||
    m.includes('user already registered') ||
    m.includes('already been registered') ||
    m.includes('email address is already registered') ||
    m.includes('email already') ||
    (m.includes('phone') && m.includes('already')) ||
    m.includes('duplicate') ||
    (message.includes('đã') && (message.includes('tồn tại') || message.includes('đăng ký')))
  );
}

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: employees = [] } = useEmployees();
  const { data: positions = [], isLoading: positionsLoading, isError: positionsError } = usePositions();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().trim().min(2, t('page.register.fullNameMin')),
          chucVuId: z.string().min(1, t('page.register.positionRequired')),
          password: z.string().min(6, t('page.login.passwordMin')),
          confirmPassword: z.string().min(1, t('page.register.passwordMismatch')),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('page.register.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const [registerPhoneDigits, setRegisterPhoneDigits] = useState('');
  const [registerPhoneError, setRegisterPhoneError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      chucVuId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    setRegisterPhoneError(undefined);
    if (positionsError) {
      toast.error(t('page.register.positionsError'));
      return;
    }
    if (!isValidVnPhone(registerPhoneDigits)) {
      setRegisterPhoneError(t('page.login.phoneInvalid'));
      toast.error(t('page.login.phoneInvalid'));
      return;
    }
    if (isPhoneTakenForRegister(registerPhoneDigits, employees)) {
      setRegisterPhoneError(t('page.register.phoneDuplicate'));
      return;
    }

    const normalized = normalizeVnPhone(registerPhoneDigits);

    setIsLoading(true);
    try {
      const result = await getAuthService().signUp({
        phone: normalized,
        password: data.password,
        fullName: data.fullName,
        chucVuId: data.chucVuId,
      });
      if ('error' in result && result.error) {
        if (isDuplicatePhoneAuthError(result.error)) {
          setRegisterPhoneError(t('page.register.phoneDuplicate'));
        } else {
          toast.error(result.error);
        }
        return;
      }
      toast.success(t('page.register.success'));
      navigate('/dang-nhap');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">{t('page.register.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('page.register.desc')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <Input
              label={t('page.register.fullName')}
              autoComplete="name"
              placeholder={t('page.register.fullNamePlaceholder')}
              disabled={isLoading}
              {...register('fullName')}
              error={errors.fullName?.message}
              className="h-11"
            />

            <div className="space-y-1.5">
              <label htmlFor="register-chuc-vu" className="text-sm font-medium leading-none block text-foreground">
                {t('page.register.position')}
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <select
                id="register-chuc-vu"
                disabled={isLoading || positionsLoading || positionsError}
                className={cn(
                  'flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  errors.chucVuId ? 'border-destructive' : 'border-input',
                )}
                {...register('chucVuId')}
              >
                <option value="">{t('page.register.positionPlaceholder')}</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ten_chuc_vu ?? p.chuc_vu ?? p.id}
                  </option>
                ))}
              </select>
              {positionsLoading ? (
                <p className="text-xs text-muted-foreground">{t('page.register.positionsLoading')}</p>
              ) : null}
              {positionsError ? (
                <p className="text-xs text-destructive">{t('page.register.positionsError')}</p>
              ) : null}
              {errors.chucVuId ? (
                <p className="text-sm font-medium text-destructive">{errors.chucVuId.message}</p>
              ) : null}
            </div>

            <VnPhoneDigitInput
              label={t('page.login.phone')}
              hint={t('page.login.phoneDigitHint')}
              value={registerPhoneDigits}
              onChange={(d) => {
                setRegisterPhoneDigits(d);
                setRegisterPhoneError(undefined);
              }}
              error={registerPhoneError}
              disabled={isLoading}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none mb-2 block">
                {t('page.register.password')}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn(
                    'flex h-11 w-full rounded-lg border bg-background pl-3 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  )}
                  placeholder={t('page.register.passwordPlaceholder')}
                  disabled={isLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('page.login.hidePassword') : t('page.login.showPassword')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none mb-2 block">
                {t('page.register.confirmPassword')}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn(
                    'flex h-11 w-full rounded-lg border bg-background pl-3 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  )}
                  placeholder={t('page.register.confirmPasswordPlaceholder')}
                  disabled={isLoading}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? t('page.login.hidePassword') : t('page.login.showPassword')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base shadow-lg shadow-primary/20"
            isLoading={isLoading}
            disabled={positionsLoading || positionsError}
          >
            {t('page.register.submit')}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {t('page.register.hasAccount')}{' '}
          <Link to="/dang-nhap" className="font-semibold text-primary hover:underline">
            {t('page.register.loginLink')}
          </Link>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-0 w-full px-4 text-center text-xs text-muted-foreground">
        {t('page.login.copyright')} {APP_DISPLAY_NAME}. {t('page.login.legal')}
      </div>
    </div>
  );
};

export default Register;
