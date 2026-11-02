import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Hourglass,
  Coins,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  obtenerEstadoSala,
  suscribirASala,
  colocarCartaEnLinea,
  getOnlinePlayerProfile,
} from "@/services/onlineMatchService";
import { addCoins, addXp } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

// ─────────────────────────────────────────────────────────────
// Utilidades de presentación (todo el texto se muestra completo)
// ─────────────────────────────────────────────────────────────
const CAT_LABEL = {
  historia: "Historia",
  biblia: "Biblia",
  ciencia: "Ciencia",
  musica: "Música",
  cine: "Cine",
  conflictos: "Conflictos",
  exploraciones: "Exploraciones",
  arte: "Arte y Literatura",
  deportes: "Deportes",
};
const CAT_EMOJI = {
  historia: "🏛️",
  biblia: "📜",
  ciencia: "🔬",
  musica: "🎵",
  cine: "🎬",
  conflictos: "⚔️",
  exploraciones: "🧭",
  arte: "🎨",
  deportes: "🏆",
};

const catLabel = (c) =>
  CAT_LABEL[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " ") : "Historia");
const catEmoji = (c) => CAT_EMOJI[c] || "⏳";

const yearLabel = (c) =>
  c?.yearFormatted || (c?.year >= 0 ? `${c.year} d.C.` : `${Math.abs(c?.year ?? 0)} a.C.`);

// "1872 d.C." -> ["1872", "d.C."]
const splitYear = (c) => {
  const label = yearLabel(c);
  const idx = label.lastIndexOf(" ");
  return idx > 0 ? [label.slice(0, idx), label.slice(idx + 1)] : [label, ""];
};

export default function JuegoOnline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codigoSala = (searchParams.get("sala") || "").toUpperCase();

  const [player] = useState(() => getOnlinePlayerProfile());
  const [sala, setSala] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [procesandoTurno, setProcesandoTurno] = useState(false);
  const [ultimaJugada, setUltimaJugada] = useState(null);
  const [manoAbierta, setManoAbierta] = useState(true);
  const [trayH, setTrayH] = useState(260);

  const lastMoveRef = useRef(null);
  const rewardedRef = useRef(false);
  const trayRef = useRef(null);
  const mesaTopRef = useRef(null);
  const mesaBottomRef = useRef(null);

  // Procesa cualquier estado nuevo de la sala (Realtime, canal local o resultado propio)
  const procesarSala = useCallback(
    (nueva, { silencioso = false } = {}) => {
      if (!nueva) return;

      const ult = nueva.ultimo_movimiento;
      if (ult?.timestamp && ult.timestamp !== lastMoveRef.current) {
        lastMoveRef.current = ult.timestamp;

        if (!silencioso) {
          if (ult.tipo === "acierto" || ult.tipo === "victoria") {
            playSfx("correct");
          } else if (ult.tipo === "error" || ult.tipo === "derrota_vidas") {
            playSfx("wrong");
          }
          if (ult.carta) {
            setUltimaJugada({ ...ult, porMi: undefined });
          }
        }
      }

      if (nueva.estado === "finalizado" && !rewardedRef.current) {
        rewardedRef.current = true;
        if (!silencioso) playSfx("victory");
        if (nueva.ganador_id === player.id) {
          if (!silencioso) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addCoins(50);
          addXp(40);
        } else {
          addCoins(15);
          addXp(15);
        }
      }

      // Realtime puede omitir columnas grandes sin cambios (TOAST): fusionamos con el estado previo
      setSala((prev) => (prev ? { ...prev, ...nueva } : nueva));
    },
    [player.id]
  );

  // 1. Cargar estado inicial y suscribir a eventos Realtime
  useEffect(() => {
    if (!codigoSala) {
      toast.error("Código de sala no proporcionado.");
      navigate("/modos-online");
      return;
    }

    let isMounted = true;

    obtenerEstadoSala(codigoSala).then((data) => {
      if (!isMounted) return;
      if (!data) {
        toast.error("No se encontró la sala solicitada.");
        navigate("/modos-online");
        return;
      }
      // Estado inicial: no repetir sonidos/premios de jugadas anteriores
      lastMoveRef.current = data.ultimo_movimiento?.timestamp || null;
      if (data.estado === "finalizado") rewardedRef.current = true;
      setSala(data);
      setCargando(false);
    });

    const desuscribir = suscribirASala(codigoSala, (salaActualizada) => {
      if (!isMounted) return;
      procesarSala(salaActualizada);
    });

    return () => {
      isMounted = false;
      desuscribir();
    };
  }, [codigoSala, navigate, procesarSala]);

  // El panel de "última jugada" se cierra solo
  useEffect(() => {
    if (!ultimaJugada) return;
    const timer = setTimeout(() => setUltimaJugada(null), 9000);
    return () => clearTimeout(timer);
  }, [ultimaJugada]);

  // Medir la bandeja inferior para que nunca tape la línea de tiempo
  useLayoutEffect(() => {
    const el = trayRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setTrayH(el.offsetHeight));
    ro.observe(el);
    setTrayH(el.offsetHeight);
    return () => ro.disconnect();
  }, [cargando, sala?.estado]);

  useEffect(() => {
    if (!cartaSeleccionada || !sala) return;
    const mano = (sala.host_id === player.id ? sala.mano_host : sala.mano_guest) || [];
    if (!mano.some((c) => c.id === cartaSeleccionada.id)) setCartaSeleccionada(null);
  }, [sala, cartaSeleccionada, player.id]);

  if (cargando || !sala) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center select-none">
        <Hourglass className="w-10 h-10 text-amber-400 animate-spin" />
        <h2 className="text-base font-bold text-white">Sincronizando portal temporal...</h2>
        <p className="text-xs text-slate-400">Conectando a sala {codigoSala}</p>
      </div>
    );
  }

  const esHost = sala.host_id === player.id;
  const esMiTurno = sala.turno_jugador_id === player.id && sala.estado === "jugando";

  const rivalNombre = esHost ? sala.guest_nombre || "Rival" : sala.host_nombre;
  const misVidas = esHost ? sala.vidas_host : sala.vidas_guest;
  const vidasRival = esHost ? sala.vidas_guest : sala.vidas_host;
  const miMano = esHost ? sala.mano_host || [] : sala.mano_guest || [];
  const manoRival = esHost ? sala.mano_guest || [] : sala.mano_host || [];

  const mesa = sala.linea_tiempo_mesa || [];
  const partidaFinalizada = sala.estado === "finalizado";
  const soyGanador = sala.ganador_id === player.id;
  const mostrarSlots = esMiTurno && !!cartaSeleccionada && !procesandoTurno;

  const idCartaReciente = sala.ultimo_movimiento?.carta?.id;

  const handleColocarCarta = async (posicion) => {
    if (!esMiTurno || !cartaSeleccionada || procesandoTurno) return;

    setProcesandoTurno(true);
    playSfx("tap");

    try {
      const resultado = await colocarCartaEnLinea({
        codigoSala,
        jugadorId: player.id,
        carta: cartaSeleccionada,
        posicionInsertada: posicion,
      });
      setCartaSeleccionada(null);
      // En modo local el emisor no recibe su propio mensaje: aplicamos el resultado directamente
      if (resultado) procesarSala(resultado);
    } catch (err) {
      toast.error(err.message || "Error al realizar la jugada");
    } finally {
      setProcesandoTurno(false);
    }
  };

  // Texto de contexto para cada hueco: "Entre 1872 d.C. y 1876 d.C."
  const textoHueco = (pos) => {
    const antes = mesa[pos - 1];
    const despues = mesa[pos];
    if (!antes && despues) return `Antes de ${yearLabel(despues)}`;
    if (antes && !despues) return `Después de ${yearLabel(antes)}`;
    if (antes && despues) return `Entre ${yearLabel(antes)} y ${yearLabel(despues)}`;
    return "Colocar aquí";
  };

  const renderHueco = (pos) => (
    <div className="grid grid-cols-[52px_1fr] gap-2.5 items-center">
      <div className="flex justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse" />
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => handleColocarCarta(pos)}
        className="w-full min-h-[44px] rounded-xl border-2 border-dashed border-emerald-400/70 bg-emerald-500/10 hover:bg-emerald-500/25 active:bg-emerald-500/30 flex items-center justify-center gap-2 px-3 py-2 text-emerald-200 cursor-pointer transition-colors"
      >
        <span className="text-lg font-black leading-none">＋</span>
        <span className="text-xs font-bold leading-tight text-center">{textoHueco(pos)}</span>
      </motion.button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2.5 select-none relative">
      {/* ── CABECERA FIJA: sala, rival y turno ── */}
      <div className="sticky top-0 z-30 -mx-1 px-1 pt-1 pb-3 bg-gradient-to-b from-slate-950 via-slate-950/95 to-transparent flex flex-col gap-2">
        <div
          className="w-full flex items-center justify-between gap-2 rounded-2xl px-3 py-2 backdrop-blur-md"
          style={{
            background: "rgba(30,45,77,0.7)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <button
            onClick={() => {
              playSfx("tap");
              if (window.confirm("¿Seguro que deseas salir de la partida en línea?")) {
                navigate("/modos-online");
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Salir</span>
          </button>

          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40 shrink-0">
            Sala {codigoSala}
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 text-right">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[92px]">{rivalNombre}</div>
              <div className="text-[9px] text-slate-400 leading-none">{manoRival.length} cartas</div>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {[1, 2, 3].map((v) => (
                <Heart
                  key={v}
                  className={`w-3.5 h-3.5 ${
                    v <= vidasRival ? "text-red-500 fill-red-500" : "text-slate-600 fill-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Banner de turno */}
        {partidaFinalizada ? (
          <div
            className={`w-full py-2 px-4 rounded-2xl text-center font-black text-sm border ${
              soyGanador
                ? "bg-amber-500/20 border-amber-400 text-amber-200"
                : "bg-red-500/20 border-red-400 text-red-200"
            }`}
          >
            {soyGanador ? "👑 ¡VICTORIA! Eres el Amo del Tiempo ⏳" : "💀 DERROTA: El rival dominó la línea temporal"}
          </div>
        ) : esMiTurno ? (
          <div className="w-full py-2 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-600/30 via-teal-600/40 to-emerald-600/30 border border-emerald-400/50 text-emerald-200 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>
              {cartaSeleccionada
                ? "Toca “＋” en la línea de tiempo donde encaja esta carta"
                : "⚡ TU TURNO: elige una carta de tu mano"}
            </span>
          </div>
        ) : (
          <div className="w-full py-2 px-4 rounded-2xl text-center font-semibold text-xs text-slate-300 bg-slate-900/60 border border-white/10 flex items-center justify-center gap-2">
            <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
            <span>Turno de {rivalNombre}… esperando su jugada</span>
          </div>
        )}
      </div>

      {/* ── ÚLTIMA JUGADA: la carta completa, legible para ambos jugadores ── */}
      <AnimatePresence>
        {ultimaJugada?.carta && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`w-full rounded-2xl p-3 border relative ${
              ultimaJugada.esCorrecto
                ? "bg-emerald-950/80 border-emerald-500/60"
                : "bg-red-950/80 border-red-500/60"
            }`}
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setUltimaJugada(null)}
              className="absolute top-2 right-2 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p
              className={`text-xs font-black mb-1.5 pr-7 ${
                ultimaJugada.esCorrecto ? "text-emerald-200" : "text-red-200"
              }`}
            >
              {ultimaJugada.mensaje}
            </p>
            <div className="flex items-start gap-3">
              <div className="shrink-0 text-center rounded-lg bg-black/30 border border-amber-400/30 px-2 py-1 min-w-[56px]">
                <div className="text-sm font-black text-amber-300 leading-tight">{splitYear(ultimaJugada.carta)[0]}</div>
                <div className="text-[9px] font-bold text-amber-200/70">{splitYear(ultimaJugada.carta)[1]}</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-white leading-snug">{ultimaJugada.carta.title}</div>
                {ultimaJugada.carta.description && (
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1 mb-0">
                    {ultimaJugada.carta.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LÍNEA DE TIEMPO VERTICAL (cada carta se lee completa) ── */}
      <div
        className="w-full rounded-3xl p-3 relative"
        style={{
          background: "rgba(13,22,41,0.9)",
          border: "1px solid rgba(245,158,11,0.2)",
          marginBottom: trayH + 16,
        }}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            ⏳ Línea de tiempo
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            {mesa.length} evento{mesa.length === 1 ? "" : "s"} colocado{mesa.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="relative flex flex-col gap-2.5">
          {/* Eje vertical del tiempo */}
          <div className="absolute left-[26px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-400/70 via-amber-400/25 to-amber-400/70 pointer-events-none" />

          <div ref={mesaTopRef} className="grid grid-cols-[52px_1fr] gap-2.5 items-center">
            <div className="text-center text-[9px] font-black text-amber-300/70 leading-tight relative z-10 bg-[#0d1629] py-0.5">
              ▲
            </div>
            <div className="text-[9px] font-black tracking-widest text-amber-300/60 uppercase">
              Más antiguo
            </div>
          </div>

          {mostrarSlots && renderHueco(0)}

          {mesa.map((c, idx) => {
            const [num, era] = splitYear(c);
            const esReciente = idCartaReciente && idCartaReciente === c.id;
            return (
              <React.Fragment key={`${c.id}-${idx}`}>
                <motion.div
                  initial={esReciente ? { opacity: 0, scale: 0.96 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-[52px_1fr] gap-2.5 items-start"
                >
                  {/* Sello del año sobre el eje */}
                  <div className="relative z-10 flex justify-center">
                    <div className="w-[52px] rounded-lg bg-[#1a1405] border border-amber-400/50 text-center py-1 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                      <div className="text-[13px] font-black text-amber-300 leading-tight">{num}</div>
                      <div className="text-[9px] font-bold text-amber-200/70 leading-none">{era}</div>
                    </div>
                  </div>

                  {/* Carta completa */}
                  <div
                    className={`rounded-2xl p-3 bg-gradient-to-b from-[#182343] to-[#0f172a] border ${
                      esReciente
                        ? "border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.3)]"
                        : "border-amber-400/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                        <span>{catEmoji(c.category)}</span>
                        <span>{catLabel(c.category)}</span>
                      </span>
                      {esReciente ? (
                        <span className="text-[9px] font-black text-amber-200 uppercase">Recién colocada</span>
                      ) : (
                        c.siglo && <span className="text-[9px] text-slate-400 font-semibold">{c.siglo}</span>
                      )}
                    </div>
                    <h4 className="text-[15px] font-extrabold text-white leading-snug m-0">{c.title}</h4>
                    {c.description && (
                      <p className="text-xs text-slate-300 leading-relaxed mt-1.5 mb-0">{c.description}</p>
                    )}
                    {c.datoCurioso && (
                      <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-400/20 px-2.5 py-1.5">
                        <p className="text-[11px] text-amber-100/90 leading-relaxed italic m-0">
                          <span className="not-italic font-black text-amber-300">💡 Dato curioso · </span>
                          {c.datoCurioso}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {mostrarSlots && renderHueco(idx + 1)}
              </React.Fragment>
            );
          })}

          <div ref={mesaBottomRef} className="grid grid-cols-[52px_1fr] gap-2.5 items-center">
            <div className="text-center text-[9px] font-black text-amber-300/70 leading-tight relative z-10 bg-[#0d1629] py-0.5">
              ▼
            </div>
            <div className="text-[9px] font-black tracking-widest text-amber-300/60 uppercase">
              Más reciente
            </div>
          </div>
        </div>
      </div>

      {/* ── BANDEJA INFERIOR FIJA: tu mano (cartas completas, deslizables) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-2xl mx-auto px-2">
          <div
            ref={trayRef}
            className="pointer-events-auto rounded-t-3xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md"
            style={{
              background: "rgba(8,13,28,0.97)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderBottom: "none",
              boxShadow: "0 -12px 30px rgba(0,0,0,0.55)",
            }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Tu mano</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((v) => (
                    <Heart
                      key={v}
                      className={`w-4 h-4 ${
                        v <= misVidas ? "text-red-500 fill-red-500" : "text-slate-700 fill-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManoAbierta((v) => !v)}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-300 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <span>
                  {miMano.length} carta{miMano.length === 1 ? "" : "s"} por colocar
                </span>
                {manoAbierta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {manoAbierta && (
              <>
                {/* Atajos cuando hay una carta elegida */}
                {mostrarSlots && (
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => handleColocarCarta(0)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 text-[11px] font-bold cursor-pointer active:scale-95"
                    >
                      ▲ Más antigua de todas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleColocarCarta(mesa.length)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 text-[11px] font-bold cursor-pointer active:scale-95"
                    >
                      ▼ Más reciente de todas
                    </button>
                  </div>
                )}

                <div
                  className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 items-stretch"
                  style={{ scrollbarWidth: "none" }}
                >
                  {miMano.map((cartaMano) => {
                    const isSelected = cartaSeleccionada?.id === cartaMano.id;
                    return (
                      <motion.div
                        key={cartaMano.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!esMiTurno) {
                            toast.info("Espera a que tu rival termine su turno.");
                            return;
                          }
                          playSfx("tap");
                          setCartaSeleccionada(isSelected ? null : cartaMano);
                        }}
                        className={`snap-center shrink-0 w-[84%] sm:w-[22rem] max-h-[30vh] overflow-y-auto rounded-2xl p-3 flex flex-col transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-b from-amber-950 via-[#1f1738] to-[#120d24] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                            : "bg-[#11182e] border border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                            <span>{catEmoji(cartaMano.category)}</span>
                            <span>{catLabel(cartaMano.category)}</span>
                          </span>
                          <span className="text-[10px] font-black text-slate-400">🔒 Año oculto</span>
                        </div>

                        <h5 className="text-[15px] font-extrabold text-white leading-snug m-0">
                          {cartaMano.title}
                        </h5>
                        {cartaMano.description && (
                          <p className="text-xs text-slate-300 leading-relaxed mt-1.5 mb-0">
                            {cartaMano.description}
                          </p>
                        )}

                        <div className="mt-2 pt-1.5 border-t border-white/10 text-right">
                          <span
                            className={`text-[11px] font-black ${isSelected ? "text-amber-300" : "text-slate-400"}`}
                          >
                            {isSelected ? "✓ Elegida · colócala en la línea" : "Toca para elegir"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {miMano.length > 1 && (
                  <p className="text-center text-[9px] text-slate-500 mt-1.5 mb-0">
                    ← desliza para ver tus otras cartas →
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL DE FIN DE PARTIDA ── */}
      {partidaFinalizada && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#131d3b] to-[#070d1e] border-2 border-amber-400/50 p-6 text-center text-white shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20">
              {soyGanador ? "👑" : "💀"}
            </div>

            <div>
              <h2 className="text-xl font-black text-white m-0">
                {soyGanador ? "¡HAS GANADO EL DUELO!" : "HAS SIDO DERROTADO"}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {sala.ultimo_movimiento?.mensaje || "La línea temporal ha quedado sellada."}
              </p>
            </div>

            <div className="py-2.5 px-4 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-around">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Monedas</span>
                <span className="text-sm font-black text-amber-300 flex items-center justify-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{soyGanador ? 50 : 15}</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Experiencia</span>
                <span className="text-sm font-black text-purple-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{soyGanador ? 40 : 15} XP</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/modos-online")}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              Volver al Lobby Online
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
