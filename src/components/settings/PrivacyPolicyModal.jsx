import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Shield, X, Sparkles, Home } from "lucide-react";
import { playSfx } from "@/utils/soundSystem";

const sections = [
  {
    title: "1. Compromiso con tu privacidad",
    body:
      "Mentrix Estudios respeta profundamente la privacidad de cada usuario. Diseñamos nuestras aplicaciones siguiendo el principio de minimización de datos: únicamente recopilamos la información estrictamente necesaria para garantizar la experiencia de juego, el guardado de logros y la sincronización entre dispositivos.",
  },
  {
    title: "2. Datos de cuenta y sincronización en la nube",
    body:
      "Si inicias sesión con tu Cuenta Mentrix (mediante correo electrónico o Google Auth con Supabase), almacenamos de forma segura tu identificador único de usuario, nombre público o alias, correo de contacto y tu saldo de monedas unificado. No tenemos acceso a tus contraseñas personales, las cuales son procesadas con cifrado de grado militar por los proveedores de autenticación.",
  },
  {
    title: "3. Progreso local y almacenamiento en el dispositivo",
    body:
      "Tus estadísticas de juego, récords de puntuación, racha diaria, cartas desbloqueadas en el Museo y preferencias de audio se almacenan primordialmente en la memoria local de tu dispositivo (LocalStorage / IndexedDB). Si decides jugar sin iniciar sesión, tu progreso permanece únicamente en tu teléfono o navegador.",
  },
  {
    title: "4. Pagos y transacciones con Mercado Pago",
    body:
      "Mentrix Estudios no recopila, almacena ni procesa números de tarjetas de crédito o débito, códigos de seguridad bancaria ni credenciales financieras. Todos los pagos se realizan directamente dentro del entorno protegido y encriptado de Mercado Pago (Checkout Pro).",
  },
  {
    title: "5. Notificaciones PWA",
    body:
      "El permiso para notificaciones web/PWA es completamente voluntario. Se utiliza exclusivamente para recordarte el Desafío Diario y ayudarte a mantener tu racha activa. Puedes activar o desactivar este permiso en cualquier momento desde tu perfil o desde los ajustes de tu navegador.",
  },
  {
    title: "6. No compartición con terceros con fines comerciales",
    body:
      "Nunca vendemos, alquilamos ni comercializamos tu información personal con empresas de publicidad de terceros. Tus datos se utilizan únicamente para operar el ecosistema de juegos Mentrix.",
  },
  {
    title: "7. Derechos del usuario y eliminación de datos",
    body:
      "Tienes pleno derecho a solicitar la consulta, rectificación o eliminación total de tu cuenta y datos asociados en cualquier momento a través del botón 'Restablecer Progreso' en tu perfil o contactando a nuestro equipo de soporte.",
  },
];

export default function PrivacyPolicyModal({ open, onClose }) {
  if (!open || typeof document === "undefined") return null;

  const navigate = useNavigate();

  const handleClose = () => {
    playSfx("tap");
    onClose();
  };

  const handleGoHome = () => {
    playSfx("tap");
    onClose();
    navigate("/");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10030] flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 cursor-pointer"
      onClick={handleClose}
    >
      <div 
        className="relative z-10 flex h-[88vh] max-h-[740px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-cyan-400/50 bg-[#0a1122] shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white text-base sm:text-lg font-black truncate m-0">Política de Privacidad</h2>
              <p className="text-[11px] text-cyan-200/70 truncate m-0">
                Protección de datos y privacidad · Mentrix Línea de Tiempo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
            aria-label="Cerrar privacidad"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta resumen rápida */}
        <div className="px-5 pt-3 shrink-0">
          <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-100/90 leading-relaxed m-0">
              Tus datos están protegidos. No almacenamos datos financieros y la sincronización con Supabase es completamente segura.
            </p>
          </div>
        </div>

        {/* Contenido scrolleable táctil nativo con min-h-0 y touch-pan-y */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3 space-y-3 text-xs text-slate-200 touch-pan-y">
          {sections.map((sec, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
              <h3 className="font-bold text-cyan-300 text-sm mb-1.5 flex items-center gap-2 m-0">
                <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-black shrink-0">
                  {idx + 1}
                </span>
                <span>{sec.title}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pl-7 m-0">{sec.body}</p>
            </div>
          ))}
        </div>

        {/* Pie de modal con botón a Inicio y Entendido */}
        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGoHome}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pantalla Principal</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
