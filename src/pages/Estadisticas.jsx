import React, { useState, useEffect, useMemo } from "react";
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
  Gift,
  Crown,
  Landmark,
  Scroll,
  Info,
  ChevronRight,
  Filter
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
import { LEARNING_CARDS, CODICES, RELIQUIAS } from "@/data/learningCards";
import { EVENTS_DB } from "@/data/eventsData";
import { ACHIEVEMENTS } from "@/data/achievements";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";

const CATEGORIAS_CONFIG = [
  { id: "todas", label: "Todas", color: "from-amber-500 to-yellow-600", pill: "bg-white/10 text-white" },
  { id: "historia", label: "Historia", color: "from-amber-600 to-yellow-700", pill: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { id: "biblia", label: "Biblia", color: "from-emerald-600 to-teal-700", pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "ciencia", label: "Ciencia", color: "from-blue-600 to-cyan-700", pill: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { id: "musica", label: "Música", color: "from-purple-600 to-pink-700", pill: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { id: "cine", label: "Cine & Pop", color: "from-rose-600 to-red-700", pill: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
];

export default function Estadisticas() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "galeria";

  // Tabs: 'galeria' | 'codice' | 'reliquias' | 'logros' | 'records'
  const [tabActiva, setTabActiva] = useState(initialTab);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  
  // Modales de detalle
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [hitoSeleccionado, setHitoSeleccionado] = useState(null);

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

  // 1. Filtrado para Galería Enciclopédica de Hitos (157 acontecimientos)
  const hitosFiltrados = useMemo(() => {
    return EVENTS_DB.filter((h) => {
      const matchCat = filtroCategoria === "todas" || h.category === filtroCategoria;
      if (!matchCat) return false;
      if (!busquedaTexto.trim()) return true;
      const q = busquedaTexto.toLowerCase();
      const inTitle = h.title?.toLowerCase().includes(q);
      const inPersonaje = h.personajeClave?.toLowerCase().includes(q);
      const inYear = h.yearFormatted?.toLowerCase().includes(q);
      const inSiglo = h.siglo?.toLowerCase().includes(q);
      const inDesc = h.description?.toLowerCase().includes(q);
      return inTitle || inPersonaje || inYear || inSiglo || inDesc;
    });
  }, [filtroCategoria, busquedaTexto]);

  // 2. Filtrado para Códices (Tier 1: Medio / Accesible)
  const codicesFiltrados = useMemo(() => {
    return CODICES.filter((c) => {
      if (filtroCategoria === "todas") return true;
      return c.category === filtroCategoria;
    });
  }, [filtroCategoria]);

  // 3. Filtrado para Reliquias Legendarias (Tier 2: Alta Dificultad)
  const reliquiasFiltradas = useMemo(() => {
    return RELIQUIAS.filter((r) => {
      if (filtroCategoria === "todas") return true;
      return r.category === filtroCategoria;
    });
  }, [filtroCategoria]);

  const totalCodices = CODICES.length;
  const codicesDesbloqueados = CODICES.filter((c) => unlockedCardIds.includes(c.id)).length;

  const totalReliquias = RELIQUIAS.length;
  const reliquiasDesbloqueadas = RELIQUIAS.filter((r) => unlockedCardIds.includes(r.id)).length;

  const totalColeccionables = LEARNING_CARDS.length;
  const desbloqueadasCount = unlockedCardIds.length;
  const porcentajeColeccion = Math.round((desbloqueadasCount / totalColeccionables) * 100);

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
      desc: "Acontecimientos ordenados en el tiempo",
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-400"
    },
  ];

  return (
    <div className="space-y-4 select-none pb-14">
      {/* ── HEADER SUPERIOR ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
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

          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-purple-500/20 text-purple-300 border-purple-400/40">
            MUSEO & APRENDIZAJE 🏛️
          </span>
        </div>
      </div>

      {/* ── MENTI ASESOR CON BURBUJA DE DIÁLOGO ACTIVA ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage={
            tabActiva === "galeria"
              ? `¡Bienvenido a la Enciclopedia del Museo! Explora los ${EVENTS_DB.length} acontecimientos y personajes históricos documentados en el juego. Toca cualquiera para conocer su historia y curiosidades.`
              : tabActiva === "codice"
              ? `¡Tu Códice de Conocimiento! Llevas ${codicesDesbloqueados} de ${totalCodices} cartas aprendidas. Gana partidas en cualquier modo para desbloquear más lecciones.`
              : tabActiva === "reliquias"
              ? `👑 ¡Sala de Reliquias Legendarias! Son los tesoros de más alto rango (${reliquiasDesbloqueadas}/${totalReliquias}). Desbloquéalas superando Duelos contra Menti, Desafíos Diarios o Rachas de 3 días.`
              : tabActiva === "logros"
              ? "¡Tus hazañas en el tiempo tienen recompensa! Reclama monedas cada vez que cumplas una misión histórica."
              : `Revisa tus récords y precisión cronológica. ¡Tu efectividad de victoria actual es del ${winRate}%!`
          }
        />
      </div>

      {/* ── SELECTOR DE SALAS / TABS DEL MUSEO (5 SALAS) ── */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setTabActiva("galeria");
            playSfx("tap");
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
            tabActiva === "galeria"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/30 scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
          }`}
        >
          <Landmark className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Galería</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTabActiva("codice");
            playSfx("tap");
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
            tabActiva === "codice"
              ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
          }`}
        >
          <Scroll className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Códices</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTabActiva("reliquias");
            playSfx("tap");
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
            tabActiva === "reliquias"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black shadow-lg shadow-purple-500/30 scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
          }`}
        >
          <Crown className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Reliquias</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTabActiva("logros");
            playSfx("tap");
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
            tabActiva === "logros"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/30 scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Logros</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTabActiva("records");
            playSfx("tap");
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
            tabActiva === "records"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black shadow-lg shadow-orange-500/30 scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Récords</span>
        </button>
      </div>

      {/* ── BARRA DE FILTROS POR CATEGORÍA (Visible en Galería, Códice y Reliquias) ── */}
      {(tabActiva === "galeria" || tabActiva === "codice" || tabActiva === "reliquias") && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIAS_CONFIG.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setFiltroCategoria(cat.id);
                playSfx("tap");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                filtroCategoria === cat.id
                  ? "bg-white text-slate-950 border-white shadow-md scale-105"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SALA 1: GALERÍA DE HITOS Y PERSONAJES (ENCICLOPEDIA 157+)
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "galeria" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Buscador en tiempo real */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              placeholder="Buscar hito, personaje histórico, año o siglo..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all shadow-inner"
            />
            {busquedaTexto && (
              <button
                type="button"
                onClick={() => setBusquedaTexto("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contador de Hitos en Archivo */}
          <div className="flex items-center justify-between text-xs text-white/70 px-1 font-semibold">
            <span>
              Mostrando <strong className="text-amber-400">{hitosFiltrados.length}</strong> de{" "}
              {EVENTS_DB.length} hitos documentados
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">
              Toca para inspeccionar
            </span>
          </div>

          {/* Listado / Grid de Hitos de la Enciclopedia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[58vh] overflow-y-auto pr-1">
            {hitosFiltrados.map((hito) => {
              const catConfig = CATEGORIAS_CONFIG.find((c) => c.id === hito.category);

              return (
                <motion.div
                  key={hito.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setHitoSeleccionado(hito);
                    playSfx("tap");
                  }}
                  className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[11px] font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30">
                        {hito.yearFormatted}
                      </span>
                      <span className="text-[9px] font-bold text-white/60">
                        {hito.siglo}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${catConfig?.pill || "bg-white/10 text-white"}`}>
                        {catConfig?.label || hito.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                      {hito.title}
                    </h4>

                    {hito.personajeClave && (
                      <p className="text-[10px] text-white/60 truncate mt-0.5">
                        👤 {hito.personajeClave}
                      </p>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SALA 2: CÓDICES DE APRENDIZAJE (TIER 1 · MEDIO / ACCESIBLE)
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "codice" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Barra de progreso de Códices */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Scroll className="w-4 h-4" />
                <span>Códices de Conocimiento Desbloqueados</span>
              </span>
              <span className="text-amber-400">{codicesDesbloqueados} / {totalCodices}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${(codicesDesbloqueados / totalCodices) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-200/70 font-medium">
              💡 Desbloquea estos códices ganando partidas en modos estándar de Línea de Tiempo.
            </p>
          </div>

          {/* Grid de Cartas Códice */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {codicesFiltrados.map((card) => {
              const unlocked = unlockedCardIds.includes(card.id);

              return (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: unlocked ? 1.02 : 1 }}
                  whileTap={{ scale: unlocked ? 0.98 : 1 }}
                  onClick={() => {
                    if (unlocked) {
                      setCartaSeleccionada(card);
                      playSfx("tap");
                    } else {
                      toast.info(`🔒 Requisito: ${card.desbloqueoRequisito}`);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[145px] ${
                    unlocked
                      ? `bg-gradient-to-br ${card.color} ${card.borde} ${card.glow} shadow-lg`
                      : "bg-slate-900/60 border-white/10 opacity-70"
                  }`}
                >
                  {/* Top info */}
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{unlocked ? card.icono : "🔒"}</span>
                    {unlocked ? (
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/40 text-amber-300 border border-white/10">
                        {card.rarity}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-white/40 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Body info */}
                  <div className="my-1.5">
                    <p className="text-[9px] font-black text-amber-300">
                      {unlocked ? card.yearFormatted : "Época Oculta"}
                    </p>
                    <h4 className="text-xs font-black text-white leading-tight line-clamp-2">
                      {unlocked ? card.title : "Códice Oculto"}
                    </h4>
                  </div>

                  {/* Footer info */}
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px]">
                    <span className="text-white/70 font-semibold truncate">
                      {unlocked ? card.personajeClave : card.dificultadObtencion}
                    </span>
                    {unlocked && (
                      <span className="text-amber-300 font-bold">Ver →</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SALA 3: RELIQUIAS LEGENDARIAS (TIER 2 · ALTA DIFICULTAD)
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "reliquias" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Banner de Prestigio */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-amber-900/30 to-slate-900/40 border border-amber-400/40 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Reliquias Legendarias Desbloqueadas</span>
              </span>
              <span className="text-amber-400">{reliquiasDesbloqueadas} / {totalReliquias}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-purple-400 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${(reliquiasDesbloqueadas / totalReliquias) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-200/80 font-medium">
              👑 Estas piezas míticas tienen información histórica de alto impacto civilizatorio. Se obtienen superando Duelos contra Menti, Desafíos Diarios perfectos o Supervivencia.
            </p>
          </div>

          {/* Grid de Reliquias Legendarias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reliquiasFiltradas.map((relic) => {
              const unlocked = unlockedCardIds.includes(relic.id);

              return (
                <motion.div
                  key={relic.id}
                  whileHover={{ scale: unlocked ? 1.02 : 1 }}
                  whileTap={{ scale: unlocked ? 0.98 : 1 }}
                  onClick={() => {
                    if (unlocked) {
                      setCartaSeleccionada(relic);
                      playSfx("tap");
                    } else {
                      toast.info(`👑 Requisito Mítico: ${relic.desbloqueoRequisito}`);
                    }
                  }}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                    unlocked
                      ? `bg-gradient-to-br ${relic.color} ${relic.borde} ${relic.glow} shadow-xl`
                      : "bg-black/60 border-amber-400/20 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{unlocked ? relic.icono : "🏺"}</span>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            👑 {relic.rarity}
                          </span>
                          {unlocked && (
                            <span className="text-[10px] font-black text-amber-300">
                              {relic.yearFormatted}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white leading-tight mt-0.5">
                          {unlocked ? relic.title : "Reliquia Mítica Bloqueada"}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="my-2 p-2 rounded-xl bg-black/40 border border-white/10">
                    <p className="text-[10px] text-white/80 leading-relaxed">
                      {unlocked
                        ? relic.leccionPedagogica
                        : `Misión de desbloqueo: ${relic.desbloqueoRequisito}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-amber-300/80 font-semibold truncate">
                      {unlocked ? `👤 ${relic.personajeClave}` : "🔒 Bloqueado"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-black border border-amber-400/30">
                      +{relic.recompensaMonedas} 🪙
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SALA 4: LOGROS Y MISIONES HISTÓRICAS
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "logros" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {ACHIEVEMENTS.map((ach) => {
            const isCompleted = ach.checkCompleted({
              highScore,
              stats,
              streak,
              unlockedCardsCount: unlockedCardIds.length,
            });
            const isClaimed = claimedAchievements.includes(ach.id);
            const progress = ach.getProgress({
              highScore,
              stats,
              streak,
              unlockedCardsCount: unlockedCardIds.length,
            });

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isClaimed
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : isCompleted
                    ? "bg-amber-950/30 border-amber-400/50 shadow-md shadow-amber-500/10"
                    : "bg-white/[0.03] border-white/10"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                  {ach.icono}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-white truncate">{ach.titulo}</h4>
                    <span className="text-[9px] font-black text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/20">
                      +{ach.recompensaMonedas} 🪙
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-tight mt-0.5">{ach.descripcion}</p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-white/50">{progress}%</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-[11px] font-black text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reclamado</span>
                    </span>
                  ) : isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleClaimAchievement(ach)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Reclamar</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-white/40 px-2.5 py-1 rounded-xl bg-white/5 flex items-center gap-1">
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
          SALA 5: RÉCORDS Y ESTADÍSTICAS DEL CRONONAUTA
      ══════════════════════════════════════════════════════════ */}
      {tabActiva === "records" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {statCards.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between min-h-[95px] relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60">{st.title}</span>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${st.color} text-white shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${st.textColor}`}>{st.value}</h3>
                    <p className="text-[10px] text-white/40 leading-tight">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de coleccionista */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-white">Progreso Total de Aprendizaje</span>
              <span className="text-amber-400">{desbloqueadasCount} / {totalColeccionables} ({porcentajeColeccion}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${porcentajeColeccion}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/60">
              <span>📜 Códices: {codicesDesbloqueados}/{totalCodices}</span>
              <span>👑 Reliquias: {reliquiasDesbloqueadas}/{totalReliquias}</span>
              <span>🏛️ Hitos en Archivo: {EVENTS_DB.length}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 1: FICHA ENCICLOPÉDICA DEL HITO (GALERÍA)
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {hitoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-400/50 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto"
            >
              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setHitoSeleccionado(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="pr-8">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-[11px] font-black text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40">
                    {hitoSeleccionado.yearFormatted}
                  </span>
                  <span className="text-[10px] font-bold text-white/60">
                    {hitoSeleccionado.siglo}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white">
                    {hitoSeleccionado.category}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white leading-tight">
                  {hitoSeleccionado.title}
                </h3>
              </div>

              {/* Personaje Clave */}
              {hitoSeleccionado.personajeClave && (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-0.5">
                    👤 Protagonista(s) o Figura Clave
                  </span>
                  <p className="text-xs font-bold text-white">
                    {hitoSeleccionado.personajeClave}
                  </p>
                </div>
              )}

              {/* Relato Histórico */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">
                  📖 Crónica y Contexto Histórico
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {hitoSeleccionado.description}
                </p>
              </div>

              {/* Dato Curioso */}
              {hitoSeleccionado.datoCurioso && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 space-y-1">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <span>💡</span>
                    <span>¿Sabías Qué? (Curiosidad del Hito)</span>
                  </span>
                  <p className="text-xs text-amber-100 font-medium leading-relaxed">
                    {hitoSeleccionado.datoCurioso}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setHitoSeleccionado(null)}
                className="w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          MODAL 2: INSPECCIÓN DETALLADA DEL CÓDICE / RELIQUIA
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cartaSeleccionada && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-md w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${cartaSeleccionada.color} border-2 ${cartaSeleccionada.borde} shadow-2xl relative space-y-3.5 max-h-[85vh] overflow-y-auto`}
            >
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={() => setCartaSeleccionada(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3 pr-8">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-3xl shadow-lg shrink-0">
                  {cartaSeleccionada.icono}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      ★ {cartaSeleccionada.rarity}
                    </span>
                    <span className="text-[10px] font-bold text-amber-200">
                      {cartaSeleccionada.yearFormatted}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white/70">
                      {cartaSeleccionada.tier === "reliquia" ? "Reliquia Mítica" : "Códice"}
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

              {/* Personaje Clave */}
              <div className="p-2.5 rounded-2xl bg-black/35 border border-white/10 space-y-0.5">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  👤 Protagonista Clave
                </span>
                <p className="text-xs font-bold text-white">
                  {cartaSeleccionada.personajeClave}
                </p>
              </div>

              {/* Curiosidad */}
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 space-y-1">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <span>💡</span>
                  <span>¿Sabías Que? (Curiosidad Histórica)</span>
                </span>
                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  {cartaSeleccionada.sabiasQue}
                </p>
              </div>

              {/* Lección Pedagógica */}
              <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/30 space-y-1">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <span>🎓</span>
                  <span>Lección y Trascendencia</span>
                </span>
                <p className="text-xs text-blue-100 font-medium leading-relaxed">
                  {cartaSeleccionada.leccionPedagogica}
                </p>
              </div>

              {/* Impacto Civilizatorio (Especial de Reliquias) */}
              {cartaSeleccionada.impactoCivilizatorio && (
                <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-400/30 space-y-1">
                  <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <span>👑</span>
                    <span>Impacto en la Civilización Humana</span>
                  </span>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed">
                    {cartaSeleccionada.impactoCivilizatorio}
                  </p>
                </div>
              )}

              {/* Misterio Histórico (Especial de Reliquias) */}
              {cartaSeleccionada.misterioHistorico && (
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    🔍 Misterio o Enigma Arqueológico
                  </span>
                  <p className="text-[11px] text-white/80 leading-relaxed italic">
                    {cartaSeleccionada.misterioHistorico}
                  </p>
                </div>
              )}

              {/* Cita Célebre */}
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
                Cerrar Dossier
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
