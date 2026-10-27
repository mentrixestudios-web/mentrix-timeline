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
  Hourglass,
  Compass
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
      {/* Menti Mascot Hero con Casco Romano y Reloj de Arena */}
      <MentrixMascot status="idle" layout="hero" />

      {/* Hero Play Card con estética de pergamino y viajero temporal */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#091228] to-[#121c3b] border border-amber-500/35 p-6 sm:p-8 shadow-[0_12px_40px_rgba(11,19,43,0.6)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-wider">Desafío Cronológico</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            ¿Qué acontecimiento ocurrió primero en la historia?
          </h2>

          <p className="text-sm text-amber-100/75 leading-relaxed font-medium">
            Viaja a través de los siglos. Ordena invenciones, batallas, eventos bíblicos y momentos cumbre en la línea temporal sin quebrar el curso de la historia.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handleStartGame()}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-7 py-4 rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all border border-amber-300/60"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>JUGAR AHORA</span>
            </button>

            <Link
              to="/desafio"
              className="flex items-center justify-center gap-2 bg-[#0e1933] hover:bg-[#132247] border border-amber-500/30 text-amber-200 font-bold px-5 py-4 rounded-2xl transition-all shadow-sm"
            >
              <Hourglass className="w-4 h-4 text-amber-400" />
              <span>Desafío Diario</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid estilo relicario / viajero del tiempo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0b1328]/90 border border-amber-500/25 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-amber-200/60 uppercase font-black tracking-wider">Mayor Línea</p>
            <p className="text-xl font-black text-white">{highScore} cartas</p>
          </div>
        </div>

        <div className="bg-[#0b1328]/90 border border-orange-500/25 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-[10px] text-orange-200/60 uppercase font-black tracking-wider">Racha Activa</p>
            <p className="text-xl font-black text-white">{streak} días</p>
          </div>
        </div>
      </div>

      {/* Categories Selector */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <h3 className="text-base font-extrabold text-white">Elige tu Mazo Temporal</h3>
          </div>
          <Link to="/categorias" className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1">
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    ? "bg-[#0f1b3d] border-amber-400/60 shadow-lg shadow-amber-500/10"
                    : "bg-[#0b1328]/80 border-white/10 hover:bg-[#0f1a38] hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-white/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-amber-100/60 font-medium">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-white/40 transition-all">
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
