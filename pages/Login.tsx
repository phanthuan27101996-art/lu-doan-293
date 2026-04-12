
import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { APP_DISPLAY_NAME } from '../lib/branding';
import Button from '../components/ui/Button';
import { VnPhoneDigitInput } from '../components/ui/VnPhoneDigitInput';
import { toast } from 'sonner';
import { DIALOG_SIZE } from '../lib/dialog-sizes';
import { cn } from '../lib/utils';
import { isValidVnPhone, normalizeVnPhone } from '../lib/phone-auth';
import { AUTH_DEMO_ACCOUNT_PHONE } from '../lib/registered-phones';
import { isMock } from '../lib/data/config';
import { getAuthService } from '../lib/supabase/auth';

const AUTH_REMEMBER_KEY = 'auth-remember';

type LoginValues = {
  password: string;
};

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState(() =>
    isMock() ? normalizeVnPhone(AUTH_DEMO_ACCOUNT_PHONE).replace(/\D/g, '').slice(0, 10) : '',
  );
  const [phoneError, setPhoneError] = useState<string | undefined>();

  const loginSchema = useMemo(
    () =>
      z.object({
        password: z.string().min(6, t('page.login.passwordMin')),
      }),
    [t],
  );

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: isMock() ? '123456' : '',
    },
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotPhoneDigits, setForgotPhoneDigits] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    const v = localStorage.getItem(AUTH_REMEMBER_KEY);
    return v === null || v === 'true';
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_REMEMBER_KEY) === null) {
      localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
    }
  }, []);

  useEffect(() => {
    if (forgotOpen) setForgotPhoneDigits(phoneDigits);
  }, [forgotOpen, phoneDigits]);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidVnPhone(forgotPhoneDigits)) {
      toast.error(t('page.login.phoneInvalid'));
      return;
    }
    setForgotSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setForgotSubmitting(false);
    setForgotOpen(false);
    toast.success(t('page.login.recoverySent'), { description: t('page.login.recoverySentTitle') });
  };

  const onSubmit = async (data: LoginValues) => {
    setPhoneError(undefined);
    if (!isValidVnPhone(phoneDigits)) {
      setPhoneError(t('page.login.phoneInvalid'));
      toast.error(t('page.login.phoneInvalid'));
      return;
    }

    setIsLoading(true);
    localStorage.setItem(AUTH_REMEMBER_KEY, rememberMe ? 'true' : 'false');

    try {
      const normalized = normalizeVnPhone(phoneDigits);
      const result = await getAuthService().signIn({
        phone: normalized,
        password: data.password,
      });
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      if ('user' in result && result.user) {
        login(result.user);
        toast.success(t('page.login.loginSuccess'));
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberChange = (checked: boolean) => {
    setRememberMe(checked);
    localStorage.setItem(AUTH_REMEMBER_KEY, checked ? 'true' : 'false');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">{t('page.login.welcome')}</h2>
          <p className="text-muted-foreground mt-2">{t('page.login.welcomeDesc')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <VnPhoneDigitInput
              label={t('page.login.phone')}
              hint={t('page.login.phoneDigitHint')}
              value={phoneDigits}
              onChange={(d) => {
                setPhoneDigits(d);
                setPhoneError(undefined);
              }}
              error={phoneError}
              disabled={isLoading}
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none mb-2 block">
                  {t('page.login.password')}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-medium text-primary hover:text-primary/80 hover:underline mb-2"
                >
                  {t('page.login.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    'flex h-11 w-full rounded-lg border bg-background pl-3 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  )}
                  placeholder="••••••••"
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
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => handleRememberChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
              {t('page.login.rememberMe')}
            </label>
          </div>

          <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" isLoading={isLoading}>
            {t('page.login.loginButton')}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        <AnimatePresence>
          {forgotOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !forgotSubmitting && setForgotOpen(false)}
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="forgot-password-title"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={cn(
                  'relative bg-card rounded-xl p-6 w-full shadow-2xl border border-border/40',
                  DIALOG_SIZE.MEDIUM
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 id="forgot-password-title" className="text-lg font-semibold text-foreground mb-2">
                  {t('page.login.forgotPasswordTitle')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{t('page.login.forgotPasswordDesc')}</p>
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <VnPhoneDigitInput
                    label={t('page.login.phone')}
                    hint={t('page.login.phoneDigitHint')}
                    value={forgotPhoneDigits}
                    onChange={setForgotPhoneDigits}
                    disabled={forgotSubmitting}
                  />
                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForgotOpen(false)}
                      disabled={forgotSubmitting}
                      className="min-w-[100px]"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" isLoading={forgotSubmitting} className="min-w-[140px]">
                      {t('page.login.sendRecovery')}
                    </Button>
                  </div>
                </form>
                <button
                  type="button"
                  onClick={() => !forgotSubmitting && setForgotOpen(false)}
                  aria-label={t('common.close')}
                  className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="text-center text-sm text-muted-foreground">
          {t('page.login.noAccount')}{' '}
          <Link to="/dang-ky" className="font-semibold text-primary hover:underline">
            {t('page.login.register')}
          </Link>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-0 w-full px-4 text-center text-xs text-muted-foreground">
        {t('page.login.copyright')} {APP_DISPLAY_NAME}. {t('page.login.legal')}
      </div>
    </div>
  );
};

export default Login;
