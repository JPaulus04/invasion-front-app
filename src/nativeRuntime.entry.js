import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

(function () {
  'use strict';

  const impactStyles = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };

  function webFallback(kind) {
    if (!navigator.vibrate) return;
    const duration = kind === 'heavy' || kind === 'error' ? 35 : kind === 'medium' ? 20 : 8;
    navigator.vibrate(duration);
  }

  function trigger(kind = 'light') {
    let request;
    if (kind === 'success') {
      request = Haptics.notification({ type: NotificationType.Success });
    } else if (kind === 'error') {
      request = Haptics.notification({ type: NotificationType.Error });
    } else if (kind === 'warning') {
      request = Haptics.notification({ type: NotificationType.Warning });
    } else {
      request = Haptics.impact({ style: impactStyles[kind] || ImpactStyle.Light });
    }

    Promise.resolve(request).catch(() => webFallback(kind));
  }

  window.LSCNativeHaptics = Object.freeze({
    isNative: Capacitor.isNativePlatform(),
    trigger,
  });
})();
