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
  Globe, 
  Brain,
  Smartphone,
  ChevronRight
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { getHighScore, getStreakInfo, getLevelInfo } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

export default function Home() {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(getHighScore());
  const [streakData, setStreakData] = useState(getStreakInfo());
  const [levelData, setLevelData] = useState(getLevelInfo());

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
    if (strk >= 30) return "¡30 días seguidos! Eres una leyenda viviente del tiempo 👑";
    if (strk >= 14) return "¡14 días! Maestro de los siglos 🏆";
    if (strk >= 7) return "¡Una semana de racha! Imparable 🔥🔥";
    if (strk >= 3) return `¡${strk} días seguidos! Sigue así 🔥`;
    if (lvl >= 10) return "Nivel 10. Ya casi eres un maestro temporal 🧠";
    if (lvl >= 5) return "¡Nivel 5! Dominas los siglos como un crack 📜";
    return "¡Bienvenido, Viajero! Elige una sala y desafía el curso de la historia ⏳";
  };

  return (
    <div className="space-y-4 select-none pb-12">
      
      {/* ── BRANDING CON MENTI FLOTANTE ── */}
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

        <div className="w-full mt-0.5">
          <MentrixMascot
            status="idle"
            layout="hero"
            customMessage={getMentiMessage(nivel, racha)}
          />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          LOS 2 MODOS MÁS FUERTES SIEMPRE A LA VISTA
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-2.5">
        
        {/* MODO 1 PROTAGONISTA: LÍNEA TEMPORAL (AVENTURA CLÁSICA) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            playSfx("tap");
            navigate("/config-ronda?modo=clasico");
          }}
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
                  Aventura completa · Ordena la historia
                </p>
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform shrink-0">
              <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
            </div>
          </div>
        </motion.div>

        {/* MODO 2 DESTACADO: DESAFÍO CRONOLÓGICO DEL DÍA */}
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

      </div>

      {/* ══════════════════════════════════════════════════════════
          LAS 3 GRANDES SALAS DE JUEGO (ESTRUCTURA DE JUEGO ARCADE)
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-3.5 bg-amber-400 rounded-full" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Salas de Juego Mentrix
            </h3>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">
            3 Módulos
          </span>
        </div>

        {/* ── SALA 1: DUELO CON AMIGOS EN UN SOLO DISPOSITIVO ── */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            playSfx("tap");
            navigate("/duelo-amigos");
          }}
          className="cursor-pointer w-full rounded-2xl p-3.5 bg-gradient-to-r from-blue-950/80 via-[#101b3b] to-indigo-950/80 border border-blue-400/40 hover:border-blue-300 shadow-md group transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                📱
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  PASS & PLAY · 1 DISPOSITIVO
                </span>
                <h4 className="text-white font-black text-sm group-hover:text-blue-200 transition-colors mt-0.5">
                  Duelo con Amigos
                </h4>
                <p className="text-blue-200/60 text-[10px] font-medium">
                  2 jugadores cara a cara en el mismo celular
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* ── SALA 2: DUELOS CON MENTI Y JUEGOS INDIVIDUALES ── */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            playSfx("tap");
            navigate("/modos-individuales");
          }}
          className="cursor-pointer w-full rounded-2xl p-3.5 bg-gradient-to-r from-purple-950/80 via-[#171038] to-fuchsia-950/80 border border-purple-400/40 hover:border-purple-300 shadow-md group transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                🤖
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  DESAFÍOS INDIVIDUALES
                </span>
                <h4 className="text-white font-black text-sm group-hover:text-purple-200 transition-colors mt-0.5">
                  Duelos vs Menti & Solitario
                </h4>
                <p className="text-purple-200/60 text-[10px] font-medium">
                  Duelo IA · Contrarreloj 60s · Supervivencia
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* ── SALA 3: DUELOS Y JUEGOS EN LÍNEA (MULTIJUGADOR ONLINE) ── */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            playSfx("tap");
            navigate("/modos-online");
          }}
          className="cursor-pointer w-full rounded-2xl p-3.5 bg-gradient-to-r from-emerald-950/80 via-[#0e213b] to-teal-950/80 border border-emerald-400/40 hover:border-emerald-300 shadow-md group transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                🌐
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  MULTIJUGADOR ONLINE PWA
                </span>
                <h4 className="text-white font-black text-sm group-hover:text-emerald-200 transition-colors mt-0.5">
                  Duelos en Línea 1 vs 1
                </h4>
                <p className="text-emerald-200/60 text-[10px] font-medium">
                  Crea salas y comparte el link por WhatsApp
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

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

    </div>
  );
}
