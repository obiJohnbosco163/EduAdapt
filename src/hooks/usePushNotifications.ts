import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const scheduleReminder = (title: string, body: string, delayMs: number) => {
    if (permission !== 'granted') return;
    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'study-reminder',
            renotify: true,
          });
        });
      }
    }, delayMs);
  };

  const sendStudyReminder = () => {
    scheduleReminder(
      '📚 Time to study!',
      "Don't break your streak! Open EduAdapt and complete a lesson.",
      0
    );
  };

  const sendStreakReminder = (streak: number) => {
    scheduleReminder(
      `🔥 ${streak}-day streak!`,
      "Keep it going! Study today to maintain your streak.",
      0
    );
  };

  return { permission, supported, requestPermission, sendStudyReminder, sendStreakReminder, scheduleReminder };
}
