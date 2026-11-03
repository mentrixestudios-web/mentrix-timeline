import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Shield, X } from "lucide-react";

const sections = [
  {
    title: "1. Información que recopilamos",
    body:
      "Mentrix: Línea de Tiempo almacena información de uso local para ofrecerle la mejor experiencia pedagógica y lúdica. Registramos su récord de cartas colocadas correctamente, racha diaria de partidas, nivel alcanzado, experiencia (XP) y saldo de monedas virtuales. Estos datos se procesan primordialmente de forma local en su navegador o dispositivo.",
  },
  {
    title: "2. Finalidad del uso de datos",
    body:
      "Los datos recopilados se utilizan estrictamente para sincronizar su avance, validar su racha diaria, mantener sus preferencias de audio y efectos, y habilitar la tabla de récords y logros. En ningún momento comercializamos, cedemos ni compartimos sus datos con terceros para publicidad invasiva ni prospección comercial.",
  },
  {
    title: "3. Servicios de terceros y pasarela de pago segura",
    body:
      "Mentrix Línea de Tiempo interactúa con servicios técnicos seguros: (a) Mercado Pago mediante su solución oficial Checkout Pro para el procesamiento cifrado de transacciones al adquirir paquetes de monedas, y (b) módulos analíticos estándar para supervisión de estabilidad de la aplicación.",
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
          className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-slate-950 via-[#0a1226] to-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h2 className="text-white text-xl font-black">Política de Privacidad</h2>
              </div>
              <p className="mt-1 max-w-2xl text-xs text-cyan-200/70">
                Protección de datos y privacidad · Mentrix Línea de Tiempo
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
                <h3 className="font-bold text-cyan-300 text-sm mb-1.5">{sec.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
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
