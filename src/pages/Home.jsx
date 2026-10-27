import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Play, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Globe, 
  BookOpen, 
  Rocket, 
  Music, 
  Film,
  Trophy,
  Flame,
  Zap
} from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import MentrixMascot from "@/components/game/MentrixMascot";
import { getHighScore, getStreak } from "@/utils/gameStorage";

const ICON_MAP = {
  Sparkles,
  Globe,
  BookOpen,
  Rocket,
  Music,
  Film,
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState("caos");
  const highScore = getHighScore();
  const streak = getStreak();

  const handleStartGame = (catId = selectedCat) => {
    navigate(`/juego?cat=${catId}`);
  };

  return (
    <div className="space-y-6">
      {/* Menti Mascot Header */}
      <div className="flex justify-center">
        <MentrixMascot status="idle" />
      </div>

      {/* Hero Play Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Desafío Cronológico</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            ¿Qué acontecimiento ocurrió primero?
          </h2>

          <p className="text-sm text-white/70 leading-relaxed">
            Ordena los sucesos de la historia humana, la biblia, la ciencia y la cultura en la línea temporal.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handleStartGame()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>JUGAR AHORA</span>
            </button>

            <Link
              to="/desafio"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-5 py-3.5 rounded-2xl transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Desafío Diario</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase font-semibold">Mayor Línea</p>
            <p className="text-lg font-black text-white">{highScore} cartas</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase font-semibold">Racha Activa</p>
            <p className="text-lg font-black text-white">{streak} días</p>
          </div>
        </div>
      </div>

      {/* Categories Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Elige tu Mazo</h3>
          <Link to="/categorias" className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1">
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = selectedCat === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCat(cat.id);
                  handleStartGame(cat.id);
                }}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-white/10 border-blue-400/60 shadow-lg shadow-blue-500/10"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-white/50">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-600 flex items-center justify-center text-white/40 group-hover:text-white transition-all">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
