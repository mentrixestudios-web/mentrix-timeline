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
  Layers,
  ChevronRight,
  Shield,
  Zap
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
    if (strk >= 30) return "¡Un mes entero! Eres una leyenda viviente del tiempo 👑";
    if (strk >= 14) return "¡14 días! Menti te proclama Gran Cronista Universal 🏆";
    if (strk >= 7) return "¡Una semana! Tu precisión histórica es impecable 🔥🔥";
    if (strk >= 3) return `¡${strk} días seguidos! Menti admira tu constancia 🔥`;
    if (lvl >= 10) return "Nivel 10 ya. Reconozco a un verdadero erudito histórico 🧠";
    if (lvl >= 5) return "¡Nivel 5! Ya dominas la cronología como un maestro 📜";
    return "¡Bienvenido, Viajero! Elige un modo de juego para desafiar la historia ⏳";
  };

  const handleSelectMode = (modo = "clasico") => {
    playSfx("tap");
    navigate(`/config-ronda?modo=${modo}`);
  };

  return (
    <div className="space-y-4 select-none pb-8">
      {/* ── BRANDING & MASCOTA MENTI VIAJERO (ESTILO MENTRIX ESTUDIO BÍBLICO) ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center gap-1 text-center"
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span style={{ fontSize: "17px", fontWeight: 900, color: "#e8f0ff", letterSpacing: "0.02em" }}>
            ✨ Mentrix: Línea de Tiempo
          </span>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", margin: 0, fontWeight: 500 }}>
            El juego de orden cronológico e historia universal
          </p>
        </div>

        {/* Mascota Menti Viajero del Tiempo Centrada con Diálogo */}
        <div className="w-full mt-1">
          <MentrixMascot
            status="idle"
            layout="hero"
            customMessage={getMentiMessage(nivel, racha)}
          />
        </div>
      </motion.div>

      {/* ── CARD DESTACADA: DESAFÍO CRONOLÓGICO DEL DÍA (Estilo Versículo del Día) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl overflow-hidden relative shadow-xl"
        style={{
          background: "linear-gradient(135deg,#181c3d,#0f152d)",
          border: "1px solid rgba(245,158,11,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(245,158,11,0.2),transparent)",
            pointerEvents: "none",
          }}
        />
        <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#F59E0B", letterSpacing: ".12em" }}>
            ✦ DESAFÍO CRONOLÓGICO DEL DÍA
          </span>
          <span
            style={{
              fontSize: "9px",
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(245,158,11,0.15)",
              color: "#FBBF24",
              border: "1px solid rgba(245,158,11,0.3)",
              fontWeight: 800,
            }}
          >
            Hoy {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div style={{ padding: "8px 14px 12px" }}>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3 font-medium">
            "Coloca 5 acontecimientos únicos en su siglo exacto sin cometer fallos. ¡Gana +50 monedas y defiende tu racha!"
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", margin: 0 }}>
              Recompensa: +50 🪙
            </p>
            <Link
              to="/desafio"
              onClick={() => playSfx("tap")}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                background: "linear-gradient(90deg, #F59E0B, #D97706)",
                color: "#0f172a",
                fontSize: "11px",
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
              }}
            >
              <span>Jugar Desafío</span>
              <ArrowRight style={{ width: "13px", height: "13px" }} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── SECCIÓN: MODOS DE JUEGO (MÓDULOS DE ACCIÓN DIDÁCTICA ARCADE) ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
          <h3 className="text-xs sm:text-sm font-black text-amber-100 uppercase tracking-wider">
            Modos de Juego
          </h3>
        </div>

        {/* MÓDULO 1: LÍNEA TEMPORAL (MODO CLÁSICO) - El protagonista */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => handleSelectMode("clasico")}
          className="cursor-pointer w-full rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 bg-gradient-to-br from-[#122347] via-[#0d1833] to-[#151f3d] border-2 border-amber-400/70 shadow-[0_8px_30px_rgba(245,158,11,0.2)] group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                ⏳
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/50">
                    Modo Estrella ⭐
                  </span>
                </div>
                <h4 className="text-white font-black text-base sm:text-lg group-hover:text-amber-200 transition-colors">
                  Línea Temporal
                </h4>
                <p className="text-amber-100/70 text-xs font-medium">
                  Configura tu mazo y ordena los acontecimientos
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            </div>
          </div>
        </motion.div>

        {/* MÓDULO 2: DUELO CONTRA MENTI (VS IA) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => handleSelectMode("duelo")}
          className="cursor-pointer w-full rounded-2xl p-3.5 sm:p-4 relative overflow-hidden transition-all duration-200 bg-gradient-to-br from-purple-950/70 via-[#181138] to-indigo-950/70 border border-purple-400/40 hover:border-purple-300 shadow-lg shadow-purple-950/40 group"
        >
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-md shrink-0 border border-white/15">
                ⚔️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Duelo VS IA 🤖
                  </span>
                </div>
                <h4 className="text-white font-extrabold text-sm sm:text-base group-hover:text-purple-200 transition-colors">
                  Duelo contra Menti
                </h4>
                <p className="text-purple-200/60 text-[11px] font-medium">
                  Compite por turnos contra el Viajero del Tiempo
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </motion.div>

        {/* GRID DE MODOS SECUNDARIOS: Contrarreloj (60s) + Supervivencia (1 Vida) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Módulo 3: Contrarreloj 60s */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => handleSelectMode("contrarreloj")}
            className="cursor-pointer rounded-2xl p-3.5 bg-gradient-to-br from-cyan-950/60 via-[#101b33] to-[#0c152a] border border-cyan-400/35 hover:border-cyan-400 shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl shrink-0">
                ⏱️
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
                  Frenesí 60s
                </span>
                <h4 className="text-white font-extrabold text-xs sm:text-sm mt-0.5 truncate">
                  Contrarreloj
                </h4>
                <p className="text-cyan-100/60 text-[10px] truncate">
                  El reloj no perdona
                </p>
              </div>
            </div>
          </motion.div>

          {/* Módulo 4: Supervivencia (1 Vida) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => handleSelectMode("supervivencia")}
            className="cursor-pointer rounded-2xl p-3.5 bg-gradient-to-br from-red-950/60 via-[#1b1226] to-[#141830] border border-red-400/35 hover:border-red-400 shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-xl shrink-0">
                💀
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300">
                  1 Sola Vida
                </span>
                <h4 className="text-white font-extrabold text-xs sm:text-sm mt-0.5 truncate">
                  Supervivencia
                </h4>
                <p className="text-red-100/60 text-[10px] truncate">
                  Un solo error y pierdes
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* MÓDULO 5: DUELO EN LÍNEA 1 VS 1 (MULTIJUGADOR PWA) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            playSfx("tap");
            setShowMultiplayerModal(true);
          }}
          className="cursor-pointer w-full rounded-2xl p-3.5 bg-gradient-to-r from-blue-950/80 via-[#0f214a] to-indigo-950/80 border border-blue-400/40 hover:border-blue-300 shadow-lg group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xl shrink-0">
                👥
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Multijugador PWA 🌐
                </span>
                <h4 className="text-white font-extrabold text-xs sm:text-sm mt-0.5 group-hover:text-blue-200 transition-colors">
                  Duelo en Línea 1 vs 1
                </h4>
                <p className="text-blue-200/60 text-[10px]">
                  Crea una sala y reta a tus amigos por enlace directo
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-black text-xs group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
              Crear Sala
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RÉCORDS RÁPIDOS ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="bg-[#0b1328]/90 border border-amber-500/25 rounded-2xl p-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-amber-200/60 uppercase font-black tracking-wider">Mayor Línea</p>
            <p className="text-base sm:text-lg font-black text-white truncate">{highScore} cartas</p>
          </div>
        </div>

        <div className="bg-[#0b1328]/90 border border-orange-500/25 rounded-2xl p-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-orange-200/60 uppercase font-black tracking-wider">Racha Activa</p>
            <p className="text-base sm:text-lg font-black text-white truncate">{racha} días</p>
          </div>
        </div>
      </div>

      {/* ── MODAL DE PREPARACIÓN DE SALAS MULTIJUGADOR ── */}
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
