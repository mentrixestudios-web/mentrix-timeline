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
  Hourglass
} from "lucide-react";
import { getEventsByCategory } from "@/data/eventsData";
import { CATEGORIES } from "@/data/categories";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import CurrentCardHand from "@/components/game/CurrentCardHand";
import LivesDisplay from "@/components/game/LivesDisplay";
import MentrixMascot from "@/components/game/MentrixMascot";
import { addCoins, recordGameResult } from "@/utils/gameStorage";

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

  // Iniciar partida
  useEffect(() => {
    startNewGame();
  }, [categoryId]);

  const startNewGame = () => {
    const rawEvents = getEventsByCategory(categoryId);
    // Shuffle array
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
  };

  const handleInsert = (slotIndex) => {
    if (gameState !== "playing" || !currentCard) return;

    // Validar orden cronológico
    let isCorrect = true;

    // Debe ser >= que el elemento anterior (si existe)
    if (slotIndex > 0 && currentCard.year < timeline[slotIndex - 1].year) {
      isCorrect = false;
    }

    // Debe ser <= que el elemento posterior (si existe)
    if (slotIndex < timeline.length && currentCard.year > timeline[slotIndex].year) {
      isCorrect = false;
    }

    if (isCorrect) {
      // ÉXITO
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#eab308", "#3b82f6", "#10b981"]
      });

      const nextTimeline = [...timeline];
      nextTimeline.splice(slotIndex, 0, currentCard);
      setTimeline(nextTimeline);

      const nextScore = score + 1;
      setScore(nextScore);
      addCoins(10);
      setMascotStatus("correct");

      setLastFeedback({
        type: "correct",
        message: `¡Correcto! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}.`
      });

      // Verificar Victoria
      if (nextScore >= targetGoal) {
        setGameState("victory");
        setMascotStatus("victory");
        recordGameResult({ won: true, cardsPlaced: nextScore, category: categoryId });
        addCoins(50); // Bonus por victoria
        confetti({ particleCount: 130, spread: 100, origin: { y: 0.5 } });
        return;
      }

      // Sacar siguiente carta
      if (pool.length > 0) {
        const nextCard = pool[0];
        setCurrentCard(nextCard);
        setPool(pool.slice(1));
      } else {
        // Pool agotado = victoria
        setGameState("victory");
        setMascotStatus("victory");
        recordGameResult({ won: true, cardsPlaced: nextScore, category: categoryId });
      }
    } else {
      // ERROR
      if (navigator?.vibrate) navigator.vibrate([100, 50, 100]);

      const nextLives = lives - 1;
      setLives(nextLives);
      setMascotStatus("wrong");

      setLastFeedback({
        type: "wrong",
        message: `¡Fallaste! ${currentCard.title} ocurrió en ${currentCard.yearFormatted}, no en esa posición.`
      });

      if (nextLives <= 0) {
        setGameState("gameover");
        setMascotStatus("gameover");
        recordGameResult({ won: false, cardsPlaced: score, category: categoryId });
      } else {
        // Reemplazar carta fallida por otra para seguir intentando
        if (pool.length > 0) {
          const nextCard = pool[0];
          setCurrentCard(nextCard);
          setPool(pool.slice(1));
        }
      }
    }
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
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
        <div className="sticky top-14 md:top-6 z-20 py-2 bg-[#0a0e1a]/95 backdrop-blur-md">
          <CurrentCardHand
            event={currentCard}
            cardsPlaced={score}
            targetGoal={targetGoal}
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
          <div className="bg-gradient-to-b from-[#0c1630] to-[#090d1c] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl shadow-amber-500/20">
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
                  : "El tiempo fue implacable. ¿Te atreves a intentarlo de nuevo?"}
              </p>
            </div>

            <div className="bg-[#0b1328] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-around shadow-inner">
              <div>
                <p className="text-[10px] text-amber-200/60 uppercase font-black">Cartas</p>
                <p className="text-xl font-black text-white">{score}</p>
              </div>
              <div className="w-px h-8 bg-amber-500/20" />
              <div>
                <p className="text-[10px] text-amber-200/60 uppercase font-black">Recompensa</p>
                <p className="text-xl font-black text-amber-400">+{score * 10} 🪙</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={startNewGame}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/30"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Jugar de nuevo</span>
              </button>

              <Link
                to="/categorias"
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-amber-500/20 text-amber-200 font-bold py-3 rounded-2xl transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Cambiar de Mazo</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
