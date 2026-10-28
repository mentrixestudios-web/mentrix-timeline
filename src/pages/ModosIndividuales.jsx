import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Brain,
  ChevronRight,
  Sparkles
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";

const MODOS_SOLITARIO = [
  {
    id: "duelo",
    nombre: "Duelo contra Menti",
    subtitulo: "Compite por turnos contra la IA",
    icono: "⚔️",
    badge: "VS IA 🤖",
    premio: "👑 Reliquia Mítica",
    topBar: "from-purple-400 via-fuchsia-500 to-pink-500",
    color: "from-[#211242] via-[#140d2b] to-[#0a0718]",
    borde: "border-purple-400/40 hover:border-purple-400 hover:shadow-[0_10px_28px_rgba(168,85,247,0.25)]",
    iconBox: "bg-purple-500/25 border-purple-400/50 text-purple-200",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    tags: ["Turnos Alternados", "IA 80% Precisión"],
    descripcion: "Ambos colocan cartas en la misma línea de tiempo. ¡Aprovecha si Menti falla!",
  },
  {
    id: "contrarreloj",
    nombre: "Contrarreloj 60s",
    subtitulo: "Velocidad pura con bonos de tiempo",
    icono: "⏱️",
    badge: "FRENESÍ ⚡",
    premio: "📜 Códice + Bono XP",
    topBar: "from-cyan-400 via-blue-500 to-indigo-500",
    color: "from-[#0e2442] via-[#0b1830] to-[#070e1f]",
    borde: "border-cyan-400/40 hover:border-cyan-400 hover:shadow-[0_10px_28px_rgba(6,182,212,0.25)]",
    iconBox: "bg-cyan-500/25 border-cyan-400/50 text-cyan-200",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    tags: ["60 Segundos", "+4s por Acierto"],
    descripcion: "El reloj corre sin descanso. Cada carta bien ubicada te regala +4 segundos extra.",
  },
  {
    id: "supervivencia",
    nombre: "Supervivencia",
    subtitulo: "1 Sola Vida · Sin margen de error",
    icono: "💀",
    badge: "EXTREMO 🔥",
    premio: "👑 Reliquia + Récord",
    topBar: "from-red-500 via-orange-500 to-amber-500",
    color: "from-[#33121e] via-[#1f0d1d] to-[#0f0712]",
    borde: "border-red-400/40 hover:border-red-400 hover:shadow-[0_10px_28px_rgba(239,68,68,0.25)]",
    iconBox: "bg-red-500/25 border-red-400/50 text-red-200",
    badgeColor: "bg-red-500/20 text-red-300 border-red-400/40",
    tags: ["1 Sola Vida", "Racha Infinita"],
    descripcion: "La prueba definitiva para eruditos. Un solo error colapsa la línea temporal.",
  },
];

export default function ModosIndividuales() {
  const navigate = useNavigate();

  const handleSelect = (modoId) => {
    playSfx("tap");
    navigate(`/config-ronda?modo=${modoId}`);
  };

  return (
    <div className="space-y-4 select-none pb-12">
      {/* ── HEADER ── */}
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

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-purple-500/20 border-purple-400/40 text-purple-300">
          ARENA INDIVIDUAL 🎯
        </span>
      </div>

      {/* ── MENTI ASESOR TEMPORAL CON BURBUJA ACTIVA ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage="¿Listo para desafiar el tiempo? Elige uno de los 3 módulos especiales: batallar contra mí por turnos, correr contra el reloj o sobrevivir con 1 sola vida."
        />
      </div>

      {/* ── CUADRÍCULA DE 3 TARJETAS ARCADE 3D ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-4 bg-purple-400 rounded-full shadow-sm shadow-purple-400/50" />
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Selecciona tu Modalidad de Reto
            </h2>
          </div>
          <span className="text-[10px] font-bold text-purple-300">
            3 Arenas Disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODOS_SOLITARIO.map((m) => (
            <motion.div
              key={m.id}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -3 }}
              onClick={() => handleSelect(m.id)}
              className={`cursor-pointer rounded-3xl p-4 bg-gradient-to-br ${m.color} border ${m.borde} shadow-xl group transition-all duration-200 relative overflow-hidden flex flex-col justify-between`}
            >
              {/* Cinta luminosa superior */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${m.topBar}`} />

              {/* Badges superiores */}
              <div className="flex items-center justify-between gap-1.5 mb-3">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${m.badgeColor}`}>
                  {m.badge}
                </span>
                <span className="text-[9px] font-black text-amber-300 bg-black/40 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  {m.premio}
                </span>
              </div>

              {/* Icono 3D + Título */}
              <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5 my-1">
                <div className={`w-13 h-13 rounded-2xl border ${m.iconBox} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                  {m.icono}
                </div>
                <div>
                  <h3 className="text-white font-black text-base group-hover:text-amber-300 transition-colors leading-tight">
                    {m.nombre}
                  </h3>
                  <p className="text-white/75 text-[11px] font-bold mt-0.5">
                    {m.subtitulo}
                  </p>
                </div>
              </div>

              {/* Descripción y Tags */}
              <div className="my-2.5 space-y-2">
                <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                  {m.descripcion}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold text-white/80 bg-black/40 border border-white/10 px-2 py-0.5 rounded-md"
                    >
                      • {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón de Entrada */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50">
                  Elegir mazo
                </span>
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform">
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Configurar</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
