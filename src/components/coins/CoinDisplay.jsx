import React from "react";
import { Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { playSfx } from "@/utils/soundSystem";

export default function CoinDisplay({ amount = 0, size = "sm", clickable = true }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!clickable) return;
    e.stopPropagation();
    playSfx("tap");
    navigate("/tienda");
  };

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      className={`inline-flex flex-col items-center select-none ${
        clickable ? "cursor-pointer group active:scale-95 transition-transform" : ""
      }`}
    >
      <div
        className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/35 rounded-full flex items-center gap-1 shadow-sm shrink-0"
      >
        <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] sm:text-xs font-black text-amber-300 tabular-nums leading-none">
          {amount.toLocaleString()}
        </span>
      </div>
      {clickable && (
        <span className="text-[8px] sm:text-[9px] text-amber-300/80 font-bold tracking-wider uppercase group-hover:text-amber-200 transition-colors mt-0.5 leading-none">
          Tienda
        </span>
      )}
    </div>
  );
}
