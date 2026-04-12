import React, { useEffect, useRef, useState } from 'react';
import { useUIStore } from '../store/useStore';
import { APP_DISPLAY_NAME, APP_LOGO_PATH, APP_TAGLINE, resolveAppLogoAbsoluteUrl } from './branding';
import { PRIMARY_COLOR_MAP } from './theme-utils';
import i18n from './i18n';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

export const ThemeSynchronizer: React.FC = () => {
  const { primaryColor, colorScheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    const hslValue = PRIMARY_COLOR_MAP[primaryColor];
    root.style.setProperty('--primary', hslValue);
    root.style.setProperty('--ring', hslValue);
    root.style.setProperty('--secondary-foreground', hslValue);
    root.style.setProperty('--accent-foreground', hslValue);
    root.style.setProperty('--color-primary', `hsl(${hslValue})`);
    root.style.setProperty('--color-ring', `hsl(${hslValue} / 0.5)`);
  }, [primaryColor]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    const root = document.documentElement;
    const getResolvedTheme = (): 'dark' | 'light' => {
      if (colorScheme === 'dark') return 'dark';
      if (colorScheme === 'light') return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    let transitionTimer: ReturnType<typeof setTimeout> | undefined;
    if (!isFirstRender.current) {
      root.setAttribute('data-theme-transition', '');
      transitionTimer = setTimeout(() => root.removeAttribute('data-theme-transition'), 350);
    }
    isFirstRender.current = false;

    const apply = () => {
      const resolved = getResolvedTheme();
      if (resolved === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };
    apply();
    if (colorScheme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => {
        mq.removeEventListener('change', apply);
        if (transitionTimer) clearTimeout(transitionTimer);
      };
    }
    return () => {
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [colorScheme]);
  return null;
};

export const MetadataSynchronizer: React.FC = () => {
  useEffect(() => {
    const titlePart = APP_TAGLINE ? `${APP_DISPLAY_NAME} - ${APP_TAGLINE}` : APP_DISPLAY_NAME;
    document.title = titlePart;

    const head = document.getElementsByTagName('head')[0];
    const absoluteLogo = resolveAppLogoAbsoluteUrl();

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      head.appendChild(link);
    }
    link.href = APP_LOGO_PATH;

    let apple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      head.appendChild(apple);
    }
    apple.href = APP_LOGO_PATH;

    let ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', absoluteLogo);
  }, []);
  return null;
};

/** Đồng bộ i18n + dayjs + thuộc tính lang — luôn tiếng Việt. */
export const LanguageSynchronizer: React.FC = () => {
  useEffect(() => {
    void i18n.changeLanguage('vi');
    dayjs.locale('vi');
    document.documentElement.lang = 'vi';
  }, []);
  return null;
};

export function useResolvedTheme(): 'dark' | 'light' {
  const colorScheme = useUIStore((s) => s.colorScheme);

  const resolve = (): 'dark' | 'light' => {
    if (colorScheme === 'dark') return 'dark';
    if (colorScheme === 'light') return 'light';
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(resolve);

  useEffect(() => {
    setTheme(resolve());
    if (colorScheme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [colorScheme]);

  return theme;
}
