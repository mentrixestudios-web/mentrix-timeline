import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Target, 
  CheckCircle2, 
  Zap, 
  Layers,
  Coins
} from "lucide-react";
import { getStats, getHighScore, getStreak, getCoins } from "@/utils/gameStorage";

export default function Estadisticas() {
  const stats = getStats();
  const highScore = getHighScore();
  const streak = getStreak();
  const coins = getCoins();

  const winRate = stats.partidasJugadas > 0
    ? Math.round((stats.partidasGanadas / stats.partidasJugadas) * 100)
    : 0;

  const statCards = [
    {
      title: "Mayor Línea",
      value: `${highScore} cartas`,
      desc: "Tu récord consecutivo",
      icon: Trophy,
      color: "from-amber-500 to-yellow-600",
      textColor: "text-amber-400"
    },
    {
      title: "Racha Activa",
      value: `${streak} días`,
      desc: "Días seguidos jugando",
      icon: Flame,
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-400"
    },
    {
      title: "Partidas Ganadas",
      value: `${stats.partidasGanadas} / ${stats.partidasJugadas}`,
      desc: `Efectividad: ${winRate}%`,
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-400"
    },
    {
      title: "Cartas Colocadas",
      value: `${stats.cartasColocadasTotal}`,
      desc: "Acontecimientos ordenados",
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-400"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white">Tus Récords</h2>
          <p className="text-xs text-white/50">Tu dominio de la historia humana</p>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 flex items-center gap-4 shadow-lg"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-white">{card.value}</p>
                <p className={`text-xs font-semibold ${card.textColor}`}>{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de monedas */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Coins className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Balance de Monedas</h4>
            <p className="text-xs text-white/50">Gana +10 🪙 por cada evento ordenado correctamente</p>
          </div>
        </div>

        <span className="text-2xl font-black text-amber-400">
          {coins} 🪙
        </span>
      </div>
    </div>
  );
}
