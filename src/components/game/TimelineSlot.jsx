import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TimelineSlot({ onSelect, disabled = false, label = "Insertar aquí" }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      disabled={disabled}
      onClick={onSelect}
      className={`group relative flex items-center justify-center py-2 px-3 my-1 rounded-xl border border-dashed transition-all duration-200 ${
        disabled
          ? "opacity-30 cursor-not-allowed border-white/10"
          : "border-blue-400/40 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white shadow-sm hover:shadow-blue-500/20"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
        <span className="text-[11px] font-medium tracking-wide">{label}</span>
      </div>
    </motion.button>
  );
}
