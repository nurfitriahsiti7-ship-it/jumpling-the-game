import { useState, useEffect, useCallback, useRef } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEYS = {
  DISMISSED_UNTIL: 'jumping_pwa_dismissed_until',
  INSTALLED_FLAG: 'jumping_pwa_installed_flag',
  VISIT_COUNT: 'jumping_pwa_visit_count',
};

export type DeviceType = 'ios' | 'android' | 'desktop' | 'other';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showPromptWidget, setShowPromptWidget] = useState<boolean>(false);
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Keep a ref for deferredPrompt to avoid stale closures in event listeners
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Check standalone mode (app running as installed PWA)
  const checkStandalone = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    // Standard display-mode check (CSS media queries)
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreenDisplay = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUiDisplay = window.matchMedia('(display-mode: minimal-ui)').matches;

    // iOS Safari standalone property
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Android TWA referrer check
    const isTWA = typeof document !== 'undefined' && document.referrer.includes('android-app://');

    return isStandaloneDisplay || isFullscreenDisplay || isMinimalUiDisplay || isIOSStandalone || isTWA;
  }, []);

  // Check if user dismissed prompt recently
  const checkIsDismissed = useCallback((): boolean => {
    try {
      const untilStr = localStorage.getItem(STORAGE_KEYS.DISMISSED_UNTIL);
      if (!untilStr) return false;
      const until = parseInt(untilStr, 10);
      return Date.now() < until;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // 1. Device and OS Detection
    const ua = navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      setDeviceType('ios');
    } else if (isAndroidDevice) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // 2. Track visit count
    try {
      const visits = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
      localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, (visits + 1).toString());
    } catch {
      // fallback
    }

    // 3. Standalone & Installed Check
    const standaloneNow = checkStandalone();
    setIsStandalone(standaloneNow);

    const flagged = localStorage.getItem(STORAGE_KEYS.INSTALLED_FLAG) === 'true';
    const installedNow = standaloneNow || flagged;
    setIsInstalled(installedNow);

    const dismissed = checkIsDismissed();
    setIsDismissed(dismissed);

    // 4. Smart Auto-Prompt: If not installed and not dismissed, show widget after a 2-second gentle delay
    let timer: NodeJS.Timeout | null = null;
    if (!installedNow && !dismissed) {
      timer = setTimeout(() => {
        // Re-verify standalone state before revealing
        if (!checkStandalone()) {
          setShowPromptWidget(true);
        }
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [checkStandalone, checkIsDismissed]);

  // Event Listeners: beforeinstallprompt, appinstalled, visibilitychange, online/offline
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent standard browser mini-infobar so our custom prompt controls the presentation
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      promptRef.current = promptEvent;

      // If user hasn't installed and hasn't snoozed, display widget
      if (!checkStandalone() && !checkIsDismissed()) {
        setShowPromptWidget(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
      promptRef.current = null;
      setShowPromptWidget(false);
      setShowManualGuide(false);
      try {
        localStorage.setItem(STORAGE_KEYS.INSTALLED_FLAG, 'true');
        localStorage.removeItem(STORAGE_KEYS.DISMISSED_UNTIL);
      } catch {
        // fallback
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const isStand = checkStandalone();
        setIsStandalone(isStand);
        if (isStand) {
          setIsInstalled(true);
          setShowPromptWidget(false);
        }
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkStandalone, checkIsDismissed]);

  // Trigger Installation Action
  const install = useCallback(async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || promptRef.current;

    // Case 1: Browser supports native prompt
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          promptRef.current = null;
          setShowPromptWidget(false);
          try {
            localStorage.setItem(STORAGE_KEYS.INSTALLED_FLAG, 'true');
          } catch {
            // fallback
          }
          return true;
        } else {
          // User dismissed native prompt; snooze widget for 48 hours
          dismiss(48);
          return false;
        }
      } catch {
        // Fallback to manual guide on error
        setShowManualGuide(true);
        return false;
      }
    }

    // Case 2: Browser does not support native prompt (iOS Safari, Firefox, or prompt not fired)
    setShowManualGuide(true);
    return false;
  }, [deferredPrompt]);

  // Dismiss / Snooze the installation widget (default 48 hours)
  const dismiss = useCallback((hours: number = 48) => {
    setShowPromptWidget(false);
    setIsDismissed(true);
    try {
      const until = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEYS.DISMISSED_UNTIL, until.toString());
    } catch {
      // fallback
    }
  }, []);

  // Explicitly open prompt widget (e.g., from Settings or Header button)
  const openInstallPrompt = useCallback(() => {
    const promptEvent = deferredPrompt || promptRef.current;
    if (promptEvent) {
      install();
    } else {
      setShowManualGuide(true);
    }
  }, [deferredPrompt, install]);

  return {
    isInstallable: !!deferredPrompt || isIOS || deviceType === 'android',
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isStandalone,
    deviceType,
    isIOS,
    isOnline,
    isDismissed,
    showPromptWidget: showPromptWidget && !isInstalled,
    showManualGuide,
    setShowManualGuide,
    install,
    dismiss,
    openInstallPrompt,
  };
}
