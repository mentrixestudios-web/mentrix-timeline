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
  Layers
} from "lucide-react";
import { getEventsByCategory } from "@/data/eventsData";
import { CATEGORIES } from "@/data/categories";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import CurrentCardHand from "@/components/game/CurrentCardHand";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";
import { addCoins } from "@/utils/gameStorage";

// Misma configuración visual premium estilo TCG que ConfigRonda
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

  const activeCategory = CATEGORIES.find((c) => c.id === catSeleccionada) || CATEGORIES[0];
  const activeDeckStyle = DECK_CONFIG[catSeleccionada] || DECK_CONFIG.caos;
  const eventCount = getEventsByCategory(catSeleccionada).length;

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
        mensaje: `¡Correcto! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}.`,
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
        mensaje: `¡Fallo! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}.`,
      });
    }

    // Pasar turno tras 1.4 segundos
    setTimeout(() => {
      setFeedback(null);
      if (pool.length > 0) {
        setCurrentCard(pool[0]);
        setPool(pool.slice(1));
        setTurno((prev) => (prev === 1 ? 2 : 1));
      } else {
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
    <div className="space-y-4 select-none pb-28 relative">
      
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
          FASE 1: SETUP (VITRINA TCG DE ALTA GAMA)
      ══════════════════════════════════════════════════════════ */}
      {fase === "setup" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Nombres de Jugadores Arcade */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl p-3 bg-blue-950/70 border-2 border-blue-400/50 space-y-1 shadow-md">
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

            <div className="rounded-2xl p-3 bg-amber-950/70 border-2 border-amber-400/50 space-y-1 shadow-md">
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

          {/* SHOWCASE DEL MAZO ACTIVO (VITRINA 3D) */}
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

              <div className="w-11 h-11 shrink-0 hidden sm:block">
                <MentrixMascot size="xs" showBubble={false} position="center" />
              </div>
            </div>

            <p className="text-[11px] text-white/80 mt-2.5 pt-2 border-t border-white/20 font-medium leading-relaxed">
              {activeDeckStyle.resumen}
            </p>
          </motion.div>

          {/* VITRINA DE MAZOS DE CARTAS (CUADRÍCULA 2x3 TIPO BARAJA COLECCIONABLE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Elige el Mazo del Duelo
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

          {/* BARRA FLOTANTE FIJA INFERIOR PARA INICIAR DUELO */}
          <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-[#091024]/95 to-transparent z-40 backdrop-blur-md border-t border-white/10">
            <div className="max-w-md mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={iniciarPartida}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 cursor-pointer transition-all animate-pulse"
              >
                <Swords className="w-5 h-5 fill-slate-950" />
                <span>¡Iniciar Duelo Cara a Cara!</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FASE 2: GAMEPLAY (CARTAS Y LÍNEA DE TIEMPO IDÉNTICAS A JUEGO.JSX)
      ══════════════════════════════════════════════════════════ */}
      {fase === "playing" && (
        <div className="space-y-3.5 pb-16">
          
          {/* Marcador Superior de Jugadores con Glow de Turno Activo */}
          <div className="grid grid-cols-2 gap-2">
            {/* Jugador 1 */}
            <div
              className={`p-2.5 rounded-2xl border transition-all ${
                turno === 1
                  ? "bg-blue-900/60 border-blue-400 shadow-lg shadow-blue-500/40 ring-2 ring-blue-400"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-300 truncate">
                  🔵 {nombreP1}
                </span>
                <span className="text-xs font-black text-white bg-blue-500/30 px-2 py-0.5 rounded-full border border-blue-400/30">
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
                  ? "bg-amber-900/60 border-amber-400 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 truncate">
                  🟡 {nombreP2}
                </span>
                <span className="text-xs font-black text-white bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400/30">
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

          {/* Banner Gigante de Turno Activo */}
          <motion.div
            key={turno}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`py-2 px-3 rounded-2xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md ${
              turno === 1
                ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-200 border-2 border-blue-400/60"
                : "bg-gradient-to-r from-amber-600/30 to-yellow-600/30 text-amber-200 border-2 border-amber-400/60"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>👉 Turno de: {turno === 1 ? nombreP1 : nombreP2} (Pasa el celular)</span>
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

          {/* Carta en Mano Activa (Idéntica a Juego.jsx) */}
          {currentCard && (
            <div className="sticky top-2 z-20 py-1 bg-[#0a0e1a]/95 backdrop-blur-md">
              <CurrentCardHand
                event={currentCard}
                cardsPlaced={timeline.length - 1}
                targetGoal={15}
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
              {/* Ranura 0 (Antes del primer evento) */}
              <div className="flex justify-center">
                <TimelineSlot
                  onSelect={() => handlePlaceCard(0)}
                  disabled={Boolean(feedback)}
                  label="Antes de todo"
                />
              </div>

              {/* Renderizado de cartas colocadas */}
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
          FASE 3: VICTORIA / PODIO FINAL
      ══════════════════════════════════════════════════════════ */}
      {fase === "victory" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-b from-[#101b3b] to-[#0b1328] border-2 border-amber-400 p-6 text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-3xl shadow-lg">
            🏆
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
              ¡DUELO FINALIZADO!
            </span>
            <h2 className="text-2xl font-black text-amber-300 mt-2">
              ¡{ganador === 1 ? nombreP1 : nombreP2} es el Ganador!
            </h2>
            <p className="text-xs text-white/70 mt-1">
              Gran Crononauta de la Historia Universal
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 bg-white/5 rounded-2xl p-3 border border-white/10 text-xs">
            <div className={`p-2 rounded-xl ${ganador === 1 ? "bg-blue-500/20 border border-blue-400/40" : ""}`}>
              <p className="text-blue-300 font-bold">{nombreP1}</p>
              <p className="text-lg font-black text-white">{puntosP1} pts</p>
            </div>
            <div className={`p-2 rounded-xl ${ganador === 2 ? "bg-amber-500/20 border border-amber-400/40" : ""}`}>
              <p className="text-amber-300 font-bold">{nombreP2}</p>
              <p className="text-lg font-black text-white">{puntosP2} pts</p>
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
