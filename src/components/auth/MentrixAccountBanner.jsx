import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, ShieldCheck, LogIn, CheckCircle2, Coins, User } from "lucide-react";
import { useMentrixAuth } from "@/context/MentrixAuthContext";
import MentrixAuthModal from "./MentrixAuthModal";
import { playSfx } from "@/utils/soundSystem";

export default function MentrixAccountBanner({ compact = false }) {
  const { user, isLoggedIn } = useMentrixAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    playSfx("tap");
    setModalOpen(true);
  };

  return (
    <>
      <div className="w-full">
        {isLoggedIn ? (
          /* Estado Conectado */
          <div
            onClick={handleClick}
            className="w-full rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/50 hover:border-emerald-400/70 shadow-lg shadow-emerald-950/30 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar Google"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full border-2 border-emerald-400/80 shadow-md shadow-emerald-500/30 object-cover shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-xl shrink-0">
                  👤
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-white truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "Jugador Mentrix"}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                    <span>Conectado</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate m-0 mt-0.5">
                  {user.email} · Monedas respaldadas ☁️
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-bold text-emerald-400 group-hover:underline">
                Gestionar
              </span>
            </div>
          </div>
        ) : (
          /* Estado No Conectado (Invitación) */
          <div
            onClick={handleClick}
            className="w-full rounded-2xl p-3.5 bg-gradient-to-r from-amber-950/50 via-yellow-950/30 to-slate-900 border border-amber-400/40 hover:border-amber-300/70 shadow-lg shadow-amber-950/30 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none relative overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
                  🛡️
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-amber-300 tracking-tight">
                    Respalda tu cuenta y monedas
                  </span>
                </div>
                <p className="text-[10px] text-slate-300/85 leading-snug line-clamp-1 m-0">
                  Inicia sesión con Google para ver tu foto y no perder tus compras
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                type="button"
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] shadow-md shadow-amber-500/25 group-hover:scale-102 transition-transform cursor-pointer"
              >
                Conectar
              </button>
            </div>
          </div>
        )}
      </div>

      <MentrixAuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
