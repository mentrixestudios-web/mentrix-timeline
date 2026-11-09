import React from "react";
import { Sparkles, Hourglass, Search, HelpCircle, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getCenturyHint(year) {
  if (year < 0) {
    const c = Math.ceil(Math.abs(year) / 100);
    return `Siglo ${c} a.C. · Época Antigua`;
  }
  const c = Math.ceil(year / 100);
  if (c <= 5) return `Siglo ${c} d.C. · Era Clásica`;
  if (c <= 15) return `Siglo ${c} d.C. · Edad Media`;
  if (c <= 18) return `Siglo ${c} d.C. · Edad Moderna`;
  return `Siglo ${c} d.C. · Época Contemporánea`;
}

export default function CurrentCardHand({
  event,
  cardsPlaced = 0,
  targetGoal = 10,
  lupaActive = false,
}) {
  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-md mx-auto bg-gradient-to-br from-[#14264f] via-[#0c152e] to-[#1a2d59] border-2 border-amber-400/80 rounded-3xl p-3.5 sm:p-4 shadow-[0_0_35px_rgba(245,158,11,0.28)] select-none"
    >
      {/* Resplandor cósmico superior */}
      <div className="absolute top-0 right-1/4 w-32 h-16 bg-amber-400/15 rounded-full pointer-events-none" />

      {/* CABECERA: ETIQUETA DE CARTA EN MANO Y PLACA DE AÑO OCULTO */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/10 border border-amber-400/50 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Tu Carta Activa</span>
        </div>

        {/* Placa de Año Oculto con Pulso */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 via-yellow-400/15 to-amber-500/20 border border-amber-400/60 text-amber-300 px-3 py-1 rounded-xl text-xs font-black shadow-sm animate-pulse">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>¿Año Incógnita?</span>
        </div>
      </div>

      {/* TÍTULO PRINCIPAL DEL ACONTECIMIENTO */}
      <h2 className="text-white font-black text-base sm:text-lg leading-snug tracking-tight relative z-10">
        {event.title}
      </h2>

      {/* PISTA DE LUPA (SI EL PODER ESTÁ ACTIVO) */}
      <AnimatePresence>
        {lupaActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-2 rounded-xl bg-amber-500/25 border border-amber-400/80 flex items-center gap-2 text-xs text-amber-100 font-extrabold shadow-sm relative z-10"
          >
            <Search className="w-4 h-4 text-amber-300 shrink-0 animate-bounce" />
            <span>🔍 Pista Revelada: <strong>{getCenturyHint(event.year)}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESEÑA HISTÓRICA COMPLETA DE CONTEXTO */}
      {event.description && !lupaActive && (
        <p className="text-xs text-amber-100/90 mt-2 leading-relaxed font-normal relative z-10 bg-black/25 p-2 rounded-xl border border-amber-400/20">
          {event.description}
        </p>
      )}

      {/* PERSONAJE CLAVE (SI EXISTE) */}
      {event.personajeClave && !lupaActive && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-300/80 font-semibold relative z-10">
          <span>👤 Figura clave:</span>
          <span className="text-amber-100">{event.personajeClave}</span>
        </div>
      )}

      {/* FOOTER INTERACTIVO: LLAMADA A LA ACCIÓN CON FLECHA */}
      <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-200/80 font-bold relative z-10">
        <span className="flex items-center gap-1 text-amber-300">
          <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Toca un portal <strong>[+]</strong> en la línea</span>
        </span>
        <span className="text-amber-400 font-black bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
          {cardsPlaced} / {targetGoal}
        </span>
      </div>
    </motion.div>
  );
}
