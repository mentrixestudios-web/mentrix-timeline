import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TimelineSlot({
  onSelect,
  disabled = false,
  isFrozen = false,
  label = "Insertar aquí",
}) {
  if (isFrozen) {
    return (
      <div className="flex items-center justify-center py-1.5 px-3 my-1 rounded-xl border border-cyan-400/20 bg-cyan-950/20 text-cyan-400/50 text-[10px] font-bold select-none cursor-not-allowed">
        <span>❄️ Descartado por Congelador</span>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onSelect}
      className={`group relative flex items-center justify-center py-2 px-3.5 my-1 rounded-xl border border-dashed transition-all duration-200 cursor-pointer ${
        disabled
          ? "opacity-30 cursor-not-allowed border-white/10"
          : "border-amber-400/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white shadow-sm hover:shadow-amber-500/20 active:scale-95"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
        <span className="text-[11px] tracking-wide">{label}</span>
      </div>
    </motion.button>
  );
}
