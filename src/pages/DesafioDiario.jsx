import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Coins, 
  Flame, 
  Play, 
  Sparkles,
  RotateCcw
} from "lucide-react";
import { getEventsByCategory } from "@/data/eventsData";
import { addCoins } from "@/utils/gameStorage";

export default function DesafioDiario() {
  const navigate = useNavigate();
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `timeline_daily_done_${todayKey}`;

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  const handleStartDaily = () => {
    navigate("/juego?cat=caos&mode=daily");
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white">Desafío Diario</h2>
          <p className="text-xs text-white/50">Un reto exclusivo cada 24 horas</p>
        </div>
      </div>

      {/* Daily Card Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-indigo-950/80 border border-amber-500/30 p-6 sm:p-8 space-y-5 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/30">
          ⏳
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
          <h3 className="text-2xl font-black text-white">
            {isCompleted ? "¡Desafío Diario Completado!" : "La Línea del Día"}
          </h3>
          <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
            {isCompleted
              ? "Has superado el reto de hoy con éxito. Vuelve mañana para continuar tu racha de sabiduría temporal."
              : "Posiciona 5 acontecimientos históricos sorpresa sin romper la continuidad del tiempo."}
          </p>
        </div>

        {/* Recompensa */}
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-2xl font-extrabold text-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Recompensa: +100 Monedas</span>
        </div>

        <div className="pt-2">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 py-3.5 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" />
              <span>Completado por hoy</span>
            </div>
          ) : (
            <button
              onClick={handleStartDaily}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.01]"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>COMENZAR DESAFÍO</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
