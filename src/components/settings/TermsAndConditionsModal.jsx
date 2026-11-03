import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";

const sections = [
  {
    title: "1. Naturaleza de Mentrix Línea de Tiempo",
    body:
      "Mentrix: Línea de Tiempo es un juego digital interactivo de cultura general, deducción cronológica e historia universal desarrollado por Mentrix Estudios. Su misión es ofrecer una experiencia educativa y estimulante donde los jugadores ponen a prueba sus conocimientos ordenando eventos, invenciones, batallas y hechos históricos en su correcta posición temporal.",
  },
  {
    title: "2. Destinatarios y uso educativo",
    body:
      "La aplicación está diseñada para estudiantes, familias, entusiastas de la historia y público en general. Fomenta el aprendizaje activo y la agilidad mental. En el caso de menores de edad, se recomienda el acompañamiento de padres o tutores para la interacción y adquisiciones dentro de la app.",
  },
  {
    title: "3. Sistema de monedas virtuales y comodines",
    body:
      "Las monedas son un recurso virtual interno del juego. Se obtienen superando desafíos diarios, completando líneas temporales o mediante compras voluntarias. Se emplean para canjear comodines estratégicos (pista de siglo, confirmación de era o salto de carta). Las monedas no poseen valor monetario real, no son transferibles y no pueden ser canjeadas por dinero en efectivo.",
  },
  {
    title: "4. Compras seguras a través de Mercado Pago",
    body:
      "La compra de paquetes de monedas se procesa de manera segura a través de la pasarela oficial de Mercado Pago mediante Checkout Pro. Todas las operaciones se encuentran encriptadas y cumplen con los máximos estándares internacionales de seguridad en pagos digitales.",
  },
  {
    title: "5. Mecánica de juego y precisión histórica",
    body:
      "El juego utiliza fechas, periodos y datos cronológicos contrastados con fuentes historiográficas y enciclopédicas reconocidas. Las aproximaciones en fechas de la antigüedad se basan en el consenso arqueológico actual con fines estrictamente pedagógicos y lúdicos.",
  },
  {
    title: "6. Propiedad intelectual",
    body:
      "El diseño de interfaz, mascota Menti, animaciones, algoritmo de cartas y código de la aplicación son propiedad exclusiva de Mentrix Estudios. Los eventos históricos, personajes y nombres propios citados forman parte del patrimonio histórico y cultural universal.",
  },
];

export default function TermsAndConditionsModal({ open, onClose }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10020]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-end justify-center px-4 py-6 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-slate-950 via-[#0a1226] to-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-white text-xl font-black">Términos y Condiciones</h2>
              </div>
              <p className="mt-1 max-w-2xl text-xs text-amber-200/70">
                Condiciones de uso y marco de juego · Mentrix Línea de Tiempo
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 text-sm text-slate-200">
            {sections.map((sec, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <h3 className="font-bold text-amber-300 text-sm mb-1.5">{sec.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </div>,
    document.body
  );
}
