import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Target, 
  CheckCircle2, 
  Zap, 
  Layers,
  Coins,
  BookOpen,
  Award,
  Sparkles,
  Lock,
  Search,
  X,
  Hourglass,
  Calendar,
  Gift
} from "lucide-react";
import { 
  getStats, 
  getHighScore, 
  getStreak, 
  getCoins,
  getUnlockedCardIds,
  getClaimedAchievementIds,
  claimAchievement
} from "@/utils/gameStorage";
import { LEARNING_CARDS } from "@/data/learningCards";
import { ACHIEVEMENTS } from "@/data/achievements";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";

export default function Estadisticas() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "estadisticas";

  const [tabActiva, setTabActiva] = useState(initialTab); // 'estadisticas' | 'codice' | 'logros'
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);

  const [stats, setStats] = useState(getStats());
  const [highScore, setHighScore] = useState(getHighScore());
  const [streak, setStreak] = useState(getStreak());
  const [coins, setCoins] = useState(getCoins());
  const [unlockedCardIds, setUnlockedCardIds] = useState(getUnlockedCardIds());
  const [claimedAchievements, setClaimedAchievements] = useState(getClaimedAchievementIds());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getStats());
      setHighScore(getHighScore());
      setStreak(getStreak());
      setCoins(getCoins());
      setUnlockedCardIds(getUnlockedCardIds());
      setClaimedAchievements(getClaimedAchievementIds());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  const winRate = stats.partidasJugadas > 0
    ? Math.round((stats.partidasGanadas / stats.partidasJugadas) * 100)
    : 0;

  // Filtrado de cartas del Códice
  const cartasFiltradas = LEARNING_CARDS.filter((c) => {
    if (filtroCategoria === "todas") return true;
    return c.category === filtroCategoria;
  });

  const totalCartas = LEARNING_CARDS.length;
  const desbloqueadasCount = unlockedCardIds.length;
  const porcentajeColeccion = Math.round((desbloqueadasCount / totalCartas) * 100);

  const handleClaimAchievement = (ach) => {
    playSfx("victory");
    claimAchievement(ach.id, ach.recompensaMonedas);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    toast.success(`🎉 ¡Logro reclamado! +${ach.recompensaMonedas} monedas recibidas.`);
  };

  const statCards = [
    {
      title: "Mayor Línea",
      value: `${highScore} cartas`,
      desc: "Récord consecutivo de aciertos",
      icon: Trophy,
      color: "from-amber-500 to-yellow-600",
      textColor: "text-amber-400"
    },
    {
      title: "Racha Activa",
      value: `${streak} días`,
      desc: "Días seguidos cronometrando",
      icon: Flame,
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-400"
    },
    {
      title: "Partidas Ganadas",
      value: `${stats.partidasGanadas} / ${stats.partidasJugadas}`,
      desc: `Efectividad de victoria: ${winRate}%`,
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-400"
    },
    {
      title: "Cartas Colocadas",
      value: `${stats.cartasColocadasTotal}`,
      desc: "Acontecimientos ordenados",
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-400"
    },
  ];

  return (
    <div className="space-y-4 select-none pb-12">
      {/* ── HEADER SUPERIOR ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver</span>
        </Link>

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-400/40">
          CENTRO DE LOGROS 🏛️
        </span>
      </div>

      {/* ── MENTI ASESOR ACTIVO CON BURBUJA DE DIÁLOGO ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage={
            tabActiva === "codice"
              ? `¡Explora tu Códice! Llevas ${desbloqueadasCount} de ${totalCartas} reliquias históricas. Gana partidas para descubrir las lecciones ocultas.`
              : tabActiva === "logros"
              ? "¡Tus hazañas en el tiempo tienen recompensa! Reclama monedas cada vez que cumplas una misión histórica."
              : "Revisa tus récords de crononauta. Tu precisión temporal aumenta con cada partida jugada."
          }
        />
      </div>

      {/* ── SELECTOR DE PESTAÑAS (TABS ARCADE) ── */}
      <div className="flex p-1 rounded-2xl bg-[#0b1328]/90 border border-white/10 shadow-inner">
        <button
          onClick={() => {
            playSfx("tap");
            setTabActiva("estadisticas");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tabActiva === "estadisticas"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Récords</span>
        </button>

        <button
          onClick={() => {
            playSfx("tap");
            setTabActiva("codice");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tabActiva === "codice"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-white/60 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Códice ({desbloqueadasCount}/{totalCartas})</span>
        </button>

        <button
          onClick={() => {
            playSfx("tap");
            setTabActiva("logros");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tabActiva === "logros"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Logros</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PESTAÑA 1: RÉCORDS Y ESTADÍSTICAS
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "estadisticas" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Grid de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#0c1630] to-[#090d1c] border border-amber-500/25 rounded-3xl p-4 flex items-center gap-3.5 shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-slate-950 shrink-0 shadow-md`}>
                    <Icon className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{card.title}</p>
                    <p className="text-xl font-black text-white leading-tight">{card.value}</p>
                    <p className={`text-[11px] font-semibold ${card.textColor}`}>{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tarjeta de Progreso del Códice Histórico */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#101b3b] to-slate-900 border border-amber-500/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Progreso del Códice Histórico</h3>
              </div>
              <span className="text-xs font-black text-amber-300">
                {desbloqueadasCount} / {totalCartas} reliquias
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-500 shadow-sm"
                style={{ width: `${porcentajeColeccion}%` }}
              />
            </div>

            <p className="text-[11px] text-white/60 font-medium">
              Cada victoria desbloquea nuevas cartas con enseñanzas profundas sobre los momentos clave de la historia universal, bíblica, científica y artística.
            </p>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PESTAÑA 2: CÓDICE DE APRENDIZAJE Y RELIQUIAS COLECCIONABLES
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "codice" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3.5"
        >
          {/* Barra de progreso y filtro */}
          <div className="rounded-2xl bg-[#0b1328]/95 border border-white/10 p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <div>
                <p className="text-xs font-black text-white">
                  Museo Cronológico: {desbloqueadasCount} / {totalCartas} Desbloqueadas ({porcentajeColeccion}%)
                </p>
                <p className="text-[10px] text-amber-300 font-semibold">
                  Toca cualquier carta desbloqueada para abrir su códice de aprendizaje
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {[
                { id: "todas", label: "Todas" },
                { id: "historia", label: "🏛️ Historia" },
                { id: "biblia", label: "📜 Biblia" },
                { id: "ciencia", label: "🚀 Ciencia" },
                { id: "musica", label: "🎨 Música" },
                { id: "cine", label: "🎬 Cine" },
                { id: "caos", label: "⏳ Maestras" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    playSfx("tap");
                    setFiltroCategoria(f.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                    filtroCategoria === f.id
                      ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cuadrícula de Cartas Coleccionables */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {cartasFiltradas.map((c) => {
              const isUnlocked = unlockedCardIds.includes(c.id);

              return (
                <motion.div
                  key={c.id}
                  whileTap={isUnlocked ? { scale: 0.96 } : {}}
                  onClick={() => {
                    if (isUnlocked) {
                      playSfx("tap");
                      setCartaSeleccionada(c);
                    } else {
                      playSfx("wrong");
                      toast.info("Gana partidas en esta categoría para desbloquear esta reliquia.");
                    }
                  }}
                  className={`rounded-2xl p-3 border transition-all relative overflow-hidden text-left flex flex-col justify-between ${
                    isUnlocked
                      ? `bg-gradient-to-br ${c.color} ${c.borde} shadow-lg ${c.glow} cursor-pointer hover:scale-[1.02]`
                      : "bg-[#090d1c]/90 border-white/10 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Resplandor superior */}
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none" />
                  )}

                  {/* Cabecera de la minicarta */}
                  <div className="flex items-center justify-between gap-1 mb-2 relative z-10">
                    <span className="text-2xl">{isUnlocked ? c.icono : "🔒"}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isUnlocked ? "bg-black/40 text-amber-300 border-amber-400/30" : "bg-white/5 text-white/30 border-white/10"
                    }`}>
                      {isUnlocked ? c.rarity : "BLOQUEADO"}
                    </span>
                  </div>

                  {/* Título y Época */}
                  <div className="relative z-10 my-1">
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2">
                      {isUnlocked ? c.title : "??? ???"}
                    </h4>
                    <p className="text-[10px] text-amber-200/80 font-bold mt-1">
                      {isUnlocked ? `${c.yearFormatted} · ${c.personajeClave}` : "Desconocido"}
                    </p>
                  </div>

                  {/* Botón de inspeccionar */}
                  <div className="pt-2 border-t border-white/10 mt-2 relative z-10 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white/60">
                      {isUnlocked ? "Tocar para leer 📖" : "Gana partidas ⏳"}
                    </span>
                    {isUnlocked && (
                      <span className="text-amber-300 font-black">+{c.recompensaMonedas} 🪙</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PESTAÑA 3: LOGROS Y MISIONES
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "logros" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {ACHIEVEMENTS.map((ach) => {
            const isClaimed = claimedAchievements.includes(ach.id);
            const isCompleted = ach.check(stats, streak, unlockedCardIds.length);
            const { current, target } = ach.progreso(stats, streak, unlockedCardIds.length);
            const pct = Math.min(Math.round((current / target) * 100), 100);

            return (
              <div
                key={ach.id}
                className={`rounded-2xl p-3.5 border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isClaimed
                    ? "bg-[#0b1328]/80 border-emerald-500/30 opacity-75"
                    : isCompleted
                    ? "bg-gradient-to-r from-amber-950/60 via-[#101f42] to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-500/20"
                    : "bg-[#0a0e1c]/90 border-white/10"
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                    isClaimed
                      ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
                      : isCompleted
                      ? "bg-amber-500/20 border border-amber-400 text-amber-300 animate-pulse"
                      : "bg-white/5 border border-white/10 opacity-50"
                  }`}>
                    {ach.icon}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {ach.title}
                      </h4>
                      {isClaimed && (
                        <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          COMPLETADO ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/60 font-medium">
                      {ach.desc}
                    </p>

                    {/* Barra de progreso */}
                    {!isClaimed && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-amber-300 font-bold">
                          {current}/{target} ({pct}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="w-full sm:w-auto shrink-0 flex justify-end">
                  {isClaimed ? (
                    <span className="text-[11px] font-bold text-white/30 px-3 py-1 rounded-xl bg-white/5">
                      Reclamado
                    </span>
                  ) : isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleClaimAchievement(ach)}
                      className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Reclamar +{ach.recompensaMonedas} 🪙</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-white/40 px-3 py-1 rounded-xl bg-white/5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-white/30" />
                      <span>En Progreso</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL DE INSPECCIÓN DETALLADA DEL CÓDICE DE APRENDIZAJE
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cartaSeleccionada && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-md w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${cartaSeleccionada.color} border-2 ${cartaSeleccionada.borde} shadow-2xl relative space-y-4`}
            >
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={() => setCartaSeleccionada(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Códice */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-3xl shadow-lg shrink-0">
                  {cartaSeleccionada.icono}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      ★ {cartaSeleccionada.rarity}
                    </span>
                    <span className="text-[10px] font-bold text-amber-200">
                      {cartaSeleccionada.yearFormatted}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {cartaSeleccionada.title}
                  </h3>
                  <p className="text-[11px] text-white/70 font-semibold">
                    {cartaSeleccionada.era}
                  </p>
                </div>
              </div>

              {/* Ficha 1: Personaje Clave */}
              <div className="p-3 rounded-2xl bg-black/35 border border-white/10 space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  👤 Personaje o Protagonista Clave
                </span>
                <p className="text-xs font-bold text-white">
                  {cartaSeleccionada.personajeClave}
                </p>
              </div>

              {/* Ficha 2: ¿Sabías Que? (Curiosidad) */}
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 space-y-1">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <span>💡</span>
                  <span>¿Sabías Que? (Curiosidad Histórica)</span>
                </span>
                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  {cartaSeleccionada.sabiasQue}
                </p>
              </div>

              {/* Ficha 3: Lección Pedagógica */}
              <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/30 space-y-1">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <span>🎓</span>
                  <span>Por Qué Transformó a la Humanidad</span>
                </span>
                <p className="text-xs text-blue-100 font-medium leading-relaxed">
                  {cartaSeleccionada.leccionPedagogica}
                </p>
              </div>

              {/* Ficha 4: Cita Célebre */}
              {cartaSeleccionada.citaHistorica && (
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <p className="text-[11px] italic text-amber-200/90 font-serif">
                    {cartaSeleccionada.citaHistorica}
                  </p>
                </div>
              )}

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setCartaSeleccionada(null)}
                className="w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cerrar Códice
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
