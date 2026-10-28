import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  Package, 
  Sparkles, 
  Clock, 
  Zap, 
  Coins, 
  CheckCircle2, 
  Loader2,
  Gift,
  Shield,
  Search,
  Heart,
  Hourglass,
  Flame,
  Check,
  CreditCard,
  Settings
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

export default function TiendaMonedas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [coins, setCoins] = useState(getCoins());
  const [powerups, setPowerups] = useState(getPowerups());
  const [adsInfo, setAdsInfo] = useState(getAdsInfo());
  const [dailyGift, setDailyGift] = useState(getDailyGiftInfo());
  const [starterClaimed, setStarterClaimed] = useState(isStarterPackClaimed());

  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [buyingPackId, setBuyingPackId] = useState(null);
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);
  const [giftResult, setGiftResult] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [mpTokenInput, setMpTokenInput] = useState(
    localStorage.getItem("mt_mp_access_token") || ""
  );

  // Escuchar actualizaciones de almacenamiento
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

  // Timer para cuenta regresiva del cofre diario y de anuncios
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyGift(getDailyGiftInfo());
      setAdsInfo(getAdsInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Verificar si viene de retorno de pago exitoso de Mercado Pago
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
        toast.success(`🎉 ¡Pago aprobado en Mercado Pago! Se acreditaron ${pack.monedas.toLocaleString()} monedas.`);
      }
    }
  }, [searchParams]);

  // Manejador del Cofre Diario
  const handleClaimDailyGift = () => {
    if (!dailyGift.canClaim) {
      toast.info(`Próximo cofre disponible en: ${dailyGift.formattedTime}`);
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

  // Manejador de compra de Poderes con Monedas
  const handleBuyPowerup = (item) => {
    if (coins < item.precioMonedas) {
      toast.error(`Necesitas ${item.precioMonedas} monedas. Te faltan ${item.precioMonedas - coins} 🪙.`);
      return;
    }

    const ok = buyPowerupWithCoins(item.id, item.precioMonedas);
    if (ok) {
      playSfx("coin");
      toast.success(`✨ ¡${item.nombre} adquirido! Se añadió a tu inventario.`);
    }
  };

  // Manejador de Compra de Paquetes (Mercado Pago)
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
        toast.success(`🪙 ¡Compra confirmada! +${pack.monedas.toLocaleString()} monedas añadidas a tu cuenta.`);
      }
    } catch {
      toast.error("Ocurrió un error al procesar el pago");
    } finally {
      setBuyingPackId(null);
    }
  };

  // Ver Anuncio Recompensado
  const handleWatchAd = () => {
    if (!adsInfo.canWatch) {
      if (adsInfo.adsRemaining === 0) {
        toast.error("Límite diario alcanzado (5/5). ¡Vuelve mañana!");
      } else {
        toast.info("Espera que termine el tiempo de recarga.");
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
            toast.success("🎬 ¡Anuncio completado! +30 monedas añadidas.");
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
        ? "✅ Credencial de Mercado Pago guardada (Modo Producción activo)."
        : "ℹ️ Modo Sandbox (Simulación de Pruebas) activo."
    );
    setShowConfigModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1228] to-slate-900 px-3 sm:px-6 pt-3 pb-16 relative overflow-hidden select-none">
      {/* Luces y ambientación cósmica */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto space-y-4">
        {/* Barra superior de la tienda */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSfx("tap");
              navigate(-1);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer text-white flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-xs"
              title="Configurar Pasarela Mercado Pago"
            >
              <Settings className="w-4 h-4" />
            </button>
            <CoinDisplay amount={coins} size="sm" clickable={false} />
          </div>
        </div>

        {/* Encabezado con Menti */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center justify-center gap-2">
            <span>Tienda y Facultades</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-amber-200/60 text-xs mt-0.5 mb-2 font-medium">
            Desbloquea poderes, protege tu racha y consigue monedas para dominar la historia
          </p>

          <div className="flex justify-center">
            <MentrixMascot
              size="sm"
              position="center"
              message="¡Monedas y poderes para los viajeros del tiempo! ⏳"
              showBubble={true}
            />
          </div>
        </motion.div>

        {/* ── BARRA DE INVENTARIO ACTUAL ── */}
        <div className="bg-[#0b1328]/90 border border-amber-500/25 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/80">
              🎒 Mi Inventario de Poderes
            </span>
            <span className="text-[10px] text-white/50">Disponibles para tus partidas</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
              <span className="text-base block">🛡️</span>
              <p className="text-[10px] font-black text-blue-300">{powerups.escudos}</p>
              <p className="text-[8px] text-slate-400">Escudos</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
              <span className="text-base block">🔍</span>
              <p className="text-[10px] font-black text-amber-300">{powerups.lupas}</p>
              <p className="text-[8px] text-slate-400">Lupas</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
              <span className="text-base block">💖</span>
              <p className="text-[10px] font-black text-rose-300">{powerups.corazones}</p>
              <p className="text-[8px] text-slate-400">Vidas</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
              <span className="text-base block">⏳</span>
              <p className="text-[10px] font-black text-cyan-300">{powerups.congeladores}</p>
              <p className="text-[8px] text-slate-400">Congelar</p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 1: COFRE DE REGALO DIARIO (GRATIS CADA 24H) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#131f3d] to-yellow-950/40 border-2 border-amber-400/50 p-4 shadow-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 shrink-0">
              🎁
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Gratis cada 24 horas
                </span>
              </div>
              <h3 className="text-white font-black text-sm mt-0.5">Cofre del Tiempo Diario</h3>
              <p className="text-amber-100/70 text-xs">
                {dailyGift.canClaim
                  ? "¡Tu cofre está listo para abrirse! Monedas y poderes al azar."
                  : `Próximo cofre disponible en: ${dailyGift.formattedTime}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimDailyGift}
            disabled={!dailyGift.canClaim}
            className={`w-full mt-3 py-2.5 px-4 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
              dailyGift.canClaim
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 cursor-pointer active:scale-95 animate-pulse"
                : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{dailyGift.canClaim ? "Abrir Cofre Diario Gratis 🎁" : `Disponible en ${dailyGift.formattedTime}`}</span>
          </button>
        </motion.div>

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
                  <h3 className="text-xl font-black text-amber-200">¡Cofre Reclamado!</h3>
                  <p className="text-xs text-white/70 mt-1">Has recibido tus recompensas de hoy:</p>
                </div>
                <div className="space-y-2 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-sm font-black text-amber-300">+{giftResult.coins} Monedas 🪙</p>
                  <p className="text-xs font-bold text-cyan-300">+1 {giftResult.powerup.toUpperCase()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGiftAnimation(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase"
                >
                  ¡Genial, gracias!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECCIÓN 2: OFERTA DE BIENVENIDA (STARTER PACK) ── */}
        {starterPack && !starterClaimed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/80 via-[#16123a] to-blue-950/70 border-2 border-purple-400/60 p-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/50">
                  {starterPack.badge}
                </span>
                <h3 className="text-white font-black text-base mt-1 leading-snug">
                  {starterPack.nombre}
                </h3>
                <p className="text-xs text-purple-200/80 font-medium">
                  1.000 Monedas + 2 Escudos de Racha + 3 Lupas
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg font-black text-amber-300">
                    ${starterPack.precioCLP.toLocaleString()} CLP
                  </span>
                  <span className="text-xs text-white/40 line-through font-bold">
                    $4.990 CLP
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={buyingPackId === starterPack.id}
                onClick={() => handleComprarPaquete(starterPack)}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:from-purple-400 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 shrink-0 cursor-pointer"
              >
                {buyingPackId === starterPack.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Comprar ($990)</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── SECCIÓN 3: TIENDA DE FACULTADES Y PODERES (CON MONEDAS) ── */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Facultades y Poderes
              </h3>
            </div>
            <span className="text-[10px] text-amber-200/60 font-bold">Canjeables con monedas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PODERES_CATALOGO.map((item) => (
              <div
                key={item.id}
                className={`border rounded-2xl p-3 bg-gradient-to-br ${item.color} flex flex-col justify-between shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{item.icono}</span>
                    <span className="text-xs font-black text-amber-300 bg-black/30 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {item.precioMonedas} 🪙
                    </span>
                  </div>
                  <h4 className="text-white font-black text-xs sm:text-sm">{item.nombre}</h4>
                  <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                    {item.descripcion}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyPowerup(item)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-[11px] uppercase tracking-wider transition-colors active:scale-95 cursor-pointer"
                >
                  Adquirir (x1)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN 4: PAQUETES DE MONEDAS (MERCADO PAGO) ── */}
        <div className="space-y-2.5 pt-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Paquetes de Monedas
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Mercado Pago / Webpay</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {paquetesRegulares.map((p) => (
              <div
                key={p.id}
                className={`border rounded-2xl p-3.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-md ${
                  p.destacado
                    ? "bg-gradient-to-br from-amber-950/40 via-[#101b38] to-[#0c152e] border-amber-400/60 shadow-amber-500/10"
                    : "bg-[#0b1328]/80 border-white/10 hover:border-amber-500/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10">
                      {p.badge}
                    </span>
                    {p.bono && (
                      <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                        {p.bono}
                      </span>
                    )}
                  </div>

                  <h4 className="text-white font-black text-sm">{p.nombre}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-base font-black text-amber-300">
                      +{p.monedas.toLocaleString()} monedas
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black text-white/90">
                    ${p.precioCLP.toLocaleString()} CLP
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={buyingPackId === p.id}
                    onClick={() => handleComprarPaquete(p)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    {buyingPackId === p.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Comprar</span>
                    )}
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN 5: VER ANUNCIO GRATIS (+30 MONEDAS) ── */}
        <div className="pt-2">
          <div className="bg-gradient-to-br from-blue-900/30 via-[#0e1c3d] to-purple-900/20 border border-blue-400/30 rounded-3xl p-3.5 shadow-md">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xs sm:text-sm">Ver Anuncio</h4>
                  <p className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
                    <span>+30 monedas gratis</span>
                    <Coins className="w-3 h-3" />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-white/80 font-bold">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{adsInfo.adsRemaining} restantes</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWatchAd}
              disabled={!adsInfo.canWatch || watchingAd}
              className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                adsInfo.canWatch && !watchingAd
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-md cursor-pointer active:scale-95"
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
              }`}
            >
              {watchingAd ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Cargando Anuncio ({adProgress}%)...</span>
                </>
              ) : adsInfo.canWatch ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ver Anuncio Gratis (+30 🪙)</span>
                </>
              ) : (
                <span>Límite diario alcanzado</span>
              )}
            </button>
          </div>
        </div>

        {/* Modal de Configuración de Mercado Pago */}
        <AnimatePresence>
          {showConfigModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#0b1328] border-2 border-amber-400/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="font-black text-sm text-amber-100">Pasarela Mercado Pago</h3>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-1 rounded-lg text-white/50 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-white/70 leading-relaxed">
                  Para activar los cobros reales con Webpay, CuentaRUT y tarjetas, pega tu <strong>Access Token</strong> de Mercado Pago. Si lo dejas vacío, funcionará en <strong>Modo Sandbox</strong> para que puedas probar compras sin gastar dinero real.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-300 uppercase">
                    Mercado Pago Access Token:
                  </label>
                  <input
                    type="password"
                    value={mpTokenInput}
                    onChange={(e) => setMpTokenInput(e.target.value)}
                    placeholder="APP_USR-..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarMpToken}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
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
