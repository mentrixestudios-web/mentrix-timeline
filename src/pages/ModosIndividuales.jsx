import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Swords, 
  Timer, 
  Skull, 
  Play, 
  Sparkles,
  Zap,
  Flame,
  Brain
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
    color: "from-purple-950/80 via-[#19113a] to-[#120d29]",
    borde: "border-purple-400/40 hover:border-purple-300",
    glow: "shadow-purple-500/20",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    descripcion: "Pon a prueba tu agilidad contra Menti. Ambos colocan cartas en la misma línea de tiempo.",
  },
  {
    id: "contrarreloj",
    nombre: "Contrarreloj Frenético",
    subtitulo: "60 segundos con bonos de tiempo",
    icono: "⏱️",
    badge: "FRENESÍ 60s ⚡",
    color: "from-cyan-950/80 via-[#101b38] to-[#0a1429]",
    borde: "border-cyan-400/40 hover:border-cyan-300",
    glow: "shadow-cyan-500/20",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    descripcion: "El reloj corre sin descanso. Cada carta correcta te otorga +4 segundos adicionales.",
  },
  {
    id: "supervivencia",
    nombre: "Supervivencia Extrema",
    subtitulo: "1 Sola Vida · Sin margen de error",
    icono: "💀",
    badge: "1 SOLA VIDA 🔥",
    color: "from-red-950/80 via-[#1c1126] to-[#120a1a]",
    borde: "border-red-400/40 hover:border-red-300",
    glow: "shadow-red-500/20",
    badgeColor: "bg-red-500/20 text-red-300 border-red-400/40",
    descripcion: "La prueba más exigente. Un solo error destruye la línea temporal y termina la partida.",
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

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/5 border-purple-400/40 text-purple-300">
          SALA INDIVIDUAL 🎯
        </span>
      </div>

      {/* ── BANNER HEROICO CON MENTI ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#12193b] to-slate-900 border-2 border-purple-400/50 p-4 shadow-xl flex items-center justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-400" />
            <h1 className="text-base sm:text-lg font-black text-white">
              Duelos & Desafíos Solitario
            </h1>
          </div>
          <p className="text-xs text-purple-200/80 font-medium">
            Entrena tu mente, supera récords y desafía a la IA
          </p>
        </div>

        <div className="w-12 h-12 shrink-0">
          <MentrixMascot size="xs" showBubble={false} position="center" />
        </div>
      </motion.div>

      {/* ── LISTADO DE MODOS INDIVIDUALES ARCADE ── */}
      <div className="space-y-3 pt-1">
        {MODOS_SOLITARIO.map((m) => (
          <motion.div
            key={m.id}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            onClick={() => handleSelect(m.id)}
            className={`cursor-pointer rounded-2xl p-4 bg-gradient-to-br ${m.color} border ${m.borde} shadow-lg ${m.glow} group transition-all duration-200 relative overflow-hidden`}
          >
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                  {m.icono}
                </div>
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                  <h3 className="text-white font-black text-base group-hover:text-amber-200 transition-colors mt-0.5">
                    {m.nombre}
                  </h3>
                  <p className="text-white/70 text-xs font-semibold">
                    {m.subtitulo}
                  </p>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 text-white flex items-center justify-center transition-all shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            <p className="text-[11px] text-white/60 mt-2.5 pt-2 border-t border-white/10 font-medium leading-relaxed">
              {m.descripcion}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
