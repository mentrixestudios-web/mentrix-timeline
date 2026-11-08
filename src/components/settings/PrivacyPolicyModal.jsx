import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Lock, CheckCircle2 } from "lucide-react";

const sections = [
  {
    title: "1. Información que recopilamos",
    body:
      "Mentrix: Línea de Tiempo almacena información de uso para ofrecerle la mejor experiencia pedagógica y lúdica. Registramos su récord de cartas colocadas correctamente, racha diaria de partidas, nivel alcanzado, experiencia (XP) y saldo de monedas virtuales. Estos datos se procesan prioritariamente de forma local en su navegador o dispositivo.",
  },
  {
    title: "2. Finalidad del uso de datos",
    body:
      "Los datos recopilados se utilizan estrictamente para sincronizar su avance a través de la cuenta Mentrix, validar su racha diaria, mantener sus preferencias de audio y efectos, y habilitar la tabla de récords y logros. En ningún momento comercializamos, cedemos ni compartimos sus datos con terceros para publicidad invasiva ni prospección comercial.",
  },
  {
    title: "3. Servicios de terceros y pasarela de pago segura",
    body:
      "Mentrix Línea de Tiempo interactúa con servicios técnicos seguros: (a) Mercado Pago mediante su solución oficial Checkout Pro para el procesamiento cifrado de transacciones al adquirir paquetes de monedas, y (b) Supabase para la autenticación voluntaria y respaldo en la nube del progreso del jugador.",
  },
  {
    title: "4. Almacenamiento seguro en el dispositivo",
    body:
      "El progreso de sus partidas, estado de tutoriales, monedas acumuladas y configuraciones se resguardan en el almacenamiento local seguro del dispositivo. Usted puede limpiar estos datos en cualquier momento a través de las opciones de su navegador o restableciendo los datos de la app.",
  },
  {
    title: "5. Derechos del usuario",
    body:
      "Usted puede consultar o solicitar la eliminación total de sus registros y datos de juego comunicándose con el equipo de soporte técnico oficial a través de los canales de Mentrix Estudios.",
  },
  {
    title: "6. Modificaciones a la política de privacidad",
    body:
      "Mentrix Estudios se reserva el derecho de actualizar esta política con el fin de reflejar mejoras de software o adecuaciones legales vigentes. Le recomendamos revisarla periódicamente desde este panel.",
  },
];

export default function PrivacyPolicyModal({ open, onClose }) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10030] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm select-none">
        {/* Fondo interactivo para cerrar al tocar fuera */}
        <div className="absolute inset-0 bg-transparent" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex h-[86vh] max-h-[740px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-b from-[#0e172e] via-[#091124] to-[#060a16] shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white"
        >
          {/* Resplandor decorativo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Encabezado */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white text-base sm:text-lg font-black truncate">Política de Privacidad</h2>
                <p className="text-[11px] text-cyan-200/70 truncate">
                  Protección de datos y privacidad · Mentrix Línea de Tiempo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Cerrar política de privacidad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjeta resumen rápida */}
          <div className="px-5 pt-4">
            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-3 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-100/90 leading-relaxed">
                Tus datos de progreso y monedas están protegidos. No vendemos información a terceros ni mostramos publicidad invasiva. Respaldo seguro en la nube opcional mediante Google.
              </p>
            </div>
          </div>

          {/* Contenido scrolleable con soporte táctil optimizado */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3 text-xs text-slate-200 touch-pan-y">
            {sections.map((sec, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                <h3 className="font-bold text-cyan-300 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-black">
                    {idx + 1}
                  </span>
                  <span>{sec.title}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">{sec.body}</p>
              </div>
            ))}
          </div>

          {/* Pie de modal */}
          <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3.5 flex items-center justify-between relative z-10">
            <span className="text-[10px] text-white/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Privacidad garantizada · Mentrix Estudios</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
