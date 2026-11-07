import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Coins, 
  Flame, 
  Play, 
  Sparkles,
  Trophy,
  Crown,
  Shield,
  Zap
} from "lucide-react";
import { getStreakInfo, getCoins } from "@/utils/gameStorage";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx, playBgm } from "@/utils/soundSystem";

export default function DesafioDiario() {
  useEffect(() => {
    playBgm("game");
  }, []);
  const navigate = useNavigate();
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `timeline_daily_done_${todayKey}`;

  const [isCompleted, setIsCompleted] = useState(false);
  const [streakInfo, setStreakInfo] = useState(getStreakInfo());
  const [coins, setCoins] = useState(getCoins());

  useEffect(() => {
    setIsCompleted(localStorage.getItem(storageKey) === "true");
    const handleUpdate = () => {
      setStreakInfo(getStreakInfo());
      setCoins(getCoins());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, [storageKey]);

  const handleStartDaily = () => {
    playSfx("victory");
    navigate("/juego?cat=caos&modo=desafio&cartas=5");
  };

  const fechaFormateada = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4 select-none pb-14">
      {/* ── HEADER SUPERIOR ESTÁNDAR PREMIUM ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={() => playSfx("tap")}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coins}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-orange-500/20 text-orange-300 border-orange-400/40">
            RETO DE 24 HORAS 🔥
          </span>
        </div>
      </div>

      {/* ── MENTI ASESOR CON BURBUJA ACTIVA ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage={
            isCompleted
              ? `¡Felicidades! Ya superaste el Desafío del Día y tu racha de ${streakInfo.racha} días está protegida. ¡Vuelve mañana por un nuevo reto!`
              : "¡Bienvenido al Desafío del Día! Ordena 5 hitos sorpresa mezclados de todas las épocas. Si ganas, desbloqueas una Reliquia Legendaria y proteges tu racha."
          }
        />
      </div>

      {/* ── TARJETA HERO DEL DESAFÍO DIARIO ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#301910] via-[#171430] to-[#0a1024] border-2 border-amber-400/70 p-5 sm:p-6 shadow-[0_12px_35px_rgba(245,158,11,0.2)] space-y-5"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera */}
        <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-sm">
            📅 {fechaFormateada}
          </span>
          <span className="text-[10px] font-black text-orange-300 bg-orange-500/20 border border-orange-400/40 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Racha Actual: {streakInfo.racha} días</span>
          </span>
        </div>

        {/* Medallón Central + Título */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative z-10">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/35 border-2 border-white/30 shrink-0">
            🏆
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {isCompleted ? "¡Desafío Diario Superado!" : "La Línea Maestra del Día"}
            </h2>
            <p className="text-xs text-amber-100/75 font-medium mt-1 leading-relaxed max-w-lg">
              {isCompleted
                ? "Tu precisión histórica quedó registrada hoy. Mañana se abrirán 5 nuevos acontecimientos sorpresa."
                : "Enfrenta 5 cartas sorpresa del mazo Caos Temporal (todas las categorías combinadas) con 3 vidas disponibles."}
            </p>
          </div>
        </div>

        {/* ── 3 CHIPS PREMIUM DE REGLAS Y RECOMPENSAS ── */}
        <div className="grid grid-cols-3 gap-2.5 relative z-10">
          <div className="p-3 rounded-2xl bg-black/40 border border-amber-400/30 text-center space-y-0.5">
            <span className="text-lg">🪙</span>
            <p className="text-xs font-black text-amber-300">+100 Monedas</p>
            <p className="text-[9px] text-white/50 font-semibold">Bono de Victoria</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-purple-400/30 text-center space-y-0.5">
            <span className="text-lg">👑</span>
            <p className="text-xs font-black text-purple-300">1 Reliquia</p>
            <p className="text-[9px] text-white/50 font-semibold">Rango Legendario</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-orange-400/30 text-center space-y-0.5">
            <span className="text-lg">🔥</span>
            <p className="text-xs font-black text-orange-300">+1 Día Racha</p>
            <p className="text-[9px] text-white/50 font-semibold">Escudo Activo</p>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <div className="pt-1 relative z-10">
          {isCompleted ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-sm bg-emerald-950/50 border border-emerald-400/40 py-3.5 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Reto Diario Completado · Puedes practicar de nuevo</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStartDaily}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider border border-white/15 cursor-pointer transition-all"
              >
                🔄 Volver a Jugar por Diversión
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStartDaily}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider py-4 rounded-2xl shadow-xl shadow-amber-500/35 cursor-pointer transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>¡Comenzar Desafío del Día!</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
