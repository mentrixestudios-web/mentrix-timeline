import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Heart, 
  Swords, 
  Play, 
  Users, 
  Check, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Hourglass,
  Layers,
  Crown
} from "lucide-react";
import { getEventsByCategory } from "@/data/eventsData";
import { CATEGORIES } from "@/data/categories";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import CurrentCardHand from "@/components/game/CurrentCardHand";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";
import { addCoins } from "@/utils/gameStorage";

// Configuración de Mazos TCG
const DECK_CONFIG = {
  caos: {
    iconoEmoji: "⏳",
    tagline: "Todas las Épocas",
    temaColor: "from-amber-600 via-yellow-600 to-amber-950",
    bordeActivo: "border-amber-400 ring-2 ring-amber-400/60 shadow-amber-500/30",
    iconoBg: "bg-amber-500/30 text-amber-200 border-amber-400/50",
    resumen: "El mazo maestro con todos los acontecimientos universales cruzados.",
  },
  historia: {
    iconoEmoji: "🏛️",
    tagline: "Imperios y Guerras",
    temaColor: "from-blue-600 via-indigo-700 to-slate-950",
    bordeActivo: "border-blue-400 ring-2 ring-blue-400/60 shadow-blue-500/30",
    iconoBg: "bg-blue-500/30 text-blue-200 border-blue-400/50",
    resumen: "Desde Egipto y Roma hasta la Revolución y el siglo XX.",
  },
  biblia: {
    iconoEmoji: "📜",
    tagline: "Génesis al Evangelio",
    temaColor: "from-emerald-600 via-teal-700 to-slate-950",
    bordeActivo: "border-emerald-400 ring-2 ring-emerald-400/60 shadow-emerald-500/30",
    iconoBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/50",
    resumen: "Profetas, reyes, éxodo y la línea histórica de las Escrituras.",
  },
  ciencia: {
    iconoEmoji: "🚀",
    tagline: "Inventos y Espacio",
    temaColor: "from-purple-600 via-fuchsia-700 to-slate-950",
    bordeActivo: "border-purple-400 ring-2 ring-purple-400/60 shadow-purple-500/30",
    iconoBg: "bg-purple-500/30 text-purple-200 border-purple-400/50",
    resumen: "Hitos científicos, exploración estelar y medicina.",
  },
  musica: {
    iconoEmoji: "🎨",
    tagline: "Obras y Maestros",
    temaColor: "from-pink-600 via-rose-700 to-slate-950",
    bordeActivo: "border-pink-400 ring-2 ring-pink-400/60 shadow-pink-500/30",
    iconoBg: "bg-pink-500/30 text-pink-200 border-pink-400/50",
    resumen: "Música clásica, rock, pintura y corrientes artísticas.",
  },
  cine: {
    iconoEmoji: "🎬",
    tagline: "Cine y Cultura Pop",
    temaColor: "from-orange-600 via-amber-700 to-slate-950",
    bordeActivo: "border-orange-400 ring-2 ring-orange-400/60 shadow-orange-500/30",
    iconoBg: "bg-orange-500/30 text-orange-200 border-orange-400/50",
    resumen: "Películas de culto, consolas legendarias y cultura pop.",
  },
};

const PLAYER_COLORS = [
  { color: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-400", ring: "ring-blue-400", emoji: "🔵" },
  { color: "text-amber-300", bg: "bg-amber-500/20", border: "border-amber-400", ring: "ring-amber-400", emoji: "🟡" },
  { color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-400", ring: "ring-emerald-400", emoji: "🟢" },
  { color: "text-purple-300", bg: "bg-purple-500/20", border: "border-purple-400", ring: "ring-purple-400", emoji: "🟣" },
];

export default function DueloAmigos() {
  const navigate = useNavigate();

  // Estados de configuración de partida
  const [fase, setFase] = useState("setup"); // 'setup' | 'playing' | 'victory'
  const [catSeleccionada, setCatSeleccionada] = useState("caos");
  
  // Cantidad de jugadores: 2, 3 o 4
  const [cantJugadores, setCantJugadores] = useState(2);
  const [nombres, setNombres] = useState([
    "Jugador 1",
    "Jugador 2",
    "Jugador 3",
    "Jugador 4",
  ]);

  // Dificultad del duelo: "facil" (4 vidas, 8 cartas meta), "medio" (3 vidas, 12 cartas), "dificil" (1 vida, 15 cartas)
  const [dificultadDuelo, setDificultadDuelo] = useState("medio");

  // Estados de juego
  const [timeline, setTimeline] = useState([]);
  const [pool, setPool] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [turnoIdx, setTurnoIdx] = useState(0); // 0 = P1, 1 = P2, etc.
  const [puntos, setPuntos] = useState([0, 0, 0, 0]);
  const [vidas, setVidas] = useState([3, 3, 3, 3]);
  const [feedback, setFeedback] = useState(null);
  const [ganadorIdx, setGanadorIdx] = useState(null);

  const activeCategory = CATEGORIES.find((c) => c.id === catSeleccionada) || CATEGORIES[0];
  const activeDeckStyle = DECK_CONFIG[catSeleccionada] || DECK_CONFIG.caos;
  const eventCount = getEventsByCategory(catSeleccionada).length;

  const getMaxVidas = () => {
    if (dificultadDuelo === "facil") return 4;
    if (dificultadDuelo === "dificil") return 1;
    return 3;
  };

  const getMetaCartas = () => {
    if (dificultadDuelo === "facil") return 8;
    if (dificultadDuelo === "dificil") return 15;
    return 12;
  };

  // Iniciar partida
  const iniciarPartida = () => {
    playSfx("victory");
    const rawEvents = getEventsByCategory(catSeleccionada);
    const shuffled = [...rawEvents].sort(() => Math.random() - 0.5);

    if (shuffled.length < 3) return;

    const initialLives = getMaxVidas();
    setTimeline([shuffled[0]]);
    setCurrentCard(shuffled[1]);
    setPool(shuffled.slice(2));
    setTurnoIdx(0);
    setPuntos([0, 0, 0, 0]);
    setVidas([initialLives, initialLives, initialLives, initialLives]);
    setFeedback(null);
    setGanadorIdx(null);
    setFase("playing");
  };

  // Siguiente jugador vivo
  const getNextTurno = (actualIdx, currentVidas) => {
    for (let i = 1; i <= cantJugadores; i++) {
      const nextIdx = (actualIdx + i) % cantJugadores;
      if (currentVidas[nextIdx] > 0) {
        return nextIdx;
      }
    }
    return actualIdx;
  };

  // Manejar colocación de carta
  const handlePlaceCard = (slotIndex) => {
    if (!currentCard || feedback) return;

    let isCorrect = true;
    if (slotIndex > 0 && currentCard.year < timeline[slotIndex - 1].year) isCorrect = false;
    if (slotIndex < timeline.length && currentCard.year > timeline[slotIndex].year) isCorrect = false;

    const playerColor = PLAYER_COLORS[turnoIdx];
    const playerName = nombres[turnoIdx];

    if (isCorrect) {
      playSfx("correct");
      const nextPuntos = [...puntos];
      nextPuntos[turnoIdx] += 1;
      setPuntos(nextPuntos);

      const newTimeline = [...timeline];
      newTimeline.splice(slotIndex, 0, currentCard);
      setTimeline(newTimeline);

      setFeedback({
        type: "correct",
        mensaje: `¡Acierto de ${playerName}! (${currentCard.yearFormatted})`,
      });

      // Si alcanzó la meta de cartas del duelo
      if (nextPuntos[turnoIdx] >= getMetaCartas()) {
        finalizarPartida(turnoIdx);
        return;
      }
    } else {
      playSfx("wrong");
      if (navigator?.vibrate) navigator.vibrate([100, 50, 100]);

      const nextVidas = [...vidas];
      nextVidas[turnoIdx] -= 1;
      setVidas(nextVidas);

      setFeedback({
        type: "wrong",
        mensaje: `¡Fallo de ${playerName}! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}.`,
      });

      // Verificar si solo queda un jugador vivo
      const jugadoresVivos = nextVidas.slice(0, cantJugadores).filter((v) => v > 0);
      if (jugadoresVivos.length <= 1) {
        // Gana el último vivo
        let ultimoVivo = 0;
        for (let j = 0; j < cantJugadores; j++) {
          if (nextVidas[j] > 0) {
            ultimoVivo = j;
            break;
          }
        }
        finalizarPartida(ultimoVivo);
        return;
      }
    }

    // Pasar turno tras 1.4 segundos al siguiente jugador vivo
    setTimeout(() => {
      setFeedback(null);
      if (pool.length > 0) {
        setCurrentCard(pool[0]);
        setPool(pool.slice(1));
        setTurnoIdx((prev) => getNextTurno(prev, vidas));
      } else {
        // Mazo agotado: gana quien tenga más puntos
        let maxPts = -1;
        let bestIdx = 0;
        for (let j = 0; j < cantJugadores; j++) {
          if (puntos[j] > maxPts) {
            maxPts = puntos[j];
            bestIdx = j;
          }
        }
        finalizarPartida(bestIdx);
      }
    }, 1400);
  };

  const finalizarPartida = (winnerIndex) => {
    setGanadorIdx(winnerIndex);
    setFase("victory");
    playSfx("victory");
    addCoins(40);
    confetti({ particleCount: 130, spread: 90, origin: { y: 0.5 } });
  };

  return (
    <div className="space-y-4 select-none pb-32 relative">
      
      {/* ── HEADER SUPERIOR ── */}
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            playSfx("tap");
            if (fase === "playing") setFase("setup");
            else navigate(-1);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{fase === "playing" ? "Rendirse" : "Volver"}</span>
        </motion.button>

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-blue-500/20 text-blue-300 border-blue-400/40">
          PASS & PLAY · 1 DISPOSITIVO 📱
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FASE 1: SETUP (JUGADORES, DIFICULTAD Y MAZO)
      ══════════════════════════════════════════════════════════ */}
      {fase === "setup" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 1. SELECCIÓN DE CANTIDAD DE JUGADORES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-400 rounded-full" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  1. Cantidad de Jugadores
                </h3>
              </div>
              <span className="text-[10px] text-blue-300 font-bold">
                Mismo celular
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((num) => {
                const active = cantJugadores === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      playSfx("tap");
                      setCantJugadores(num);
                    }}
                    className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      active
                        ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30 ring-2 ring-blue-400 font-black"
                        : "bg-[#0b1328]/90 border-white/10 text-white/60 hover:text-white font-bold"
                    }`}
                  >
                    <span className="text-sm">👥</span>
                    <p className="text-xs">{num} Jugadores</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombres de los Jugadores seleccionados */}
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: cantJugadores }).map((_, idx) => {
              const style = PLAYER_COLORS[idx];
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-2.5 bg-[#0b1328]/90 border ${style.border}/60 space-y-1 shadow-sm`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-wider ${style.color}`}>
                    {style.emoji} JUGADOR {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={nombres[idx]}
                    onChange={(e) => {
                      const copia = [...nombres];
                      copia[idx] = e.target.value;
                      setNombres(copia);
                    }}
                    maxLength={12}
                    className="w-full px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              );
            })}
          </div>

          {/* 2. SELECTOR DE DIFICULTAD DEL DUELO */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-400 rounded-full" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  2. Dificultad del Duelo
                </h3>
              </div>
              <span className="text-[10px] text-purple-300 font-bold">
                Vidas y cartas
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "facil", label: "Fácil", vidasText: "4 Vidas", meta: "8 Cartas", emoji: "🟢" },
                { id: "medio", label: "Media", vidasText: "3 Vidas", meta: "12 Cartas", emoji: "🟡" },
                { id: "dificil", label: "Difícil", vidasText: "1 Vida", meta: "15 Cartas", emoji: "🔴" },
              ].map((d) => {
                const active = dificultadDuelo === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      playSfx("tap");
                      setDificultadDuelo(d.id);
                    }}
                    className={`py-2.5 px-1.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      active
                        ? "bg-gradient-to-b from-amber-500/25 to-yellow-500/10 border-amber-400 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400"
                        : "bg-[#0b1328]/90 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{d.emoji}</span>
                    <p className="text-xs font-black text-white mt-0.5">{d.label}</p>
                    <p className="text-[10px] text-amber-300 font-bold">{d.vidasText}</p>
                    <p className="text-[8px] text-white/40">{d.meta}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. VITRINA DEL MAZO ACTIVO */}
          <motion.div
            key={catSeleccionada}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-3xl p-4 border bg-gradient-to-br ${activeDeckStyle.temaColor} shadow-xl`}
          >
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
                  {activeDeckStyle.iconoEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      Mazo de Batalla
                    </span>
                    <span className="text-[9px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {eventCount} Cartas 🃏
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {activeCategory.name}
                  </h2>
                  <p className="text-xs text-white/80 font-medium">
                    {activeDeckStyle.tagline}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. CUADRÍCULA 2x3 DE MAZOS DE CARTAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  3. Selecciona el Mazo
                </h3>
              </div>
              <span className="text-[10px] text-amber-300 font-bold">
                Toca para equipar
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = catSeleccionada === cat.id;
                const deckStyle = DECK_CONFIG[cat.id] || DECK_CONFIG.caos;
                const count = getEventsByCategory(cat.id).length;

                return (
                  <motion.div
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playSfx("tap");
                      setCatSeleccionada(cat.id);
                    }}
                    className={`cursor-pointer rounded-2xl p-3 border transition-all duration-200 relative flex flex-col justify-between text-center overflow-hidden shadow-lg ${
                      isSelected
                        ? `${deckStyle.bordeActivo} bg-[#111c38]`
                        : "bg-[#0b1328]/95 border-white/10 hover:border-amber-400/40"
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.color}`} />

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-white/70 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">
                        {count} 🃏
                      </span>
                      {isSelected ? (
                        <span className="text-[9px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          LISTO
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-white/30">
                          Equipar
                        </span>
                      )}
                    </div>

                    <div className="my-1">
                      <div className={`w-12 h-12 mx-auto rounded-2xl ${deckStyle.iconoBg} border flex items-center justify-center text-2xl shadow-md transition-transform ${isSelected ? "scale-110" : ""}`}>
                        {deckStyle.iconoEmoji}
                      </div>
                      <h4 className={`text-xs sm:text-sm font-black mt-2 leading-tight ${isSelected ? "text-amber-300" : "text-white"}`}>
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-white/60 font-semibold line-clamp-1 mt-0.5">
                        {deckStyle.tagline}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/10">
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? "text-amber-400" : "text-white/40"}`}>
                        {isSelected ? "★ SELECCIONADO" : "Elegir Mazo"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* BOTÓN EN PANTALLA VISIBLE PARA INICIAR PARTIDA */}
          <div className="pt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={iniciarPartida}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 hover:from-blue-400 hover:to-amber-400 text-white font-black text-base uppercase tracking-wider shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
            >
              <Swords className="w-5 h-5" />
              <span>¡Iniciar Duelo ({cantJugadores} Jugadores)!</span>
            </motion.button>
          </div>

          {/* BARRA FLOTANTE FIJA INFERIOR */}
          <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-[#091024]/95 backdrop-blur-xl border-t border-blue-500/30 z-50">
            <div className="max-w-md mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={iniciarPartida}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
              >
                <Swords className="w-5 h-5" />
                <span>¡Comenzar Duelo con Amigos!</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FASE 2: GAMEPLAY (2 A 4 JUGADORES COMPARTIENDO EL CELULAR)
      ══════════════════════════════════════════════════════════ */}
      {fase === "playing" && (
        <div className="space-y-3.5 pb-16">
          
          {/* Marcador Superior de Jugadores (Adaptado de 2 a 4) */}
          <div className={`grid gap-2 ${cantJugadores === 2 ? "grid-cols-2" : cantJugadores === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
            {Array.from({ length: cantJugadores }).map((_, idx) => {
              const isTurno = turnoIdx === idx;
              const isEliminado = vidas[idx] <= 0;
              const style = PLAYER_COLORS[idx];
              const maxVidas = getMaxVidas();

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-2xl border transition-all text-center ${
                    isTurno
                      ? `${style.bg} ${style.border} shadow-lg ${style.ring} ring-2`
                      : isEliminado
                      ? "bg-red-950/20 border-red-500/30 opacity-40"
                      : "bg-white/5 border-white/10 opacity-70"
                  }`}
                >
                  <p className={`text-[11px] font-black truncate ${style.color}`}>
                    {style.emoji} {nombres[idx]}
                  </p>
                  <span className="text-xs font-black text-white bg-black/40 px-2 py-0.5 rounded-full my-0.5 inline-block">
                    {puntos[idx]} pts
                  </span>

                  {/* Vidas restantes */}
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 text-xs">
                    {isEliminado ? (
                      <span className="text-[9px] font-black text-red-400">ELIMINADO</span>
                    ) : (
                      Array.from({ length: maxVidas }).map((_, vIdx) => (
                        <Heart
                          key={vIdx}
                          className={`w-3 h-3 ${
                            vIdx < vidas[idx] ? "fill-rose-500 text-rose-500" : "text-white/20"
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner Gigante de Turno Activo */}
          <motion.div
            key={turnoIdx}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`py-2 px-3 rounded-2xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md ${
              PLAYER_COLORS[turnoIdx].bg
            } ${PLAYER_COLORS[turnoIdx].color} border-2 ${PLAYER_COLORS[turnoIdx].border}`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>👉 Turno de: {nombres[turnoIdx]} (Pasa el teléfono)</span>
          </motion.div>

          {/* Feedback de Acierto / Fallo */}
          {feedback && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 ${
                feedback.type === "correct"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20"
                  : "bg-red-950/80 border-red-500 text-red-200 shadow-lg shadow-red-500/20"
              }`}
            >
              {feedback.type === "correct" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.mensaje}</span>
            </motion.div>
          )}

          {/* Carta en Mano Activa */}
          {currentCard && (
            <div className="sticky top-2 z-20 py-1 bg-[#0a0e1a]/95 backdrop-blur-md">
              <CurrentCardHand
                event={currentCard}
                cardsPlaced={timeline.length - 1}
                targetGoal={getMetaCartas()}
                lupaActive={false}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              LÍNEA DE TIEMPO INTERACTIVA COMPARTIDA
          ══════════════════════════════════════════════════════════ */}
          <div className="relative py-2">
            <div className="flex items-center justify-center mb-3">
              <span className="text-[11px] font-black text-amber-300/60 uppercase tracking-widest flex items-center gap-2">
                <span>Antigüedad</span>
                <span className="text-amber-400">━━━━ ⏳ ━━━━</span>
                <span>Época Actual</span>
              </span>
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-center">
                <TimelineSlot
                  onSelect={() => handlePlaceCard(0)}
                  disabled={Boolean(feedback)}
                  label="Antes de todo"
                />
              </div>

              {timeline.map((event, idx) => (
                <React.Fragment key={event.id}>
                  <TimelineCard event={event} index={idx} />

                  <div className="flex justify-center">
                    <TimelineSlot
                      onSelect={() => handlePlaceCard(idx + 1)}
                      disabled={Boolean(feedback)}
                      label={idx === timeline.length - 1 ? "Después de todo" : "En medio"}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FASE 3: VICTORIA / PODIO FINAL MULTIJUGADOR
      ══════════════════════════════════════════════════════════ */}
      {fase === "victory" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-b from-[#101b3b] to-[#0b1328] border-2 border-amber-400 p-6 text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-3xl shadow-lg">
            👑
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
              ¡DUELO FINALIZADO!
            </span>
            <h2 className="text-2xl font-black text-amber-300 mt-2">
              ¡{nombres[ganadorIdx]} es el Gran Campeón!
            </h2>
            <p className="text-xs text-white/70 mt-1">
              Dominó la línea de tiempo y venció a sus rivales
            </p>
          </div>

          {/* Podio de todos los participantes */}
          <div className="space-y-1.5 bg-white/5 rounded-2xl p-3 border border-white/10 text-xs">
            {Array.from({ length: cantJugadores }).map((_, idx) => {
              const isWinner = ganadorIdx === idx;
              const style = PLAYER_COLORS[idx];
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl ${
                    isWinner ? "bg-amber-500/25 border border-amber-400/60 font-black" : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{isWinner ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                    <span className={style.color}>{nombres[idx]}</span>
                  </div>
                  <span className="text-white font-black">{puntos[idx]} aciertos</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setFase("setup")}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase cursor-pointer"
            >
              Revancha
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase cursor-pointer shadow-lg"
            >
              Menú Principal
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
