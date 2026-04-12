import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Settings as SettingsIcon,
} from 'lucide-react';
import DashboardToolbar from '../components/shared/DashboardToolbar';
import { useUIStore } from '../store/useStore';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { primaryColor, colorScheme, setTheme } = useUIStore();

  const THEME_COLORS = useMemo(() => [
    { name: 'blue', label: t('settings.colorBlue'), color: 'bg-blue-600' },
    { name: 'violet', label: t('settings.colorViolet'), color: 'bg-indigo-600' },
    { name: 'emerald', label: t('settings.colorEmerald'), color: 'bg-emerald-600' },
    { name: 'rose', label: t('settings.colorRose'), color: 'bg-rose-600' },
    { name: 'amber', label: t('settings.colorAmber'), color: 'bg-amber-500' },
    { name: 'orange', label: t('settings.colorOrange'), color: 'bg-orange-600' },
    { name: 'cyan', label: t('settings.colorCyan'), color: 'bg-cyan-500' },
    { name: 'slate', label: t('settings.colorSlate'), color: 'bg-slate-600' },
  ], [t]);

  const handleReset = () => {
    setTheme({
      primaryColor: 'blue',
      colorScheme: 'light',
    });
    toast.info(t('settings.restored'));
  };

  return (
    <div className="flex flex-col min-h-0 max-w-5xl mx-auto w-full px-4 sm:px-6">
      <DashboardToolbar
        onBack={() => navigate(-1)}
        className="px-0"
        leadingContent={
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-semibold text-foreground truncate">
              {t('settings.pageTitle')}
            </h1>
          </div>
        }
        actions={
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 h-8 px-2 flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 text-xs font-medium"
          >
            <RotateCcw size={15} className="stroke-[2.5px]" />
            <span className="hidden sm:inline">{t('common.reset')}</span>
          </button>
        }
        mobileActions={
          <button
            type="button"
            onClick={handleReset}
            aria-label={t('common.reset')}
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground active:scale-95 transition-all"
          >
            <RotateCcw size={15} className="stroke-[2.5px]" />
          </button>
        }
      />
      <div className="space-y-6 pb-10 pt-3 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-5 rounded-xl border border-border shadow-sm"
        >
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
              <Palette className="w-4 h-4 text-primary shrink-0" />
              {t('settings.title')}
            </h3>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Moon size={14} className="text-primary shrink-0" />
                {t('settings.displayMode')}
              </label>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t('settings.displayMode')}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={colorScheme === 'light'}
                  onClick={() => setTheme({ colorScheme: 'light' })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    colorScheme === 'light'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Sun size={14} className={cn(colorScheme === 'light' ? 'text-primary' : 'text-muted-foreground')} />
                  {t('settings.light')}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={colorScheme === 'dark'}
                  onClick={() => setTheme({ colorScheme: 'dark' })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    colorScheme === 'dark'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Moon size={14} className={cn(colorScheme === 'dark' ? 'text-primary' : 'text-muted-foreground')} />
                  {t('settings.dark')}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={colorScheme === 'system'}
                  onClick={() => setTheme({ colorScheme: 'system' })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    colorScheme === 'system'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Monitor size={14} className={cn(colorScheme === 'system' ? 'text-primary' : 'text-muted-foreground')} />
                  {t('settings.system')}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                {t('settings.primaryColor')}
              </label>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('settings.primaryColor')}>
                {THEME_COLORS.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    role="radio"
                    aria-checked={primaryColor === theme.name}
                    aria-label={theme.label}
                    onClick={() => setTheme({ primaryColor: theme.name })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                      primaryColor === theme.name
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <span
                      className={cn('w-4 h-4 rounded-full shrink-0', theme.color)}
                      aria-hidden="true"
                    />
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
