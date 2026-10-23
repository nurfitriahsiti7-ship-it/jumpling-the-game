import { useState, useEffect, useCallback, useRef } from 'react';
import { PWAStatusManager, DeviceInfo } from '../game/pwaStatusManager';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type DeviceType = 'ios' | 'android' | 'desktop' | 'other';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    isSafari: false,
    isChrome: false,
    platformName: 'Browser',
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showPromptWidget, setShowPromptWidget] = useState<boolean>(false);
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Device profiling
    const dev = PWAStatusManager.getDeviceInfo();
    setDeviceInfo(dev);

    // 2. Track visit count
    PWAStatusManager.recordVisit();

    // 3. Standalone check
    const standaloneNow = PWAStatusManager.isRunningStandalone();
    setIsStandalone(standaloneNow);

    const installedNow = PWAStatusManager.isInstalled();
    setIsInstalled(installedNow);

    const dismissed = PWAStatusManager.isSnoozed();
    setIsDismissed(dismissed);

    // 4. Smart Auto-Prompt: If not installed and not snoozed, show widget after a 2-second gentle delay
    let timer: NodeJS.Timeout | null = null;
    if (!installedNow && !dismissed) {
      timer = setTimeout(() => {
        // Re-verify standalone state before revealing widget
        if (!PWAStatusManager.isRunningStandalone()) {
          setShowPromptWidget(true);
        }
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Event Listeners: beforeinstallprompt, appinstalled, visibilitychange, online/offline
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent standard browser mini-infobar so our custom prompt controls the presentation
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      promptRef.current = promptEvent;

      // If user hasn't installed and hasn't snoozed, display widget
      if (!PWAStatusManager.isRunningStandalone() && !PWAStatusManager.isSnoozed()) {
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
      PWAStatusManager.setInstalled();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const isStand = PWAStatusManager.isRunningStandalone();
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
  }, []);

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
          PWAStatusManager.setInstalled();
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
    PWAStatusManager.snooze(hours);
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
    isInstallable: !!deferredPrompt || deviceInfo.isIOS || deviceInfo.isAndroid,
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isStandalone,
    deviceType: (deviceInfo.isIOS ? 'ios' : deviceInfo.isAndroid ? 'android' : 'desktop') as DeviceType,
    isIOS: deviceInfo.isIOS,
    deviceInfo,
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

// Export both names for maximum compatibility
export const usePWA = usePWAInstall;
