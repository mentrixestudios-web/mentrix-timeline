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
  HelpCircle
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
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3b82f6", "#10b981", "#f59e0b"]
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
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
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
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Barra superior de control */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Categoría y progreso */}
        <div className="text-center">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
            {categoryInfo.name}
          </span>
          <span className="text-sm font-extrabold text-white">
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
          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            lastFeedback.type === "correct"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/60 border-red-500/40 text-red-300"
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
        <div className="sticky top-16 z-20 py-2 bg-[#0a0e1a]/90 backdrop-blur-md">
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
        <div className="flex items-center justify-center mb-2">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <span>Pasado remoto</span>
            <span>━━━━━ ⏳ ━━━━━</span>
            <span>Hacia el presente</span>
          </span>
        </div>

        <div className="space-y-1 relative">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg">
              {gameState === "victory" ? "🏆" : "💀"}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                {gameState === "victory" ? "¡VICTORIA TEMPORAL!" : "FIN DE LA PARTIDA"}
              </h3>
              <p className="text-xs text-white/60">
                {gameState === "victory"
                  ? "Lograste posicionar 10 acontecimientos sin quebrar la historia."
                  : "El tiempo fue implacable. ¿Te atreves a intentarlo de nuevo?"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-around">
              <div>
                <p className="text-[10px] text-white/50 uppercase font-semibold">Cartas</p>
                <p className="text-xl font-black text-white">{score}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[10px] text-white/50 uppercase font-semibold">Recompensa</p>
                <p className="text-xl font-black text-amber-400">+{score * 10} 🪙</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={startNewGame}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar de nuevo</span>
              </button>

              <Link
                to="/categorias"
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white/80 font-semibold py-3 rounded-2xl transition-all"
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
