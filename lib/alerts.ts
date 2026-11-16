export async function requestNotificationPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  } catch {
    // Some browsers (older iOS) do not support notifications in the page.
  }
}

export async function alertUser(title: string, body: string) {
  try {
    navigator.vibrate?.([300, 150, 300])
  } catch {}

  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, { body, icon: '/icon-192.png', tag: 'parking-limit' })
    } else {
      new Notification(title, { body, icon: '/icon-192.png', tag: 'parking-limit' })
    }
  } catch {
    // Notification constructor throws on Android Chrome without a service worker.
  }
}
