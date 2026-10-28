import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Sparkles, 
  Hourglass, 
  Flame, 
  Trophy, 
  Swords, 
  Timer, 
  Skull, 
  ArrowRight, 
  Users,
  Compass,
  Zap,
  ShoppingBag,
  Gift
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { getHighScore, getStreakInfo, getLevelInfo } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

export default function Home() {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(getHighScore());
  const [streakData, setStreakData] = useState(getStreakInfo());
  const [levelData, setLevelData] = useState(getLevelInfo());
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setHighScore(getHighScore());
      setStreakData(getStreakInfo());
      setLevelData(getLevelInfo());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  const { racha } = streakData;
  const { nivel } = levelData;

  const getMentiMessage = (lvl, strk) => {
    if (strk >= 30) return "¡30 días seguidos! Eres una leyenda cósmica 👑";
    if (strk >= 14) return "¡14 días! Maestro de la historia universal 🏆";
    if (strk >= 7) return "¡Una semana de racha! Imparable 🔥🔥";
    if (strk >= 3) return `¡${strk} días seguidos! Sigue así 🔥`;
    if (lvl >= 10) return "Nivel 10. Reconozco a un erudito temporal 🧠";
    if (lvl >= 5) return "¡Nivel 5! Dominas los siglos como un crack 📜";
    return "¡Bienvenido, Viajero! Elige un modo y desafía el tiempo ⏳";
  };

  const handleSelectMode = (modo = "clasico") => {
    playSfx("tap");
    navigate(`/config-ronda?modo=${modo}`);
  };

  return (
    <div className="space-y-3.5 select-none pb-12">
      
      {/* ── BRANDING COMPACTO CON MENTI ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center gap-1 text-center"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
            Mentrix: Línea de Tiempo
          </h1>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Mascota Menti Hero con Diálogo Táctil */}
        <div className="w-full mt-0.5">
          <MentrixMascot
            status="idle"
            layout="hero"
            customMessage={getMentiMessage(nivel, racha)}
          />
        </div>
      </motion.div>

      {/* ── BANNER ARCADE: DESAFÍO CRONOLÓGICO DEL DÍA ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#141b38] to-amber-950/50 border border-amber-400/50 p-3 shadow-lg"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-md shadow-amber-500/25 shrink-0 border border-amber-300/40">
              🏆
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                  RETO DIARIO
                </span>
                <span className="text-[9px] font-black text-amber-300">
                  +50 🪙
                </span>
              </div>
              <h3 className="text-white font-black text-xs sm:text-sm truncate">
                Desafío del Día
              </h3>
              <p className="text-[10px] text-amber-200/70 truncate font-semibold">
                5 eventos sin fallar · Defiende tu racha
              </p>
            </div>
          </div>

          <Link
            to="/desafio"
            onClick={() => playSfx("tap")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
          >
            <span>Jugar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* ── BOTÓN ESTRELLA PRINCIPAL: LÍNEA TEMPORAL (HERO BATTLE CARD) ── */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        onClick={() => handleSelectMode("clasico")}
        className="cursor-pointer w-full rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 bg-gradient-to-r from-[#14264f] via-[#0f1b3b] to-[#19264c] border-2 border-amber-400/80 shadow-[0_8px_30px_rgba(245,158,11,0.25)] group"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/40 shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
              ⏳
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                MODO PRINCIPAL ⭐
              </span>
              <h2 className="text-white font-black text-base sm:text-xl group-hover:text-amber-200 transition-colors mt-0.5">
                Línea Temporal
              </h2>
              <p className="text-amber-200/70 text-xs font-semibold">
                Ordena la historia y conquista los siglos
              </p>
            </div>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform shrink-0">
            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </motion.div>

      {/* ── CUADRÍCULA ARCADE 2x2: MODOS DE BATALLA RÁPIDOS ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-3.5 bg-amber-400 rounded-full" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Modos de Batalla
            </h3>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">
            Elige tu desafío
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          
          {/* MODO 2: DUELO VS IA */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectMode("duelo")}
            className="cursor-pointer rounded-2xl p-3 bg-gradient-to-br from-purple-950/80 via-[#181138] to-[#100d28] border border-purple-400/40 hover:border-purple-300 shadow-md group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                ⚔️
              </div>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                VS IA 🤖
              </span>
            </div>

            <div>
              <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-purple-200 transition-colors">
                Duelo vs Menti
              </h4>
              <p className="text-purple-200/60 text-[10px] font-medium mt-0.5">
                Reta a la IA por turnos
              </p>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-purple-300 text-[10px] font-black uppercase">
              <span>Batalla</span>
              <Play className="w-3 h-3 fill-current" />
            </div>
          </motion.div>

          {/* MODO 3: CONTRARRELOJ (60s) */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectMode("contrarreloj")}
            className="cursor-pointer rounded-2xl p-3 bg-gradient-to-br from-cyan-950/80 via-[#101b38] to-[#0a1429] border border-cyan-400/40 hover:border-cyan-300 shadow-md group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                ⏱️
              </div>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                60 SEGUNDOS
              </span>
            </div>

            <div>
              <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-cyan-200 transition-colors">
                Contrarreloj
              </h4>
              <p className="text-cyan-200/60 text-[10px] font-medium mt-0.5">
                Frenesí contra el reloj
              </p>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-cyan-300 text-[10px] font-black uppercase">
              <span>Frenesí</span>
              <Play className="w-3 h-3 fill-current" />
            </div>
          </motion.div>

          {/* MODO 4: SUPERVIVENCIA (1 VIDA) */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectMode("supervivencia")}
            className="cursor-pointer rounded-2xl p-3 bg-gradient-to-br from-red-950/80 via-[#1c1126] to-[#120a1a] border border-red-400/40 hover:border-red-300 shadow-md group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                💀
              </div>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30">
                1 SOLA VIDA
              </span>
            </div>

            <div>
              <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-red-200 transition-colors">
                Supervivencia
              </h4>
              <p className="text-red-200/60 text-[10px] font-medium mt-0.5">
                Un fallo y se termina
              </p>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-red-300 text-[10px] font-black uppercase">
              <span>Extremo</span>
              <Play className="w-3 h-3 fill-current" />
            </div>
          </motion.div>

          {/* MODO 5: DUELO EN LÍNEA 1v1 (MULTIJUGADOR PWA) */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSfx("tap");
              setShowMultiplayerModal(true);
            }}
            className="cursor-pointer rounded-2xl p-3 bg-gradient-to-br from-blue-950/80 via-[#0f214a] to-[#0c1836] border border-blue-400/40 hover:border-blue-300 shadow-md group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                👥
              </div>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                ONLINE 🌐
              </span>
            </div>

            <div>
              <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-blue-200 transition-colors">
                Duelo en Línea
              </h4>
              <p className="text-blue-200/60 text-[10px] font-medium mt-0.5">
                Salas 1v1 con amigos
              </p>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-blue-300 text-[10px] font-black uppercase">
              <span>Crear Sala</span>
              <Play className="w-3 h-3 fill-current" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── BARRA HORIZONTAL DE RÉCORD Y RACHA ── */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-[#0b1328]/90 border border-amber-500/25 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] text-amber-200/60 uppercase font-black">Mayor Línea</p>
            <p className="text-xs sm:text-sm font-black text-white truncate">{highScore} cartas</p>
          </div>
        </div>

        <div className="bg-[#0b1328]/90 border border-orange-500/25 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] text-orange-200/60 uppercase font-black">Racha Diaria</p>
            <p className="text-xs sm:text-sm font-black text-white truncate">{racha} días</p>
          </div>
        </div>
      </div>

      {/* ── MODAL SALAS MULTIJUGADOR ── */}
      {showMultiplayerModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b1328] border-2 border-blue-400/60 rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl text-white text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 mx-auto flex items-center justify-center text-2xl border border-blue-400/40">
              👥
            </div>
            <h3 className="font-black text-base text-blue-200">Salas de Duelo 1 vs 1</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              En este modelo PWA podrás crear una sala con un solo toque y <strong>compartir el enlace directo por WhatsApp</strong> para que tu rival entre al duelo al instante sin instalar nada.
            </p>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-mono text-amber-300">
              mentrix.cl/duelo?sala=CRONO24
            </div>
            <button
              onClick={() => setShowMultiplayerModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              ¡Entendido, esperando dominio!
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
