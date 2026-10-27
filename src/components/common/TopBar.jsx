import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import CoinDisplay from "@/components/coins/CoinDisplay";
import AudioSettingsButton from "@/components/settings/AudioSettingsButton";
import TutorialModal from "@/components/tutorial/TutorialModal";
import { getCoins, getStreakInfo, getLevelInfo } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

export default function TopBar() {
  const [coins, setCoins] = useState(getCoins());
  const [streakData, setStreakData] = useState(getStreakInfo());
  const [levelData, setLevelData] = useState(getLevelInfo());
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCoins(getCoins());
      setStreakData(getStreakInfo());
      setLevelData(getLevelInfo());
    };

    window.addEventListener("mt_storage_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("mt_storage_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const { racha, rachaHoy } = streakData;
  const { nivel, xpActual, xpMax, xpPct } = levelData;

  return (
    <>
      <header className="w-full mb-3 select-none">
        <div
          className="flex items-center justify-between w-full rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md shadow-lg"
          style={{
            background: "rgba(30,45,77,0.7)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* 1. Monedas / Tienda */}
          <div className="shrink-0 flex items-center justify-start">
            <CoinDisplay amount={coins} size="sm" clickable={true} />
          </div>

          {/* Divisor */}
          <div className="w-px h-5 bg-white/10 shrink-0 mx-1 sm:mx-1.5" />

          {/* 2. Racha diaria */}
          <div className="shrink-0 flex items-center justify-center gap-1 px-0.5">
            <span
              className="text-base sm:text-lg leading-none shrink-0"
              style={{
                filter:
                  racha > 0
                    ? "drop-shadow(0 0 5px rgba(245,158,11,0.9))"
                    : "grayscale(1) opacity(0.35)",
              }}
            >
              🔥
            </span>
            <div className="leading-tight">
              <div className="flex items-baseline gap-0.5">
                <span
                  className="font-black text-xs sm:text-sm leading-none"
                  style={{ color: racha > 0 ? "#F59E0B" : "#64748b" }}
                >
                  {racha}
                </span>
                <span className="text-[8px] text-slate-400">d</span>
              </div>
              <div
                className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider leading-none mt-0.5"
                style={{ color: rachaHoy ? "#F59E0B" : "#64748b" }}
              >
                {rachaHoy ? "✓ hoy" : "racha"}
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="w-px h-5 bg-white/10 shrink-0 mx-1 sm:mx-1.5" />

          {/* 3. Nivel y XP */}
          <div className="flex-1 min-w-[70px] max-w-[110px] flex flex-col items-center justify-center px-1 gap-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold text-purple-300 leading-tight">
              ⚡ Nivel {nivel}
            </span>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background: "linear-gradient(90deg,#7C3AED,#67E8F9)",
                  width: `${xpPct}%`,
                }}
              />
            </div>
            <span className="text-[7px] sm:text-[8px] text-slate-400 leading-none">
              {xpActual}/{xpMax} XP
            </span>
          </div>

          {/* Divisor */}
          <div className="w-px h-5 bg-white/10 shrink-0 mx-1 sm:mx-1.5" />

          {/* 4. Botones de acción / funciones */}
          <div className="flex items-center gap-1 shrink-0">
            <AudioSettingsButton
              buttonClassName="rounded-lg bg-white/10 border border-white/15 p-1 sm:p-1.5 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer"
              iconClassName="w-3.5 h-3.5"
            />
            <button
              onClick={() => {
                playSfx("tap");
                setShowTutorial(true);
              }}
              className="rounded-lg bg-white/10 border border-white/15 p-1 sm:p-1.5 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer text-white/60 hover:text-white"
              aria-label="Ayuda del juego"
              type="button"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Tutorial / Ayuda */}
      <TutorialModal open={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  );
}
