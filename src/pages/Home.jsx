import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Sparkles, 
  Flame, 
  Trophy, 
  ArrowRight, 
  ChevronRight,
  Zap,
  Shield,
  BookOpen
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { getHighScore, getStreakInfo, getLevelInfo, getUnlockedCardIds } from "@/utils/gameStorage";
import { LEARNING_CARDS } from "@/data/learningCards";
import { EVENTS_DB } from "@/data/eventsData";
import { playSfx } from "@/utils/soundSystem";

const SALAS_JUEGO = [
  {
    id: "amigos",
    path: "/duelo-amigos",
    emoji: "📱",
    badge: "PASS & PLAY",
    subBadge: "2-4 Jugadores",
    titulo: "Duelo con Amigos",
    descripcion: "Compite cara a cara pasando el mismo dispositivo por turnos.",
    tags: ["1 Dispositivo", "Turnos Local"],
    topBar: "from-blue-400 via-indigo-500 to-cyan-400",
    cardBg: "from-[#0e1c3d] via-[#0b142c] to-[#080e20]",
    borderGlow: "border-blue-400/35 hover:border-blue-400 hover:shadow-[0_8px_28px_rgba(59,130,246,0.25)]",
    iconBox: "bg-blue-500/25 border-blue-400/50 text-blue-200 shadow-blue-500/20",
    badgeStyle: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    btnStyle: "bg-blue-500/15 group-hover:bg-blue-500 text-blue-300 group-hover:text-white border-blue-400/30",
    ctaText: "Sala Local",
  },
  {
    id: "individual",
    path: "/modos-individuales",
    emoji: "🤖",
    badge: "VS IA & SOLO",
    subBadge: "3 Modos",
    titulo: "Duelos vs Menti",
    descripcion: "Enfrenta a la IA de Menti, juega Contrarreloj 60s o Supervivencia.",
    tags: ["Duelo IA", "60s Frenesí", "1 Vida"],
    topBar: "from-purple-400 via-fuchsia-500 to-pink-500",
    cardBg: "from-[#1f113d] via-[#130c29] to-[#0a0718]",
    borderGlow: "border-purple-400/35 hover:border-purple-400 hover:shadow-[0_8px_28px_rgba(168,85,247,0.25)]",
    iconBox: "bg-purple-500/25 border-purple-400/50 text-purple-200 shadow-purple-500/20",
    badgeStyle: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    btnStyle: "bg-purple-500/15 group-hover:bg-purple-500 text-purple-300 group-hover:text-white border-purple-400/30",
    ctaText: "Elegir Reto",
  },
  {
    id: "online",
    path: "/modos-online",
    emoji: "🌐",
    badge: "ONLINE 1 VS 1",
    subBadge: "WhatsApp",
    titulo: "Duelos en Línea",
    descripcion: "Crea una sala privada y comparte el código con amigos a distancia.",
    tags: ["Sala Privada", "Link Directo"],
    topBar: "from-emerald-400 via-teal-500 to-cyan-400",
    cardBg: "from-[#0c292b] via-[#091c22] to-[#061017]",
    borderGlow: "border-emerald-400/35 hover:border-emerald-400 hover:shadow-[0_8px_28px_rgba(16,185,129,0.25)]",
    iconBox: "bg-emerald-500/25 border-emerald-400/50 text-emerald-200 shadow-emerald-500/20",
    badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    btnStyle: "bg-emerald-500/15 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-white border-emerald-400/30",
    ctaText: "Sala Online",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(getHighScore());
  const [streakData, setStreakData] = useState(getStreakInfo());
  const [levelData, setLevelData] = useState(getLevelInfo());
  const [unlockedCardsCount, setUnlockedCardsCount] = useState(getUnlockedCardIds().length);

  useEffect(() => {
    const handleUpdate = () => {
      setHighScore(getHighScore());
      setStreakData(getStreakInfo());
      setLevelData(getLevelInfo());
      setUnlockedCardsCount(getUnlockedCardIds().length);
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  const { racha } = streakData;
  const { nivel } = levelData;
  const porcentajeMuseo = Math.round((unlockedCardsCount / LEARNING_CARDS.length) * 100);

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
          ZONA HERO: LOS 2 MODOS ESTRELLA (DISEÑO TARJETAS ARCADE 3D)
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        
        {/* MODO 1 PROTAGONISTA: LÍNEA TEMPORAL (7 COLUMNAS EN DESKTOP) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -3 }}
          onClick={() => {
            playSfx("tap");
            navigate("/config-ronda?modo=clasico");
          }}
          className="sm:col-span-7 cursor-pointer rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 bg-gradient-to-br from-[#192d5c] via-[#101d3d] to-[#0b1328] border-2 border-amber-400/80 shadow-[0_10px_30px_rgba(245,158,11,0.22)] flex flex-col justify-between group"
        >
          {/* Cinta luminosa superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500" />
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Fila superior: Badges de estado */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm">
              ⭐ MODO ESTRELLA
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                {EVENTS_DB.length} Cartas 🃏
              </span>
              <span className="text-[9px] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                6 Mazos
              </span>
            </div>
          </div>

          {/* Cuerpo central: Medallón 3D + Título */}
          <div className="flex items-center gap-3.5 my-3 relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/40 shrink-0 border-2 border-white/30 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              ⏳
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-black text-lg sm:text-2xl leading-tight group-hover:text-amber-300 transition-colors">
                Línea Temporal
              </h2>
              <p className="text-amber-100/75 text-xs font-semibold mt-0.5 leading-snug">
                Aventura principal · Ubica cada hito en el año correcto
              </p>
            </div>
          </div>

          {/* Barra inferior de acción */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] text-amber-200/80 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Gana Códices y Monedas</span>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Jugar Ahora</span>
            </div>
          </div>
        </motion.div>

        {/* MODO 2 DESTACADO: DESAFÍO DEL DÍA (5 COLUMNAS EN DESKTOP) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -3 }}
          onClick={() => {
            playSfx("tap");
            navigate("/desafio");
          }}
          className="sm:col-span-5 cursor-pointer rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 bg-gradient-to-br from-[#331a12] via-[#1c132b] to-[#0b1328] border-2 border-orange-400/60 hover:border-orange-400 shadow-[0_10px_28px_rgba(249,115,22,0.18)] flex flex-col justify-between group"
        >
          {/* Cinta superior naranja/dorada */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Fila superior */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/25 text-orange-300 border border-orange-400/40">
              🔥 RETO DIARIO
            </span>
            <span className="text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-sm">
              +50 🪙 Premio
            </span>
          </div>

          {/* Cuerpo central */}
          <div className="flex items-center gap-3 my-3 relative z-10">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-orange-500/30 shrink-0 border border-white/30 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-black text-base sm:text-lg leading-tight group-hover:text-orange-200 transition-colors">
                Desafío del Día
              </h3>
              <p className="text-[11px] text-orange-200/75 font-semibold mt-0.5 leading-snug">
                5 eventos sin fallar · Protege tu racha diaria
              </p>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
            <span className="text-[10px] text-orange-300 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Racha: {racha} d</span>
            </span>
            <div className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400 text-orange-200 group-hover:text-slate-950 border border-orange-400/40 font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-all">
              <span>Aceptar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          LAS 3 SALAS DE JUEGO MENTRIX (CUADRÍCULA DE CHIPS 3D)
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-4 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Salas de Juego Mentrix
            </h3>
          </div>
          <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-400/25 px-2.5 py-0.5 rounded-full">
            3 Salas Activas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SALAS_JUEGO.map((sala) => (
            <motion.div
              key={sala.id}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -3 }}
              onClick={() => {
                playSfx("tap");
                navigate(sala.path);
              }}
              className={`cursor-pointer rounded-3xl p-4 relative overflow-hidden transition-all duration-200 bg-gradient-to-br ${sala.cardBg} border ${sala.borderGlow} shadow-lg flex flex-col justify-between group`}
            >
              {/* Cinta luminosa superior */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sala.topBar}`} />

              {/* Cabecera del Chip: Badges */}
              <div className="flex items-center justify-between gap-1.5 mb-2.5">
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${sala.badgeStyle}`}>
                  {sala.badge}
                </span>
                <span className="text-[9px] font-black text-white/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                  {sala.subBadge}
                </span>
              </div>

              {/* Cuerpo: Icono 3D + Título + Descripción */}
              <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 my-1">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-110 transition-transform ${sala.iconBox}`}
                >
                  <span>{sala.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-black text-white leading-tight group-hover:text-amber-200 transition-colors">
                    {sala.titulo}
                  </h4>
                  <p className="text-[11px] text-white/65 font-medium leading-snug mt-1 line-clamp-2">
                    {sala.descripcion}
                  </p>
                </div>
              </div>

              {/* Pills de características */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                {sala.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold text-white/75 bg-black/35 border border-white/10 px-2 py-0.5 rounded-md"
                  >
                    • {tag}
                  </span>
                ))}
              </div>

              {/* Pie de acción del Chip */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 group-hover:text-white/80 transition-colors">
                  Toca para abrir
                </span>
                <div
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${sala.btnStyle}`}
                >
                  <span>{sala.ctaText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PANEL INFERIOR: MUSEO & ESTADO DEL CRONONAUTA (3 CHIPS PREMIUM)
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-4 bg-purple-400 rounded-full shadow-sm shadow-purple-400/50" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Archivo, Museo & Récords
            </h3>
          </div>
          <span className="text-[10px] font-bold text-purple-300">
            Colección Interactiva
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* CHIP 1: MUSEO, GALERÍA Y CÓDICES (6 COLUMNAS) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => {
              playSfx("tap");
              navigate("/estadisticas?tab=galeria");
            }}
            className="sm:col-span-6 cursor-pointer rounded-2xl p-3.5 relative overflow-hidden bg-gradient-to-br from-amber-950/50 via-[#111e42] to-[#0b1328] border border-amber-400/40 hover:border-amber-400 shadow-lg flex flex-col justify-between group transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-300" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform shrink-0">
                  🏛️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      MUSEO & APRENDIZAJE
                    </span>
                    <span className="text-[9px] text-amber-300 font-black bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {EVENTS_DB.length} Hitos
                    </span>
                  </div>
                  <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-amber-200 transition-colors mt-1 truncate">
                    Galería, Códices y Reliquias
                  </h4>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-300 flex items-center justify-center transition-all shrink-0">
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Barra de colección integrada */}
            <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-white/65">Tesoros Desbloqueados</span>
                <span className="text-amber-300 font-black">
                  {unlockedCardsCount} / {LEARNING_CARDS.length} ({porcentajeMuseo}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeMuseo}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* CHIP 2: MAYOR LÍNEA (3 COLUMNAS) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => {
              playSfx("tap");
              navigate("/estadisticas?tab=records");
            }}
            className="sm:col-span-3 cursor-pointer relative overflow-hidden bg-gradient-to-br from-[#131f42] to-[#0b1328] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg group transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />

            <div className="flex items-center justify-between">
              <span className="text-[9px] text-amber-300/80 uppercase font-black tracking-wider">
                Mayor Línea
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            <div className="my-1">
              <p className="text-base sm:text-lg font-black text-white leading-tight">
                {highScore} <span className="text-xs text-amber-300 font-bold">cartas</span>
              </p>
              <p className="text-[9px] text-white/50 font-semibold mt-0.5">
                Récord personal sin fallar
              </p>
            </div>
          </motion.div>

          {/* CHIP 3: RACHA DIARIA (3 COLUMNAS) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => {
              playSfx("tap");
              navigate("/desafio");
            }}
            className="sm:col-span-3 cursor-pointer relative overflow-hidden bg-gradient-to-br from-[#291522] to-[#0b1328] border border-orange-500/30 hover:border-orange-400 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg group transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />

            <div className="flex items-center justify-between">
              <span className="text-[9px] text-orange-300/80 uppercase font-black tracking-wider">
                Racha Activa
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
            </div>

            <div className="my-1">
              <p className="text-base sm:text-lg font-black text-white leading-tight">
                {racha} <span className="text-xs text-orange-300 font-bold">días</span>
              </p>
              <p className="text-[9px] text-white/50 font-semibold mt-0.5">
                Viajero constante 🔥
              </p>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
