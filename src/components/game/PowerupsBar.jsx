import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPowerups, usePowerup, buyPowerupWithCoins, getCoins } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";
import { toast } from "sonner";

export default function PowerupsBar({
  onUseLupa,
  onUseCongelador,
  onUseCorazon,
  lupaActive = false,
  congeladorActive = false,
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
      // Intentar comprar con monedas (80 🪙)
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

  return (
    <div className="w-full flex items-center justify-around bg-gradient-to-r from-[#0b1328]/90 via-[#0e172e] to-[#0b1328]/90 border border-amber-500/25 rounded-2xl p-2 shadow-md backdrop-blur-md">
      {/* 1. Lupa */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleLupaClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
          lupaActive
            ? "bg-amber-500/25 border-amber-400 text-amber-200"
            : "bg-white/5 border-white/10 text-white/80 hover:border-amber-400/40"
        }`}
      >
        <span className="text-base leading-none">🔍</span>
        <span className="hidden xs:inline text-[11px]">Lupa</span>
        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black">
          {powerups.lupas}
        </span>
      </motion.button>

      {/* 2. Congelador */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCongeladorClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
          congeladorActive
            ? "bg-cyan-500/25 border-cyan-400 text-cyan-200"
            : "bg-white/5 border-white/10 text-white/80 hover:border-cyan-400/40"
        }`}
      >
        <span className="text-base leading-none">⏳</span>
        <span className="hidden xs:inline text-[11px]">Congelar</span>
        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black">
          {powerups.congeladores}
        </span>
      </motion.button>

      {/* 3. Vida Extra */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCorazonClick}
        disabled={lives >= maxLives}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
          lives < maxLives
            ? "bg-rose-500/20 border-rose-400/50 text-rose-200 hover:bg-rose-500/30"
            : "bg-white/5 border-white/5 text-white/40 cursor-not-allowed"
        }`}
      >
        <span className="text-base leading-none">💖</span>
        <span className="hidden xs:inline text-[11px]">+Vida</span>
        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-black">
          {powerups.corazones}
        </span>
      </motion.button>
    </div>
  );
}
