import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Hourglass, 
  Compass, 
  Eye, 
  Coins, 
  Flame, 
  Trophy, 
  Play, 
  Volume2, 
  Settings, 
  Users, 
  Check,
  Calendar,
  Layers,
  ShieldCheck
} from "lucide-react";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";

export default function InteractiveTutorial({ onComplete, onClose }) {
  const [step, setStep] = useState(0);

  const handleClose = () => {
    playSfx("tap");
    try {
      localStorage.setItem("mt_tutorial_seen", "true");
    } catch {}
    if (onComplete) onComplete();
    else if (onClose) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  const steps = [
    {
      title: "¡Bienvenido a Mentrix: Línea de Tiempo!",
      badge: "Viaje Cronológico",
      description: "Pon a prueba tu intuición y cultura general ordenando acontecimientos, invenciones y batallas de la historia universal. Soy Menti, tu crononauta y guía a través de los siglos.",
      icon: "⏳",
      visual: (
        <div className="flex flex-col items-center justify-center py-2">
          <MentrixMascot 
            size="lg" 
            customMessage="¡Saludos, Crononauta! Prepárate para ordenar la historia humana. ⏳📜" 
          />
        </div>
      ),
    },
    {
      title: "Música y Sonido de Época ⚙️",
      badge: "Audio & Ambiente",
      description: "La música ambiental de viaje temporal inicia de forma interactiva. Puedes ajustar su volumen o silenciarla tocando el botón de Configuración en la barra superior.",
      icon: "🎵",
      visual: (
        <div className="space-y-2.5 max-w-sm w-full mx-auto">
          <div className="bg-slate-900/90 border border-amber-400/30 rounded-2xl p-3 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
              ⚙️
            </div>
            <div>
              <p className="text-white text-xs font-black m-0">Ajustes & Audio</p>
              <p className="text-amber-200/70 text-[11px] m-0">Música de Época · Efectos · Notificaciones</p>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100 text-[11px] leading-relaxed">
            💡 <strong className="text-amber-300">Tip de audio:</strong> Si juegas en navegador web y no escuchas sonido, pulsa cualquier botón para habilitar el motor sonoro.
          </div>
        </div>
      ),
    },
    {
      title: "¿Cómo se Juega? — Mecánica Cronológica 🎯",
      badge: "Regla Principal",
      description: "Recibirás una carta histórica con fecha oculta. Tu objetivo es pulsar la ranura [+] correcta en la mesa: ¿Ocurrió ANTES, ENTRE medio, o DESPUÉS de las cartas ya confirmadas?",
      icon: "📜",
      visual: (
        <div className="space-y-2 max-w-sm w-full mx-auto">
          <div className="grid grid-cols-3 gap-1.5 items-center">
            {/* Ranura Antes */}
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-dashed border-emerald-400/50 text-center">
              <span className="text-emerald-300 text-xs font-black block">[+] ANTES</span>
              <span className="text-[9px] text-emerald-200/70">Siglos atrás</span>
            </div>

            {/* Carta Confirmada en Mesa */}
            <div className="p-2 rounded-xl bg-slate-900 border border-amber-400/60 text-center shadow-md">
              <span className="text-xs">⚔️</span>
              <p className="text-[10px] font-black text-white truncate m-0">Rev. Francesa</p>
              <span className="text-[9px] font-bold text-amber-300">1789 d.C.</span>
            </div>

            {/* Ranura Después */}
            <div className="p-2 rounded-xl bg-blue-500/15 border border-dashed border-blue-400/50 text-center">
              <span className="text-blue-300 text-xs font-black block">[+] DESPUÉS</span>
              <span className="text-[9px] text-blue-200/70">Años posteriores</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] text-white/80">Tu carta en mano: <strong className="text-amber-300">Invención de la Imprenta (¿?)</strong></span>
            <p className="text-[10px] text-emerald-300/90 font-semibold m-0 mt-0.5">
              ✓ Correcto: 1440 d.C. va ANTES de 1789
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Tres Modos de Juego ⚔️",
      badge: "Solo & Multijugador",
      description: "Disfruta el juego según tu estilo: compite contra ti mismo, desafía a amigos en la misma habitación o juega online a distancia.",
      icon: "🎮",
      visual: (
        <div className="space-y-2 max-w-sm w-full mx-auto">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center gap-2.5">
            <span className="text-xl">⏳</span>
            <div className="min-w-0">
              <p className="text-purple-200 text-xs font-bold m-0">Línea de Tiempo Clásica</p>
              <p className="text-purple-300/70 text-[10px] m-0">Modo en solitario · Suma XP, racha y récords</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center gap-2.5">
            <span className="text-xl">🌐</span>
            <div className="min-w-0">
              <p className="text-cyan-200 text-xs font-bold m-0">Duelo Online 1v1</p>
              <p className="text-cyan-300/70 text-[10px] m-0">Salas en vivo · Invita por enlace o WhatsApp</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center gap-2.5">
            <span className="text-xl">⚔️</span>
            <div className="min-w-0">
              <p className="text-blue-200 text-xs font-bold m-0">Duelo Local & Menti IA</p>
              <p className="text-blue-300/70 text-[10px] m-0">Pasa el celular con amigos o juega contra Menti</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Comodines y Poderes Estratégicos 🔮",
      badge: "Ventajas Tácticas",
      description: "Si dudas de una fecha o quieres proteger tu racha, usa los poderes temporales en tu mano para asegurar tu jugada.",
      icon: "✨",
      visual: (
        <div className="space-y-2 max-w-sm w-full mx-auto">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
            <span className="text-lg">🧭</span>
            <div>
              <p className="text-amber-200 text-xs font-bold m-0">Brújula de Siglo</p>
              <p className="text-amber-200/60 text-[10px] m-0">Te revela el siglo exacto del evento histórico.</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2.5">
            <span className="text-lg">⌛</span>
            <div>
              <p className="text-cyan-200 text-xs font-bold m-0">Reloj de Arena (Salto)</p>
              <p className="text-cyan-200/60 text-[10px] m-0">Descarta la carta actual por una nueva sin perder vidas.</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2.5">
            <span className="text-lg">👁️</span>
            <div>
              <p className="text-purple-200 text-xs font-bold m-0">Ojo del Crononauta</p>
              <p className="text-purple-200/60 text-[10px] m-0">Verifica si tu ranura elegida es correcta antes de colocarla.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Racha Diaria y Billetera Unificada 🪙",
      badge: "Ecosistema Mentrix",
      description: "Mantén tu racha diaria jugando al menos una partida al día. Tus monedas se sincronizan en la Billetera Global Mentrix para utilizarlas en toda la trilogía.",
      icon: "🔥",
      visual: (
        <div className="space-y-2 max-w-sm w-full mx-auto">
          <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/35 flex items-center gap-2.5">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-orange-200 text-xs font-bold m-0">Racha de Días Consecutivos</p>
              <p className="text-orange-200/70 text-[10px] m-0">+1 día por cada jornada en que juegues.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center gap-2.5">
            <span className="text-xl">🪙</span>
            <div>
              <p className="text-amber-200 text-xs font-bold m-0">Monedas Compartidas Mentrix</p>
              <p className="text-amber-200/70 text-[10px] m-0">Tu saldo sirve en Línea de Tiempo, Estudio Bíblico y Mente.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center gap-2.5">
            <span className="text-xl">☁️</span>
            <div>
              <p className="text-emerald-200 text-xs font-bold m-0">Respaldo Google & Correo</p>
              <p className="text-emerald-200/70 text-[10px] m-0">Conecta tu cuenta para jamás perder compras ni récords.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Efeméride del Día y Museo 🏛️",
      badge: "Cultura & Colección",
      description: "Cada día te espera un suceso verídico en la pantalla de inicio con su historia. Desbloquea más de 70 cartas legendarias para tu Museo de Reliquias.",
      icon: "📜",
      visual: (
        <div className="space-y-2 max-w-sm w-full mx-auto">
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-400/40 flex items-center gap-2.5">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-amber-200 text-xs font-bold m-0">Efeméride del Día</p>
              <p className="text-amber-200/70 text-[10px] m-0">Un acontecimiento histórico fascinante cada 24 horas.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-400/40 flex items-center gap-2.5">
            <span className="text-xl">👑</span>
            <div>
              <p className="text-indigo-200 text-xs font-bold m-0">Museo de Reliquias (72 Cartas)</p>
              <p className="text-indigo-200/70 text-[10px] m-0">Desde Mesopotamia y Roma hasta la Era Espacial.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "¡Listo para Conquistar el Tiempo! 🚀",
      badge: "¡Comencemos!",
      description: "Ya conoces todas las herramientas del Crononauta. Es hora de demostrar tu conocimiento y colocar tu nombre en la cima de la historia.",
      icon: "👑",
      visual: (
        <div className="flex flex-col items-center justify-center py-2">
          <MentrixMascot 
            size="lg" 
            customMessage="¡Adelante! La historia del mundo está en tus manos. 👑✨" 
          />
        </div>
      ),
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    playSfx("tap");
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      playSfx("victory");
      handleClose();
    }
  };

  const handlePrev = () => {
    playSfx("tap");
    if (step > 0) setStep(step - 1);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10030] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95">
      {/* Cierre al tocar el fondo exterior */}
      <div className="absolute inset-0 bg-transparent cursor-pointer" onClick={handleClose} />

      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#0e172e] via-[#091124] to-[#060a16] border-2 border-amber-400/50 rounded-3xl p-5 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white overflow-hidden flex flex-col justify-between min-h-[520px] max-h-[92vh] touch-pan-y"
      >
        {/* Resplandor decorativo optimizado */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full pointer-events-none" />

        {/* ── TOP BAR DEL TUTORIAL ── */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Paso {step + 1} de {steps.length}
            </span>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              {current.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="text-[11px] font-bold text-white/50 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5"
            >
              Saltar
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── CUERPO PRINCIPAL DEL PASO ── */}
        <div className="py-4 space-y-3.5 relative z-10 flex-1 flex flex-col justify-center">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2 m-0 tracking-tight">
              <span>{current.icon}</span>
              <span>{current.title}</span>
            </h3>
            <p className="text-xs text-white/75 mt-1.5 leading-relaxed max-w-sm mx-auto">
              {current.description}
            </p>
          </div>

          {/* Componente Visual */}
          <div className="py-1">
            {current.visual}
          </div>
        </div>

        {/* ── FOOTER & NAVEGACIÓN ── */}
        <div className="pt-3 border-t border-white/10 relative z-10 space-y-3">
          {/* Indicadores de progreso (dots) */}
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step 
                    ? "w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
                    : idx < step 
                    ? "w-2 bg-amber-400/50" 
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2.5">
            {step > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                step === steps.length - 1
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-amber-500/30 hover:brightness-110"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-blue-600/30"
              }`}
            >
              <span>{step === steps.length - 1 ? "¡Comenzar el Viaje!" : "Siguiente"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
