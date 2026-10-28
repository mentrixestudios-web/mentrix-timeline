import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  Sparkles, 
  Clock, 
  Zap, 
  Coins, 
  Loader2,
  Gift,
  Shield,
  Search,
  Heart,
  Hourglass,
  Flame,
  CreditCard,
  Settings,
  ShoppingBag,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import MentrixMascot from "@/components/game/MentrixMascot";
import CoinDisplay from "@/components/coins/CoinDisplay";
import { 
  getCoins, 
  addCoins, 
  getAdsInfo, 
  watchAdReward, 
  getPowerups,
  buyPowerupWithCoins,
  getDailyGiftInfo,
  claimDailyGift,
  isStarterPackClaimed,
  claimStarterPack
} from "@/utils/gameStorage";
import { 
  PAQUETES_MONEDAS, 
  PODERES_CATALOGO, 
  procesarCompraMercadoPago 
} from "@/utils/mercadoPago";
import { playSfx } from "@/utils/soundSystem";

// Iconos visuales arcade para cada paquete de monedas
const ICONOS_PAQUETES = {
  pack_200: "🪙",
  pack_650: "💰",
  pack_1800: "💎",
  pack_4500: "👑",
};

export default function TiendaMonedas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Estados de datos
  const [coins, setCoins] = useState(getCoins());
  const [powerups, setPowerups] = useState(getPowerups());
  const [adsInfo, setAdsInfo] = useState(getAdsInfo());
  const [dailyGift, setDailyGift] = useState(getDailyGiftInfo());
  const [starterClaimed, setStarterClaimed] = useState(isStarterPackClaimed());

  // Pestaña activa: "monedas" | "poderes" | "gratis"
  const [tabActiva, setTabActiva] = useState("monedas");

  // Estados de acción
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [buyingPackId, setBuyingPackId] = useState(null);
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);
  const [giftResult, setGiftResult] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [mpTokenInput, setMpTokenInput] = useState(
    localStorage.getItem("mt_mp_access_token") || ""
  );

  // Escuchar sincronización de almacenamiento
  useEffect(() => {
    const handleUpdate = () => {
      setCoins(getCoins());
      setPowerups(getPowerups());
      setAdsInfo(getAdsInfo());
      setDailyGift(getDailyGiftInfo());
      setStarterClaimed(isStarterPackClaimed());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  // Reloj para contadores regresivos
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyGift(getDailyGiftInfo());
      setAdsInfo(getAdsInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Verificación de retorno aprobado de Mercado Pago
  useEffect(() => {
    const status = searchParams.get("status");
    const packId = searchParams.get("pack_id");
    if (status === "approved" && packId) {
      const pack = PAQUETES_MONEDAS.find((p) => p.id === packId);
      if (pack) {
        if (pack.esStarter) {
          claimStarterPack();
        } else {
          addCoins(pack.monedas);
        }
        playSfx("victory");
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        toast.success(`🎉 ¡Pago aprobado! +${pack.monedas.toLocaleString()} monedas.`);
      }
    }
  }, [searchParams]);

  // Manejar reclamo de cofre diario
  const handleClaimDailyGift = () => {
    if (!dailyGift.canClaim) {
      toast.info(`Próximo cofre en: ${dailyGift.formattedTime}`);
      return;
    }
    const reward = claimDailyGift();
    if (reward) {
      setGiftResult(reward);
      setShowGiftAnimation(true);
      playSfx("victory");
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#fbbf24", "#38bdf8", "#ec4899"],
      });
      setTimeout(() => setShowGiftAnimation(false), 4500);
    }
  };

  // Manejar canje de poder con monedas
  const handleBuyPowerup = (item) => {
    if (coins < item.precioMonedas) {
      playSfx("wrong");
      toast.error(`Te faltan ${item.precioMonedas - coins} 🪙`);
      return;
    }

    const ok = buyPowerupWithCoins(item.id, item.precioMonedas);
    if (ok) {
      playSfx("coin");
      toast.success(`+1 ${item.nombre} adquirido!`);
    }
  };

  // Manejar compra con Mercado Pago
  const handleComprarPaquete = async (pack) => {
    setBuyingPackId(pack.id);
    playSfx("tap");

    try {
      const result = await procesarCompraMercadoPago(
        pack,
        (monedas) => {},
        (errorMsg) => toast.error(errorMsg)
      );

      if (result && result.status === "approved") {
        if (pack.esStarter) {
          claimStarterPack();
        } else {
          addCoins(pack.monedas);
        }
        playSfx("victory");
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#fbbf24", "#a855f7", "#10b981"],
        });
        toast.success(`🪙 +${pack.monedas.toLocaleString()} monedas acreditadas!`);
      }
    } catch {
      toast.error("Error al procesar el pago");
    } finally {
      setBuyingPackId(null);
    }
  };

  // Ver Anuncio Recompensado
  const handleWatchAd = () => {
    if (!adsInfo.canWatch) {
      if (adsInfo.adsRemaining === 0) {
        toast.error("Límite diario alcanzado (5/5)");
      } else {
        toast.info("Espera el tiempo de recarga");
      }
      return;
    }

    playSfx("tap");
    setWatchingAd(true);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setWatchingAd(false);
          const ok = watchAdReward();
          if (ok) {
            playSfx("victory");
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#f59e0b", "#fbbf24", "#3b82f6"],
            });
            toast.success("🎬 ¡+30 monedas añadidas!");
          }
          return 100;
        }
        return prev + 35;
      });
    }, 1000);
  };

  const starterPack = PAQUETES_MONEDAS.find((p) => p.esStarter);
  const paquetesRegulares = PAQUETES_MONEDAS.filter((p) => !p.esStarter);

  const guardarMpToken = () => {
    localStorage.setItem("mt_mp_access_token", mpTokenInput.trim());
    toast.success(
      mpTokenInput.trim()
        ? "✅ Modo Producción Mercado Pago activado."
        : "ℹ️ Modo Sandbox (Pruebas) activado."
    );
    setShowConfigModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1228] to-slate-900 px-3 sm:px-6 pt-3 pb-20 relative select-none">
      {/* Resplandor de fondo */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto space-y-3.5">
        
        {/* ── BARRA SUPERIOR ARCADE ── */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSfx("tap");
              navigate(-1);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Volver</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-xs border border-white/10 cursor-pointer"
              title="Configuración de Pasarela"
            >
              <Settings className="w-4 h-4 text-amber-300" />
            </button>
            <CoinDisplay amount={coins} size="sm" clickable={false} />
          </div>
        </div>

        {/* ── BANNER VISUAL COMPACTO CON MENTI ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0f1936] to-slate-900 border border-amber-500/30 p-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                <span>Bóveda Mentrix</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h1>
              <p className="text-[11px] text-amber-200/70 font-semibold">
                Consigue monedas, poderes y regalos diarios
              </p>
            </div>
          </div>

          <div className="w-10 h-10 shrink-0">
            <MentrixMascot size="xs" showBubble={false} position="center" />
          </div>
        </div>

        {/* ── SELECTOR DE PESTAÑAS (TABS ARCADE) ── */}
        <div className="flex p-1 rounded-2xl bg-[#0b1328]/90 border border-white/10 shadow-inner">
          <button
            onClick={() => {
              playSfx("tap");
              setTabActiva("monedas");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === "monedas"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>🪙</span>
            <span>Monedas</span>
          </button>

          <button
            onClick={() => {
              playSfx("tap");
              setTabActiva("poderes");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === "poderes"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>⚡</span>
            <span>Poderes</span>
          </button>

          <button
            onClick={() => {
              playSfx("tap");
              setTabActiva("gratis");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
              tabActiva === "gratis"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>🎁</span>
            <span>Gratis</span>
            {dailyGift.canClaim && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-3 animate-ping" />
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PESTAÑA 1: MONEDAS
        ══════════════════════════════════════════════════════════ */}
        {tabActiva === "monedas" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* VIP STARTER PACK BANNER */}
            {starterPack && !starterClaimed && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/80 to-pink-900/70 border-2 border-purple-400/80 p-3.5 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        80% OFF · ÚNICO
                      </span>
                    </div>
                    <h3 className="text-white font-black text-sm sm:text-base mt-1">
                      Pack Crononauta
                    </h3>
                    <p className="text-amber-200 font-bold text-xs">
                      1.000 🪙 + 🛡️x2 + 🔍x3
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    disabled={buyingPackId === starterPack.id}
                    onClick={() => handleComprarPaquete(starterPack)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-amber-500/30 cursor-pointer"
                  >
                    {buyingPackId === starterPack.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>$990 CLP</span>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* GRID DE PAQUETES DE MONEDAS ARCADE */}
            <div className="grid grid-cols-2 gap-2.5">
              {paquetesRegulares.map((p) => {
                const icono = ICONOS_PAQUETES[p.id] || "🪙";
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-2xl p-3 border flex flex-col justify-between text-center transition-all shadow-md ${
                      p.destacado
                        ? "bg-gradient-to-b from-amber-950/40 via-[#101b38] to-[#0c152e] border-amber-400/70 shadow-amber-500/10 ring-1 ring-amber-400/40"
                        : "bg-[#0b1328]/90 border-white/10 hover:border-amber-400/40"
                    }`}
                  >
                    {/* Badge superior */}
                    <div className="h-5 flex items-center justify-center">
                      {p.bono ? (
                        <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full">
                          {p.bono}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    {/* Icono grande y cantidad */}
                    <div className="my-1.5">
                      <div className="text-3xl filter drop-shadow-md">{icono}</div>
                      <p className="text-base sm:text-lg font-black text-amber-300 tracking-tight mt-1">
                        +{p.monedas.toLocaleString()} 🪙
                      </p>
                      <p className="text-[10px] text-white/60 font-semibold">{p.nombre}</p>
                    </div>

                    {/* Botón de compra directo */}
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      disabled={buyingPackId === p.id}
                      onClick={() => handleComprarPaquete(p)}
                      className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1"
                    >
                      {buyingPackId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>${p.precioCLP.toLocaleString()}</span>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-center text-[10px] text-white/40 pt-1 font-medium">
              🔒 Pagos seguros y directos vía Mercado Pago (Webpay / Tarjetas)
            </p>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            PESTAÑA 2: PODERES Y FACULTADES (CON MONEDAS)
        ══════════════════════════════════════════════════════════ */}
        {tabActiva === "poderes" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* MINI INVENTARIO ACTUAL */}
            <div className="flex items-center justify-around py-2 px-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div>
                <span className="text-sm">🛡️</span>
                <p className="text-[10px] font-black text-blue-300">{powerups.escudos}</p>
                <p className="text-[8px] text-slate-400">Escudos</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-sm">🔍</span>
                <p className="text-[10px] font-black text-amber-300">{powerups.lupas}</p>
                <p className="text-[8px] text-slate-400">Lupas</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-sm">💖</span>
                <p className="text-[10px] font-black text-rose-300">{powerups.corazones}</p>
                <p className="text-[8px] text-slate-400">Vidas</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-sm">⏳</span>
                <p className="text-[10px] font-black text-cyan-300">{powerups.congeladores}</p>
                <p className="text-[8px] text-slate-400">Congelar</p>
              </div>
            </div>

            {/* CATÁLOGO DE PODERES COMPACTO */}
            <div className="grid grid-cols-2 gap-2.5">
              {PODERES_CATALOGO.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-3 bg-[#0b1328]/90 border border-white/10 flex flex-col justify-between shadow-md"
                >
                  <div className="text-center">
                    <span className="text-2xl block">{item.icono}</span>
                    <h4 className="text-white font-black text-xs mt-1">{item.nombre}</h4>
                    <p className="text-[10px] text-amber-200/70 font-medium leading-tight mt-0.5 line-clamp-2">
                      {item.id === "escudos" && "Protege tu racha diaria"}
                      {item.id === "lupas" && "Revela el siglo del evento"}
                      {item.id === "corazones" && "+1 Vida extra en partida"}
                      {item.id === "congeladores" && "Descarta 2 ranuras"}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleBuyPowerup(item)}
                    className="w-full mt-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-amber-300 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>{item.precioMonedas} 🪙</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            PESTAÑA 3: GRATIS (COFRE DIARIO + ANUNCIO)
        ══════════════════════════════════════════════════════════ */}
        {tabActiva === "gratis" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* COFRE DIARIO */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#101b38] to-slate-900 border-2 border-amber-400/50 p-4 text-center shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                🎁
              </div>
              <h3 className="text-white font-black text-base mt-2">Cofre del Día</h3>
              <p className="text-amber-200/80 text-xs font-medium">
                {dailyGift.canClaim
                  ? "¡Listo para reclamar monedas y poderes gratis!"
                  : `Disponible en: ${dailyGift.formattedTime}`}
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleClaimDailyGift}
                disabled={!dailyGift.canClaim}
                className={`w-full mt-3 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all ${
                  dailyGift.canClaim
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 cursor-pointer animate-pulse"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                }`}
              >
                {dailyGift.canClaim ? "Abrir Cofre Gratis 🎁" : `Espera ${dailyGift.formattedTime}`}
              </motion.button>
            </div>

            {/* ANUNCIO RECOMPENSADO */}
            <div className="rounded-2xl bg-[#0b1328]/90 border border-blue-400/30 p-3.5 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-xl shrink-0">
                  🎬
                </div>
                <div>
                  <h4 className="text-white font-black text-xs sm:text-sm">Ver Video</h4>
                  <p className="text-amber-300 font-bold text-xs flex items-center gap-1">
                    <span>+30 Monedas</span>
                    <Coins className="w-3 h-3" />
                  </p>
                  <p className="text-[10px] text-white/50">{adsInfo.adsRemaining} de 5 hoy</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={handleWatchAd}
                disabled={!adsInfo.canWatch || watchingAd}
                className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wide shrink-0 transition-all ${
                  adsInfo.canWatch && !watchingAd
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 cursor-pointer shadow-md"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                }`}
              >
                {watchingAd ? `${adProgress}%` : adsInfo.canWatch ? "Ver (+30 🪙)" : "Agotado"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal de Recompensa del Cofre Diario */}
        <AnimatePresence>
          {showGiftAnimation && giftResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <div className="bg-gradient-to-b from-[#0c1836] to-[#080d1c] border-2 border-amber-400 rounded-3xl p-6 text-center max-w-xs w-full space-y-4 shadow-2xl shadow-amber-500/40">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 mx-auto flex items-center justify-center text-3xl border border-amber-400">
                  🎉
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-200">¡Cofre Abierto!</h3>
                  <p className="text-xs text-white/70 mt-1">Recompensas recibidas:</p>
                </div>
                <div className="space-y-2 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-sm font-black text-amber-300">+{giftResult.coins} Monedas 🪙</p>
                  <p className="text-xs font-bold text-cyan-300">+1 {giftResult.powerup.toUpperCase()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGiftAnimation(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  ¡Genial!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Configuración Mercado Pago */}
        <AnimatePresence>
          {showConfigModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#0b1328] border-2 border-amber-400/50 rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="font-black text-sm text-amber-100">Pasarela de Pagos</h3>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-1 rounded-lg text-white/50 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-white/70">
                  Pega tu <strong>Access Token</strong> de Mercado Pago para cobros reales. Déjalo vacío para <strong>Modo Sandbox</strong> (pruebas gratuitas).
                </p>

                <input
                  type="password"
                  value={mpTokenInput}
                  onChange={(e) => setMpTokenInput(e.target.value)}
                  placeholder="APP_USR-..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarMpToken}
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
