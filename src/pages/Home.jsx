import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight,
  Shuffle,
  BookOpen,
  CheckCircle,
  Flame
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import EfemerideModal from "@/components/home/EfemerideModal";
import { 
  getHighScore, 
  getStreakInfo, 
  getLevelInfo, 
  getUnlockedCardIds 
} from "@/utils/gameStorage";
import { 
  getEphemerisForDate, 
  getRandomEphemeris, 
  isDailyEphemerisReadToday 
} from "@/utils/dailyEphemeris";
import { playSfx } from "@/utils/soundSystem";

export default function Home() {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(getHighScore());
  const [streakData, setStreakData] = useState(getStreakInfo());
  const [levelData, setLevelData] = useState(getLevelInfo());
  const [unlockedCardsCount, setUnlockedCardsCount] = useState(getUnlockedCardIds().length);
  
  // Estado de la efeméride diaria
  const [efemeride, setEfemeride] = useState(() => getEphemerisForDate());
  const [showEfemerideModal, setShowEfemerideModal] = useState(false);
  const [leidaHoy, setLeidaHoy] = useState(() => isDailyEphemerisReadToday());

  useEffect(() => {
    const handleUpdate = () => {
      setHighScore(getHighScore());
      setStreakData(getStreakInfo());
      setLevelData(getLevelInfo());
      setUnlockedCardsCount(getUnlockedCardIds().length);
      setLeidaHoy(isDailyEphemerisReadToday());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  const { racha } = streakData;
  const { nivel } = levelData;

  const getMentiMessage = (lvl, strk) => {
    if (strk >= 30) return "¡30 días seguidos! Eres una leyenda viviente del tiempo 👑";
    if (strk >= 14) return "¡14 días! Maestro de los siglos y milenios 🏆";
    if (strk >= 7) return "¡Una semana de racha! Imparable a través de las eras 🔥🔥";
    if (strk >= 3) return `¡${strk} días seguidos! Tu intuición temporal crece 🔥`;
    if (lvl >= 10) return "Nivel 10 ya. Reconozco a un historiador de élite 🧠";
    if (lvl >= 5) return "¡Nivel 5! Dominas los siglos como un verdadero crack 📜";
    return "¡Bienvenido! Que la sabiduría de los siglos te guíe hoy ⏳";
  };

  const handleShuffleEfemeride = () => {
    playSfx("tap");
    setEfemeride(getRandomEphemeris());
  };

  const handlePlayCategory = (categoria) => {
    navigate(`/config-ronda?categoria=${categoria || "todas"}`);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 select-none pt-0">
      
      {/* ── CONTENEDOR RESPONSIVO: En móvil 1 columna, en PC 2 columnas (Idéntico a Estudio Bíblico) ── */}
      <div className="w-full flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">

        {/* ══════════════════════════════════════════════════════════
            COLUMNA IZQUIERDA EN PC: Menti + Efeméride Histórica del Día
        ══════════════════════════════════════════════════════════ */}
        <div className="w-full flex flex-col items-center gap-3 lg:col-span-5 lg:bg-slate-900/40 lg:border lg:border-white/10 lg:rounded-3xl lg:p-6">
          
          {/* BRANDING: Título arriba, Menti centrado, burbuja abajo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center gap-1 mb-1 px-1 text-center"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-extrabold text-[#e8f0ff] tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Mentrix Línea de Tiempo</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </span>
              <p className="text-[10px] text-white/50 m-0">
                Aprende y desafía la historia de forma dinámica y divertida
              </p>
            </div>

            {/* Menti centrado con burbuja de diálogo */}
            <div className="w-full mt-2">
              <MentrixMascot
                status="idle"
                layout="hero"
                customMessage={getMentiMessage(nivel, racha)}
              />
            </div>
          </motion.div>

          {/* ── EFEMÉRIDE HISTÓRICA DEL DÍA (Idéntica al Versículo del Día) ── */}
          {efemeride && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full rounded-2xl overflow-hidden relative shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1a1040 0%, #0f1a35 100%)",
                border: "1px solid rgba(167, 139, 250, 0.25)"
              }}
            >
              {/* Resplandor decorativo de fondo */}
              <div 
                className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(167, 139, 250, 0.15), transparent)" }}
              />

              {/* Cabecera de la Efeméride */}
              <div className="px-3.5 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-extrabold text-[#A78BFA] tracking-wider flex items-center gap-1">
                    <span>✦ EFEMÉRIDE DEL DÍA</span>
                  </span>
                  {leidaHoy && (
                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                      ✓ Leída
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#A78BFA] border border-[#a78bfa]/25 uppercase truncate max-w-[140px]">
                  {efemeride.fechaTexto}
                </span>
              </div>

              {/* Contenido de la Efeméride */}
              <div className="p-3.5 pt-2">
                <p className="text-xs lg:text-sm italic text-slate-200 leading-relaxed mb-2.5 line-clamp-3 lg:line-clamp-none font-normal">
                  "{efemeride.resumenCorto}"
                </p>

                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-black text-[#A78BFA] truncate m-0">
                      {efemeride.anioTexto} · {efemeride.titulo}
                    </p>
                    <p className="text-[10px] text-slate-400 m-0">
                      {efemeride.categoriaLabel}
                    </p>
                  </div>

                  <div className="flex gap-1.5 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("tap");
                        setShowEfemerideModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#A78BFA] hover:bg-[#a78bfa]/25 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Leer efeméride →</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleEfemeride}
                      className="p-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-xs text-slate-300 transition-all cursor-pointer"
                      title="Ver otra efeméride histórica"
                      aria-label="Otra efeméride"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            COLUMNA DERECHA EN PC: Los 4 Módulos Principales de Juego
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="w-full flex flex-col gap-3 lg:col-span-7 lg:gap-4"
        >
          {/* MÓDULO 1: Línea de Tiempo Clásica */}
          <Link to="/config-ronda?modo=clasico" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-indigo-950/80 border border-purple-400/35 hover:border-purple-300/50 hover:shadow-2xl hover:shadow-purple-500/20 active:shadow-lg rounded-2xl py-3.5 lg:py-4 px-5 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <span className="text-2xl lg:text-3xl drop-shadow-md filter group-hover:scale-110 transition-transform" style={{ color: "#A78BFA" }}>
                    ⏳
                  </span>
                  <div className="text-left">
                    <div className="font-extrabold text-white text-base lg:text-lg tracking-wide flex items-center gap-2">
                      <span>Línea de Tiempo Clásica</span>
                    </div>
                    <div className="text-xs font-normal text-purple-200/70 mt-0.5 line-clamp-1">
                      Ubica eventos cronológicamente, construye tu racha y gana monedas
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-300/70 group-hover:text-purple-200 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 2: Duelo Histórico (Amigos, IA & Online) */}
          <Link to="/duelo-amigos" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-950/80 border border-amber-600/30 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-600/15 active:shadow-lg rounded-2xl py-3.5 lg:py-4 px-5 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <span className="text-2xl lg:text-3xl drop-shadow-md filter group-hover:scale-110 transition-transform">
                    ⚔️
                  </span>
                  <div className="text-left">
                    <div className="font-extrabold text-white text-base lg:text-lg tracking-wide flex items-center gap-2">
                      <span>Duelo Histórico</span>
                    </div>
                    <div className="text-xs font-normal text-blue-200/70 mt-0.5 line-clamp-1">
                      Pasa el celular con amigos, reta a la IA de Menti o crea una sala en línea
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-300/70 group-hover:text-amber-200 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 3: Desafío Diario & Retos */}
          <Link to="/desafio" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-emerald-950/80 via-emerald-900/70 to-teal-950/80 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/20 active:shadow-lg rounded-2xl py-3.5 lg:py-4 px-5 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <span className="text-2xl lg:text-3xl drop-shadow-md filter group-hover:scale-110 transition-transform">
                    📅
                  </span>
                  <div className="text-left">
                    <div className="font-extrabold text-white text-base lg:text-lg tracking-wide flex items-center gap-2">
                      <span>Desafío Diario & Retos</span>
                    </div>
                    <div className="text-xs font-normal text-emerald-200/70 mt-0.5 line-clamp-1">
                      Desafío del día con calendario de racha, Contrarreloj 60s y Supervivencia
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-300/70 group-hover:text-emerald-200 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 4: Museo del Tiempo (Códices y Reliquias) */}
          <Link to="/estadisticas" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-[#1a1040]/80 via-[#151a3d]/70 to-[#0e172e]/80 border border-blue-400/30 hover:border-blue-300/40 hover:shadow-2xl hover:shadow-blue-500/15 active:shadow-lg rounded-2xl py-3.5 lg:py-4 px-5 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <span className="text-2xl lg:text-3xl drop-shadow-md filter group-hover:scale-110 transition-transform">
                    🏛️
                  </span>
                  <div className="text-left">
                    <div className="font-extrabold text-white text-base lg:text-lg tracking-wide flex items-center gap-2">
                      <span>Museo del Tiempo</span>
                    </div>
                    <div className="text-xs font-normal text-blue-200/70 mt-0.5 line-clamp-1">
                      Colecciona y explora los 72 códices y reliquias históricas desbloqueables
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-300/70 group-hover:text-blue-200 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* ── PIE DE PÁGINA MOTIVACIONAL (Idéntico a Estudio Bíblico) ── */}
      <div className="w-full text-center mt-6 py-2">
        <p className="text-[11px] sm:text-xs text-slate-400/60 font-medium flex items-center justify-center gap-2 m-0">
          <span>⏳</span>
          <span>Explora · Deduce · Conquista la historia</span>
          <span>⏳</span>
        </p>
      </div>

      {/* Modal detallado de la Efeméride Histórica */}
      <EfemerideModal
        open={showEfemerideModal}
        onClose={() => setShowEfemerideModal(false)}
        efemeride={efemeride}
        onShuffle={handleShuffleEfemeride}
        onPlayCategory={handlePlayCategory}
      />
    </div>
  );
}
