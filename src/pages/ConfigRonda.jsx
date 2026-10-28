import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Rocket, 
  Music, 
  Film,
  Play,
  Hourglass,
  Swords,
  Timer,
  Skull,
  CheckCircle2,
  Layers,
  Flame,
  Check
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { CATEGORIES } from "@/data/categories";
import { getEventsByCategory } from "@/data/eventsData";
import { playSfx } from "@/utils/soundSystem";

const ICON_MAP = {
  Sparkles,
  Globe,
  BookOpen,
  Rocket,
  Music,
  Film,
};

const MODOS_INFO = {
  clasico: {
    nombre: "Línea Temporal",
    subtitulo: "Modo Clásico",
    icono: "⏳",
    color: "from-amber-500/20 to-yellow-600/10 border-amber-400/40 text-amber-300",
    badge: "MODO ESTRELLA ⭐",
    mensajeMenti: "Elige el mazo temático para ordenar la historia sin alterar la línea de tiempo. ⏳",
  },
  duelo: {
    nombre: "Duelo contra Menti",
    subtitulo: "1 vs 1 con la Inteligencia Artificial",
    icono: "⚔️",
    color: "from-purple-500/20 to-indigo-600/10 border-purple-400/40 text-purple-300",
    badge: "VS IA 🤖",
    mensajeMenti: "¡Acepto tu reto! Escoge el mazo y veamos quién de los dos domina los siglos. 😏",
  },
  contrarreloj: {
    nombre: "Contrarreloj Frenético",
    subtitulo: "60 segundos + bonos por acierto",
    icono: "⏱️",
    color: "from-cyan-500/20 to-blue-600/10 border-cyan-400/40 text-cyan-300",
    badge: "FRENESÍ 60s ⚡",
    mensajeMenti: "¡El tiempo corre sin piedad! Elige tu mazo favorito para pensar a toda velocidad. ⏱️",
  },
  supervivencia: {
    nombre: "Supervivencia Extrema",
    subtitulo: "1 sola vida · Máxima tensión",
    icono: "💀",
    color: "from-red-500/20 to-rose-600/10 border-red-400/40 text-red-300",
    badge: "1 SOLA VIDA 🔥",
    mensajeMenti: "Un solo error y la línea colapsa para siempre. ¿Estás listo para el desafío extremo? 💀",
  },
};

export default function ConfigRonda() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modo = searchParams.get("modo") || "clasico";
  const modoData = MODOS_INFO[modo] || MODOS_INFO.clasico;

  // Mazo seleccionado por defecto: "caos"
  const [selectedCat, setSelectedCat] = useState("caos");

  // Dificultad / Longitud de ronda: 5 | 10 | 15 cartas
  const [cartasMeta, setCartasMeta] = useState(10);

  const handleStartGame = () => {
    playSfx("victory");
    const target = modo === "supervivencia" ? 25 : cartasMeta;
    navigate(`/juego?modo=${modo}&cat=${selectedCat}&cartas=${target}`);
  };

  return (
    <div className="space-y-4 select-none pb-12">
      {/* ── HEADER SUPERIOR ── */}
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            playSfx("tap");
            navigate(-1);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/5 ${modoData.color}`}>
            {modoData.badge}
          </span>
        </div>
      </div>

      {/* ── BANNER DEL MODO SELECCIONADO CON MENTI ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-[#111f42] via-[#0d162f] to-[#151c38] border-2 border-amber-400/50 p-4 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 shrink-0">
              {modoData.icono}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                {modoData.nombre}
              </h1>
              <p className="text-xs text-amber-200/80 font-medium">
                {modoData.subtitulo}
              </p>
            </div>
          </div>
          
          <div className="w-12 h-12 shrink-0">
            <MentrixMascot size="xs" showBubble={false} position="center" />
          </div>
        </div>

        <p className="text-[11px] text-white/70 italic mt-3 pt-2.5 border-t border-white/10 leading-relaxed font-medium">
          "{modoData.mensajeMenti}"
        </p>
      </motion.div>

      {/* ── SELECCIÓN DIDÁCTICA DE MAZOS DE CARTAS ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              1. Selecciona tu Mazo de Cartas
            </h2>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">
            {CATEGORIES.length} Temáticas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = selectedCat === cat.id;
            const count = getEventsByCategory(cat.id).length;

            return (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playSfx("tap");
                  setSelectedCat(cat.id);
                }}
                className={`cursor-pointer rounded-2xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between shadow-md ${
                  isSelected
                    ? "bg-gradient-to-br from-[#162752] via-[#101b3b] to-[#1a2347] border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20"
                    : "bg-[#0b1328]/90 border-white/10 hover:border-white/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md border border-white/20`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-amber-200/70 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {count} cartas
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20" />
                      )}
                    </div>
                  </div>

                  <h3 className={`text-sm font-black transition-colors ${isSelected ? "text-amber-300" : "text-white"}`}>
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-amber-200/70 font-semibold line-clamp-1 mt-0.5">
                    {cat.subtitle}
                  </p>
                  <p className="text-[10px] text-white/50 leading-relaxed mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SELECTOR DE LONGITUD / DIFICULTAD (EXCEPTO EN SUPERVIVENCIA) ── */}
      {modo !== "supervivencia" && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 bg-purple-400 rounded-full" />
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              2. Longitud de Ronda
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { cartas: 5, label: "Rápida", desc: "5 cartas", icon: "🟢" },
              { cartas: 10, label: "Estándar", desc: "10 cartas", icon: "🟡" },
              { cartas: 15, label: "Desafío", desc: "15 cartas", icon: "🔴" },
            ].map((d) => {
              const active = cartasMeta === d.cartas;
              return (
                <button
                  key={d.cartas}
                  type="button"
                  onClick={() => {
                    playSfx("tap");
                    setCartasMeta(d.cartas);
                  }}
                  className={`py-2 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-b from-amber-500/25 to-yellow-500/10 border-amber-400 text-white shadow-md shadow-amber-500/20"
                      : "bg-[#0b1328]/90 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <span className="text-xs">{d.icon}</span>
                  <p className="text-xs font-black mt-0.5">{d.label}</p>
                  <p className="text-[9px] text-amber-200/60 font-semibold">{d.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BOTÓN GIGANTE ARCADE: COMENZAR PARTIDA ── */}
      <div className="pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleStartGame}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>¡Comenzar Viaje Temporal!</span>
        </motion.button>
      </div>
    </div>
  );
}
