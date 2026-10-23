import { useState, useEffect, useCallback } from 'react';

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
};

export type DeviceType = 'ios' | 'android' | 'desktop' | 'other';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // start true until checked
  const [showPromptWidget, setShowPromptWidget] = useState<boolean>(false);
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Check standalone mode (app running as installed PWA)
  const checkStandalone = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    // Standard display-mode check
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreenDisplay = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUiDisplay = window.matchMedia('(display-mode: minimal-ui)').matches;

    // iOS Safari standalone property
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Android TWA referrer check
    const isTWA = document.referrer.includes('android-app://');

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
    // 1. Initial Device Detection
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

    // 2. Initial Standalone Check
    const standaloneNow = checkStandalone();
    setIsStandalone(standaloneNow);

    // If standalone or flagged as installed, mark as installed
    const flagged = localStorage.getItem(STORAGE_KEYS.INSTALLED_FLAG) === 'true';
    const installedNow = standaloneNow || flagged;
    setIsInstalled(installedNow);

    const dismissed = checkIsDismissed();
    setIsDismissed(dismissed);

    // If not installed and not dismissed, show widget after a smooth 2.5s delay
    if (!installedNow && !dismissed) {
      const timer = setTimeout(() => {
        setShowPromptWidget(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [checkStandalone, checkIsDismissed]);

  // Event Listeners: beforeinstallprompt, appinstalled, visibilitychange, online/offline
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic browser mini-infobar
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // If user hasn't installed or dismissed, trigger prompt widget
      if (!checkStandalone() && !checkIsDismissed()) {
        setShowPromptWidget(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
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
    // Case 1: Browser supports native prompt
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setShowPromptWidget(false);
          try {
            localStorage.setItem(STORAGE_KEYS.INSTALLED_FLAG, 'true');
          } catch {
            // fallback
          }
          return true;
        } else {
          // User dismissed native prompt; snooze widget so we don't nag
          dismiss(24);
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

  // Dismiss / Snooze the installation widget
  const dismiss = useCallback((hours: number = 24) => {
    setShowPromptWidget(false);
    setIsDismissed(true);
    try {
      const until = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEYS.DISMISSED_UNTIL, until.toString());
    } catch {
      // fallback
    }
  }, []);

  // Explicitly open prompt widget (e.g., from Settings or Header)
  const openInstallPrompt = useCallback(() => {
    if (deferredPrompt) {
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
    showPromptWidget: showPromptWidget && !isInstalled,
    showManualGuide,
    setShowManualGuide,
    install,
    dismiss,
    openInstallPrompt,
  };
}
