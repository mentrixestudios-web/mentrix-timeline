import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  Package, 
  Sparkles, 
  Clock, 
  Zap, 
  Coins, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import MentrixMascot from "@/components/game/MentrixMascot";
import CoinDisplay from "@/components/coins/CoinDisplay";
import { getCoins, addCoins, getAdsInfo, watchAdReward } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

export default function TiendaMonedas() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(getCoins());
  const [adsInfo, setAdsInfo] = useState(getAdsInfo());
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setCoins(getCoins());
      setAdsInfo(getAdsInfo());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  // Timer para cooldown de anuncios
  useEffect(() => {
    if (adsInfo.cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setAdsInfo(getAdsInfo());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adsInfo.cooldownRemaining]);

  const formatCooldown = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleWatchAd = () => {
    if (!adsInfo.canWatch) {
      if (adsInfo.adsRemaining === 0) {
        toast.error("Límite diario de anuncios alcanzado (5/5). ¡Vuelve mañana!");
      } else if (adsInfo.cooldownRemaining > 0) {
        toast.info(`Espera ${formatCooldown(adsInfo.cooldownRemaining)} para ver otro anuncio.`);
      }
      return;
    }

    playSfx("tap");
    setWatchingAd(true);
    setAdProgress(0);

    // Simulación de anuncio publicitario interactivo de 3 segundos
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
            toast.success("🎬 ¡Anuncio completado! +30 monedas añadidas a tu cuenta");
          }
          return 100;
        }
        return prev + 35;
      });
    }, 1000);
  };

  const paquetes = [
    {
      id: "pack_100",
      titulo: "Puñado de Monedas",
      monedas: 100,
      badge: "Iniciación",
      precio: "Gratis de bienvenida",
      color: "border-blue-400/40 bg-blue-950/40",
      textColor: "text-blue-300",
      buttonText: "Reclamar",
    },
    {
      id: "pack_500",
      titulo: "Bolsa de Sabio",
      monedas: 500,
      badge: "Más Popular 🔥",
      precio: "Recompensa de Tiempo",
      color: "border-amber-400/50 bg-amber-950/30",
      textColor: "text-amber-300",
      buttonText: "Obtener",
    },
    {
      id: "pack_1500",
      titulo: "Cofre Cronológico",
      monedas: 1500,
      badge: "Mejor Valor 💎",
      precio: "Tesoros de la Historia",
      color: "border-purple-400/50 bg-purple-950/30",
      textColor: "text-purple-300",
      buttonText: "Obtener",
    },
    {
      id: "pack_5000",
      titulo: "Bóveda Temporal",
      monedas: 5000,
      badge: "Épico 👑",
      precio: "Maestro del Tiempo",
      color: "border-emerald-400/50 bg-emerald-950/30",
      textColor: "text-emerald-300",
      buttonText: "Obtener",
    },
  ];

  const handleComprarPaquete = (pack) => {
    playSfx("coin");
    addCoins(pack.monedas);
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#fbbf24", "#e0e7ff", "#a855f7"],
    });
    toast.success(`🪙 ¡${pack.titulo} acreditado! +${pack.monedas.toLocaleString()} monedas.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1228] to-slate-900 px-4 pt-3 pb-8 relative overflow-hidden select-none">
      {/* Luces y ambientación cósmica */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Barra superior de la tienda */}
        <div className="flex items-center justify-between mb-4">
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

          <CoinDisplay amount={coins} size="sm" clickable={false} />
        </div>

        {/* Encabezado con Menti */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5"
        >
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center justify-center gap-2">
            <span>Tienda de Monedas</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-amber-200/60 text-xs mt-1 mb-3">
            Consigue monedas para pistas, segundas oportunidades y desbloqueo de épocas
          </p>

          <div className="flex justify-center">
            <MentrixMascot
              size="sm"
              position="center"
              message="¡Monedas para los viajeros del tiempo! ⏳"
              showBubble={true}
            />
          </div>
        </motion.div>

        {/* ── CARD: Ver Anuncio para Monedas Gratis ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="bg-gradient-to-br from-blue-900/40 via-[#0e1c3d] to-purple-900/30 border border-blue-400/40 rounded-3xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-blue-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-black text-sm">Ver Anuncio</h3>
                <p className="text-amber-300 font-bold text-xs flex items-center gap-1">
                  <span>+30 monedas gratis</span>
                  <Coins className="w-3.5 h-3.5" />
                </p>
              </div>

              <div className="ml-auto flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-white/80 font-bold">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{adsInfo.adsRemaining} restantes</span>
                </div>
                {adsInfo.cooldownRemaining > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{formatCooldown(adsInfo.cooldownRemaining)}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleWatchAd}
              disabled={!adsInfo.canWatch || watchingAd}
              className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
                adsInfo.canWatch && !watchingAd
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 cursor-pointer active:scale-95"
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
              }`}
            >
              {watchingAd ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Cargando Anuncio ({adProgress}%)...</span>
                </>
              ) : adsInfo.canWatch ? (
                <>
                  <Play className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Ver Anuncio Gratis (+30 🪙)</span>
                </>
              ) : adsInfo.cooldownRemaining > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Espera {formatCooldown(adsInfo.cooldownRemaining)}</span>
                </>
              ) : (
                <span>Límite diario alcanzado</span>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── SECCIÓN: Paquetes de Monedas ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 mb-2 px-1">
            <Package className="w-4 h-4 text-amber-400" />
            <h3 className="text-white font-extrabold text-sm tracking-wide">
              Paquetes de Monedas
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {paquetes.map((p) => (
              <div
                key={p.id}
                className={`border rounded-2xl p-3.5 backdrop-blur-md transition-all ${p.color} flex items-center justify-between gap-3 shadow-md hover:scale-[1.01]`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="text-white font-black text-sm">{p.titulo}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className={`text-sm font-black ${p.textColor}`}>
                      +{p.monedas.toLocaleString()} monedas
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleComprarPaquete(p)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {p.buttonText}
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-amber-200/40">
          <p>Las monedas se guardan de forma permanente en tu dispositivo.</p>
        </div>
      </div>
    </div>
  );
}
