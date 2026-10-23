/**
 * PWAStatusManager
 * Centralized manager for PWA installation detection, persistence, and device checks.
 */

export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isChrome: boolean;
  platformName: string;
}

const STORAGE_KEYS = {
  DISMISSED_UNTIL: 'jumping_pwa_dismissed_until',
  INSTALLED_FLAG: 'jumping_pwa_installed_flag',
  VISIT_COUNT: 'jumping_pwa_visit_count',
  LAST_PROMPT_TIME: 'jumping_pwa_last_prompt',
};

class PWAStatusManagerClass {
  /**
   * Check if the application is currently running as an installed PWA (Standalone mode)
   */
  public isRunningStandalone(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Standard CSS display-mode media queries
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreenDisplay = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUiDisplay = window.matchMedia('(display-mode: minimal-ui)').matches;

    // 2. iOS Safari standalone property
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // 3. Android Trusted Web Activity (TWA) referrer check
    const isTWA = typeof document !== 'undefined' && document.referrer.includes('android-app://');

    return isStandaloneDisplay || isFullscreenDisplay || isMinimalUiDisplay || isIOSStandalone || isTWA;
  }

  /**
   * Check if app has been flagged as installed
   */
  public isInstalled(): boolean {
    if (this.isRunningStandalone()) return true;
    try {
      return localStorage.getItem(STORAGE_KEYS.INSTALLED_FLAG) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Mark as installed in localStorage
   */
  public setInstalled(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INSTALLED_FLAG, 'true');
      localStorage.removeItem(STORAGE_KEYS.DISMISSED_UNTIL);
    } catch {
      // fallback
    }
  }

  /**
   * Check if user has snoozed/dismissed the install prompt
   */
  public isSnoozed(): boolean {
    try {
      const untilStr = localStorage.getItem(STORAGE_KEYS.DISMISSED_UNTIL);
      if (!untilStr) return false;
      const until = parseInt(untilStr, 10);
      return Date.now() < until;
    } catch {
      return false;
    }
  }

  /**
   * Snooze prompt for a specific duration in hours (default 48 hours)
   */
  public snooze(hours: number = 48): void {
    try {
      const until = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEYS.DISMISSED_UNTIL, until.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_PROMPT_TIME, Date.now().toString());
    } catch {
      // fallback
    }
  }

  /**
   * Clear snooze (for testing or manual trigger)
   */
  public clearSnooze(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DISMISSED_UNTIL);
    } catch {
      // fallback
    }
  }

  /**
   * Get total visit count
   */
  public recordVisit(): number {
    try {
      const current = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
      const next = current + 1;
      localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, next.toString());
      return next;
    } catch {
      return 1;
    }
  }

  /**
   * Detect detailed device & browser environment
   */
  public getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        isIOS: false,
        isAndroid: false,
        isDesktop: true,
        isSafari: false,
        isChrome: false,
        platformName: 'Browser',
      };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(ua);
    const isDesktop = !isIOS && !isAndroid;

    const isChrome = /chrome|crios/.test(ua) && !/edg/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios/.test(ua);

    let platformName = 'Desktop';
    if (isIOS) platformName = 'iOS Safari';
    else if (isAndroid) platformName = isChrome ? 'Android Chrome' : 'Android Browser';
    else if (isChrome) platformName = 'Desktop Chrome';

    return {
      isIOS,
      isAndroid,
      isDesktop,
      isSafari,
      isChrome,
      platformName,
    };
  }
}

export const PWAStatusManager = new PWAStatusManagerClass();
