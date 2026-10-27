import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function LivesDisplay({ lives = 3, maxLives = 3 }) {
  return (
    <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-full shadow-inner">
      {Array.from({ length: maxLives }).map((_, idx) => {
        const isAlive = idx < lives;
        return (
          <motion.div
            key={idx}
            initial={{ scale: 0.8 }}
            animate={{ scale: isAlive ? 1 : 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                isAlive
                  ? "text-red-500 fill-red-500 filter drop-shadow(0 0 6px rgba(239,68,68,0.6))"
                  : "text-white/20 fill-white/10"
              }`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
