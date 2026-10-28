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
  POWERUPS: "mt_powerups",
  DAILY_GIFT_LAST: "mt_daily_gift_last",
  STARTER_PACK_CLAIMED: "mt_starter_pack_claimed",
};

const INITIAL_COINS = 1000;
const AD_REWARD = 30;
const MAX_ADS_PER_DAY = 5;
const AD_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos
const DAILY_GIFT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas

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
// INVENTARIO DE PODERES Y FACULTADES
// ============================================
export function getPowerups() {
  try {
    const raw = localStorage.getItem(KEYS.POWERUPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        escudos: parsed.escudos || 0,
        lupas: parsed.lupas || 0,
        corazones: parsed.corazones || 0,
        congeladores: parsed.congeladores || 0,
      };
    }
  } catch {}
  return {
    escudos: 1, // 1 escudo de regalo de inicio
    lupas: 2,   // 2 lupas de regalo de inicio
    corazones: 1,
    congeladores: 1,
  };
}

export function savePowerups(powerups) {
  localStorage.setItem(KEYS.POWERUPS, JSON.stringify(powerups));
  emitStorageUpdate();
  return powerups;
}

export function addPowerup(type, count = 1) {
  const current = getPowerups();
  current[type] = (current[type] || 0) + count;
  return savePowerups(current);
}

export function usePowerup(type) {
  const current = getPowerups();
  if ((current[type] || 0) > 0) {
    current[type] -= 1;
    savePowerups(current);
    return true;
  }
  return false;
}

export function buyPowerupWithCoins(type, priceInCoins) {
  if (spendCoins(priceInCoins)) {
    addPowerup(type, 1);
    return true;
  }
  return false;
}

// ============================================
// COFRE DE REGALO DIARIO (CADA 24 HORAS)
// ============================================
export function getDailyGiftInfo() {
  const lastClaim = parseInt(localStorage.getItem(KEYS.DAILY_GIFT_LAST) || "0", 10);
  const now = Date.now();
  const elapsed = now - lastClaim;
  const cooldownRemaining = Math.max(0, DAILY_GIFT_COOLDOWN_MS - elapsed);
  const canClaim = cooldownRemaining === 0;

  const hours = Math.floor(cooldownRemaining / (1000 * 60 * 60));
  const mins = Math.floor((cooldownRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((cooldownRemaining % (1000 * 60)) / 1000);

  const formattedTime = `${hours}h ${mins}m ${secs}s`;

  return {
    canClaim,
    cooldownRemaining,
    formattedTime,
    lastClaim,
  };
}

export function claimDailyGift() {
  const info = getDailyGiftInfo();
  if (!info.canClaim) return null;

  // Recompensa aleatoria: entre 40 y 100 monedas
  const bonusCoins = Math.floor(Math.random() * 61) + 40; // 40-100 🪙
  addCoins(bonusCoins);

  // Además, un poder al azar de regalo
  const poderes = ["escudos", "lupas", "corazones", "congeladores"];
  const randomPoder = poderes[Math.floor(Math.random() * poderes.length)];
  addPowerup(randomPoder, 1);

  localStorage.setItem(KEYS.DAILY_GIFT_LAST, String(Date.now()));
  emitStorageUpdate();

  return {
    coins: bonusCoins,
    powerup: randomPoder,
  };
}

// ============================================
// OFERTA DE BIENVENIDA (STARTER PACK)
// ============================================
export function isStarterPackClaimed() {
  return localStorage.getItem(KEYS.STARTER_PACK_CLAIMED) === "true";
}

export function claimStarterPack() {
  addCoins(1000);
  addPowerup("escudos", 2);
  addPowerup("lupas", 3);
  localStorage.setItem(KEYS.STARTER_PACK_CLAIMED, "true");
  emitStorageUpdate();
  return true;
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

  // Si tiene un escudo de racha disponible, podemos salvar la racha
  const powerups = getPowerups();
  if (powerups.escudos > 0 && streak > 0) {
    // Racha salvada por escudo
    return { racha: streak, rachaHoy: false, escudoProtegiendo: true };
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

  const high = Math.max(parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10), cardsPlaced);
  localStorage.setItem(KEYS.HIGH_SCORE, String(high));

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
