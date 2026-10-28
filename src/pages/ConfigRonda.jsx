import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  Play, 
  Hourglass,
  Swords,
  Timer,
  Skull,
  Check,
  Zap,
  Flame,
  Layers
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { CATEGORIES } from "@/data/categories";
import { getEventsByCategory } from "@/data/eventsData";
import { playSfx } from "@/utils/soundSystem";

const MODOS_INFO = {
  clasico: {
    nombre: "Línea Temporal",
    subtitulo: "Modo Aventura",
    icono: "⏳",
    colorBadge: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    badge: "MODO ESTRELLA ⭐",
    mensajeMenti: "Selecciona el mazo con el que pondrás a prueba tu conocimiento temporal.",
  },
  duelo: {
    nombre: "Duelo vs Menti",
    subtitulo: "Batalla contra la IA",
    icono: "⚔️",
    colorBadge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    badge: "VS IA 🤖",
    mensajeMenti: "¡Acepto el reto! Escoge el mazo y veamos quién domina los siglos.",
  },
  contrarreloj: {
    nombre: "Contrarreloj",
    subtitulo: "Frenesí de 60 segundos",
    icono: "⏱️",
    colorBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    badge: "FRENESÍ 60s ⚡",
    mensajeMenti: "¡El reloj corre! Escoge tu mazo favorito para pensar a toda velocidad.",
  },
  supervivencia: {
    nombre: "Supervivencia",
    subtitulo: "1 Sola Vida Extrema",
    icono: "💀",
    colorBadge: "bg-red-500/20 text-red-300 border-red-400/40",
    badge: "1 SOLA VIDA 🔥",
    mensajeMenti: "Un solo fallo y la línea colapsa. Elige tu mazo más fuerte.",
  },
};

// Detalles visuales premium estilo TCG / Baraja de cartas para cada mazo
const DECK_CONFIG = {
  caos: {
    iconoEmoji: "⏳",
    tagline: "Todas las Épocas",
    temaColor: "from-amber-600 via-yellow-600 to-amber-950",
    bordeActivo: "border-amber-400 ring-2 ring-amber-400/60 shadow-amber-500/30",
    resplandor: "bg-amber-500/20",
    iconoBg: "bg-amber-500/30 text-amber-200 border-amber-400/50",
    resumen: "El mazo maestro con todos los acontecimientos universales cruzados.",
  },
  historia: {
    iconoEmoji: "🏛️",
    tagline: "Imperios y Guerras",
    temaColor: "from-blue-600 via-indigo-700 to-slate-950",
    bordeActivo: "border-blue-400 ring-2 ring-blue-400/60 shadow-blue-500/30",
    resplandor: "bg-blue-500/20",
    iconoBg: "bg-blue-500/30 text-blue-200 border-blue-400/50",
    resumen: "Desde Egipto y Roma hasta la Revolución y el siglo XX.",
  },
  biblia: {
    iconoEmoji: "📜",
    tagline: "Génesis al Evangelio",
    temaColor: "from-emerald-600 via-teal-700 to-slate-950",
    bordeActivo: "border-emerald-400 ring-2 ring-emerald-400/60 shadow-emerald-500/30",
    resplandor: "bg-emerald-500/20",
    iconoBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/50",
    resumen: "Profetas, reyes, éxodo y la línea histórica de las Escrituras.",
  },
  ciencia: {
    iconoEmoji: "🚀",
    tagline: "Inventos y Espacio",
    temaColor: "from-purple-600 via-fuchsia-700 to-slate-950",
    bordeActivo: "border-purple-400 ring-2 ring-purple-400/60 shadow-purple-500/30",
    resplandor: "bg-purple-500/20",
    iconoBg: "bg-purple-500/30 text-purple-200 border-purple-400/50",
    resumen: "Hitos científicos, exploración estelar y medicina.",
  },
  musica: {
    iconoEmoji: "🎨",
    tagline: "Obras y Maestros",
    temaColor: "from-pink-600 via-rose-700 to-slate-950",
    bordeActivo: "border-pink-400 ring-2 ring-pink-400/60 shadow-pink-500/30",
    resplandor: "bg-pink-500/20",
    iconoBg: "bg-pink-500/30 text-pink-200 border-pink-400/50",
    resumen: "Música clásica, rock, pintura y corrientes artísticas.",
  },
  cine: {
    iconoEmoji: "🎬",
    tagline: "Cine y Cultura Pop",
    temaColor: "from-orange-600 via-amber-700 to-slate-950",
    bordeActivo: "border-orange-400 ring-2 ring-orange-400/60 shadow-orange-500/30",
    resplandor: "bg-orange-500/20",
    iconoBg: "bg-orange-500/30 text-orange-200 border-orange-400/50",
    resumen: "Películas de culto, consolas legendarias y cultura pop.",
  },
};

export default function ConfigRonda() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modo = searchParams.get("modo") || "clasico";
  const modoData = MODOS_INFO[modo] || MODOS_INFO.clasico;

  // Mazo seleccionado por defecto: "caos"
  const [selectedCat, setSelectedCat] = useState("caos");

  // Dificultad / Longitud: 5, 10 o 15 cartas
  const [cartasMeta, setCartasMeta] = useState(10);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCat) || CATEGORIES[0];
  const activeDeckStyle = DECK_CONFIG[selectedCat] || DECK_CONFIG.caos;
  const eventCount = getEventsByCategory(selectedCat).length;

  const handleStartGame = () => {
    playSfx("victory");
    const target = modo === "supervivencia" ? 25 : cartasMeta;
    navigate(`/juego?modo=${modo}&cat=${selectedCat}&cartas=${target}`);
  };

  return (
    <div className="space-y-4 select-none pb-28 relative">
      
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

        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${modoData.colorBadge}`}>
          {modoData.badge}
        </span>
      </div>

      {/* ── SHOWCASE DEL MAZO ACTIVO (VITRINA 3D) ── */}
      <motion.div
        key={selectedCat}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-3xl p-4 border bg-gradient-to-br ${activeDeckStyle.temaColor} shadow-xl`}
      >
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
              {activeDeckStyle.iconoEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Mazo Activo
                </span>
                <span className="text-[9px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {eventCount} Cartas 🃏
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {activeCategory.name}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {activeDeckStyle.tagline}
              </p>
            </div>
          </div>

          <div className="w-11 h-11 shrink-0 hidden sm:block">
            <MentrixMascot size="xs" showBubble={false} position="center" />
          </div>
        </div>

        <p className="text-[11px] text-white/80 mt-2.5 pt-2 border-t border-white/20 font-medium leading-relaxed">
          {activeDeckStyle.resumen}
        </p>
      </motion.div>

      {/* ── VITRINA DE MAZOS DE CARTAS (CUADRÍCULA 2x3 TIPO BARAJA COLECCIONABLE) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Elige tu Mazo de Juego
            </h3>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">
            Toca para equipar
          </span>
        </div>

        {/* Cuadrícula 2 columnas estilo cajas de baraja arcade */}
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            const deckStyle = DECK_CONFIG[cat.id] || DECK_CONFIG.caos;
            const count = getEventsByCategory(cat.id).length;

            return (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSfx("tap");
                  setSelectedCat(cat.id);
                }}
                className={`cursor-pointer rounded-2xl p-3 border transition-all duration-200 relative flex flex-col justify-between text-center overflow-hidden shadow-lg ${
                  isSelected
                    ? `${deckStyle.bordeActivo} bg-[#111c38]`
                    : "bg-[#0b1328]/95 border-white/10 hover:border-amber-400/40"
                }`}
              >
                {/* Resplandor superior metálico */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.color}`} />

                {/* Badge superior de cartas */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-white/70 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">
                    {count} 🃏
                  </span>
                  {isSelected ? (
                    <span className="text-[9px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      LISTO
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-white/30">
                      Equipar
                    </span>
                  )}
                </div>

                {/* Ícono central 3D grande */}
                <div className="my-1">
                  <div className={`w-12 h-12 mx-auto rounded-2xl ${deckStyle.iconoBg} border flex items-center justify-center text-2xl shadow-md transition-transform ${isSelected ? "scale-110" : ""}`}>
                    {deckStyle.iconoEmoji}
                  </div>
                  <h4 className={`text-xs sm:text-sm font-black mt-2 leading-tight ${isSelected ? "text-amber-300" : "text-white"}`}>
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-white/60 font-semibold line-clamp-1 mt-0.5">
                    {deckStyle.tagline}
                  </p>
                </div>

                {/* Indicador de selección */}
                <div className="mt-2 pt-1.5 border-t border-white/10">
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? "text-amber-400" : "text-white/40"}`}>
                    {isSelected ? "★ SELECCIONADO" : "Elegir Mazo"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SELECTOR DE LONGITUD DE RONDA (EXCEPTO EN SUPERVIVENCIA) ── */}
      {modo !== "supervivencia" && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-400 rounded-full" />
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Cartas por Partida
              </h3>
            </div>
            <span className="text-[10px] text-purple-300 font-bold">
              Objetivo de victoria
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { cartas: 5, label: "Rápida", badge: "5 Cartas", emoji: "⚡" },
              { cartas: 10, label: "Estándar", badge: "10 Cartas", emoji: "⭐" },
              { cartas: 15, label: "Desafío", badge: "15 Cartas", emoji: "👑" },
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
                  className={`py-2 px-1 rounded-2xl border text-center transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-b from-amber-500/25 to-yellow-500/10 border-amber-400 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50"
                      : "bg-[#0b1328]/90 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{d.emoji}</span>
                  <p className="text-xs font-black text-white">{d.label}</p>
                  <p className="text-[9px] text-amber-300 font-bold">{d.badge}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BARRA FLOTANTE FIJA INFERIOR (STICKY ACTION BAR ARCADE) ── */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-[#091024]/95 to-transparent z-40 backdrop-blur-md border-t border-white/10">
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartGame}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 cursor-pointer transition-all animate-pulse"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>¡Jugar con {activeCategory.name}!</span>
          </motion.button>
        </div>
      </div>

    </div>
  );
}
