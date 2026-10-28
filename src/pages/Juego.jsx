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
  ShoppingBag
} from "lucide-react";
import { getEventsByCategory } from "@/data/eventsData";
import { CATEGORIES } from "@/data/categories";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import CurrentCardHand from "@/components/game/CurrentCardHand";
import LivesDisplay from "@/components/game/LivesDisplay";
import MentrixMascot from "@/components/game/MentrixMascot";
import PowerupsBar from "@/components/game/PowerupsBar";
import { addCoins, recordGameResult, getPowerups, usePowerup, spendCoins } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

export default function Juego() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryId = searchParams.get("cat") || "caos";
  const categoryInfo = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  const [pool, setPool] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [targetGoal] = useState(10);
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'revealing' | 'victory' | 'gameover'
  const [mascotStatus, setMascotStatus] = useState("idle");
  const [lastFeedback, setLastFeedback] = useState(null);

  // Estados de poderes activos en la carta actual
  const [lupaActive, setLupaActive] = useState(false);
  const [frozenSlots, setFrozenSlots] = useState([]);

  // Iniciar partida
  useEffect(() => {
    startNewGame();
  }, [categoryId]);

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
    setLives(3);
    setScore(0);
    setGameState("playing");
    setMascotStatus("idle");
    setLastFeedback(null);
    setLupaActive(false);
    setFrozenSlots([]);
  };

  const handleUseLupa = () => {
    setLupaActive(true);
    playSfx("tap");
  };

  const handleUseCongelador = () => {
    if (!currentCard) return;
    // Encontrar qué ranuras son incorrectas
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

    // Congelar hasta 2 ranuras incorrectas al azar
    const toFreeze = wrongSlots.sort(() => Math.random() - 0.5).slice(0, 2);
    setFrozenSlots(toFreeze);
    playSfx("tap");
  };

  const handleUseCorazon = () => {
    setLives((prev) => Math.min(3, prev + 1));
    playSfx("victory");
  };

  const handleInsert = (slotIndex) => {
    if (gameState !== "playing" || !currentCard) return;
    if (frozenSlots.includes(slotIndex)) {
      toast.error("Esa ranura está congelada porque es incorrecta");
      return;
    }

    // Validar orden cronológico
    let isCorrect = true;

    // Debe ser >= que el elemento anterior
    if (slotIndex > 0 && currentCard.year < timeline[slotIndex - 1].year) {
      isCorrect = false;
    }

    // Debe ser <= que el elemento posterior
    if (slotIndex < timeline.length && currentCard.year > timeline[slotIndex].year) {
      isCorrect = false;
    }

    if (isCorrect) {
      playSfx("correct");
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#eab308", "#3b82f6", "#10b981"],
      });

      const nextTimeline = [...timeline];
      nextTimeline.splice(slotIndex, 0, currentCard);
      setTimeline(nextTimeline);

      const nextScore = score + 1;
      setScore(nextScore);
      addCoins(10);
      setMascotStatus("correct");

      // Reset de poderes para la siguiente carta
      setLupaActive(false);
      setFrozenSlots([]);

      setLastFeedback({
        type: "correct",
        message: `¡Correcto! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}.`,
      });

      // Verificar Victoria
      if (nextScore >= targetGoal) {
        setGameState("victory");
        setMascotStatus("victory");
        playSfx("victory");
        recordGameResult({ won: true, cardsPlaced: nextScore, category: categoryId });
        addCoins(50);
        confetti({ particleCount: 130, spread: 100, origin: { y: 0.5 } });
        return;
      }

      // Sacar siguiente carta
      if (pool.length > 0) {
        const nextCard = pool[0];
        setCurrentCard(nextCard);
        setPool(pool.slice(1));
      } else {
        setGameState("victory");
        setMascotStatus("victory");
        playSfx("victory");
        recordGameResult({ won: true, cardsPlaced: nextScore, category: categoryId });
      }
    } else {
      // ERROR
      playSfx("wrong");
      if (navigator?.vibrate) navigator.vibrate([100, 50, 100]);

      const nextLives = lives - 1;
      setLives(nextLives);
      setMascotStatus("wrong");

      // Reset poderes
      setLupaActive(false);
      setFrozenSlots([]);

      setLastFeedback({
        type: "wrong",
        message: `¡Fallaste! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}, no en esa posición.`,
      });

      if (nextLives <= 0) {
        setGameState("gameover");
        setMascotStatus("gameover");
        recordGameResult({ won: false, cardsPlaced: score, category: categoryId });
      } else {
        if (pool.length > 0) {
          const nextCard = pool[0];
          setCurrentCard(nextCard);
          setPool(pool.slice(1));
        }
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

  return (
    <div className="space-y-4 max-w-xl mx-auto select-none">
      {/* Barra superior de control */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-[#0b1328] hover:bg-[#121c3b] border border-amber-500/30 text-amber-300 hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Categoría y progreso */}
        <div className="text-center">
          <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block flex items-center justify-center gap-1">
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span>{categoryInfo.name}</span>
          </span>
          <span className="text-sm font-black text-white">
            {score} / {targetGoal} cartas
          </span>
        </div>

        {/* Vidas */}
        <LivesDisplay lives={lives} maxLives={3} />
      </div>

      {/* Menti Mascot reactivo */}
      <div className="flex justify-center">
        <MentrixMascot status={mascotStatus} size="sm" />
      </div>

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

      {/* Carta en mano activa */}
      {gameState === "playing" && currentCard && (
        <div className="sticky top-2 z-20 py-1 space-y-2 bg-[#0a0e1a]/95 backdrop-blur-md">
          <CurrentCardHand
            event={currentCard}
            cardsPlaced={score}
            targetGoal={targetGoal}
            lupaActive={lupaActive}
          />

          {/* Barra de Poderes y Facultades */}
          <PowerupsBar
            onUseLupa={handleUseLupa}
            onUseCongelador={handleUseCongelador}
            onUseCorazon={handleUseCorazon}
            lupaActive={lupaActive}
            congeladorActive={frozenSlots.length > 0}
            lives={lives}
            maxLives={3}
          />
        </div>
      )}

      {/* ========================================================
          LA LÍNEA DE TIEMPO INTERACTIVA
         ======================================================== */}
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
              onSelect={() => handleInsert(0)}
              disabled={gameState !== "playing"}
              isFrozen={frozenSlots.includes(0)}
              label="Antes de todo"
            />
          </div>

          {/* Renderizado de eventos en orden */}
          {timeline.map((event, idx) => (
            <React.Fragment key={event.id}>
              <TimelineCard event={event} index={idx} />

              {/* Ranura entre eventos o al final */}
              <div className="flex justify-center">
                <TimelineSlot
                  onSelect={() => handleInsert(idx + 1)}
                  disabled={gameState !== "playing"}
                  isFrozen={frozenSlots.includes(idx + 1)}
                  label={idx === timeline.length - 1 ? "Después de todo" : "En medio"}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ========================================================
          MODALES DE FIN DE PARTIDA (Victoria / Derrota)
         ======================================================== */}
      {(gameState === "victory" || gameState === "gameover") && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#0c1630] to-[#090d1c] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-amber-500/20">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg bg-amber-500/20 border border-amber-500/40">
              {gameState === "victory" ? "🏆" : "💀"}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-amber-100">
                {gameState === "victory" ? "¡VICTORIA TEMPORAL!" : "FIN DE LA PARTIDA"}
              </h3>
              <p className="text-xs text-amber-200/70 font-medium">
                {gameState === "victory"
                  ? "Lograste posicionar 10 acontecimientos sin quebrar el curso de la historia."
                  : `Colocaste ${score} cartas en su lugar correcto.`}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Opción de revivir en Game Over */}
              {gameState === "gameover" && (
                <button
                  type="button"
                  onClick={handleRevive}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Revivir (Segundo Aire · 100 🪙)</span>
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
    </div>
  );
}
