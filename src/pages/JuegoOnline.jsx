import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Crown,
  Trophy,
  Swords,
  Timer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users
} from "lucide-react";
import { toast } from "sonner";
import {
  obtenerEstadoSala,
  suscribirASala,
  colocarCartaEnLinea,
  forzarPasoTurnoOnline,
  getOnlinePlayerProfile,
  AVATARES_MESA
} from "@/services/onlineMatchService";
import { addCoins, addXp } from "@/utils/gameStorage";
import { playSfx, playBgm } from "@/utils/soundSystem";
import TimelineCard from "@/components/game/TimelineCard";
import TimelineSlot from "@/components/game/TimelineSlot";
import MentrixMascot from "@/components/game/MentrixMascot";

export default function JuegoOnline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codigoSala = (searchParams.get("sala") || "").toUpperCase();

  const [player] = useState(() => getOnlinePlayerProfile());
  const [sala, setSala] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [procesandoTurno, setProcesandoTurno] = useState(false);
  const [justPlacedId, setJustPlacedId] = useState(null);
  const [manoAbierta, setManoAbierta] = useState(true);

  // Temporizador de turno (20 segundos)
  const [segundosRestantes, setSegundosRestantes] = useState(20);
  const timerRef = useRef(null);
  const lastMoveRef = useRef(null);
  const rewardedRef = useRef(false);

  useEffect(() => {
    playBgm("game");
  }, []);

  // Procesa cualquier actualización de sala en tiempo real
  const procesarSala = useCallback(
    (nueva, { silencioso = false } = {}) => {
      if (!nueva) return;

      const ult = nueva.ultimo_movimiento;
      if (ult?.timestamp && ult.timestamp !== lastMoveRef.current) {
        lastMoveRef.current = ult.timestamp;

        if (!silencioso) {
          if (ult.tipo === "acierto" || ult.tipo === "victoria") {
            playSfx("correct");
            if (ult.carta?.id) {
              setJustPlacedId(ult.carta.id);
              setTimeout(() => setJustPlacedId(null), 2000);
            }
          } else if (ult.tipo === "error" || ult.tipo === "eliminacion" || ult.tipo === "tiempo_agotado") {
            playSfx("wrong");
          }
        }
      }

      // Reiniciar temporizador al cambiar el turno
      setSegundosRestantes(20);

      // Si la partida terminó y el usuario gana el Pozo
      if (nueva.estado === "finalizado" && !rewardedRef.current) {
        rewardedRef.current = true;
        if (!silencioso) playSfx("victory");

        const pozo = nueva.pozo_total || (nueva.apuesta || 50) * (nueva.jugadores?.length || 2);

        if (nueva.ganador_id === player.id) {
          if (!silencioso) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
          }
          addCoins(pozo);
          addXp(60);
          toast.success(`👑 ¡FELICITACIONES! Te has llevado el Pozo de ${pozo.toLocaleString()} 🪙`);
        } else {
          // Recompensa de consolación por participar
          addCoins(15);
          addXp(20);
        }
      }

      setSala(nueva);
    },
    [player.id]
  );

  // 1. Cargar estado inicial y suscribir
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
      lastMoveRef.current = data.ultimo_movimiento?.timestamp || null;
      if (data.estado === "finalizado") rewardedRef.current = true;
      setSala(data);
      setCargando(false);
    });

    const desuscribir = suscribirASala(codigoSala, (actualizada) => {
      if (!isMounted) return;
      procesarSala(actualizada);
    });

    return () => {
      isMounted = false;
      desuscribir();
    };
  }, [codigoSala, navigate, procesarSala]);

  // 2. Temporizador regresivo de 20 segundos para el turno activo
  useEffect(() => {
    if (!sala || sala.estado !== "jugando") return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Si el jugador local es el que tiene el turno activo y se le acabó el tiempo
          if (sala.turno_jugador_id === player.id && !procesandoTurno) {
            playSfx("wrong");
            toast.error("⏰ ¡Se agotó tu tiempo de turno!");
            forzarPasoTurnoOnline({ codigoSala, jugadorId: player.id });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.turno_jugador_id, sala?.estado, player.id, codigoSala, procesandoTurno]);

  // Manejar colocación de carta en un slot
  const handleColocarCarta = async (posicionInsertada) => {
    if (!cartaSeleccionada || procesandoTurno) return;
    if (sala.turno_jugador_id !== player.id) {
      toast.error("No es tu turno.");
      return;
    }

    setProcesandoTurno(true);
    playSfx("tap");

    try {
      const nuevaSala = await colocarCartaEnLinea({
        codigoSala,
        jugadorId: player.id,
        carta: cartaSeleccionada,
        posicionInsertada,
      });

      setCartaSeleccionada(null);
      if (nuevaSala) {
        procesarSala(nuevaSala);
      }
    } catch (err) {
      toast.error(err.message || "Error al colocar la carta");
    } finally {
      setProcesandoTurno(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-xs font-black text-amber-300">Conectando a la mesa temporal...</p>
      </div>
    );
  }

  if (!sala) return null;

  const jugadores = sala.jugadores || [];
  const jugadorLocal = jugadores.find((j) => j.id === player.id) || {
    id: player.id,
    nombre: player.name,
    avatar: "👑",
    vidas: 3,
    cartasEnMano: [],
  };

  const esMiTurno = sala.estado === "jugando" && sala.turno_jugador_id === player.id;
  const jugadorEnTurno = jugadores.find((j) => j.id === sala.turno_jugador_id) || jugadores[0];
  const mesa = sala.linea_tiempo_mesa || [];
  const pozoTotal = sala.pozo_total || (sala.apuesta || 50) * jugadores.length;
  const ganador = jugadores.find((j) => j.id === sala.ganador_id);
  const soyGanador = sala.ganador_id === player.id;

  // Frase dinámica de Menti Crononauta
  const fraseMenti = () => {
    if (sala.estado === "finalizado") {
      return soyGanador
        ? `¡Enhorabuena, Crononauta Supremo! Has dominado la historia y te llevas el Pozo de ${pozoTotal.toLocaleString()} monedas.`
        : `¡Partida finalizada! ${ganador?.nombre || "El rival"} se coronó Campeón de la Mesa. ¡Sigue entrenando tu cronología!`;
    }
    if (esMiTurno) {
      return cartaSeleccionada
        ? `Has elegido "${cartaSeleccionada.title}". Ahora toca una de las ranuras doradas [+] del tablero para insertarla en su época exacta.`
        : "¡Es tu turno de viajar en el tiempo! Toca una de tus cartas en la bandeja inferior para prepararla.";
    }
    return `Observando el tablero... Es el turno de ${jugadorEnTurno?.nombre}. ¡Fíjate bien en qué año coloca su evento!`;
  };

  return (
    <div className="space-y-3 select-none pb-48 relative min-h-screen">
      {/* ── HEADER SUPERIOR: SALIR, CÓDIGO Y POZO ACUMULADO ── */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md sticky top-1 z-30 shadow-lg">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            playSfx("tap");
            if (confirm("¿Seguro que deseas salir de la partida en curso?")) {
              navigate("/modos-online");
            }
          }}
          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Rendirse</span>
        </motion.button>

        {/* POZO DE LA MESA */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
            POZO:
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
            {pozoTotal.toLocaleString()} 🪙
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black px-2 py-1 rounded-xl bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-mono">
            {codigoSala}
          </span>
        </div>
      </div>

      {/* ── BARRA SUPERIOR DE LOS 2 A 6 JUGADORES (ESTILO LUDO CLUB) ── */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#0a1224] via-[#09152b] to-[#0a1224] border border-white/10 shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {jugadores.map((j, idx) => {
            const isTurno = sala.turno_jugador_id === j.id && sala.estado === "jugando";
            const isMe = j.id === player.id;
            const isEliminado = j.eliminado || j.vidas <= 0;

            return (
              <div
                key={j.id}
                className={`p-2 rounded-xl border transition-all text-center relative ${
                  isTurno
                    ? "bg-gradient-to-b from-amber-500/30 via-yellow-500/20 to-amber-950/40 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.03]"
                    : isEliminado
                    ? "bg-rose-950/30 border-rose-500/30 opacity-40"
                    : isMe
                    ? "bg-blue-950/40 border-cyan-400/40"
                    : "bg-white/5 border-white/10 opacity-80"
                }`}
              >
                {/* Badge Turno Activo */}
                {isTurno && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                    TURNO ({segundosRestantes}s)
                  </span>
                )}

                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-base">{j.avatar || AVATARES_MESA[idx % AVATARES_MESA.length]}</span>
                  <p className="text-[11px] font-black text-white truncate max-w-[80px]">
                    {j.nombre}
                  </p>
                  {isMe && <span className="text-[9px] text-cyan-300 font-bold">(Tú)</span>}
                </div>

                {/* Vidas restantes */}
                <div className="flex items-center justify-center gap-0.5 my-1">
                  {isEliminado ? (
                    <span className="text-[9px] font-black text-rose-400">💀 ELIMINADO</span>
                  ) : (
                    [1, 2, 3].map((v) => (
                      <Heart
                        key={v}
                        className={`w-3 h-3 ${
                          v <= (j.vidas ?? 3)
                            ? "fill-rose-500 text-rose-500"
                            : "text-white/20"
                        }`}
                      />
                    ))
                  )}
                </div>

                {/* Cartas restantes en mano */}
                <span className="text-[10px] font-extrabold text-amber-200/90 bg-black/40 px-2 py-0.5 rounded-full inline-block">
                  🎴 {j.cartasEnMano?.length ?? 0} cartas
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BANNER DE ESTADO / RETROALIMENTACIÓN DE ÚLTIMA JUGADA ── */}
      <AnimatePresence mode="wait">
        {sala.ultimo_movimiento?.mensaje && (
          <motion.div
            key={sala.ultimo_movimiento.timestamp}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border shadow-md text-center ${
              sala.ultimo_movimiento.tipo === "acierto" || sala.ultimo_movimiento.tipo === "victoria"
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-emerald-500/20"
                : sala.ultimo_movimiento.tipo === "error" || sala.ultimo_movimiento.tipo === "eliminacion" || sala.ultimo_movimiento.tipo === "tiempo_agotado"
                ? "bg-rose-950/80 border-rose-500 text-rose-200 shadow-rose-500/20"
                : "bg-blue-950/80 border-cyan-500 text-cyan-200 shadow-cyan-500/20"
            }`}
          >
            {sala.ultimo_movimiento.tipo === "acierto" || sala.ultimo_movimiento.tipo === "victoria" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : sala.ultimo_movimiento.tipo === "error" || sala.ultimo_movimiento.tipo === "tiempo_agotado" ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{sala.ultimo_movimiento.mensaje}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CARTA ACTIVA PREPARADA PARA INSERTAR ── */}
      {cartaSeleccionada && esMiTurno && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="sticky top-14 z-20 p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-2 border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl">⏳</span>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block">
                CARTA LISTA PARA COLOCAR · TOCA UNA RANURA [+] EN EL TABLERO
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                {cartaSeleccionada.title}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCartaSeleccionada(null)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0"
            title="Deseleccionar"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          LÍNEA DE TIEMPO INTERACTIVA COMPARTIDA
      ══════════════════════════════════════════════════════════ */}
      <div className="relative py-2">
        {/* Marcador Cósmico del Pasado Remoto */}
        <div className="flex items-center justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span>🏛️</span>
            <span>COMIENZO DE LA HISTORIA · PASADO REMOTO</span>
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Tablero con Eje Cronológico Continuo */}
        <div className="space-y-1 relative">
          {/* EJE CENTRAL DE ENERGÍA TEMPORAL */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-500/20 via-amber-400/50 to-blue-500/30 pointer-events-none shadow-[0_0_8px_rgba(245,158,11,0.3)]" />

          {/* Ranura Inicial (Antes del primer evento) */}
          <TimelineSlot
            onSelect={() => handleColocarCarta(0)}
            disabled={!esMiTurno || !cartaSeleccionada || procesandoTurno}
            nextYear={mesa[0]?.yearFormatted}
          />

          {mesa.map((event, idx) => (
            <React.Fragment key={event.id || idx}>
              <TimelineCard
                event={event}
                index={idx}
                status={justPlacedId === event.id ? "justPlaced" : "default"}
              />

              <TimelineSlot
                onSelect={() => handleColocarCarta(idx + 1)}
                disabled={!esMiTurno || !cartaSeleccionada || procesandoTurno}
                prevYear={event.yearFormatted}
                nextYear={mesa[idx + 1]?.yearFormatted}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Marcador Cósmico del Presente */}
        <div className="flex items-center justify-center mt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>PRESENTE HISTÓRICO · ÉPOCA ACTUAL</span>
            <span>⚡</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          BANDEJA INFERIOR FLOTANTE DE CARTAS EN MANO DEL JUGADOR
      ══════════════════════════════════════════════════════════ */}
      {sala.estado === "jugando" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-3 bg-gradient-to-t from-slate-950 via-[#070e1c] to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="rounded-3xl bg-[#091326]/95 border-2 border-amber-400/60 shadow-2xl backdrop-blur-xl p-3 space-y-2">
              
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎴</span>
                  <span className="text-xs font-black text-white">
                    Tus Cartas en Mano ({jugadorLocal.cartasEnMano?.length || 0})
                  </span>
                  {esMiTurno ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 animate-pulse">
                      ¡ES TU TURNO! ({segundosRestantes}s)
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Esperando a {jugadorEnTurno?.nombre}...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setManoAbierta(!manoAbierta)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                >
                  {manoAbierta ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {manoAbierta && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 max-h-48 overflow-y-auto">
                  {(jugadorLocal.cartasEnMano || []).map((carta) => {
                    const seleccionada = cartaSeleccionada?.id === carta.id;

                    return (
                      <motion.button
                        key={carta.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (!esMiTurno) {
                            toast.info(`Es el turno de ${jugadorEnTurno?.nombre}. ¡Prepárate!`);
                            return;
                          }
                          playSfx("tap");
                          setCartaSeleccionada(seleccionada ? null : carta);
                        }}
                        className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                          seleccionada
                            ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-400 ring-2 ring-amber-400 shadow-lg scale-[1.03]"
                            : esMiTurno
                            ? "bg-white/5 border-white/15 hover:border-amber-400/50 hover:bg-white/10"
                            : "bg-white/5 border-white/10 opacity-70"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">⏳</span>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-black/40 text-amber-300 border border-amber-400/30">
                              ???
                            </span>
                          </div>
                          <p className="text-xs font-black text-white line-clamp-2 leading-tight">
                            {carta.title}
                          </p>
                        </div>

                        <span className="text-[9px] text-amber-300/80 font-bold mt-2 block">
                          {seleccionada ? "✓ Seleccionada" : "Tocar para usar"}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PANTALLA DE VICTORIA Y ENTREGA DEL POZO DE APUESTAS
      ══════════════════════════════════════════════════════════ */}
      {sala.estado === "finalizado" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#0c182c] via-[#09152a] to-[#040812] border-2 border-amber-400/80 p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 animate-pulse" />

            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
              {soyGanador ? "👑" : "🏆"}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400 text-slate-950 inline-block mb-1.5">
                {soyGanador ? "¡HAS GANADO LA PARTIDA!" : "PARTIDA FINALIZADA"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {soyGanador ? "¡Crononauta Supremo!" : `${ganador?.nombre || "Rival"} es el Campeón`}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {soyGanador
                  ? `Has colocado todas tus cartas y te llevas el Pozo acumulado de la mesa.`
                  : `Una gran batalla cronológica de ${jugadores.length} jugadores.`}
              </p>
            </div>

            {/* PREMIO DEL POZO */}
            <div className="p-4 rounded-2xl bg-black/50 border border-amber-400/50 shadow-inner space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/80">
                {soyGanador ? "POZO GANADO" : "POZO DE LA MESA"}
              </span>
              <p className="text-3xl font-black text-amber-300 font-mono flex items-center justify-center gap-2">
                <Coins className="w-7 h-7 text-amber-400" />
                <span>{pozoTotal.toLocaleString()} 🪙</span>
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/modos-online")}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                Volver al Lobby Online
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MENTI ASESOR TEMPORAL FLOTANTE EN ESQUINA INFERIOR ── */}
      <MentrixMascot
        layout="floating"
        customMessage={fraseMenti()}
      />
    </div>
  );
}
