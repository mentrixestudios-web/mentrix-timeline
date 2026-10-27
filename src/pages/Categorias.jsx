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
  Layers
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
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white">Mazos y Épocas</h2>
          <p className="text-xs text-white/50">Elige la temática de acontecimientos para tu partida</p>
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
              className="bg-slate-900/80 border border-white/10 hover:border-blue-500/50 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                    {count} acontecimientos
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-blue-300/80 font-medium mt-0.5">
                    {cat.subtitle}
                  </p>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-5">
                <button
                  onClick={() => handleSelect(cat.id)}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white font-bold py-3 rounded-2xl transition-all shadow-md group-hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Jugar Mazo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
