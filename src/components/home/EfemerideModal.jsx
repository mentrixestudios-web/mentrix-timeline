import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  Share2, 
  BookOpen, 
  ArrowRight, 
  Shuffle, 
  Flame, 
  Coins, 
  Clock 
} from "lucide-react";
import { toast } from "sonner";
import { playSfx } from "@/utils/soundSystem";
import { 
  isDailyEphemerisReadToday, 
  markDailyEphemerisAsRead 
} from "@/utils/dailyEphemeris";

export default function EfemerideModal({ 
  open, 
  onClose, 
  efemeride, 
  onShuffle,
  onPlayCategory 
}) {
  const [leidaHoy, setLeidaHoy] = useState(false);

  useEffect(() => {
    if (open) {
      setLeidaHoy(isDailyEphemerisReadToday());
    }
  }, [open, efemeride?.id]);

  if (!open || !efemeride) return null;

  const handleMarcarLeida = () => {
    playSfx("victory");
    const res = markDailyEphemerisAsRead();
    setLeidaHoy(true);
    if (!res.yaLeida) {
      toast.success("🔥 ¡Efeméride leída! +30 monedas y racha diaria actualizada.", {
        duration: 4000
      });
    } else {
      toast.info("Ya habías registrado la efeméride de hoy. ¡Buen hábito historiador!");
    }
  };

  const handleCompartir = () => {
    playSfx("tap");
    const texto = `⏳ *Un día como hoy en la historia:* (${efemeride.fechaTexto} · ${efemeride.anioTexto})\n\n*"${efemeride.titulo}"*\n${efemeride.resumenCorto}\n\n💡 _Dato curioso:_ ${efemeride.curiosidad}\n\nDescubre más y desafía el tiempo en *Mentrix: Línea de Tiempo* 📜`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#131d3b] via-[#0b1328] to-[#070d1e] border border-amber-400/40 p-5 sm:p-6 text-white shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado con resplandor */}
        <div className="shrink-0 mb-3 pr-8">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>EFEMÉRIDE HISTÓRICA DEL DÍA</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
              {efemeride.categoriaLabel || "Historia"}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide leading-snug m-0">
            {efemeride.titulo}
          </h2>

          <div className="flex items-center gap-2 mt-1 text-xs text-amber-300 font-semibold">
            <span>📅 {efemeride.fechaTexto}</span>
            <span>·</span>
            <span>⏳ {efemeride.anioTexto}</span>
            <span>·</span>
            <span className="text-slate-400 font-normal">{efemeride.siglo}</span>
          </div>

          {efemeride.personajeClave && (
            <div className="mt-2 text-[11px] text-slate-300 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 inline-flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">Protagonistas:</span>
              <span className="truncate">{efemeride.personajeClave}</span>
            </div>
          )}
        </div>

        {/* Contenido scrolleable estilo Expediente Histórico */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 text-slate-200">
          
          {/* 1. El Acontecimiento */}
          <div className="bg-[#0f172a]/80 rounded-2xl p-3.5 border border-white/10">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>El Acontecimiento</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-normal m-0">
              {efemeride.relato}
            </p>
          </div>

          {/* 2. Impacto en la Humanidad */}
          <div className="bg-[#0f172a]/80 rounded-2xl p-3.5 border border-white/10">
            <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <span>🌍</span>
              <span>Impacto en la Humanidad</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-normal m-0">
              {efemeride.impacto}
            </p>
          </div>

          {/* 3. Dato Curioso / Sabías que... */}
          <div className="bg-[#19152e]/80 rounded-2xl p-3.5 border border-purple-500/25">
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <span>💡</span>
              <span>¿Sabías que...?</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-purple-100 font-normal italic m-0">
              "{efemeride.curiosidad}"
            </p>
          </div>
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="shrink-0 pt-4 mt-2 border-t border-white/10 flex flex-col gap-2.5">
          
          {/* Botón Marcar como leída / Racha */}
          <button
            type="button"
            onClick={handleMarcarLeida}
            disabled={leidaHoy}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              leidaHoy
                ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default"
                : "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-98"
            }`}
          >
            {leidaHoy ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Efeméride de hoy completada (+30 🪙 y racha al día)</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-slate-950 fill-current" />
                <span>Leer y sumar racha diaria (+30 🪙)</span>
              </>
            )}
          </button>

          {/* Botones secundarios (Jugar categoría + Compartir + Barajar) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                onClose();
                onPlayCategory?.(efemeride.categoria);
              }}
              className="py-2 px-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
              title="Jugar partida con esta categoría"
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Jugar</span>
            </button>

            <button
              type="button"
              onClick={handleCompartir}
              className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
              title="Compartir en WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="truncate">Compartir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                onShuffle?.();
              }}
              className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
              title="Explorar otra efeméride"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0 text-purple-300" />
              <span className="truncate">Otra</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
