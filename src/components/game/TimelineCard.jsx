import React from "react";
import { Hourglass } from "lucide-react";

function getCenturyTag(year) {
  if (year < 0) {
    const c = Math.ceil(Math.abs(year) / 100);
    return `Siglo ${c} a.C. · Antigüedad`;
  }
  const c = Math.ceil(year / 100);
  if (c <= 5) return `Siglo ${c} d.C. · Era Clásica`;
  if (c <= 15) return `Siglo ${c} d.C. · Edad Media`;
  if (c <= 18) return `Siglo ${c} d.C. · Edad Moderna`;
  return `Siglo ${c} d.C. · Época Contemporánea`;
}

export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
}) {
  const statusStyles = {
    default:
      "border-amber-400/40 bg-gradient-to-br from-[#0d1a38] via-[#091126] to-[#132247] shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
    justPlaced:
      "border-emerald-400 bg-gradient-to-br from-emerald-950/80 via-[#0a1828] to-[#0c1f38] shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/50",
    error:
      "border-red-500 bg-gradient-to-br from-red-950/80 via-[#180a14] to-[#0d1120] shadow-[0_0_25px_rgba(239,68,68,0.3)] ring-2 ring-red-500/50",
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-3xl border-2 p-4 transition-colors duration-200 ${
        statusStyles[status] || statusStyles.default
      }`}
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full pointer-events-none" />

      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-2xl font-black text-sm sm:text-base tracking-wider shadow-lg shadow-amber-500/30">
          <Hourglass className="w-4 h-4 fill-slate-950" />
          <span>{event.yearFormatted}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-200/80">
          <span>{getCenturyTag(event.year)}</span>
        </div>
      </div>

      <div className="mt-3 relative z-10">
        <h3 className="text-white font-black text-base sm:text-lg leading-snug tracking-tight">
          {event.title}
        </h3>
        {event.description && (
          <p className="mt-1.5 text-xs text-amber-100/85 leading-relaxed font-normal">
            {event.description}
          </p>
        )}
      </div>

      {event.datoCurioso && (
        <div className="mt-2.5 pt-2 border-t border-amber-500/20 relative z-10 flex items-start gap-2 text-[11px] text-amber-200/90 bg-black/30 p-2 rounded-xl border border-amber-400/25">
          <span className="text-amber-400 shrink-0 text-xs">💡</span>
          <p className="leading-relaxed">
            <strong className="text-amber-300">Dato curioso:</strong> {event.datoCurioso}
          </p>
        </div>
      )}

      {event.personajeClave && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-300/70 font-semibold relative z-10">
          <span>👤 Figura:</span>
          <span className="text-amber-100">{event.personajeClave}</span>
        </div>
      )}
    </div>
  );
}
