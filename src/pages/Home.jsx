import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Lock, Download } from "lucide-react";
import { usePwaInstall, PwaInstallModal } from "@/components/pwa/InstallPwaBanner";
import { playBgm } from "@/utils/soundSystem";
import EfemerideModal from "@/components/home/EfemerideModal";
import { getStreakInfo, getLevelInfo, getUnlockedCardIds } from "@/utils/gameStorage";
import {
  getEphemerisForDate,
  getRandomEphemeris,
  isDailyEphemerisReadToday,
} from "@/utils/dailyEphemeris";
import { LEARNING_CARDS } from "@/data/learningCards";
import { playSfx } from "@/utils/soundSystem";

// Modos de juego: misma forma que Estudio Bíblico (icono + título centrados, esquinas redondeadas),
// cada juego conserva su propia paleta de color.
const GAME_MODES = [
  {
    to: "/config-ronda?modo=clasico",
    icon: "⏳",
    iconColor: "#A78BFA",
    title: "Línea de Tiempo Clásica",
    desc: "Ubica eventos cronológicamente, construye tu racha y gana monedas",
    className:
      "from-purple-950/80 via-purple-900/70 to-indigo-950/80 border-2 border-amber-400/60 hover:border-amber-300/85 hover:shadow-amber-500/25",
    descClass: "text-purple-200/70",
    glow: "bg-purple-400/15",
  },
  {
    to: "/modos-online",
    icon: "🌐",
    iconColor: "#67e8f9",
    title: "Duelo Online 1v1",
    desc: "Crea una sala, invita por WhatsApp o únete con código en tiempo real",
    className:
      "from-cyan-950/80 via-blue-950/80 to-blue-950/80 border border-amber-500/45 hover:border-amber-300/75 hover:shadow-cyan-500/20",
    descClass: "text-cyan-200/70",
    glow: "bg-cyan-400/15",
    badge: "live",
  },
  {
    to: "/duelo-amigos",
    icon: "⚔️",
    iconColor: "#fbbf24",
    title: "Duelo Local & Menti IA",
    desc: "Pasa el celular con amigos o desafía a la IA de Menti",
    className:
      "from-blue-950/80 via-blue-900/70 to-blue-950/80 border border-amber-500/45 hover:border-amber-300/75 hover:shadow-amber-600/20",
    descClass: "text-blue-200/70",
    glow: "bg-amber-400/10",
  },
  {
    to: "/desafio",
    icon: "📅",
    iconColor: "#34d399",
    title: "Desafío Diario & Retos",
    desc: "Desafío del día, Contrarreloj 60s y Supervivencia",
    className:
      "from-emerald-950/80 via-emerald-900/70 to-teal-950/80 border border-amber-500/45 hover:border-amber-300/75 hover:shadow-emerald-500/20",
    descClass: "text-emerald-200/70",
    glow: "bg-emerald-400/10",
    badge: "+50 🪙",
  },
];

export default function Home() {
  const { isStandalone, isIos, showInstructionsModal, setShowInstructionsModal, triggerInstall } = usePwaInstall();

  useEffect(() => {
    playBgm("/audio/bgm/home.mp3");
  }, []);
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState(getStreakInfo());
  const [levelData, setLevelData] = useState(getLevelInfo());
  const [unlockedIds, setUnlockedIds] = useState(getUnlockedCardIds());

  // Estado de la efeméride diaria
  const [efemeride, setEfemeride] = useState(() => getEphemerisForDate());
  const [showEfemerideModal, setShowEfemerideModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setStreakData(getStreakInfo());
      setLevelData(getLevelInfo());
      setUnlockedIds(getUnlockedCardIds());
      isDailyEphemerisReadToday();
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

  // Vista previa de la galería: primero las desbloqueadas, luego siluetas bloqueadas
  const totalCards = LEARNING_CARDS.length;
  const unlockedCount = unlockedIds.length;
  const museumPct = totalCards ? Math.min((unlockedCount / totalCards) * 100, 100) : 0;
  const previewCards = useMemo(() => {
    const unlocked = LEARNING_CARDS.filter((c) => unlockedIds.includes(c.id));
    const locked = LEARNING_CARDS.filter((c) => !unlockedIds.includes(c.id));
    return [...unlocked, ...locked].slice(0, 8).map((c) => ({
      id: c.id,
      icon: c.icono || c.icon || "📜",
      title: c.title || c.titulo,
      tier: c.tier,
      unlocked: unlockedIds.includes(c.id),
    }));
  }, [unlockedIds]);

  return (
    <div className="w-full flex flex-col items-center gap-2 select-none pt-0">
      <div className="w-full flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* ══════════════ COLUMNA IZQUIERDA: Menti + Efeméride ══════════════ */}
        <div className="w-full flex flex-col items-center gap-3 lg:col-span-5 lg:bg-slate-900/40 lg:border lg:border-white/10 lg:rounded-3xl lg:p-6">
          {/* BRANDING: título, Menti flotando libre (sin caja) y cápsula de diálogo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center gap-1 mb-1 px-1 text-center"
          >
            <span className="text-base font-extrabold tracking-wide flex items-center gap-1.5">
              <span className="text-amber-400 text-sm">✦</span>
              <span className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                Mentrix Línea de Tiempo
              </span>
              <span className="text-amber-400 text-sm">✦</span>
            </span>
            <p className="text-[9px] text-amber-100/40 m-0 tracking-wide">
              Viaja por la historia · Ordena los siglos · Conquista el tiempo
            </p>

            {/* Menti flotando dentro de un anillo de reloj/astrolabio dorado */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 mt-1 flex items-center justify-center">
              <div className="absolute inset-0 -m-6 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-4 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

              {/* Anillo exterior punteado girando lento (engranaje temporal) */}
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-amber-400/45 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
              {/* Anillo interior sólido con marcas de hora */}
              <div className="absolute inset-3 rounded-full border border-amber-300/25 pointer-events-none" />
              {[0, 90, 180, 270].map((deg) => (
                <span
                  key={deg}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-amber-300/80 shadow-[0_0_6px_rgba(252,211,77,0.8)] pointer-events-none"
                  style={{ transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-5.4rem)` }}
                />
              ))}

              <motion.span
                className="absolute -left-2 top-6 text-xl pointer-events-none"
                animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                📜
              </motion.span>
              <motion.span
                className="absolute -right-2 top-10 text-xl pointer-events-none"
                animate={{ y: [0, -10, 0], rotate: [0, -12, 0] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                ⏳
              </motion.span>
              <motion.span
                className="absolute right-4 bottom-3 text-base pointer-events-none"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                ✨
              </motion.span>

              <motion.picture
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-[82%] h-[82%]"
              >
                <source srcSet="/mentrix-mascot.webp" type="image/webp" />
                <img
                  src="/mentrix-mascot.png"
                  alt="Menti, viajero del tiempo"
                  className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)]"
                />
              </motion.picture>
            </div>

            {/* Insignia dorada + cápsula de diálogo */}
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/45 px-3 py-0.5 rounded-full text-[10px] font-black text-amber-300 tracking-wider uppercase">
              <span>⌛</span>
              <span>Menti · Viajero del Tiempo</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-0.5 bg-blue-600/20 backdrop-blur-md rounded-full px-6 py-2.5 shadow-lg shadow-blue-900/20 border border-amber-400/25 max-w-sm"
            >
              <p className="text-white/95 text-xs sm:text-sm text-center font-medium m-0">
                {getMentiMessage(nivel, racha)}
              </p>
            </motion.div>
          </motion.div>

          {/* ── EFEMÉRIDE DEL DÍA (equivalente al Versículo del Día) ── */}
          {efemeride && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full rounded-2xl overflow-hidden relative shadow-lg"
              style={{
                background: "linear-gradient(135deg, #2a1d08 0%, #12183a 55%, #0f1a35 100%)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                boxShadow: "0 0 18px rgba(245,158,11,0.08), inset 0 1px 0 rgba(253,230,138,0.08)",
              }}
            >
              <div
                className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.22), transparent)" }}
              />
              <div className="px-3 pt-2.5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-amber-300 tracking-[0.12em] uppercase">
                  ✦ Efeméride del día
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-400/30">
                  {efemeride.categoriaLabel || "Historia"}
                </span>
              </div>
              <div className="px-3 pt-2 pb-2.5">
                <p className="text-xs lg:text-sm italic text-slate-200 leading-relaxed mb-2 line-clamp-2 lg:line-clamp-none m-0">
                  "{efemeride.resumenCorto}"
                </p>
                <div className="flex justify-between items-center gap-2 mt-2">
                  <p className="text-[11px] font-bold text-amber-300 truncate m-0 min-w-0">
                    {efemeride.anioTexto} · {efemeride.titulo}
                  </p>
                  <div className="flex gap-1.5 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("tap");
                        setShowEfemerideModal(true);
                      }}
                      className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-400/35 text-amber-200 hover:bg-amber-500/20 text-[9px] font-semibold cursor-pointer"
                    >
                      📖 Leer efeméride →
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleEfemeride}
                      className="px-1.5 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/15 text-[11px] cursor-pointer"
                      title="Otra efeméride"
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

        {/* ══════════════ COLUMNA DERECHA: Modos de juego + Galería ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="w-full flex flex-col gap-3 lg:col-span-7 lg:gap-4"
        >
          {/* Divisor ornamental: modos de juego */}
          <div className="hidden lg:flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/40" />
            <span className="text-amber-400/70 text-[8px]">◆</span>
            <span className="text-[9px] font-bold tracking-[0.25em] text-amber-300/80 uppercase">Elige tu época</span>
            <span className="text-amber-400/70 text-[8px]">◆</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>

          {/* Modos de juego */}
          {GAME_MODES.map((m) => (
            <Link key={m.to} to={m.to} onClick={() => playSfx("tap")}>
              <motion.div
                whileTap={{ scale: 0.99, y: 1 }}
                whileHover={{ y: -2 }}
                className={`w-full bg-gradient-to-br ${m.className} border hover:shadow-2xl active:shadow-lg rounded-2xl py-3 lg:py-4 px-6 text-white font-semibold text-base lg:text-lg transition-all duration-200 relative overflow-hidden ring-1 ring-inset ring-amber-200/10`}
              >
                <div className={`absolute -right-6 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none ${m.glow}`} />

                {m.badge === "live" && (
                  <span className="absolute top-2 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-300/40 text-[8px] font-black tracking-wider text-cyan-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    EN VIVO
                  </span>
                )}
                {m.badge && m.badge !== "live" && (
                  <span className="absolute top-2 right-3 z-10 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-300/35 text-[9px] font-black text-emerald-200">
                    {m.badge}
                  </span>
                )}

                <div className="flex items-center justify-center lg:justify-start gap-4 relative z-10">
                  <span
                    className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-lg lg:text-xl bg-black/25 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.15)] shrink-0"
                    style={{ color: m.iconColor }}
                  >
                    {m.icon}
                  </span>
                  <div className="text-left">
                    <div>{m.title}</div>
                    <div className={`hidden lg:block text-xs font-normal ${m.descClass}`}>{m.desc}</div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}

          {/* ── GALERÍA DEL MUSEO: colección, no es un modo de juego ── */}
          <div className="mt-2 flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/40" />
            <span className="text-amber-400/70 text-[8px]">◆</span>
            <span className="text-[9px] font-bold tracking-[0.25em] text-amber-300/80 uppercase">Tu colección</span>
            <span className="text-amber-400/70 text-[8px]">◆</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>

          <div
            className="w-full rounded-2xl p-3.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(120,80,20,0.18) 0%, rgba(15,23,42,0.85) 60%)",
              border: "1px solid rgba(245,158,11,0.35)",
            }}
          >
            <div className="absolute -left-8 -bottom-10 w-28 h-28 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-xl">
                  🏛️
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white leading-tight">Museo del Tiempo</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Códices y reliquias que desbloqueas jugando
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-black text-amber-300 leading-none">
                  {unlockedCount}
                  <span className="text-[10px] font-semibold text-slate-400">/{totalCards}</span>
                </div>
                <div className="text-[8px] uppercase tracking-wider text-slate-500 mt-0.5">cartas</div>
              </div>
            </div>

            <div className="mt-2.5 h-1 rounded-full bg-slate-800 overflow-hidden relative z-10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${museumPct}%`, background: "linear-gradient(90deg,#F59E0B,#FCD34D)" }}
              />
            </div>

            {/* Tira de vistas previas */}
            <div
              className="mt-3 flex gap-2 overflow-x-auto pb-1 relative z-10"
              style={{ scrollbarWidth: "none" }}
            >
              {previewCards.map((c) => (
                <Link
                  key={c.id}
                  to="/estadisticas?tab=galeria"
                  onClick={() => playSfx("tap")}
                  title={c.unlocked ? c.title : "Carta bloqueada"}
                  className={`shrink-0 w-14 h-[74px] rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    c.unlocked
                      ? c.tier === "reliquia"
                        ? "bg-gradient-to-b from-amber-500/25 to-amber-900/20 border-amber-400/50 shadow-md shadow-amber-500/10"
                        : "bg-gradient-to-b from-indigo-500/25 to-indigo-900/20 border-indigo-400/45"
                      : "bg-slate-900/70 border-white/10 opacity-70"
                  }`}
                >
                  {c.unlocked ? (
                    <>
                      <span className="text-xl leading-none">{c.icon}</span>
                      <span className="text-[7px] px-1 text-center text-slate-300 leading-tight line-clamp-2">
                        {c.title}
                      </span>
                    </>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </Link>
              ))}
            </div>

            <Link
              to="/estadisticas?tab=galeria"
              onClick={() => playSfx("tap")}
              className="mt-2 relative z-10 flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/20 text-amber-200 text-xs font-bold transition-all"
            >
              Ver galería completa
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Botón Instalar en móvil si no está instalada */}
            {!isStandalone && (
              <button
                onClick={triggerInstall}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-purple-200 font-semibold text-xs transition-all cursor-pointer mt-3"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>Instalar Línea de Tiempo como App</span>
              </button>
            )}

      {/* ── PIE DE PÁGINA MOTIVACIONAL ── */}
      <div className="w-full text-center mt-4 py-2">
        <p className="text-[11px] sm:text-xs text-slate-400/50 font-medium flex items-center justify-center gap-2 m-0">
          <span className="text-amber-400/70">⏳</span>
          <span>Aprende · Deduce · Conquista la historia</span>
          <span className="text-amber-400/70">⏳</span>
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

      <PwaInstallModal
        open={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        isIos={isIos}
      />
    </div>
  );
}
