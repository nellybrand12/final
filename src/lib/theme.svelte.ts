import { browser } from '$app/environment';

class ThemeManager {
  isDark = $state(false);
  isAdmin = $state(false);

  private systemMediaQuery: MediaQueryList | null = null;

  constructor() {
    if (browser) {
      this.init();
    }
  }

  private init() {
    this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemMediaQuery.addEventListener('change', (e) => {
      const key = this.isAdmin ? 'admin-theme' : 'theme';
      const saved = localStorage.getItem(key);
      if (!saved) {
        this.applyTheme(e.matches);
      }
    });

    this.syncRoute(window.location.pathname);
  }

  syncRoute(pathname: string) {
    if (!browser) return;
    this.isAdmin = pathname.startsWith('/admin');
    const key = this.isAdmin ? 'admin-theme' : 'theme';
    const saved = localStorage.getItem(key);

    let shouldBeDark = false;
    if (saved === 'dark') {
      shouldBeDark = true;
    } else if (saved === 'light') {
      shouldBeDark = false;
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyTheme(shouldBeDark);
  }

  private applyTheme(dark: boolean) {
    this.isDark = dark;
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }

  toggle(scope?: 'public' | 'admin') {
    if (!browser) return;
    const targetIsAdmin = scope !== undefined ? scope === 'admin' : this.isAdmin;
    const key = targetIsAdmin ? 'admin-theme' : 'theme';
    const newDark = !this.isDark;

    localStorage.setItem(key, newDark ? 'dark' : 'light');
    this.applyTheme(newDark);
  }
}

export const themeManager = new ThemeManager();
