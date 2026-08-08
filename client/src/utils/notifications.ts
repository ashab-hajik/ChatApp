export function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => undefined);
  }
}

interface ShowNotificationOptions {
  body: string;
  icon?: string;
  onClick?: () => void;
}

export function showBrowserNotification(title: string, { body, icon, onClick }: ShowNotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const notification = new Notification(title, { body, icon, tag: title });
  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
}
