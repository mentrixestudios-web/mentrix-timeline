import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Rocket, 
  Music, 
  Film,
  Play,
  Hourglass
} from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { getEventsByCategory } from "@/data/eventsData";

const ICON_MAP = {
  Sparkles,
  Globe,
  BookOpen,
  Rocket,
  Music,
  Film,
};

export default function Categorias() {
  const navigate = useNavigate();

  const handleSelect = (catId) => {
    navigate(`/juego?cat=${catId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-[#0b1328] hover:bg-[#121c3b] border border-amber-500/30 text-amber-300 hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
            <span>Mazos y Épocas</span>
            <Hourglass className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-amber-200/60 font-medium">Elige la temática de acontecimientos para tu viaje en el tiempo</p>
        </div>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          const count = getEventsByCategory(cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-gradient-to-br from-[#0c162e] via-[#0b1328] to-[#0e1a38] border border-amber-500/25 hover:border-amber-400/70 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/15 group shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-lg border border-white/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    {count} acontecimientos
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-bold mt-0.5">
                    {cat.subtitle}
                  </p>
                </div>

                <p className="text-xs text-amber-100/70 leading-relaxed font-medium">
                  {cat.description}
                </p>
              </div>

              <div className="pt-5">
                <button
                  onClick={() => handleSelect(cat.id)}
                  className="w-full flex items-center justify-center gap-2 bg-[#0e1933] hover:bg-gradient-to-r hover:from-amber-400 hover:to-yellow-500 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-slate-950 font-black py-3 rounded-2xl transition-all shadow-md group-hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Jugar Este Mazo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
