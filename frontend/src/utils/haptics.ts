declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

class HapticsManager {
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    if (!this.enabled) return;
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      } else if (navigator.vibrate) {
        navigator.vibrate(style === 'heavy' ? 40 : 20);
      }
    } catch (e) {
      // Ignore vibration errors
    }
  }

  public notification(type: 'error' | 'success' | 'warning') {
    if (!this.enabled) return;
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else if (navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [30, 50, 30] : [50, 50]);
      }
    } catch (e) {
      // Ignore
    }
  }

  public selection() {
    if (!this.enabled) return;
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      } else if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (e) {
      // Ignore
    }
  }
}

export const haptics = new HapticsManager();
