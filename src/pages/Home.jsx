import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Globe, 
  BookOpen, 
  Rocket, 
  Music, 
  Film,
  Trophy,
  Flame,
  Hourglass,
  Compass,
  ArrowRight
} from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import MentrixMascot from "@/components/game/MentrixMascot";
import { getHighScore, getStreakInfo, getLevelInfo } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

const ICON_MAP = {
  Sparkles,
  Globe,
  BookOpen,
  Rocket,
  Music,
  Film,
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState("caos");
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
    if (strk >= 30) return "¡Un mes entero! Eres una leyenda viviente del tiempo 👑";
    if (strk >= 14) return "¡14 días! Menti te proclama Gran Cronista Universal 🏆";
    if (strk >= 7) return "¡Una semana! Tu precisión histórica es impecable 🔥🔥";
    if (strk >= 3) return `¡${strk} días seguidos! Menti admira tu constancia 🔥`;
    if (lvl >= 20) return "Nivel 20+... ¿Acaso tienes una máquina del tiempo real? 😏";
    if (lvl >= 10) return "Nivel 10 ya. Reconozco a un verdadero erudito histórico 🧠";
    if (lvl >= 5) return "¡Nivel 5! Ya dominas la cronología como un maestro 📜";
    if (lvl >= 3) return "Vas por excelente camino. Menti te observa con orgullo 👀";
    if (lvl >= 2) return "Nivel 2 — Tu viaje a través de las eras recién comienza 🌱";
    return "¡Bienvenido, Viajero! Que tu memoria histórica no falle hoy ⏳";
  };

  const handleStartGame = (catId = selectedCat) => {
    playSfx("tap");
    navigate(`/juego?cat=${catId}`);
  };

  return (
    <div className="space-y-4 select-none">
      {/* ── BRANDING IDÉNTICO A MENTRIX ESTUDIO BÍBLICO ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center gap-1 px-1 text-center"
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#e8f0ff" }}>
            ✨ Mentrix: Línea de Tiempo
          </span>
          <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Viaja a través de los siglos ordenando la historia
          </p>
        </div>

        {/* Menti Mascota Centrado con burbuja de diálogo */}
        <div className="w-full mt-2">
          <MentrixMascot
            status="idle"
            layout="hero"
            customMessage={getMentiMessage(nivel, racha)}
          />
        </div>
      </motion.div>

      {/* ── CARD: HITO HISTÓRICO DEL DÍA (Estilo Versículo del Día de Mentrix) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl overflow-hidden relative shadow-lg"
        style={{
          background: "linear-gradient(135deg,#16213e,#0e172e)",
          border: "1px solid rgba(245,158,11,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(245,158,11,0.15),transparent)",
            pointerEvents: "none",
          }}
        />
        <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#F59E0B", letterSpacing: ".1em" }}>
            ✦ DESAFÍO CRONOLÓGICO DEL DÍA
          </span>
          <span
            style={{
              fontSize: "9px",
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(245,158,11,0.12)",
              color: "#FBBF24",
              border: "1px solid rgba(245,158,11,0.25)",
              fontWeight: 700,
            }}
          >
            Hoy {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div style={{ padding: "8px 14px 12px" }}>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-2.5 font-medium">
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
                padding: "4px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.35)",
                color: "#FCD34D",
                fontSize: "10px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Jugar Desafío</span>
              <ArrowRight style={{ width: "12px", height: "12px" }} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── CARD PRINCIPAL: Desafío Cronológico (JUGAR AHORA) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#091228] to-[#121c3b] border border-amber-500/35 p-5 sm:p-7 shadow-[0_12px_40px_rgba(11,19,43,0.6)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-3.5">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-black text-amber-300 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-wider">Modo Principal</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            ¿Qué acontecimiento ocurrió primero en la historia?
          </h2>

          <p className="text-xs sm:text-sm text-amber-100/75 leading-relaxed font-medium">
            Viaja a través de los siglos. Ordena invenciones, batallas, eventos bíblicos y momentos cumbre en la línea temporal sin quebrar el curso del tiempo.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleStartGame()}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all border border-amber-300/60 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>JUGAR AHORA</span>
            </button>

            <Link
              to="/tienda"
              onClick={() => playSfx("tap")}
              className="flex items-center justify-center gap-2 bg-[#0e1933] hover:bg-[#132247] border border-amber-500/30 text-amber-200 font-bold px-5 py-3.5 rounded-2xl transition-all shadow-sm text-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tienda de Monedas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Récords Rápidos ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#0b1328]/90 border border-amber-500/25 rounded-2xl p-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-amber-200/60 uppercase font-black tracking-wider">Mayor Línea</p>
            <p className="text-lg font-black text-white truncate">{highScore} cartas</p>
          </div>
        </div>

        <div className="bg-[#0b1328]/90 border border-orange-500/25 rounded-2xl p-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-orange-200/60 uppercase font-black tracking-wider">Racha Activa</p>
            <p className="text-lg font-black text-white truncate">{racha} días</p>
          </div>
        </div>
      </div>

      {/* ── Mazos / Categorías ── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <h3 className="text-sm sm:text-base font-extrabold text-white">Elige tu Mazo Histórico</h3>
          </div>
          <Link
            to="/categorias"
            onClick={() => playSfx("tap")}
            className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = selectedCat === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCat(cat.id);
                  handleStartGame(cat.id);
                }}
                className={`group cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-[#0f1b3d] border-amber-400/60 shadow-lg shadow-amber-500/10"
                    : "bg-[#0b1328]/80 border-white/10 hover:bg-[#0f1a38] hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-white/20`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-amber-100/60 font-medium truncate">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-white/40 transition-all shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
