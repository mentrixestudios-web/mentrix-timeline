import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPowerups, usePowerup, buyPowerupWithCoins, getCoins } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";
import { toast } from "sonner";
import { RefreshCw, Anchor } from "lucide-react";

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

  useEffect(() => {
    const handleUpdate = () => {
      setPowerups(getPowerups());
      setCoins(getCoins());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  const handleLupaClick = () => {
    if (lupaActive) {
      toast.info("La lupa ya está activa en esta carta");
      return;
    }
    if (powerups.lupas > 0) {
      usePowerup("lupas");
      playSfx("tap");
      onUseLupa();
      toast.success("🔍 ¡Lupa activada! Siglo revelado.");
    } else {
      if (coins >= 80) {
        if (buyPowerupWithCoins("lupas", 80)) {
          usePowerup("lupas");
          playSfx("coin");
          onUseLupa();
          toast.success("🔍 Lupa comprada (80 🪙) y activada.");
        }
      } else {
        toast.error("No tienes lupas ni suficientes monedas (80 🪙)");
      }
    }
  };

  const handleCongeladorClick = () => {
    if (congeladorActive) {
      toast.info("El congelador ya descartó opciones en esta ronda");
      return;
    }
    if (powerups.congeladores > 0) {
      usePowerup("congeladores");
      playSfx("tap");
      onUseCongelador();
      toast.success("⏳ ¡Congelador activado! Opciones erróneas descartadas.");
    } else {
      if (coins >= 60) {
        if (buyPowerupWithCoins("congeladores", 60)) {
          usePowerup("congeladores");
          playSfx("coin");
          onUseCongelador();
          toast.success("⏳ Congelador comprado (60 🪙) y activado.");
        }
      } else {
        toast.error("No tienes congeladores ni suficientes monedas (60 🪙)");
      }
    }
  };

  const handleCorazonClick = () => {
    if (lives >= maxLives) {
      toast.info("¡Tus vidas ya están al máximo!");
      return;
    }
    if (powerups.corazones > 0) {
      usePowerup("corazones");
      playSfx("victory");
      onUseCorazon();
      toast.success("💖 ¡Segundo Aire! +1 Vida recuperada.");
    } else {
      if (coins >= 100) {
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

  const handleSaltoClick = () => {
    if (saltoUsed) {
      toast.info("Ya utilizaste tu Salto Temporal en esta partida");
      return;
    }
    playSfx("tap");
    onUseSalto?.();
  };

  const handleAnclaClick = () => {
    if (anclaActive) {
      toast.info("El Ancla Temporal ya está activa en esta carta");
      return;
    }
    playSfx("tap");
    onUseAncla?.();
  };

  return (
    <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 bg-gradient-to-r from-[#0b1328]/95 via-[#0e172e] to-[#0b1328]/95 border border-amber-500/25 rounded-2xl p-1.5 sm:p-2 shadow-md overflow-x-auto">
      {/* 1. Lupa */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleLupaClick}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
          lupaActive
            ? "bg-amber-500/25 border-amber-400 text-amber-200"
            : "bg-white/5 border-white/10 text-white/80 hover:border-amber-400/40"
        }`}
        title="Revela el siglo exacto de la carta"
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
        onClick={handleCongeladorClick}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
          congeladorActive
            ? "bg-cyan-500/25 border-cyan-400 text-cyan-200"
            : "bg-white/5 border-white/10 text-white/80 hover:border-cyan-400/40"
        }`}
        title="Descarta dos ranuras incorrectas"
      >
        <span className="text-sm leading-none">⏳</span>
        <span className="hidden sm:inline text-[11px]">Congelar</span>
        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black">
          {powerups.congeladores}
        </span>
      </motion.button>

      {/* 3. Salto Temporal (Descarte Táctico) */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSaltoClick}
        disabled={saltoUsed}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
          saltoUsed
            ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed opacity-50"
            : "bg-purple-600/20 border-purple-400/50 text-purple-200 hover:bg-purple-600/30"
        }`}
        title="Descarta esta carta y roba otra (1 vez por partida)"
      >
        <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
        <span className="hidden sm:inline text-[11px]">Salto</span>
        <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-black">
          {saltoUsed ? "0" : "1"}
        </span>
      </motion.button>

      {/* 4. Ancla Temporal (Orientación por Tercio) */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAnclaClick}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
          anclaActive
            ? "bg-teal-500/25 border-teal-400 text-teal-200"
            : "bg-white/5 border-white/10 text-white/80 hover:border-teal-400/40"
        }`}
        title="Indica si la carta pertenece al pasado, era media o contemporánea"
      >
        <Anchor className="w-3.5 h-3.5 text-teal-300" />
        <span className="hidden sm:inline text-[11px]">Ancla</span>
      </motion.button>

      {/* 5. Vida Extra */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCorazonClick}
        disabled={lives >= maxLives}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
          lives < maxLives
            ? "bg-rose-500/20 border-rose-400/50 text-rose-200 hover:bg-rose-500/30"
            : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
        }`}
        title="Recupera 1 corazón de vida"
      >
        <span className="text-sm leading-none">💖</span>
        <span className="hidden sm:inline text-[11px]">+Vida</span>
        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-black">
          {powerups.corazones}
        </span>
      </motion.button>
    </div>
  );
}
