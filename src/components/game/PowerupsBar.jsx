import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPowerups, usePowerup, buyPowerupWithCoins, getCoins } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";
import { toast } from "sonner";
import { RefreshCw, Anchor, HelpCircle, X, Check, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

// Metadata detallada para cada comodín/facultad
const POWERUPS_INFO = {
  lupas: {
    id: "lupas",
    titulo: "Lupa del Siglo",
    icono: "🔍",
    costoMonedas: 80,
    colorTheme: "from-amber-600/30 to-yellow-950/40 border-amber-400 text-amber-300",
    botonColor: "bg-amber-500 hover:bg-amber-400 text-slate-950",
    descripcion:
      "Escanea las coordenadas temporales de tu carta activa y revela el siglo exacto y la era histórica (por ejemplo: 'Siglo XX d.C. · Época Contemporánea').",
    beneficio: "Ideal para no equivocarte de era en acontecimientos muy antiguos o contemporáneos.",
    limitacion: "Se usa 1 vez por carta. Si pasas a la siguiente carta, deberás activar otra lupa.",
    comoConseguir: "Comprando más en la Tienda, canjeando 80 monedas aquí mismo o en cofres de recompensas.",
  },
  congeladores: {
    id: "congeladores",
    titulo: "Congelador de Eras",
    icono: "⏳",
    costoMonedas: 60,
    colorTheme: "from-cyan-600/30 to-blue-950/40 border-cyan-400 text-cyan-300",
    botonColor: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
    descripcion:
      "Congela y bloquea dos ranuras incorrectas del tablero actual, reduciendo las opciones donde podrías equivocarte.",
    beneficio: "Descarta automáticamente fechas trampa y te deja un camino más seguro.",
    limitacion: "Solo descarta ranuras erróneas de la carta actual. No revela la exacta, pero acorta el margen de error.",
    comoConseguir: "Consíguelos por 60 monedas o en paquetes de la Tienda de Monedas.",
  },
  salto: {
    id: "salto",
    titulo: "Salto Temporal (Descarte)",
    icono: "🌀",
    costoMonedas: 0,
    gratisPorPartida: true,
    colorTheme: "from-purple-600/30 to-indigo-950/40 border-purple-400 text-purple-300",
    botonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    descripcion:
      "Devuelve la carta que tienes en mano al fondo del mazo y roba una completamente nueva sin perder ninguna vida.",
    beneficio: "Si te sale un evento muy difícil o dudoso, sáltatelo de inmediato.",
    limitacion: "Disponible 1 vez gratis por partida. No acumulable.",
    comoConseguir: "Se recarga automáticamente al comenzar cada nueva partida.",
  },
  ancla: {
    id: "ancla",
    titulo: "Ancla Temporal",
    icono: "⚓",
    costoMonedas: 40,
    colorTheme: "from-teal-600/30 to-emerald-950/40 border-teal-400 text-teal-300",
    botonColor: "bg-teal-500 hover:bg-teal-400 text-slate-950",
    descripcion:
      "Fija una brújula cronológica indicando en qué tercio del tablero se encuentra tu carta (Pasado Remoto, Medioevo/Renacimiento o Era Contemporánea).",
    beneficio: "Te orienta rápidamente si debes buscar la ranura arriba, al medio o abajo en la línea.",
    limitacion: "Activa una orientación general de tercio, no el año exacto.",
    comoConseguir: "Cuesta solo 40 monedas o mediante logros históricos.",
  },
  corazones: {
    id: "corazones",
    titulo: "Segundo Aire (+1 Vida)",
    icono: "💖",
    costoMonedas: 100,
    colorTheme: "from-rose-600/30 to-pink-950/40 border-rose-400 text-rose-300",
    botonColor: "bg-rose-500 hover:bg-rose-400 text-white",
    descripcion:
      "Restaura inmediatamente 1 corazón de vida perdido, salvando tu racha y alejándote del colapso temporal (Game Over).",
    beneficio: "Te permite continuar partidas donde estás a 1 o 2 cartas de la victoria.",
    limitacion: "Solo puedes usarlo si has perdido al menos una vida (hasta tu límite máximo de corazones).",
    comoConseguir: "Cuesta 100 monedas o con paquetes de bienestar en la Tienda.",
  },
};

export default function PowerupsBar({
  onUseLupa,
  onUseCongelador,
  onUseCorazon,
  onUseSalto,
  onUseAncla,
  lupaActive = false,
  congeladorActive = false,
  anclaActive = false,
  saltoUsed = false,
  lives = 3,
  maxLives = 3,
}) {
  const [powerups, setPowerups] = useState(getPowerups());
  const [coins, setCoins] = useState(getCoins());
  const [modalPowerup, setModalPowerup] = useState(null); // 'lupas' | 'congeladores' | 'salto' | 'ancla' | 'corazones' | null

  useEffect(() => {
    const handleUpdate = () => {
      setPowerups(getPowerups());
      setCoins(getCoins());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  // Abrir modal explicativo
  const openModal = (type) => {
    playSfx("tap");
    setModalPowerup(type);
  };

  const closeModal = () => {
    setModalPowerup(null);
  };

  // Confirmar activación del comodín desde el modal
  const handleConfirmUse = (type) => {
    closeModal();

    if (type === "lupas") {
      if (lupaActive) {
        toast.info("La lupa ya está activa en esta carta");
        return;
      }
      if (powerups.lupas > 0) {
        usePowerup("lupas");
        playSfx("tap");
        onUseLupa();
        toast.success("🔍 ¡Lupa activada! Siglo revelado.");
      } else if (coins >= 80) {
        if (buyPowerupWithCoins("lupas", 80)) {
          usePowerup("lupas");
          playSfx("coin");
          onUseLupa();
          toast.success("🔍 Lupa comprada (80 🪙) y activada.");
        }
      } else {
        toast.error("No tienes lupas ni suficientes monedas (80 🪙)");
      }
    } else if (type === "congeladores") {
      if (congeladorActive) {
        toast.info("El congelador ya descartó opciones en esta ronda");
        return;
      }
      if (powerups.congeladores > 0) {
        usePowerup("congeladores");
        playSfx("tap");
        onUseCongelador();
        toast.success("⏳ ¡Congelador activado! Opciones erróneas descartadas.");
      } else if (coins >= 60) {
        if (buyPowerupWithCoins("congeladores", 60)) {
          usePowerup("congeladores");
          playSfx("coin");
          onUseCongelador();
          toast.success("⏳ Congelador comprado (60 🪙) y activado.");
        }
      } else {
        toast.error("No tienes congeladores ni suficientes monedas (60 🪙)");
      }
    } else if (type === "salto") {
      if (saltoUsed) {
        toast.info("Ya utilizaste tu Salto Temporal en esta partida");
        return;
      }
      playSfx("tap");
      onUseSalto?.();
    } else if (type === "ancla") {
      if (anclaActive) {
        toast.info("El Ancla Temporal ya está activa en esta carta");
        return;
      }
      if (coins >= 40) {
        if (buyPowerupWithCoins("ancla", 40)) {
          playSfx("coin");
          onUseAncla?.();
        }
      } else {
        playSfx("tap");
        onUseAncla?.(); // Si tiene saldo o es primera vez
      }
    } else if (type === "corazones") {
      if (lives >= maxLives) {
        toast.info("¡Tus vidas ya están al máximo!");
        return;
      }
      if (powerups.corazones > 0) {
        usePowerup("corazones");
        playSfx("victory");
        onUseCorazon();
        toast.success("💖 ¡Segundo Aire! +1 Vida recuperada.");
      } else if (coins >= 100) {
        if (buyPowerupWithCoins("corazones", 100)) {
          usePowerup("corazones");
          playSfx("coin");
          onUseCorazon();
          toast.success("💖 Vida comprada (100 🪙) y recuperada.");
        }
      } else {
        toast.error("No tienes vidas extra ni suficientes monedas (100 🪙)");
      }
    }
  };

  const selectedInfo = modalPowerup ? POWERUPS_INFO[modalPowerup] : null;

  return (
    <>
      <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 bg-gradient-to-r from-[#0b1328]/95 via-[#0e172e] to-[#0b1328]/95 border border-amber-500/25 rounded-2xl p-1.5 sm:p-2 shadow-md overflow-x-auto">
        {/* 1. Lupa */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal("lupas")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
            lupaActive
              ? "bg-amber-500/25 border-amber-400 text-amber-200"
              : "bg-white/5 border-white/10 text-white/80 hover:border-amber-400/40"
          }`}
          title="Ver explicación y usar Lupa"
        >
          <span className="text-sm leading-none">🔍</span>
          <span className="hidden sm:inline text-[11px]">Lupa</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black">
            {powerups.lupas}
          </span>
        </motion.button>

        {/* 2. Congelador */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal("congeladores")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
            congeladorActive
              ? "bg-cyan-500/25 border-cyan-400 text-cyan-200"
              : "bg-white/5 border-white/10 text-white/80 hover:border-cyan-400/40"
          }`}
          title="Ver explicación y usar Congelador"
        >
          <span className="text-sm leading-none">⏳</span>
          <span className="hidden sm:inline text-[11px]">Congelar</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black">
            {powerups.congeladores}
          </span>
        </motion.button>

        {/* 3. Salto Temporal */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal("salto")}
          disabled={saltoUsed}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
            saltoUsed
              ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed opacity-50"
              : "bg-purple-600/20 border-purple-400/50 text-purple-200 hover:bg-purple-600/30"
          }`}
          title="Ver explicación y usar Salto Temporal"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline text-[11px]">Salto</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-black">
            {saltoUsed ? "0" : "1"}
          </span>
        </motion.button>

        {/* 4. Ancla Temporal */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal("ancla")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
            anclaActive
              ? "bg-teal-500/25 border-teal-400 text-teal-200"
              : "bg-white/5 border-white/10 text-white/80 hover:border-teal-400/40"
          }`}
          title="Ver explicación y usar Ancla Temporal"
        >
          <Anchor className="w-3.5 h-3.5 text-teal-300" />
          <span className="hidden sm:inline text-[11px]">Ancla</span>
        </motion.button>

        {/* 5. Vida Extra */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal("corazones")}
          disabled={lives >= maxLives}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
            lives < maxLives
              ? "bg-rose-500/20 border-rose-400/50 text-rose-200 hover:bg-rose-500/30"
              : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
          }`}
          title="Ver explicación y recuperar Vida"
        >
          <span className="text-sm leading-none">💖</span>
          <span className="hidden sm:inline text-[11px]">+Vida</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-black">
            {powerups.corazones}
          </span>
        </motion.button>
      </div>

      {/* ========================================================
          MODAL EXPLICATIVO Y DE CONFIRMACIÓN DE COMODÍN
         ======================================================== */}
      <AnimatePresence>
        {modalPowerup && selectedInfo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-b from-[#101b3b] via-[#0b1328] to-[#070b18] border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-left relative overflow-hidden"
            >
              {/* Botón cerrar esquina */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cabecera del Comodín */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border bg-gradient-to-br ${selectedInfo.colorTheme}`}>
                  {selectedInfo.icono}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Facultad Temporal
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {selectedInfo.titulo}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                    <span>Disponibles:</span>
                    <strong className="text-amber-300">
                      {modalPowerup === "salto"
                        ? (saltoUsed ? "0 (Usado)" : "1 Gratis")
                        : (powerups[modalPowerup] ?? 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* ¿Qué hace? */}
              <div className="space-y-3 text-xs leading-relaxed text-slate-200">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ¿Qué hace este comodín?
                  </p>
                  <p className="text-slate-300 text-[11px]">{selectedInfo.descripcion}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px]">
                  <strong>💡 Ventaja:</strong> {selectedInfo.beneficio}
                </div>

                <div className="p-2.5 rounded-2xl bg-amber-950/30 border border-amber-500/25 text-amber-200 text-[11px]">
                  <strong>⚠️ Limitación:</strong> {selectedInfo.limitacion}
                </div>

                <div className="p-2.5 rounded-2xl bg-purple-950/30 border border-purple-500/25 text-purple-200 text-[11px]">
                  <strong>🛒 ¿Cómo conseguir más?</strong> {selectedInfo.comoConseguir}
                </div>
              </div>

              {/* Acciones: Cancelar o Confirmar Uso */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors text-center"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmUse(modalPowerup)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black tracking-wide shadow-lg transition-all flex items-center justify-center gap-1.5 ${selectedInfo.botonColor}`}
                >
                  <Check className="w-4 h-4" />
                  <span>Usar Ahora</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
