import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Sparkles,
  HelpCircle,
  Hourglass,
  ShoppingBag,
  Timer,
  Swords,
  Skull,
  Share2,
  SlidersHorizontal
} from "lucide-react";
import HistoryShareModal from "@/components/share/HistoryShareModal";
import { getEventsByCategory } from "@/data/eventsData";
import { CATEGORIES } from "@/data/categories";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import CurrentCardHand from "@/components/game/CurrentCardHand";
import HorizontalTimelineSlider from "@/components/game/HorizontalTimelineSlider";
import LivesDisplay from "@/components/game/LivesDisplay";
import MentrixMascot from "@/components/game/MentrixMascot";
import PowerupsBar from "@/components/game/PowerupsBar";
import { addCoins, recordGameResult, getPowerups, usePowerup, spendCoins } from "@/utils/gameStorage";
import { playSfx, playBgm } from "@/utils/soundSystem";

export default function Juego() {
  useEffect(() => {
    playBgm("game");
  }, []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryId = searchParams.get("cat") || "caos";
  const modo = searchParams.get("modo") || "clasico";
  const categoryInfo = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  const maxLives = modo === "supervivencia" ? 1 : 3;

  const [pool, setPool] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [lives, setLives] = useState(maxLives);
  const [score, setScore] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // Estados específicos para Duelo vs Menti (IA)
  const [mentiScore, setMentiScore] = useState(0);
  const [turnoDuelo, setTurnoDuelo] = useState("jugador"); // 'jugador' | 'menti'
  const [mentiThinking, setMentiThinking] = useState(false);
  const [mentiCustomMsg, setMentiCustomMsg] = useState(null);

  // ═════════════════════════════════════════════════════════════
  // NUEVAS MECÁNICAS DE JUGABILIDAD MENTRIX 2.0
  // 1. Combo Racha Multiplicador (x1, x2, x3)
  // 2. Margen de Gracia / Paradoja Leve (error por <= 10 años)
  // 3. Poderes Tácticos: Salto Temporal (descarte) y Ancla Temporal
  // 4. Modo Desafío Ciego / Hardcore (apuesta de monedas)
  // ═════════════════════════════════════════════════════════════
  const [comboStreak, setComboStreak] = useState(0);
  const [saltoUsed, setSaltoUsed] = useState(false);
  const [anclaActive, setAnclaActive] = useState(false);
  const [hardcoreMode, setHardcoreMode] = useState(false);

  const cartasParam = parseInt(searchParams.get("cartas"));
  const [targetGoal] = useState(!isNaN(cartasParam) && cartasParam > 0 ? cartasParam : (modo === "supervivencia" ? 25 : 10));
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'revealing' | 'victory' | 'gameover'
  const [mascotStatus, setMascotStatus] = useState("idle");
  const [lastFeedback, setLastFeedback] = useState(null);
  const [justPlacedId, setJustPlacedId] = useState(null);
  const [unlockedPrizeCard, setUnlockedPrizeCard] = useState(null);

  // Estados de poderes activos en la carta actual
  const [lupaActive, setLupaActive] = useState(false);
  const [frozenSlots, setFrozenSlots] = useState([]);

  // Modo de vista: 'carousel' (Deslizador horizontal como en la imagen) o 'slots' (Ranuras clásicas verticales)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("timeline_view_mode") || "carousel";
  });

  const handleToggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === "carousel" ? "slots" : "carousel";
      localStorage.setItem("timeline_view_mode", next);
      toast.info(next === "carousel" ? "Vista Deslizador horizontal activada" : "Vista Clásica con ranuras activada");
      return next;
    });
  };

  // Estado de Contrarreloj (segundos restantes)
  const [timeLeft, setTimeLeft] = useState(60);

  // Iniciar partida
  useEffect(() => {
    startNewGame();
  }, [categoryId, modo]);

  // Temporizador en modo contrarreloj
  useEffect(() => {
    if (modo !== "contrarreloj" || gameState !== "playing") return;

    if (timeLeft <= 0) {
      setGameState("gameover");
      setMascotStatus("gameover");
      playSfx("wrong");
      recordGameResult({ won: false, cardsPlaced: score, category: categoryId, mode: modo });
      toast.error("⏱️ ¡Tiempo agotado!");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [modo, gameState, timeLeft, score, categoryId]);

  // Turno de la IA en Modo Duelo contra Menti
  useEffect(() => {
    if (modo !== "duelo" || turnoDuelo !== "menti" || gameState !== "playing") return;

    const timer = setTimeout(() => {
      setPool((currentPool) => {
        if (!currentPool || currentPool.length === 0) {
          if (score >= mentiScore) {
            setGameState("victory");
            setMascotStatus("victory");
            playSfx("victory");
            const res = recordGameResult({ won: true, cardsPlaced: score, category: categoryId, mode: modo });
            if (res?.newlyUnlockedCard) {
              setUnlockedPrizeCard(res.newlyUnlockedCard);
            }
          } else {
            setGameState("gameover");
            setMascotStatus("gameover");
            playSfx("wrong");
            recordGameResult({ won: false, cardsPlaced: score, category: categoryId, mode: modo });
          }
          return currentPool;
        }

        const mentiCard = currentPool[0];
        const remaining = currentPool.slice(1);

        // Menti acierta con 80% de probabilidad
        const acierta = Math.random() < 0.80;

        setTimeline((currTimeline) => {
          if (acierta) {
            let insertIdx = 0;
            while (insertIdx < currTimeline.length && currTimeline[insertIdx].year < mentiCard.year) {
              insertIdx++;
            }
            const nextTl = [...currTimeline];
            nextTl.splice(insertIdx, 0, mentiCard);
            setJustPlacedId(mentiCard.id);
            setTimeout(() => setJustPlacedId(null), 2500);

            setMentiScore((prevMenti) => {
              const nextM = prevMenti + 1;
              if (nextM >= targetGoal) {
                setGameState("gameover");
                setMascotStatus("gameover");
                playSfx("wrong");
                recordGameResult({ won: false, cardsPlaced: score, category: categoryId, mode: modo });
              }
              return nextM;
            });

            playSfx("correct");
            setMascotStatus("victory");
            setLastFeedback({
              type: "correct",
              message: `🤖 Menti colocó correctamente: "${mentiCard.title}" (${mentiCard.yearFormatted})`,
            });
            setMentiCustomMsg(`¡Punto para mí! "${mentiCard.title}" encaja en ${mentiCard.yearFormatted}. ¡Tu turno, crononauta! 🧠`);
            return nextTl;
          } else {
            playSfx("wrong");
            setMascotStatus("wrong");
            setLastFeedback({
              type: "wrong",
              message: `🤖 ¡Menti falló con "${mentiCard.title}"! Perdió su turno.`,
            });
            setMentiCustomMsg(`¡Rayos! Me fallaron los cronocircuitos con "${mentiCard.title}". ¡Aprovecha mi tropiezo! 😅`);
            return currTimeline;
          }
        });

        // Entregar siguiente carta al jugador
        if (remaining.length > 0) {
          setCurrentCard(remaining[0]);
          return remaining.slice(1);
        } else {
          setCurrentCard(null);
          return [];
        }
      });

      setTurnoDuelo("jugador");
      setMentiThinking(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [modo, turnoDuelo, gameState, score, mentiScore, targetGoal, categoryId]);

  const startNewGame = () => {
    const rawEvents = getEventsByCategory(categoryId);
    const shuffled = [...rawEvents].sort(() => Math.random() - 0.5);

    if (shuffled.length < 2) {
      toast.error("No hay suficientes eventos en esta categoría");
      navigate("/categorias");
      return;
    }

    const firstCard = shuffled[0];
    const handCard = shuffled[1];
    const remainingPool = shuffled.slice(2);

    setTimeline([firstCard]);
    setCurrentCard(handCard);
    setPool(remainingPool);
    setLives(maxLives);
    setScore(0);
    setComboStreak(0);
    setSaltoUsed(false);
    setAnclaActive(false);
    setMentiScore(0);
    setTurnoDuelo("jugador");
    setMentiThinking(false);
    setMentiCustomMsg(
      modo === "duelo"
        ? "¡Acepto el duelo! Tú comienzas: ubica tu carta en la época correcta. ⚔️"
        : null
    );
    setTimeLeft(60);
    setGameState("playing");
    setMascotStatus("idle");
    setLastFeedback(null);
    setLupaActive(false);
    setFrozenSlots([]);
    setUnlockedPrizeCard(null);
  };

  const handleUseLupa = () => {
    setLupaActive(true);
    playSfx("tap");
  };

  const handleUseCongelador = () => {
    if (!currentCard) return;
    const wrongSlots = [];
    const totalSlots = timeline.length + 1;

    for (let slot = 0; slot < totalSlots; slot++) {
      let isCorrect = true;
      if (slot > 0 && currentCard.year < timeline[slot - 1].year) isCorrect = false;
      if (slot < timeline.length && currentCard.year > timeline[slot].year) isCorrect = false;

      if (!isCorrect) {
        wrongSlots.push(slot);
      }
    }

    const toFreeze = wrongSlots.sort(() => Math.random() - 0.5).slice(0, 2);
    setFrozenSlots(toFreeze);
    playSfx("tap");
  };

  const handleUseCorazon = () => {
    setLives((prev) => Math.min(maxLives, prev + 1));
    playSfx("victory");
  };

  // Poder Táctico 1: Salto Temporal (descarta la carta actual al fondo del mazo)
  const handleUseSalto = () => {
    if (saltoUsed || !currentCard || pool.length === 0) return;
    setSaltoUsed(true);
    const newPool = [...pool.slice(1), currentCard];
    const newCurrent = pool[0];
    setCurrentCard(newCurrent);
    setPool(newPool);
    setLupaActive(false);
    setAnclaActive(false);
    setFrozenSlots([]);
    playSfx("tap");
    toast.success("🌀 ¡Salto Temporal activado! Carta devuelta al continuo.");
  };

  // Poder Táctico 2: Ancla Temporal (indica en qué tercio del tablero se ubica la carta)
  const handleUseAncla = () => {
    setAnclaActive(true);
    playSfx("tap");
    toast.success("⚓ ¡Ancla Temporal activada! Coordenada por tercio revelada.");
  };

  const handleToggleHardcore = () => {
    if (gameState !== "playing" || score > 0) return;
    if (!hardcoreMode) {
      if (spendCoins(50)) {
        setHardcoreMode(true);
        playSfx("coin");
        toast.success("💀 ¡Modo Ciego activado! (Apuesta 50 🪙 · Premio 300 🪙)");
      } else {
        toast.error("Necesitas 50 monedas para activar la apuesta de Modo Ciego");
      }
    } else {
      setHardcoreMode(false);
      addCoins(50);
      toast.info("Modo Ciego desactivado (50 monedas devueltas)");
    }
  };

  const handleInsert = (slotIndex) => {
    if (gameState !== "playing" || !currentCard || turnoDuelo === "menti") return;
    if (frozenSlots.includes(slotIndex)) {
      toast.error("Esa ranura está congelada porque es incorrecta");
      return;
    }

    let isCorrect = true;

    if (slotIndex > 0 && currentCard.year < timeline[slotIndex - 1].year) {
      isCorrect = false;
    }

    if (slotIndex < timeline.length && currentCard.year > timeline[slotIndex].year) {
      isCorrect = false;
    }

    if (isCorrect) {
      playSfx("correct");

      // Multiplicador de Combo Cronológico (1-2: x1 | 3-5: x2 | 6+: x3)
      const nextStreak = comboStreak + 1;
      setComboStreak(nextStreak);
      const multiplier = nextStreak >= 6 ? 3 : nextStreak >= 3 ? 2 : 1;
      const coinReward = 10 * multiplier;
      addCoins(coinReward);

      confetti({
        particleCount: multiplier * 35,
        spread: 60 + multiplier * 15,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#eab308", "#3b82f6", "#10b981", "#8b5cf6"],
      });

      const nextTimeline = [...timeline];
      nextTimeline.splice(slotIndex, 0, currentCard);
      setTimeline(nextTimeline);
      setJustPlacedId(currentCard.id);
      setTimeout(() => setJustPlacedId(null), 2500);

      const nextScore = score + 1;
      setScore(nextScore);
      setMascotStatus("correct");

      // Si es contrarreloj, regala +4 segundos de bonificación
      if (modo === "contrarreloj") {
        setTimeLeft((prev) => prev + 4);
      }

      setLupaActive(false);
      setAnclaActive(false);
      setFrozenSlots([]);

      const comboText = multiplier > 1 ? ` 🔥 ¡Combo x${multiplier}! (+${coinReward}🪙)` : "";
      setLastFeedback({
        type: "correct",
        message: `¡Correcto! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}.${comboText}`,
      });

      if (nextScore >= targetGoal) {
        setGameState("victory");
        setMascotStatus("victory");
        playSfx("victory");
        if (modo === "desafio") {
          const todayKey = new Date().toISOString().slice(0, 10);
          localStorage.setItem(`timeline_daily_done_${todayKey}`, "true");
        }
        const res = recordGameResult({ won: true, cardsPlaced: nextScore, category: categoryId, mode: modo });
        if (res?.newlyUnlockedCard) {
          setUnlockedPrizeCard(res.newlyUnlockedCard);
        }
        // Premio extra en Modo Ciego Hardcore (300 monedas)
        const victoryCoins = hardcoreMode ? 300 : (modo === "desafio" ? 100 : 50);
        addCoins(victoryCoins);
        confetti({ particleCount: 150, spread: 110, origin: { y: 0.5 } });
        return;
      }

      // Si estamos en Duelo contra Menti, ceder el turno a Menti
      if (modo === "duelo") {
        setTurnoDuelo("menti");
        setMentiThinking(true);
        setMentiCustomMsg("¡Buen movimiento! Ahora es mi turno de calcular la historia... 🤖");
        return;
      }

      if (pool.length > 0) {
        const nextCard = pool[0];
        setCurrentCard(nextCard);
        setPool(pool.slice(1));
      } else {
        setGameState("victory");
        setMascotStatus("victory");
        playSfx("victory");
        const res = recordGameResult({ won: true, cardsPlaced: nextScore, category: categoryId, mode: modo });
        if (res?.newlyUnlockedCard) {
          setUnlockedPrizeCard(res.newlyUnlockedCard);
        }
      }
    } else {
      // ═══════════════════════════════════════════════════════════
      // MECÁNICA 1: MARGEN DE GRACIA / PARADOJA LEVE
      // Si el año fallado estuvo a <= 10 años de distancia de alguno de los límites de la ranura,
      // se considera "Paradoja Leve": ¡No pierde vida! Solo se resetea la racha y se reubica.
      // ═══════════════════════════════════════════════════════════
      let minDiff = Infinity;
      if (slotIndex > 0) {
        minDiff = Math.min(minDiff, Math.abs(currentCard.year - timeline[slotIndex - 1].year));
      }
      if (slotIndex < timeline.length) {
        minDiff = Math.min(minDiff, Math.abs(currentCard.year - timeline[slotIndex].year));
      }

      const esParadojaLeve = minDiff <= 10 && modo !== "supervivencia" && modo !== "duelo";

      if (esParadojaLeve) {
        playSfx("tap");
        setComboStreak(0);
        setLupaActive(false);
        setAnclaActive(false);
        setFrozenSlots([]);

        // Encuentra la posición exacta correcta e inserta la carta sin perder vida
        const correctIndex = timeline.findIndex((c) => c.year > currentCard.year);
        const targetIndex = correctIndex === -1 ? timeline.length : correctIndex;
        const nextTimeline = [...timeline];
        nextTimeline.splice(targetIndex, 0, currentCard);
        setTimeline(nextTimeline);
        setJustPlacedId(currentCard.id);
        setTimeout(() => setJustPlacedId(null), 2500);

        setScore((prev) => prev + 1);
        setLastFeedback({
          type: "warning",
          message: `⚠️ ¡Paradoja Leve! Estuviste a solo ${minDiff} años (${currentCard.yearFormatted}). ¡Salvado por el continuo temporal!`,
        });
        toast.warning(`⚠️ ¡Casi aciertas! A solo ${minDiff} años. ¡No pierdes vida!`);

        if (pool.length > 0) {
          setCurrentCard(pool[0]);
          setPool(pool.slice(1));
        } else {
          setGameState("victory");
        }
        return;
      }

      playSfx("wrong");
      if (navigator?.vibrate) navigator.vibrate([100, 50, 100]);

      // Reiniciar multiplicador de combo
      setComboStreak(0);

      const nextLives = lives - 1;
      setLives(nextLives);
      setMascotStatus("wrong");

      setLupaActive(false);
      setAnclaActive(false);
      setFrozenSlots([]);

      setLastFeedback({
        type: "wrong",
        message: `¡Fallaste! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}, no en esa posición.`,
      });

      if (nextLives <= 0) {
        setGameState("gameover");
        setMascotStatus("gameover");
        recordGameResult({ won: false, cardsPlaced: score, category: categoryId, mode: modo });
        return;
      }

      // Si estamos en Duelo contra Menti, ceder el turno a Menti aunque fallemos
      if (modo === "duelo") {
        setTurnoDuelo("menti");
        setMentiThinking(true);
        setMentiCustomMsg("¡Ese fallo te costó caro! Menti toma su turno... 🤖");
        return;
      }

      if (pool.length > 0) {
        const nextCard = pool[0];
        setCurrentCard(nextCard);
        setPool(pool.slice(1));
      }
    }
  };

  const handleRevive = () => {
    const powerups = getPowerups();
    if (powerups.corazones > 0) {
      usePowerup("corazones");
      setLives(1);
      setGameState("playing");
      setMascotStatus("idle");
      playSfx("victory");
      toast.success("💖 ¡Reviviste con tu Segundo Aire!");
    } else if (spendCoins(100)) {
      setLives(1);
      setGameState("playing");
      setMascotStatus("idle");
      playSfx("victory");
      toast.success("💖 ¡Reviviste por 100 monedas!");
    } else {
      toast.error("No tienes vidas extra ni 100 monedas para revivir");
    }
  };

  const getModeTitle = () => {
    if (modo === "contrarreloj") return "⏱️ Contrarreloj 60s";
    if (modo === "supervivencia") return "💀 Supervivencia (1 Vida)";
    if (modo === "duelo") return "⚔️ Duelo vs Menti";
    return `⏳ ${categoryInfo.name}`;
  };

  return (
    <div className={`space-y-3.5 mx-auto select-none pb-48 ${viewMode === "carousel" ? "max-w-3xl" : "max-w-xl"}`}>
      {/* Barra superior de control */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            className="p-2 rounded-xl bg-[#0b1328] hover:bg-[#121c3b] border border-amber-500/30 text-amber-300 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Interruptor de Vista: Deslizador Horizontal vs Ranuras Clásicas */}
          <button
            type="button"
            onClick={handleToggleViewMode}
            title={viewMode === "carousel" ? "Cambiar a vista con ranuras" : "Cambiar a vista deslizador horizontal"}
            className="px-2.5 py-2 rounded-xl bg-[#0b1328] hover:bg-[#121c3b] border border-amber-500/30 text-amber-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-black cursor-pointer active:scale-95"
          >
            {viewMode === "carousel" ? (
              <>
                <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline text-[11px]">Deslizador</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline text-[11px]">Ranuras</span>
              </>
            )}
          </button>
        </div>

        {/* Modo de juego y progreso */}
        <div className="text-center">
          <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block flex items-center justify-center gap-1">
            <span>{getModeTitle()}</span>
          </span>
          {modo === "duelo" ? (
            <div className="flex items-center gap-2 mt-0.5 justify-center">
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                Tú: {score}
              </span>
              <span className="text-[10px] text-white/50">VS</span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                Menti: {mentiScore}
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                (Meta: {targetGoal})
              </span>
            </div>
          ) : (
            <span className="text-sm font-black text-white">
              {score} / {targetGoal} cartas
            </span>
          )}
        </div>

        {/* Contador de tiempo o vidas */}
        <div className="flex items-center gap-2">
          {/* Indicador de Combo de Racha */}
          {comboStreak >= 2 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs border shadow-sm animate-pulse ${
              comboStreak >= 6 
                ? "bg-purple-600/30 border-purple-400 text-purple-300 shadow-purple-500/30"
                : "bg-amber-500/25 border-amber-400 text-amber-300 shadow-amber-500/25"
            }`}>
              <span>🔥</span>
              <span>x{comboStreak >= 6 ? 3 : 2}</span>
            </div>
          )}

          {modo === "contrarreloj" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-sm">
              <Timer className="w-4 h-4 animate-pulse" />
              <span>{timeLeft}s</span>
            </div>
          ) : (
            <LivesDisplay lives={lives} maxLives={maxLives} />
          )}
        </div>
      </div>

      {/* Selector Opcional de Modo Ciego (Apuesta Hardcore al iniciar) */}
      {score === 0 && modo === "clasico" && (
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/30 to-purple-950/40 border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">💀</span>
            <div>
              <p className="font-extrabold text-amber-100">Modo Ciego Hardcore</p>
              <p className="text-[10px] text-amber-300/70">Oculta años del tablero · Apuesta 50 🪙 ➔ Gana 300 🪙</p>
            </div>
          </div>
          <button
            onClick={handleToggleHardcore}
            className={`px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all border ${
              hardcoreMode
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30"
                : "bg-white/10 hover:bg-white/15 text-white/80 border-white/20"
            }`}
          >
            {hardcoreMode ? "✓ Activado" : "Apostar"}
          </button>
        </div>
      )}

      {/* Indicador de turno en Duelo contra Menti */}
      {modo === "duelo" && gameState === "playing" && (
        <div className={`p-2.5 rounded-2xl border text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
          turnoDuelo === "jugador"
            ? "bg-blue-950/80 border-blue-400/60 text-blue-200 shadow-blue-500/20"
            : "bg-purple-950/80 border-purple-400/60 text-purple-200 shadow-purple-500/20 animate-pulse"
        }`}>
          {turnoDuelo === "jugador" ? (
            <>
              <Swords className="w-4 h-4 text-blue-400" />
              <span>👉 Tu Turno: Ubica la carta en su época histórica</span>
            </>
          ) : (
            <>
              <Hourglass className="w-4 h-4 text-purple-400 animate-spin" />
              <span>🤖 Turno de Menti: Analizando coordenadas temporales...</span>
            </>
          )}
        </div>
      )}

      {/* Menti Mascot Flotante Permanente (estilo Estudio Bíblico) */}
      <MentrixMascot
        status={mascotStatus}
        layout="floating"
        customMessage={mentiCustomMsg}
        modo={modo}
        streak={score}
      />

      {/* Feedback de última acción */}
      {lastFeedback && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all shadow-md ${
            lastFeedback.type === "correct"
              ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/70 border-red-500/50 text-red-200"
          }`}
        >
          {lastFeedback.type === "correct" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{lastFeedback.message}</span>
        </div>
      )}

      {/* ========================================================
          RENDERIZADO DUAL: DESLIZADOR HORIZONTAL vs RANURAS CLÁSICAS
         ======================================================== */}
      {viewMode === "carousel" ? (
        <div className="space-y-2">
          {turnoDuelo === "menti" ? (
            <div className="p-4 rounded-3xl bg-purple-950/60 border border-purple-400/40 text-center text-xs font-black text-purple-200 animate-pulse">
              🤖 Esperando la jugada de Menti...
            </div>
          ) : (
            <>
              {/* Barra de Poderes y Facultades */}
              <PowerupsBar
                onUseLupa={handleUseLupa}
                onUseCongelador={handleUseCongelador}
                onUseCorazon={handleUseCorazon}
                onUseSalto={handleUseSalto}
                onUseAncla={handleUseAncla}
                lupaActive={lupaActive}
                congeladorActive={frozenSlots.length > 0}
                anclaActive={anclaActive}
                saltoUsed={saltoUsed}
                lives={lives}
                maxLives={maxLives}
              />

              {/* Vista Deslizador / Carrusel Horizontal */}
              <HorizontalTimelineSlider
                timeline={timeline}
                currentCard={currentCard}
                targetGoal={targetGoal}
                score={score}
                lives={lives}
                maxLives={maxLives}
                categoryInfo={categoryInfo}
                onInsert={handleInsert}
                disabled={gameState !== "playing" || turnoDuelo === "menti"}
                frozenSlots={frozenSlots}
                lupaActive={lupaActive}
                anclaActive={anclaActive}
                hardcoreMode={hardcoreMode}
                justPlacedId={justPlacedId}
              />
            </>
          )}
        </div>
      ) : (
        /* Vista Clásica con Ranuras Verticales */
        <>
          {/* Carta en mano activa */}
          {gameState === "playing" && currentCard && (
            <div className="sticky top-2 z-20 py-1 space-y-2 bg-[#0a0e1a]/95">
              {turnoDuelo === "menti" ? (
                <div className="p-4 rounded-3xl bg-purple-950/60 border border-purple-400/40 text-center text-xs font-black text-purple-200 animate-pulse">
                  🤖 Esperando la jugada de Menti...
                </div>
              ) : (
                <>
                  <CurrentCardHand
                    event={currentCard}
                    cardsPlaced={score}
                    targetGoal={targetGoal}
                    lupaActive={lupaActive}
                    anclaActive={anclaActive}
                  />

                  {/* Barra de Poderes y Facultades */}
                  <PowerupsBar
                    onUseLupa={handleUseLupa}
                    onUseCongelador={handleUseCongelador}
                    onUseCorazon={handleUseCorazon}
                    onUseSalto={handleUseSalto}
                    onUseAncla={handleUseAncla}
                    lupaActive={lupaActive}
                    congeladorActive={frozenSlots.length > 0}
                    anclaActive={anclaActive}
                    saltoUsed={saltoUsed}
                    lives={lives}
                    maxLives={maxLives}
                  />
                </>
              )}
            </div>
          )}

          {/* ========================================================
              TABLERO CRONOLÓGICO: EL CONDUCTO TEMPORAL INTERACTIVO
             ======================================================== */}
          <div className="relative py-2">
            {/* Marcador Cósmico de Antigüedad */}
            <div className="flex items-center justify-center mb-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span>🏛️</span>
                <span>COMIENZO DE LA HISTORIA · PASADO REMOTO</span>
                <Hourglass className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>

            {/* Tablero con Eje Cronológico Luminoso Continuo */}
            <div className="space-y-1 relative">
              {/* EJE CENTRAL DE ENERGÍA TEMPORAL (Línea vertical continua dorada) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-500/20 via-amber-400/50 to-blue-500/30 pointer-events-none shadow-[0_0_8px_rgba(245,158,11,0.3)]" />

              {/* Ranura 0 (Antes del primer evento) */}
              <TimelineSlot
                onSelect={() => handleInsert(0)}
                disabled={gameState !== "playing" || turnoDuelo === "menti"}
                isFrozen={frozenSlots.includes(0)}
                nextYear={timeline[0]?.yearFormatted}
              />

              {/* Renderizado de eventos en orden */}
              {timeline.map((event, idx) => (
                <React.Fragment key={event.id}>
                  <TimelineCard 
                    event={event} 
                    index={idx} 
                    status={justPlacedId === event.id ? "justPlaced" : "default"}
                    hardcoreMode={hardcoreMode}
                  />

                  {/* Ranura entre eventos o al final */}
                  <TimelineSlot
                    onSelect={() => handleInsert(idx + 1)}
                    disabled={gameState !== "playing" || turnoDuelo === "menti"}
                    isFrozen={frozenSlots.includes(idx + 1)}
                    prevYear={event.yearFormatted}
                    nextYear={timeline[idx + 1]?.yearFormatted}
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Marcador Cósmico del Futuro / Presente */}
            <div className="flex items-center justify-center mt-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>ÉPOCA ACTUAL · PRESENTE HISTÓRICO</span>
                <span>⚡</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODALES DE FIN DE PARTIDA (Victoria / Derrota)
         ======================================================== */}
      {(gameState === "victory" || gameState === "gameover") && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#0c1630] to-[#090d1c] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-amber-500/20">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg bg-amber-500/20 border border-amber-500/40">
              {gameState === "victory" ? "🏆" : "💀"}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-amber-100">
                {modo === "duelo"
                  ? gameState === "victory"
                    ? "¡LE GANASTE A MENTI!"
                    : "MENTI GANÓ EL DUELO"
                  : gameState === "victory"
                  ? "¡VICTORIA TEMPORAL!"
                  : "FIN DE LA PARTIDA"}
              </h3>
              <p className="text-xs text-amber-200/70 font-medium">
                {modo === "duelo"
                  ? gameState === "victory"
                    ? `Lograste ${score} cartas antes de que Menti alcanzara la meta. ¡Eres un verdadero maestro crononauta!`
                    : `Menti logró ${mentiScore} cartas superando tus ${score}. ¡Entrena y tómate la revancha!`
                  : gameState === "victory"
                  ? "Lograste posicionar las cartas sin quebrar el curso de la historia."
                  : `Colocaste ${score} cartas correctamente en su siglo.`}
              </p>
            </div>

            {/* Carta de Aprendizaje Desbloqueada como Recompensa en Victoria */}
            {gameState === "victory" && unlockedPrizeCard && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#102048] to-[#0c1630] border-2 border-amber-400 text-left space-y-2 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ¡RELIQUIA COLECCIONADA!
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    +{unlockedPrizeCard.recompensaMonedas} 🪙
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-black/40 border border-amber-400/50 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {unlockedPrizeCard.icono}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                      {unlockedPrizeCard.title}
                    </h4>
                    <p className="text-[10px] text-amber-300 font-bold mt-0.5">
                      {unlockedPrizeCard.yearFormatted} · {unlockedPrizeCard.personajeClave}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-black/35 border border-white/10 text-[11px] text-amber-100/90 leading-snug">
                  💡 <strong>¿Sabías que?</strong> {unlockedPrizeCard.sabiasQue}
                </div>

                <Link
                  to="/estadisticas?tab=codice"
                  className="block text-center py-1.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[11px] font-black uppercase tracking-wider transition-colors"
                >
                  Abrir Ficha en el Museo 📖
                </Link>
              </div>
            )}

            {/* Ficha Educativa del Hito cuando el jugador pierde (Aprende del Error) */}
            {gameState === "gameover" && currentCard && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-[#0e1b38] to-[#091024] border border-blue-400/40 text-left space-y-2 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/40">
                    📖 APRENDE DE ESTE HITO
                  </span>
                  <span className="text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full">
                    {currentCard.yearFormatted}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    {currentCard.title}
                  </h4>
                  {currentCard.personajeClave && (
                    <p className="text-[10px] text-amber-300 font-bold mt-0.5">
                      👤 {currentCard.personajeClave} {currentCard.siglo ? `· ${currentCard.siglo}` : ""}
                    </p>
                  )}
                </div>

                {currentCard.description && (
                  <p className="text-[11px] text-white/80 leading-relaxed">
                    {currentCard.description}
                  </p>
                )}

                {currentCard.datoCurioso && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[10px] text-amber-100/90 leading-snug">
                    💡 <strong>¿Sabías que?</strong> {currentCard.datoCurioso}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2">
              {/* Opción de revivir en Game Over */}
              {gameState === "gameover" && modo !== "contrarreloj" && modo !== "duelo" && (
                <button
                  type="button"
                  onClick={handleRevive}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Revivir (Segundo Aire · 100 🪙)</span>
                </button>
              )}

              {/* Compartir Hazaña en Victoria */}
              {gameState === "victory" && (
                <button
                  type="button"
                  onClick={() => {
                    playSfx("tap");
                    setShowShareModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-cyan-200" />
                  <span>Compartir Hazaña (Tarjeta Ilustrada)</span>
                </button>
              )}

              <button
                type="button"
                onClick={startNewGame}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar de Nuevo</span>
              </button>

              <Link
                to="/tienda"
                className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Ir a la Tienda de Monedas</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Compartir Victoria */}
      <HistoryShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        mode="victoria"
        gameStats={{
          score,
          categoryName: categoryInfo?.name || "Historia General",
        }}
      />
    </div>
  );
}
