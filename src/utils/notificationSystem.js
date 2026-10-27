import { createPageUrl } from "./index";

const NOTIF_ENABLED_KEY = "timeline_notif_enabled";
const SHOWN_PREFIX = "timeline_notif_shown_";

export function isNotificationsEnabled() {
  const saved = localStorage.getItem(NOTIF_ENABLED_KEY);
  return saved == null ? true : saved === "true";
}

export function setNotificationsEnabled(enabled) {
  localStorage.setItem(NOTIF_ENABLED_KEY, enabled ? "true" : "false");
  if (enabled) {
    scheduleTimelineNotifications();
  }
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  } catch {
    return false;
  }
}

export async function showTimelineNotification(title, options = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  const payload = {
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    vibrate: [200, 100, 200],
    ...options,
  };

  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, payload);
      return true;
    }
  } catch (e) {
    console.warn("ServiceWorker showNotification fallback", e);
  }

  try {
    new Notification(title, payload);
    return true;
  } catch (e) {
    console.warn("Direct Notification constructor failed", e);
    return false;
  }
}

export async function sendTestNotification() {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  setTimeout(() => {
    showTimelineNotification("Mentrix: Línea de Tiempo", {
      body: "¡Prueba de notificación recibida! El tiempo te espera ⏳✨",
      data: { target: createPageUrl("Home") },
    });
  }, 5000);

  return true;
}

let schedulerTimer = null;

export function scheduleTimelineNotifications() {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }

  if (!isNotificationsEnabled()) return;
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const check = async () => {
    if (!isNotificationsEnabled() || Notification.permission !== "granted") return;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const hour = now.getHours();

    // 1. Desafío Diario a partir de las 10:00 AM
    const dailyKey = `${SHOWN_PREFIX}daily_${dateStr}`;
    if (hour >= 10 && !localStorage.getItem(dailyKey)) {
      const shown = await showTimelineNotification("¡Nuevo Desafío Cronológico! ⏳", {
        body: "5 eventos históricos clave te esperan hoy. ¿Podrás ordenarlos sin perder ninguna vida?",
        data: { target: createPageUrl("DesafioDiario") },
      });
      if (shown) localStorage.setItem(dailyKey, "true");
    }

    // 2. Recordatorio nocturno a las 20:30 PM
    const streakKey = `${SHOWN_PREFIX}streak_${dateStr}`;
    if (hour >= 20 && !localStorage.getItem(streakKey)) {
      const shown = await showTimelineNotification("¡No detengas el reloj! 🔥", {
        body: "Entra a Mentrix Línea de Tiempo y pon a prueba tu memoria histórica antes de medianoche.",
        data: { target: createPageUrl("Home") },
      });
      if (shown) localStorage.setItem(streakKey, "true");
    }

    schedulerTimer = setTimeout(check, 60000);
  };

  check();
}
