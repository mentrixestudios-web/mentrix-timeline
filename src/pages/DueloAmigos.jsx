import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  AlertCircle,
  Sparkles,
  Hourglass
} from "lucide-react";
import { getEventsByCategory } from "@/data/eventsData";
import { CATEGORIES } from "@/data/categories";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import CurrentCardHand from "@/components/game/CurrentCardHand";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";
import { addCoins } from "@/utils/gameStorage";

export default function DueloAmigos() {
  const navigate = useNavigate();

  // Estados de configuración de partida
  const [fase, setFase] = useState("setup"); // 'setup' | 'playing' | 'victory'
  const [catSeleccionada, setCatSeleccionada] = useState("caos");
  const [nombreP1, setNombreP1] = useState("Jugador 1");
  const [nombreP2, setNombreP2] = useState("Jugador 2");

  // Estados de juego
  const [timeline, setTimeline] = useState([]);
  const [pool, setPool] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [turno, setTurno] = useState(1); // 1 = P1, 2 = P2
  const [puntosP1, setPuntosP1] = useState(0);
  const [puntosP2, setPuntosP2] = useState(0);
  const [vidasP1, setVidasP1] = useState(3);
  const [vidasP2, setVidasP2] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [ganador, setGanador] = useState(null);

  // Iniciar partida local
  const iniciarPartida = () => {
    playSfx("victory");
    const rawEvents = getEventsByCategory(catSeleccionada);
    const shuffled = [...rawEvents].sort(() => Math.random() - 0.5);

    if (shuffled.length < 3) return;

    setTimeline([shuffled[0]]);
    setCurrentCard(shuffled[1]);
    setPool(shuffled.slice(2));
    setTurno(1);
    setPuntosP1(0);
    setPuntosP2(0);
    setVidasP1(3);
    setVidasP2(3);
    setFeedback(null);
    setGanador(null);
    setFase("playing");
  };

  // Manejar colocación de carta
  const handlePlaceCard = (slotIndex) => {
    if (!currentCard || feedback) return;

    // Validar si la posición es cronológicamente correcta
    let isCorrect = true;
    if (slotIndex > 0 && currentCard.year < timeline[slotIndex - 1].year) isCorrect = false;
    if (slotIndex < timeline.length && currentCard.year > timeline[slotIndex].year) isCorrect = false;

    if (isCorrect) {
      playSfx("correct");
      if (turno === 1) setPuntosP1((p) => p + 1);
      else setPuntosP2((p) => p + 1);

      const newTimeline = [...timeline];
      newTimeline.splice(slotIndex, 0, currentCard);
      setTimeline(newTimeline);

      setFeedback({
        type: "correct",
        mensaje: `¡Acierto de ${turno === 1 ? nombreP1 : nombreP2}! (${currentCard.yearFormatted})`,
      });
    } else {
      playSfx("wrong");
      if (navigator?.vibrate) navigator.vibrate([100, 50, 100]);

      if (turno === 1) {
        const nv = vidasP1 - 1;
        setVidasP1(nv);
        if (nv <= 0) {
          finalizarPartida(2);
          return;
        }
      } else {
        const nv = vidasP2 - 1;
        setVidasP2(nv);
        if (nv <= 0) {
          finalizarPartida(1);
          return;
        }
      }

      setFeedback({
        type: "wrong",
        mensaje: `¡Fallo! Ocurrió en ${currentCard.yearFormatted}.`,
      });
    }

    // Pasar turno tras 1.5 segundos
    setTimeout(() => {
      setFeedback(null);
      if (pool.length > 0) {
        setCurrentCard(pool[0]);
        setPool(pool.slice(1));
        setTurno((prev) => (prev === 1 ? 2 : 1));
      } else {
        // Fin por mazo agotado: gana quien tenga más puntos
        const g = puntosP1 >= puntosP2 ? 1 : 2;
        finalizarPartida(g);
      }
    }, 1400);
  };

  const finalizarPartida = (ganadorNum) => {
    setGanador(ganadorNum);
    setFase("victory");
    playSfx("victory");
    addCoins(30);
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
  };

  return (
    <div className="space-y-4 select-none pb-12">
      
      {/* ── HEADER ── */}
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

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/5 border-blue-400/40 text-blue-300">
          1 DISPOSITIVO · PASS & PLAY 📱
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FASE 1: SETUP (ELEGIR NOMBRES Y MAZO)
      ══════════════════════════════════════════════════════════ */}
      {fase === "setup" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Banner de Bienvenida */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-950/80 via-[#101b3b] to-indigo-950/80 border-2 border-blue-400/50 p-4 shadow-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-300" />
                <h1 className="text-base sm:text-lg font-black text-white">
                  Duelo en un Solo Dispositivo
                </h1>
              </div>
              <p className="text-xs text-blue-200/80 font-medium mt-0.5">
                2 Jugadores cara a cara compartiendo el mismo teléfono
              </p>
            </div>
            <div className="w-12 h-12 shrink-0">
              <MentrixMascot size="xs" showBubble={false} position="center" />
            </div>
          </div>

          {/* Configuración de Jugadores */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl p-3 bg-blue-950/60 border border-blue-400/40 space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">
                🔵 JUGADOR 1
              </span>
              <input
                type="text"
                value={nombreP1}
                onChange={(e) => setNombreP1(e.target.value)}
                maxLength={12}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="rounded-2xl p-3 bg-amber-950/60 border border-amber-400/40 space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                🟡 JUGADOR 2
              </span>
              <input
                type="text"
                value={nombreP2}
                onChange={(e) => setNombreP2(e.target.value)}
                maxLength={12}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Selección de Mazo */}
          <div className="space-y-2">
            <span className="text-xs font-black text-white uppercase tracking-wider px-1">
              Elige el Mazo de Batalla
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = catSeleccionada === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playSfx("tap");
                      setCatSeleccionada(cat.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-amber-500/25 to-yellow-500/10 border-amber-400 text-white shadow-md ring-1 ring-amber-400"
                        : "bg-[#0b1328]/90 border-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black">{cat.name}</p>
                      <p className="text-[9px] text-white/50">{cat.subtitle}</p>
                    </div>
                    {isSelected && <span className="text-amber-400 font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón de Inicio */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={iniciarPartida}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 hover:from-blue-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Swords className="w-4 h-4" />
            <span>¡Comenzar Duelo Cara a Cara!</span>
          </motion.button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FASE 2: GAMEPLAY (BATALLA POR TURNOS)
      ══════════════════════════════════════════════════════════ */}
      {fase === "playing" && (
        <div className="space-y-3.5">
          {/* Marcador Superior de Jugadores */}
          <div className="grid grid-cols-2 gap-2">
            {/* Jugador 1 */}
            <div
              className={`p-2.5 rounded-2xl border transition-all ${
                turno === 1
                  ? "bg-blue-900/50 border-blue-400 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-300 truncate">
                  🔵 {nombreP1}
                </span>
                <span className="text-xs font-black text-white bg-blue-500/30 px-2 py-0.5 rounded-full">
                  {puntosP1} pts
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < vidasP1 ? "fill-rose-500 text-rose-500" : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Jugador 2 */}
            <div
              className={`p-2.5 rounded-2xl border transition-all ${
                turno === 2
                  ? "bg-amber-900/50 border-amber-400 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 truncate">
                  🟡 {nombreP2}
                </span>
                <span className="text-xs font-black text-white bg-amber-500/30 px-2 py-0.5 rounded-full">
                  {puntosP2} pts
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < vidasP2 ? "fill-rose-500 text-rose-500" : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Banner de Turno Activo */}
          <div
            className={`py-2 px-3 rounded-2xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm ${
              turno === 1
                ? "bg-blue-500/20 text-blue-300 border border-blue-400/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
            }`}
          >
            <Swords className="w-3.5 h-3.5 animate-spin" />
            <span>👉 Pasa el teléfono a: {turno === 1 ? nombreP1 : nombreP2}</span>
          </div>

          {/* Feedback temporal */}
          {feedback && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`py-2 px-3 rounded-xl text-xs font-black text-center ${
                feedback.type === "correct"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {feedback.mensaje}
            </motion.div>
          )}

          {/* Carta en Mano */}
          {currentCard && (
            <CurrentCardHand currentCard={currentCard} />
          )}

          {/* Línea de Tiempo Compartida */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/80 px-1">
              Línea Temporal Compartida ({timeline.length} cartas)
            </span>

            <div className="flex flex-col items-center gap-2">
              <TimelineSlot index={0} onPlace={handlePlaceCard} />

              {timeline.map((event, idx) => (
                <React.Fragment key={event.id}>
                  <TimelineCard event={event} isPlaced={true} />
                  <TimelineSlot index={idx + 1} onPlace={handlePlaceCard} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FASE 3: VICTORIA / PODIO
      ══════════════════════════════════════════════════════════ */}
      {fase === "victory" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-b from-[#101b3b] to-[#0b1328] border-2 border-amber-400 p-6 text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-3xl">
            🏆
          </div>

          <div>
            <h2 className="text-xl font-black text-amber-300">
              ¡{ganador === 1 ? nombreP1 : nombreP2} es el Ganador!
            </h2>
            <p className="text-xs text-white/70 mt-1">
              Gran Crononauta de la Historia Universal
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-2xl p-3 border border-white/10 text-xs">
            <div>
              <p className="text-blue-300 font-bold">{nombreP1}</p>
              <p className="text-base font-black text-white">{puntosP1} pts</p>
            </div>
            <div>
              <p className="text-amber-300 font-bold">{nombreP2}</p>
              <p className="text-base font-black text-white">{puntosP2} pts</p>
            </div>
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
              className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
            >
              Menú Principal
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
