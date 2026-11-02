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
          
          {/* BRANDING: Título arriba, Menti centrado flotando libre, burbuja abajo (Idéntico a Estudio Bíblico) */}
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
              <p className="text-[9px] text-white/35 m-0">
                Aprende y desafía la historia de forma dinámica y divertida
              </p>
            </div>

            {/* Menti flotando libremente en el fondo con resplandor suave */}
            <div className="relative flex flex-col items-center justify-center my-1.5 w-full">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl scale-125 pointer-events-none" />
                <motion.img
                  src="/mentrix-mascot.png"
                  alt="Menti"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_8px_30px_rgba(59,130,246,0.35)]"
                />
              </div>

              {/* Cápsula de diálogo única (Formato idéntico a Estudio Bíblico) */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 relative bg-blue-600/20 backdrop-blur-md rounded-full px-6 py-2 shadow-lg shadow-blue-900/20 border border-blue-400/20 max-w-sm"
              >
                <p className="text-white/95 text-xs sm:text-sm text-center font-medium m-0">
                  {getMentiMessage(nivel, racha)}
                </p>
              </motion.div>
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
                <span className="text-[9px] font-bold text-[#A78BFA] tracking-wider uppercase">
                  ✦ EFEMÉRIDE DEL DÍA
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#a78bfa]/15 text-[#A78BFA] border border-[#a78bfa]/25">
                  {efemeride.categoriaLabel || "Historia"}
                </span>
              </div>

              {/* Contenido de la Efeméride */}
              <div className="p-3.5 pt-2">
                <p className="text-xs lg:text-sm italic text-slate-200 leading-relaxed mb-2.5 line-clamp-2 lg:line-clamp-none font-normal">
                  "{efemeride.resumenCorto}"
                </p>

                <div className="flex justify-between items-center pt-1">
                  <p className="text-[11px] font-bold text-[#A78BFA] truncate m-0 pr-2">
                    {efemeride.anioTexto} · {efemeride.titulo}
                  </p>

                  <div className="flex gap-1.5 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("tap");
                        setShowEfemerideModal(true);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#A78BFA] hover:bg-[#a78bfa]/25 text-[9px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      📖 Leer efeméride →
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleEfemeride}
                      className="p-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/15 text-xs text-slate-300 transition-all cursor-pointer"
                      title="Ver otra efeméride histórica"
                      aria-label="Otra efeméride"
                    >
                      🔀
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            COLUMNA DERECHA EN PC: Botones Principales de Juego
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
              className="w-full bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-indigo-950/80 border border-purple-400/35 hover:border-purple-300/50 hover:shadow-2xl hover:shadow-purple-500/20 active:shadow-lg rounded-2xl py-3 lg:py-4 px-6 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 relative z-10">
                <span className="text-xl lg:text-2xl drop-shadow-lg" style={{ color: "#A78BFA" }}>
                  ⏳
                </span>
                <div className="text-left">
                  <div>Línea de Tiempo Clásica</div>
                  <div className="hidden lg:block text-xs font-normal text-purple-200/70">
                    Ubica eventos cronológicamente, construye tu racha y gana monedas
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 2: Duelo Online 1v1 (Multijugador en Tiempo Real) */}
          <Link to="/modos-online" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-950/80 border border-amber-600/30 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-600/15 active:shadow-lg rounded-2xl py-3 lg:py-4 px-6 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 relative z-10">
                <span className="text-xl lg:text-2xl drop-shadow-lg" style={{ color: "#67e8f9" }}>
                  🌐
                </span>
                <div className="text-left">
                  <div>Duelo Online 1v1</div>
                  <div className="hidden lg:block text-xs font-normal text-blue-200/70">
                    Salas en tiempo real, invita a un amigo por WhatsApp o únete con código
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 3: Duelo Local & Menti IA */}
          <Link to="/duelo-amigos" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-indigo-950/80 via-indigo-900/70 to-slate-950/80 border border-indigo-400/30 hover:border-indigo-300/45 hover:shadow-2xl hover:shadow-indigo-500/15 active:shadow-lg rounded-2xl py-3 lg:py-4 px-6 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 relative z-10">
                <span className="text-xl lg:text-2xl drop-shadow-lg text-amber-400">
                  ⚔️
                </span>
                <div className="text-left">
                  <div>Duelo Local & Menti IA</div>
                  <div className="hidden lg:block text-xs font-normal text-indigo-200/70">
                    Pasa el celular con amigos en el mismo dispositivo o desafía a la IA de Menti
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 4: Desafío Diario & Retos */}
          <Link to="/desafio" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-emerald-950/80 via-emerald-900/70 to-teal-950/80 border border-emerald-400/30 hover:border-emerald-300/45 hover:shadow-2xl hover:shadow-emerald-500/15 active:shadow-lg rounded-2xl py-3 lg:py-4 px-6 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 relative z-10">
                <span className="text-xl lg:text-2xl drop-shadow-lg" style={{ color: "#34d399" }}>
                  📅
                </span>
                <div className="text-left">
                  <div>Desafío Diario & Retos</div>
                  <div className="hidden lg:block text-xs font-normal text-emerald-200/70">
                    Desafío del día con calendario de racha, Contrarreloj 60s y Supervivencia
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* MÓDULO 5: Museo del Tiempo (Tarjeta destacada con marco dorado estilo "Biblia Interactiva") */}
          <Link to="/estadisticas" onClick={() => playSfx("tap")}>
            <motion.div
              whileTap={{ scale: 0.99, y: 1 }}
              whileHover={{ y: -2 }}
              className="w-full bg-gradient-to-br from-blue-900/60 via-blue-950/70 to-blue-950/60 border-2 border-amber-500/50 hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-600/25 rounded-2xl py-4 lg:py-5 px-5 transition-all duration-200"
            >
              <div className="flex items-center gap-5">
                <div className="shrink-0 bg-amber-600/15 p-2.5 rounded-xl border border-amber-500/35">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-lg font-semibold text-white leading-tight">Museo del Tiempo</div>
                  <div className="text-xs text-slate-300 font-normal truncate sm:text-clip">
                    Colecciona y explora los 72 códices y reliquias históricas
                  </div>
                </div>
                <div className="shrink-0">
                  <img
                    src="/icons/icon-192.png"
                    alt="Museo"
                    className="w-12 h-12 lg:w-14 lg:h-14 object-contain rounded-xl drop-shadow-lg border border-amber-400/30"
                  />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* ── PIE DE PÁGINA MOTIVACIONAL (Idéntico a Estudio Bíblico) ── */}
      <div className="w-full text-center mt-6 py-2">
        <p className="text-[11px] sm:text-xs text-slate-400/50 font-medium flex items-center justify-center gap-2 m-0">
          <span>👥</span>
          <span>Aprende · Deduce · Conquista la historia</span>
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
