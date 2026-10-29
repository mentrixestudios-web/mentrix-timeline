import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Layers,
  Coins,
  Award,
  Sparkles,
  Lock,
  Search,
  X,
  Gift,
  Crown,
  Landmark,
  Scroll,
  ChevronRight,
  Check
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
  {
    id: "todas",
    label: "Todas",
    sublabel: "Colección Total",
    emoji: "⏳",
    topBar: "from-amber-400 via-yellow-500 to-amber-600",
    activeBg: "from-amber-500/25 via-[#152347] to-[#0b1328]",
    activeBorder: "border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/25",
    iconBox: "bg-amber-500/25 border-amber-400/50 text-amber-200",
    pill: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    badgeText: "text-amber-300",
  },
  {
    id: "historia",
    label: "Historia",
    sublabel: "Imperios y Eras",
    emoji: "🏛️",
    topBar: "from-blue-400 via-indigo-500 to-blue-600",
    activeBg: "from-blue-500/25 via-[#132247] to-[#0b1328]",
    activeBorder: "border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/25",
    iconBox: "bg-blue-500/25 border-blue-400/50 text-blue-200",
    pill: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    badgeText: "text-blue-300",
  },
  {
    id: "biblia",
    label: "Biblia",
    sublabel: "Textos Sagrados",
    emoji: "📜",
    topBar: "from-emerald-400 via-teal-500 to-emerald-600",
    activeBg: "from-emerald-500/25 via-[#102a38] to-[#0b1328]",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/25",
    iconBox: "bg-emerald-500/25 border-emerald-400/50 text-emerald-200",
    pill: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    badgeText: "text-emerald-300",
  },
  {
    id: "ciencia",
    label: "Ciencia",
    sublabel: "Inventos y Cosmos",
    emoji: "🚀",
    topBar: "from-purple-400 via-fuchsia-500 to-purple-600",
    activeBg: "from-purple-500/25 via-[#221547] to-[#0b1328]",
    activeBorder: "border-purple-400 ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/25",
    iconBox: "bg-purple-500/25 border-purple-400/50 text-purple-200",
    pill: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    badgeText: "text-purple-300",
  },
  {
    id: "musica",
    label: "Música",
    sublabel: "Obras y Leyendas",
    emoji: "🎵",
    topBar: "from-pink-400 via-rose-500 to-pink-600",
    activeBg: "from-pink-500/25 via-[#2d1338] to-[#0b1328]",
    activeBorder: "border-pink-400 ring-2 ring-pink-400/50 shadow-lg shadow-pink-500/25",
    iconBox: "bg-pink-500/25 border-pink-400/50 text-pink-200",
    pill: "bg-pink-500/20 text-pink-300 border-pink-400/40",
    badgeText: "text-pink-300",
  },
  {
    id: "cine",
    label: "Cine & Pop",
    sublabel: "Cultura y Pantalla",
    emoji: "🎬",
    topBar: "from-orange-400 via-amber-500 to-rose-600",
    activeBg: "from-orange-500/25 via-[#2e1c2b] to-[#0b1328]",
    activeBorder: "border-orange-400 ring-2 ring-orange-400/50 shadow-lg shadow-orange-500/25",
    iconBox: "bg-orange-500/25 border-orange-400/50 text-orange-200",
    pill: "bg-orange-500/20 text-orange-300 border-orange-400/40",
    badgeText: "text-orange-300",
  },
  {
    id: "conflictos",
    label: "Batallas",
    sublabel: "Grandes Conflictos",
    emoji: "⚔️",
    topBar: "from-red-400 via-rose-500 to-red-600",
    activeBg: "from-red-500/25 via-[#381119] to-[#0b1328]",
    activeBorder: "border-red-400 ring-2 ring-red-400/50 shadow-lg shadow-red-500/25",
    iconBox: "bg-red-500/25 border-red-400/50 text-red-200",
    pill: "bg-red-500/20 text-red-300 border-red-400/40",
    badgeText: "text-red-300",
  },

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

  // Contador dinámico por categoría según la sala activa
  const getCategoryCount = (catId) => {
    if (tabActiva === "galeria") {
      return catId === "todas"
        ? EVENTS_DB.length
        : EVENTS_DB.filter((e) => e.category === catId).length;
    }
    if (tabActiva === "codice") {
      return catId === "todas"
        ? CODICES.length
        : CODICES.filter((c) => c.category === catId).length;
    }
    if (tabActiva === "reliquias") {
      return catId === "todas"
        ? RELIQUIAS.length
        : RELIQUIAS.filter((r) => r.category === catId).length;
    }
    return 0;
  };

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

  const SALAS_MUSEO = [
    {
      id: "galeria",
      label: "Galería",
      badge: `${EVENTS_DB.length}`,
      emoji: "🏛️",
      activeBg: "from-blue-600 via-indigo-600 to-blue-800",
      activeBorder: "border-blue-300 ring-2 ring-blue-400/50 shadow-blue-500/30",
      topAccent: "from-blue-300 to-cyan-300",
    },
    {
      id: "codice",
      label: "Códices",
      badge: `${codicesDesbloqueados}/${totalCodices}`,
      emoji: "📜",
      activeBg: "from-amber-500 via-yellow-500 to-amber-600",
      activeBorder: "border-amber-200 ring-2 ring-amber-400/60 shadow-amber-500/30",
      topAccent: "from-yellow-200 to-amber-300",
      darkText: true,
    },
    {
      id: "reliquias",
      label: "Reliquias",
      badge: `${reliquiasDesbloqueadas}/${totalReliquias}`,
      emoji: "👑",
      activeBg: "from-purple-600 via-fuchsia-600 to-pink-600",
      activeBorder: "border-pink-300 ring-2 ring-purple-400/50 shadow-purple-500/30",
      topAccent: "from-pink-300 to-amber-300",
    },
    {
      id: "logros",
      label: "Logros",
      badge: `${claimedAchievements.length}/${ACHIEVEMENTS.length}`,
      emoji: "🎖️",
      activeBg: "from-emerald-600 via-teal-600 to-emerald-800",
      activeBorder: "border-emerald-300 ring-2 ring-emerald-400/50 shadow-emerald-500/30",
      topAccent: "from-emerald-300 to-teal-200",
    },
    {
      id: "records",
      label: "Récords",
      badge: `${winRate}%`,
      emoji: "🏆",
      activeBg: "from-orange-500 via-amber-600 to-red-600",
      activeBorder: "border-amber-300 ring-2 ring-orange-400/50 shadow-orange-500/30",
      topAccent: "from-amber-300 to-orange-300",
    },
  ];

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
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coins}</span>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-sm">
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

      {/* ── SELECTOR PREMIUM DE SALAS DEL MUSEO (5 MÓDULOS ARCADE) ── */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[#070c1a]/90 border border-amber-500/20 shadow-xl backdrop-blur-md">
        {SALAS_MUSEO.map((sala) => {
          const isActive = tabActiva === sala.id;
          return (
            <motion.button
              key={sala.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTabActiva(sala.id);
                playSfx("tap");
              }}
              className={`relative overflow-hidden flex flex-col items-center justify-between py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? `bg-gradient-to-b ${sala.activeBg} ${sala.activeBorder} shadow-lg scale-[1.02]`
                  : "bg-[#0d162e]/80 border-white/10 text-white/60 hover:text-white hover:border-white/25 hover:bg-[#132042]"
              }`}
            >
              {/* Barra luminosa superior */}
              {isActive && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sala.topAccent}`} />
              )}

              {/* Icono 3D en medallón */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-sm sm:text-base shadow-inner mb-1 transition-transform ${
                  isActive
                    ? "bg-black/30 border border-white/30 scale-105"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <span>{sala.emoji}</span>
              </div>

              {/* Nombre de Sala */}
              <span
                className={`text-[10px] sm:text-[11px] font-black leading-tight tracking-tight ${
                  isActive
                    ? sala.darkText
                      ? "text-slate-950"
                      : "text-white"
                    : "text-white/75"
                }`}
              >
                {sala.label}
              </span>

              {/* Contador / Badge inferior */}
              <span
                className={`mt-1 text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                  isActive
                    ? sala.darkText
                      ? "bg-slate-950/80 text-amber-300 border-slate-950"
                      : "bg-black/40 text-amber-300 border-white/20"
                    : "bg-black/30 text-white/45 border-white/5"
                }`}
              >
                {sala.badge}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── CHIPS PREMIUM DE CATEGORÍAS (ESTILO MAZOS DE JUEGO DE ALTA GAMA) ── */}
      {(tabActiva === "galeria" || tabActiva === "codice" || tabActiva === "reliquias") && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-3.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/90">
                Filtrar por Mazo Histórico
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-300/90">
              {CATEGORIAS_CONFIG.find((c) => c.id === filtroCategoria)?.sublabel}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIAS_CONFIG.map((cat) => {
              const isSelected = filtroCategoria === cat.id;
              const count = getCategoryCount(cat.id);

              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFiltroCategoria(cat.id);
                    playSfx("tap");
                  }}
                  className={`relative overflow-hidden rounded-2xl p-2 sm:p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${cat.activeBg} ${cat.activeBorder}`
                      : "bg-[#0b1328]/90 border-white/10 hover:border-amber-400/40 hover:bg-[#101c38]"
                  }`}
                >
                  {/* Cinta superior de color del mazo */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.topBar}`} />

                  {/* Fila superior: Icono 3D + Contador de cartas */}
                  <div className="flex items-center justify-between gap-1 w-full mt-0.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center text-sm sm:text-base shadow-md transition-transform ${
                        cat.iconBox
                      } ${isSelected ? "scale-110" : "opacity-85"}`}
                    >
                      <span>{cat.emoji}</span>
                    </div>

                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                          : "bg-white/5 text-white/60 border-white/10"
                      }`}
                    >
                      {count} 🃏
                    </span>
                  </div>

                  {/* Fila inferior: Nombre y estado */}
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p
                        className={`text-[11px] sm:text-xs font-black truncate leading-tight ${
                          isSelected ? "text-white" : "text-white/80"
                        }`}
                      >
                        {cat.label}
                      </p>
                      <p className="text-[8px] text-white/45 font-semibold truncate">
                        {cat.sublabel}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
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
          {/* Buscador en tiempo real estilo cápsula futurista */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              placeholder="Buscar hito, personaje histórico, año o siglo..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#0b1328]/90 border border-amber-500/25 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
            />
            {busquedaTexto && (
              <button
                type="button"
                onClick={() => setBusquedaTexto("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Contador de Hitos en Archivo */}
          <div className="flex items-center justify-between text-xs text-white/75 px-1 font-semibold">
            <span>
              Mostrando <strong className="text-amber-400 font-black">{hitosFiltrados.length}</strong> de{" "}
              {EVENTS_DB.length} hitos documentados
            </span>
            <span className="text-[9px] font-black text-amber-300/80 uppercase tracking-wider bg-amber-500/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              ✨ Toca para inspeccionar
            </span>
          </div>

          {/* Listado / Grid de Hitos de la Enciclopedia con estética de Cartas Premium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[58vh] overflow-y-auto pr-1">
            {hitosFiltrados.map((hito) => {
              const catConfig = CATEGORIAS_CONFIG.find((c) => c.id === hito.category) || CATEGORIAS_CONFIG[0];

              return (
                <motion.div
                  key={hito.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setHitoSeleccionado(hito);
                    playSfx("tap");
                  }}
                  className="relative overflow-hidden p-3 rounded-2xl bg-gradient-to-br from-[#0e1834] via-[#0b1328] to-[#080d1d] hover:from-[#132247] hover:to-[#0c152e] border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-lg"
                >
                  {/* Cinta superior con el color de su categoría */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${catConfig.topBar}`} />

                  {/* Medallón izquierdo 3D de Categoría */}
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl shrink-0 shadow-md group-hover:scale-110 transition-transform ${catConfig.iconBox}`}
                  >
                    <span>{catConfig.emoji}</span>
                  </div>

                  {/* Información central del Hito */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-black text-slate-950 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm">
                        {hito.yearFormatted}
                      </span>
                      <span className="text-[9px] font-bold text-white/60 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                        {hito.siglo}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${catConfig.pill}`}>
                        {catConfig.label}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-[13px] font-black text-white truncate group-hover:text-amber-300 transition-colors">
                      {hito.title}
                    </h4>

                    {hito.personajeClave && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-amber-200/80 font-semibold truncate bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                          👤 {hito.personajeClave}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón derecho de Inspección */}
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-300 transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
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
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0e1834] to-slate-900 border border-amber-400/40 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Scroll className="w-4 h-4 text-amber-400" />
                <span>Códices de Conocimiento Desbloqueados</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {codicesDesbloqueados} / {totalCodices}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${(codicesDesbloqueados / totalCodices) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-200/80 font-medium">
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
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[150px] ${
                    unlocked
                      ? `bg-gradient-to-br ${card.color} ${card.borde} ${card.glow} shadow-lg`
                      : "bg-[#0b1328]/80 border-white/10 opacity-75 hover:border-amber-400/30"
                  }`}
                >
                  {/* Top info */}
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-black/35 border border-white/15 flex items-center justify-center text-xl shadow-inner">
                      {unlocked ? card.icono : "🔒"}
                    </div>
                    {unlocked ? (
                      <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                        ★ {card.rarity}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-white/40 flex items-center gap-0.5 bg-black/30 px-1.5 py-0.5 rounded-md">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Body info */}
                  <div className="my-2">
                    <p className="text-[9px] font-black text-amber-300">
                      {unlocked ? card.yearFormatted : "Época Oculta"}
                    </p>
                    <h4 className="text-xs font-black text-white leading-tight line-clamp-2 mt-0.5">
                      {unlocked ? card.title : "Códice Oculto"}
                    </h4>
                  </div>

                  {/* Footer info */}
                  <div className="pt-1.5 border-t border-white/15 flex items-center justify-between text-[9px]">
                    <span className="text-white/75 font-semibold truncate">
                      {unlocked ? card.personajeClave : card.dificultadObtencion}
                    </span>
                    {unlocked && (
                      <span className="text-amber-300 font-black">Ver →</span>
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
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {reliquiasDesbloqueadas} / {totalReliquias}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
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
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[165px] ${
                    unlocked
                      ? `bg-gradient-to-br ${relic.color} ${relic.borde} ${relic.glow} shadow-xl`
                      : "bg-[#0b1328]/85 border-amber-400/20 opacity-80 hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-2xl shadow-md shrink-0">
                        {unlocked ? relic.icono : "🏺"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            👑 {relic.rarity}
                          </span>
                          {unlocked && (
                            <span className="text-[10px] font-black text-amber-300">
                              {relic.yearFormatted}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white leading-tight mt-1">
                          {unlocked ? relic.title : "Reliquia Mítica Bloqueada"}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="my-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <p className="text-[10px] text-white/85 leading-relaxed font-medium">
                      {unlocked
                        ? relic.leccionPedagogica
                        : `Misión de desbloqueo: ${relic.desbloqueoRequisito}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-amber-300/90 font-semibold truncate">
                      {unlocked ? `👤 ${relic.personajeClave}` : "🔒 Toca para ver misión"}
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
                    ? "bg-emerald-950/25 border-emerald-500/30"
                    : isCompleted
                    ? "bg-amber-950/35 border-amber-400/50 shadow-md shadow-amber-500/10"
                    : "bg-[#0b1328]/80 border-white/10"
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
                  className="p-3.5 rounded-2xl bg-[#0b1328]/90 border border-white/10 flex flex-col justify-between min-h-[95px] relative overflow-hidden shadow-md"
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
          <div className="p-3.5 rounded-2xl bg-[#0b1328]/90 border border-amber-400/30 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-white">Progreso Total de Aprendizaje</span>
              <span className="text-amber-400">{desbloqueadasCount} / {totalColeccionables} ({porcentajeColeccion}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${porcentajeColeccion}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/70 font-semibold pt-1">
              <span>📜 Códices: {codicesDesbloqueados}/{totalCodices}</span>
              <span>👑 Reliquias: {reliquiasDesbloqueadas}/{totalReliquias}</span>
              <span>🏛️ Hitos: {EVENTS_DB.length}</span>
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
              className="max-w-md w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-[#0e1834] to-indigo-950 border-2 border-amber-400/60 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto"
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
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="text-[11px] font-black text-slate-950 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm">
                    {hitoSeleccionado.yearFormatted}
                  </span>
                  <span className="text-[10px] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                    {hitoSeleccionado.siglo}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
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
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-1">
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Cerrar Ficha Histórica
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
