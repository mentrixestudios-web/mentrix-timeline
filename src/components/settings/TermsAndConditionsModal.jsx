import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Sparkles, ShieldCheck, Home } from "lucide-react";

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
      "Las monedas son un recurso virtual interno del juego sincronizado a través de la Billetera Global Mentrix. Se obtienen superando desafíos diarios, completando líneas temporales o mediante compras voluntarias. Se emplean para canjear comodines estratégicos (pista de siglo, confirmación de era o salto de carta). Las monedas no poseen valor monetario real, no son transferibles fuera del ecosistema Mentrix y no pueden ser canjeadas por dinero en efectivo.",
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
  {
    title: "7. Actualizaciones y disponibilidad",
    body:
      "Mentrix Estudios se reserva el derecho de actualizar contenidos, agregar nuevos eventos históricos, equilibrar recompensas y mejorar las funciones de la aplicación para garantizar la mejor experiencia a los usuarios.",
  },
];

export default function TermsAndConditionsModal({ open, onClose }) {
  if (!open || typeof document === "undefined") return null;

  const handleGoHome = () => {
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10030] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex h-[86vh] max-h-[740px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-[#0e172e] via-[#091124] to-[#060a16] shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white cursor-default"
      >
        {/* Resplandor decorativo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white text-base sm:text-lg font-black truncate">Términos y Condiciones</h2>
              <p className="text-[11px] text-amber-200/70 truncate">
                Condiciones de uso y marco de juego · Mentrix Línea de Tiempo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
            aria-label="Cerrar términos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta resumen rápida */}
        <div className="px-5 pt-4">
          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Juego educativo orientado al aprendizaje histórico universal. Monedas virtuales unificadas para el ecosistema Mentrix, compras seguras por Mercado Pago y protección del usuario.
            </p>
          </div>
        </div>

        {/* Contenido scrolleable con soporte táctil optimizado */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3 text-xs text-slate-200 touch-pan-y">
          {sections.map((sec, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
              <h3 className="font-bold text-amber-300 text-sm mb-1.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                <span>{sec.title}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pl-7">{sec.body}</p>
            </div>
          ))}
        </div>

        {/* Pie de modal con botón a Inicio y Entendido */}
        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3.5 flex items-center justify-between gap-2 relative z-10">
          <button
            type="button"
            onClick={handleGoHome}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Pantalla Principal</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
