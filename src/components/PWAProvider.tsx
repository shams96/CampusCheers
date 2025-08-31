'use client';

import { useEffect } from 'react';
import { registerServiceWorker, requestNotificationPermission } from '@/lib/pwa';

export default function PWAProvider() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Request notification permission
    requestNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  }, []);

  return null; // This component doesn't render anything
}