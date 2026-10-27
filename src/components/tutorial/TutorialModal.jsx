import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hourglass, HelpCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { playSfx } from "@/utils/soundSystem";

export default function TutorialModal({ open, onClose }) {
  if (!open) return null;

  const steps = [
    {
      num: "1",
      title: "Recibe tu Carta en Mano",
      desc: "Se te entregará un acontecimiento histórico con título y contexto, pero con su fecha oculta.",
      icon: "📜",
    },
    {
      num: "2",
      title: "Examina la Línea Temporal",
      desc: "Mira las cartas que ya están sobre la mesa con sus fechas confirmadas (desde la Antigüedad hasta hoy).",
      icon: "⏳",
    },
    {
      num: "3",
      title: "Toca la Ranura [+] Correcta",
      desc: "Decide si ocurrió Antes de todo, Entre medio de dos eventos, o Después de todo.",
      icon: "🎯",
    },
    {
      num: "4",
      title: "¡Completa tu Línea y Sube de Nivel!",
      desc: "Gana monedas, XP para subir tu Nivel de Sabio, y mantén tu racha diaria activa.",
      icon: "👑",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#0c162e] via-[#091124] to-[#070b18] border-2 border-amber-400/50 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white overflow-hidden"
        >
          {/* Fondo estético */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <Hourglass className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-sm text-amber-100 uppercase tracking-wider">
                  ¿Cómo Jugar?
                </h3>
                <p className="text-[10px] text-amber-300/70 font-semibold">
                  Guía del Viajero del Tiempo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pasos */}
          <div className="space-y-3 mb-5">
            {steps.map((st) => (
              <div
                key={st.num}
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-400/40 flex items-center justify-center text-lg shrink-0 shadow-sm">
                  {st.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] inline-flex items-center justify-center">
                      {st.num}
                    </span>
                    <span>{st.title}</span>
                  </h4>
                  <p className="text-[11px] text-white/70 mt-1 leading-snug">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Botón Aceptar */}
          <button
            type="button"
            onClick={() => {
              playSfx("correct");
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>¡Entendido, Comencemos a Viajar!</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
