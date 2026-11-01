import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  Hourglass, 
  Swords, 
  Trophy, 
  Flame, 
  Coins, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  obtenerEstadoSala, 
  suscribirASala, 
  colocarCartaEnLinea, 
  getOnlinePlayerProfile 
} from "@/services/onlineMatchService";
import { addCoins, addXp } from "@/utils/gameStorage";
import { playSfx } from "@/utils/soundSystem";

export default function JuegoOnline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codigoSala = (searchParams.get("sala") || "").toUpperCase();

  const [player] = useState(() => getOnlinePlayerProfile());
  const [sala, setSala] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [procesandoTurno, setProcesandoTurno] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState(null);

  const scrollRef = useRef(null);

  // 1. Cargar estado inicial y suscribir a eventos Realtime
  useEffect(() => {
    if (!codigoSala) {
      toast.error("Código de sala no proporcionado.");
      navigate("/modos-online");
      return;
    }

    let isMounted = true;

    // Cargar estado inicial
    obtenerEstadoSala(codigoSala).then((data) => {
      if (!isMounted) return;
      if (!data) {
        toast.error("No se encontró la sala solicitada.");
        navigate("/modos-online");
        return;
      }
      setSala(data);
      setCargando(false);
    });

    // Suscribir a actualizaciones en tiempo real
    const desuscribir = suscribirASala(codigoSala, (salaActualizada) => {
      if (!isMounted || !salaActualizada) return;

      setSala((prev) => {
        // Detectar si hubo un movimiento nuevo
        const ult = salaActualizada.ultimo_movimiento;
        if (ult && ult.timestamp !== prev?.ultimo_movimiento?.timestamp) {
          if (ult.tipo === "acierto") {
            playSfx("correct");
            setMensajeNotificacion({
              tipo: "success",
              texto: ult.mensaje || "¡Carta colocada correctamente!",
            });
          } else if (ult.tipo === "error") {
            playSfx("wrong");
            setMensajeNotificacion({
              tipo: "error",
              texto: ult.mensaje || "¡Error cronológico! -1 Vida",
            });
          } else if (ult.tipo === "victoria") {
            playSfx("victory");
            if (salaActualizada.ganador_id === player.id) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              addCoins(50);
              addXp(40);
            } else {
              addCoins(15);
              addXp(15);
            }
          }
        }
        return salaActualizada;
      });
    });

    return () => {
      isMounted = false;
      desuscribir();
    };
  }, [codigoSala, navigate, player.id]);

  // Limpiar mensaje de notificación flotante tras 3 segundos
  useEffect(() => {
    if (mensajeNotificacion) {
      const timer = setTimeout(() => setMensajeNotificacion(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeNotificacion]);

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

  const miNombre = esHost ? sala.host_nombre : sala.guest_nombre;
  const rivalNombre = esHost ? (sala.guest_nombre || "Rival") : sala.host_nombre;

  const misVidas = esHost ? sala.vidas_host : sala.vidas_guest;
  const vidasRival = esHost ? sala.vidas_guest : sala.vidas_host;

  const miMano = esHost ? (sala.mano_host || []) : (sala.mano_guest || []);
  const manoRival = esHost ? (sala.mano_guest || []) : (sala.mano_host || []);

  const mesa = sala.linea_tiempo_mesa || [];
  const partidaFinalizada = sala.estado === "finalizado";
  const soyGanador = sala.ganador_id === player.id;

  // Manejar colocación de la carta seleccionada
  const handleColocarCarta = async (posicion) => {
    if (!esMiTurno || !cartaSeleccionada || procesandoTurno) return;

    setProcesandoTurno(true);
    playSfx("tap");

    try {
      await colocarCartaEnLinea({
        codigoSala,
        jugadorId: player.id,
        carta: cartaSeleccionada,
        posicionInsertada: posicion,
      });
      setCartaSeleccionada(null);
    } catch (err) {
      toast.error(err.message || "Error al realizar la jugada");
    } finally {
      setProcesandoTurno(false);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -220, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 select-none pb-20 relative">
      
      {/* ── BARRA SUPERIOR DE LA SALA ONLINE ── */}
      <div className="w-full flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-2xl px-3 py-2 backdrop-blur-md shadow-md">
        <button
          onClick={() => {
            playSfx("tap");
            if (window.confirm("¿Seguro que deseas salir de la partida en línea?")) {
              navigate("/modos-online");
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            SALA: {codigoSala}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            1 vs 1 En Línea
          </span>
        </div>

        {/* Rival status preview */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-300 truncate max-w-[80px] sm:max-w-[120px]">
            {rivalNombre}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3].map((v) => (
              <Heart
                key={v}
                className={`w-3.5 h-3.5 ${
                  v <= vidasRival
                    ? "text-red-500 fill-red-500"
                    : "text-slate-600 fill-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── BANNER DE TURNO ACTIVO ── */}
      <div className="w-full">
        {partidaFinalizada ? (
          <div className={`w-full py-2.5 px-4 rounded-2xl text-center font-black text-sm border shadow-lg ${
            soyGanador 
              ? "bg-amber-500/20 border-amber-400 text-amber-200" 
              : "bg-red-500/20 border-red-400 text-red-200"
          }`}>
            {soyGanador ? "👑 ¡VICTORIA! Eres el Amo del Tiempo ⏳" : "💀 DERROTA: El rival dominó la línea temporal"}
          </div>
        ) : esMiTurno ? (
          <motion.div
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-full py-2 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-600/30 via-teal-600/40 to-emerald-600/30 border border-emerald-400/50 text-emerald-200 shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              {cartaSeleccionada
                ? "¡Toca un botón [+] en la mesa donde encaja cronológicamente!"
                : "⚡ TU TURNO: Selecciona una carta de tu mano abajo"}
            </span>
          </motion.div>
        ) : (
          <div className="w-full py-2 px-4 rounded-2xl text-center font-semibold text-xs text-slate-300 bg-slate-900/40 border border-white/5 flex items-center justify-center gap-2">
            <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Turno de {rivalNombre}... esperando su jugada en tiempo real</span>
          </div>
        )}
      </div>

      {/* ── NOTIFICACIÓN DE JUGADA FLOTANTE ── */}
      <AnimatePresence>
        {mensajeNotificacion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full py-2 px-4 rounded-xl text-center text-xs font-bold border shadow-lg ${
              mensajeNotificacion.tipo === "success"
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-200"
                : "bg-red-950/90 border-red-500 text-red-200"
            }`}
          >
            {mensajeNotificacion.texto}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MESA: LA LÍNEA DE TIEMPO COMPARTIDA ── */}
      <div className="w-full bg-[#0d1629]/90 border border-white/10 rounded-3xl p-3 sm:p-4 shadow-xl relative">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <span>⏳ LÍNEA DE TIEMPO EN LA MESA</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              ({mesa.length} eventos colocados)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={scrollLeft}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carril horizontal deslizable */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto py-3 px-1 scrollbar-none scroll-smooth min-h-[170px]"
        >
          {/* Slot de inserción 0 (Al inicio) */}
          {esMiTurno && cartaSeleccionada && (
            <button
              type="button"
              onClick={() => handleColocarCarta(0)}
              className="w-14 h-28 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 hover:bg-emerald-500/30 flex flex-col items-center justify-center gap-1 shrink-0 text-emerald-300 transition-all cursor-pointer animate-pulse"
              title="Colocar antes de todo"
            >
              <span className="text-xl font-bold">+</span>
              <span className="text-[9px] font-black uppercase text-center leading-none">Aquí</span>
            </button>
          )}

          {mesa.map((cartaMesa, idx) => (
            <React.Fragment key={cartaMesa.id + idx}>
              {/* Tarjeta de la mesa (con su año revelado) */}
              <div className="w-36 sm:w-40 rounded-2xl bg-gradient-to-b from-[#182343] to-[#0f172a] border border-amber-400/30 p-2.5 flex flex-col justify-between shrink-0 shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 truncate max-w-[80px]">
                      {cartaMesa.category}
                    </span>
                    <span className="text-xs">📜</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight m-0">
                    {cartaMesa.title}
                  </h4>
                </div>

                <div className="mt-3 pt-1.5 border-t border-white/10 text-center">
                  <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wider">
                    {cartaMesa.yearFormatted || `${cartaMesa.year} d.C.`}
                  </span>
                </div>
              </div>

              {/* Slot de inserción después de cada carta */}
              {esMiTurno && cartaSeleccionada && (
                <button
                  type="button"
                  onClick={() => handleColocarCarta(idx + 1)}
                  className="w-14 h-28 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 hover:bg-emerald-500/30 flex flex-col items-center justify-center gap-1 shrink-0 text-emerald-300 transition-all cursor-pointer animate-pulse"
                  title={`Colocar entre posición ${idx + 1}`}
                >
                  <span className="text-xl font-bold">+</span>
                  <span className="text-[9px] font-black uppercase text-center leading-none">Aquí</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── ZONA INFERIOR: MANO DEL JUGADOR Y VIDAS ── */}
      <div className="w-full bg-[#0a1020]/95 border border-white/10 rounded-3xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white">Tu Mano:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((v) => (
                <Heart
                  key={v}
                  className={`w-4 h-4 ${
                    v <= misVidas
                      ? "text-red-500 fill-red-500"
                      : "text-slate-700 fill-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-400">
            {miMano.length} cartas por colocar
          </span>
        </div>

        {/* Cartas en mano del jugador */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {miMano.map((cartaMano) => {
            const isSelected = cartaSeleccionada?.id === cartaMano.id;
            return (
              <motion.div
                key={cartaMano.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (!esMiTurno) {
                    toast.info("Espera a que tu rival termine su turno.");
                    return;
                  }
                  playSfx("tap");
                  setCartaSeleccionada(isSelected ? null : cartaMano);
                }}
                className={`rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-950 via-[#1f1738] to-[#120d24] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] -translate-y-1"
                    : "bg-[#11182e] hover:bg-[#15203d] border border-white/15"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase text-amber-400/80">
                      {cartaMano.category}
                    </span>
                    <span className="text-xs">⏳</span>
                  </div>

                  <h5 className="text-xs font-black text-white line-clamp-2 leading-tight">
                    {cartaMano.title}
                  </h5>

                  <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                    {cartaMano.description}
                  </p>
                </div>

                <div className="mt-3 pt-1 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-bold">
                    Año oculto
                  </span>
                  <span className={`text-[10px] font-black ${isSelected ? "text-amber-400" : "text-slate-400"}`}>
                    {isSelected ? "Elegida" : "Tocar"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL DE FIN DE PARTIDA ── */}
      {partidaFinalizada && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
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
