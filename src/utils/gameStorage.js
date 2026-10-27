const KEYS = {
  COINS: "mt_coins",
  STREAK: "mt_streak",
  LAST_PLAY_DATE: "mt_last_play_date",
  HIGH_SCORE: "mt_high_score",
  STATS: "mt_stats",
  LEVEL: "mt_level",
  XP: "mt_xp",
  ADS_WATCHED: "mt_ads_watched_today",
  ADS_DATE: "mt_ads_date",
  LAST_AD_TIME: "mt_last_ad_time",
};

const INITIAL_COINS = 1000;
const AD_REWARD = 30;
const MAX_ADS_PER_DAY = 5;
const AD_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos

function emitStorageUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mt_storage_updated"));
  }
}

// ============================================
// MONEDAS
// ============================================
export function getCoins() {
  const v = localStorage.getItem(KEYS.COINS);
  return v ? parseInt(v, 10) : INITIAL_COINS;
}

export function setCoins(val) {
  const clean = Math.max(0, parseInt(val, 10) || 0);
  localStorage.setItem(KEYS.COINS, String(clean));
  emitStorageUpdate();
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

// ============================================
// NIVEL Y EXPERIENCIA (XP)
// ============================================
export function getLevel() {
  const v = localStorage.getItem(KEYS.LEVEL);
  return v ? Math.max(1, parseInt(v, 10)) : 1;
}

export function getXp() {
  const v = localStorage.getItem(KEYS.XP);
  return v ? Math.max(0, parseInt(v, 10)) : 0;
}

export function getLevelInfo() {
  const nivel = getLevel();
  const experiencia = getXp();
  const xpMax = nivel * 100;
  const xpActual = experiencia % xpMax;
  const xpPct = Math.min((xpActual / xpMax) * 100, 100);

  return {
    nivel,
    experiencia,
    xpActual,
    xpMax,
    xpPct: Math.round(xpPct),
  };
}

export function addXp(amount) {
  const currentXp = getXp();
  const nextXp = currentXp + amount;
  localStorage.setItem(KEYS.XP, String(nextXp));

  // Calcular si subió de nivel
  let nivel = getLevel();
  let xpReq = nivel * 100;
  let subioNivel = false;

  while (nextXp >= nivel * xpReq) {
    nivel += 1;
    subioNivel = true;
    xpReq = nivel * 100;
  }

  localStorage.setItem(KEYS.LEVEL, String(nivel));
  emitStorageUpdate();

  return {
    nivel,
    subioNivel,
    totalXp: nextXp,
  };
}

// ============================================
// RACHA DIARIA
// ============================================
export function getStreakInfo() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastPlay = localStorage.getItem(KEYS.LAST_PLAY_DATE);
  const streak = parseInt(localStorage.getItem(KEYS.STREAK) || "0", 10);

  const rachaHoy = lastPlay === today;

  if (lastPlay === today || lastPlay === yesterday) {
    return { racha: streak, rachaHoy };
  }

  return { racha: 0, rachaHoy: false };
}

export function getStreak() {
  return getStreakInfo().racha;
}

// ============================================
// ANUNCIOS RECOMPENSADOS (TIENDA)
// ============================================
export function getAdsInfo() {
  const today = new Date().toISOString().slice(0, 10);
  const savedDate = localStorage.getItem(KEYS.ADS_DATE);
  let adsWatched = parseInt(localStorage.getItem(KEYS.ADS_WATCHED) || "0", 10);

  if (savedDate !== today) {
    localStorage.setItem(KEYS.ADS_DATE, today);
    localStorage.setItem(KEYS.ADS_WATCHED, "0");
    adsWatched = 0;
  }

  const lastAdTime = parseInt(localStorage.getItem(KEYS.LAST_AD_TIME) || "0", 10);
  const elapsed = Date.now() - lastAdTime;
  const cooldownRemaining = Math.max(0, AD_COOLDOWN_MS - elapsed);
  const canWatch = adsWatched < MAX_ADS_PER_DAY && cooldownRemaining === 0;
  const adsRemaining = Math.max(0, MAX_ADS_PER_DAY - adsWatched);

  return {
    adsWatched,
    adsRemaining,
    maxAds: MAX_ADS_PER_DAY,
    cooldownRemaining,
    canWatch,
    rewardAmount: AD_REWARD,
  };
}

export function watchAdReward() {
  const info = getAdsInfo();
  if (!info.canWatch) return false;

  const nextCount = info.adsWatched + 1;
  localStorage.setItem(KEYS.ADS_WATCHED, String(nextCount));
  localStorage.setItem(KEYS.LAST_AD_TIME, String(Date.now()));
  addCoins(AD_REWARD);
  emitStorageUpdate();

  return true;
}

// ============================================
// ESTADÍSTICAS Y RESULTADOS
// ============================================
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

  // High Score
  const high = Math.max(parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10), cardsPlaced);
  localStorage.setItem(KEYS.HIGH_SCORE, String(high));

  // Racha
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

  // Experiencia ganada
  const xpEarned = cardsPlaced * 15 + (won ? 50 : 10);
  const coinsEarned = cardsPlaced * 5 + (won ? 25 : 0);
  addXp(xpEarned);
  if (coinsEarned > 0) addCoins(coinsEarned);

  emitStorageUpdate();
  return next;
}

export function getHighScore() {
  return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10);
}
