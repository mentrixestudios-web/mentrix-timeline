const KEYS = {
  COINS: "mt_coins",
  STREAK: "mt_streak",
  LAST_PLAY_DATE: "mt_last_play_date",
  HIGH_SCORE: "mt_high_score",
  STATS: "mt_stats",
  DAILY_PREFIX: "mt_daily_",
};

export function getCoins() {
  const v = localStorage.getItem(KEYS.COINS);
  return v ? parseInt(v, 10) : 1000;
}

export function setCoins(val) {
  const clean = Math.max(0, parseInt(val, 10) || 0);
  localStorage.setItem(KEYS.COINS, String(clean));
  return clean;
}

export function addCoins(amount) {
  return setCoins(getCoins() + amount);
}

export function spendCoins(amount) {
  const current = getCoins();
  if (current >= amount) {
    setCoins(current - amount);
    return true;
  }
  return false;
}

export function getStats() {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    partidasJugadas: 0,
    partidasGanadas: 0,
    cartasColocadasTotal: 0,
    mayorLinea: 0,
    erroresCometidos: 0,
  };
}

export function recordGameResult({ won, cardsPlaced, category }) {
  const current = getStats();
  const next = {
    partidasJugadas: current.partidasJugadas + 1,
    partidasGanadas: current.partidasGanadas + (won ? 1 : 0),
    cartasColocadasTotal: current.cartasColocadasTotal + cardsPlaced,
    mayorLinea: Math.max(current.mayorLinea, cardsPlaced),
    erroresCometidos: current.erroresCometidos + (won ? 0 : 1),
  };
  localStorage.setItem(KEYS.STATS, JSON.stringify(next));

  // Actualizar High Score
  const high = Math.max(parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10), cardsPlaced);
  localStorage.setItem(KEYS.HIGH_SCORE, String(high));

  // Actualizar racha
  const today = new Date().toISOString().slice(0, 10);
  const lastPlay = localStorage.getItem(KEYS.LAST_PLAY_DATE);
  let streak = parseInt(localStorage.getItem(KEYS.STREAK) || "0", 10);

  if (lastPlay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastPlay === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(KEYS.STREAK, String(streak));
    localStorage.setItem(KEYS.LAST_PLAY_DATE, today);
  }

  return next;
}

export function getStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastPlay = localStorage.getItem(KEYS.LAST_PLAY_DATE);
  const streak = parseInt(localStorage.getItem(KEYS.STREAK) || "0", 10);

  if (lastPlay === today || lastPlay === yesterday) {
    return streak;
  }
  return 0;
}

export function getHighScore() {
  return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10);
}
