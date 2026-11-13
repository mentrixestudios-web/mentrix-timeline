import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  Swords, 
  Globe, 
  Clock, 
  Loader2,
  Sparkles,
  Wifi,
  Users,
  RotateCcw,
  Coins,
  Crown,
  Play,
  ShoppingBag,
  Info
} from "lucide-react";
import { toast } from "sonner";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { 
  crearSalaOnline, 
  unirseASalaOnline, 
  suscribirASala, 
  iniciarPartidaOnline,
  salirDeSalaOnline,
  getOnlinePlayerProfile,
  NIVELES_MESA,
  AVATARES_MESA,
  normalizarSala
} from "@/services/onlineMatchService";
import { getCoins, spendCoins, addCoins } from "@/utils/gameStorage";
import HistoryShareModal from "@/components/share/HistoryShareModal";

export default function ModosEnLinea() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salaUrl = searchParams.get("sala") || "";

  const [player] = useState(() => getOnlinePlayerProfile());
  const [monedas, setMonedas] = useState(() => getCoins());
  const [mesaNivel, setMesaNivel] = useState(NIVELES_MESA[0]); // Por defecto 50 monedas

  const [codigoSala, setCodigoSala] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState(salaUrl.toUpperCase());
  const [copiado, setCopiado] = useState(false);
  const [enSalaEspera, setEnSalaEspera] = useState(false);
  const [creandoSala, setCreandoSala] = useState(false);
  const [uniendose, setUniendose] = useState(false);
  const [iniciandoPartida, setIniciandoPartida] = useState(false);

  // Datos de la sala viva en espera
  const [salaActual, setSalaActual] = useState(null);
  const [salasActivas, setSalasActivas] = useState([]);
  const [cargandoSalas, setCargandoSalas] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Escuchar cambios de monedas
  useEffect(() => {
    const handleStorage = () => setMonedas(getCoins());
    window.addEventListener("mt_storage_updated", handleStorage);
    return () => window.removeEventListener("mt_storage_updated", handleStorage);
  }, []);

  const enlaceSala = typeof window !== "undefined" 
    ? `${window.location.origin}/modos-online?sala=${codigoSala}`
    : `https://mentrixestudios.com/modos-online?sala=${codigoSala}`;

  // Cargar salas públicas en espera desde Supabase
  const cargarSalasActivas = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    setCargandoSalas(true);
    try {
      const haceDosHoras = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("timeline_rooms")
        .select("id, codigo_sala, host_nombre, categoria, created_at, ultimo_movimiento")
        .eq("estado", "esperando")
        .gte("created_at", haceDosHoras)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        setSalasActivas(data.map(normalizarSala));
      }
    } catch (e) {
      console.warn("Error consultando salas activas:", e);
    } finally {
      setCargandoSalas(false);
    }
  }, []);

  useEffect(() => {
    cargarSalasActivas();
    const interval = setInterval(cargarSalasActivas, 7000);
    return () => clearInterval(interval);
  }, [cargarSalasActivas]);

  // Si el usuario entra por enlace compartido
  useEffect(() => {
    if (salaUrl) {
      setCodigoIngresado(salaUrl.toUpperCase());
    }
  }, [salaUrl]);

  // Suscribirse a la sala mientras se está en la sala de espera
  useEffect(() => {
    if (!enSalaEspera || !codigoSala) return;

    const desuscribir = suscribirASala(codigoSala, (salaActualizada) => {
      if (!salaActualizada) return;
      setSalaActual(salaActualizada);

      // Si la partida inició para todos
      if (salaActualizada.estado === "jugando") {
        playSfx("victory");
        toast.success(`⚔️ ¡Comenzó la batalla por el Pozo de ${salaActualizada.pozo_total} monedas!`);
        setTimeout(() => {
          navigate(`/juego-online?sala=${codigoSala}`);
        }, 800);
      } else if (salaActualizada.estado === "cancelado") {
        toast.info("La sala fue cancelada por el anfitrión.");
        addCoins(mesaNivel.apuesta);
        setEnSalaEspera(false);
        setSalaActual(null);
      }
    });

    return () => desuscribir();
  }, [enSalaEspera, codigoSala, navigate, mesaNivel.apuesta]);

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlaceSala);
    setCopiado(true);
    playSfx("tap");
    toast.success("🔗 ¡Enlace de sala copiado!");
    setTimeout(() => setCopiado(false), 3000);
  };

  const compartirWhatsApp = () => {
    playSfx("tap");
    const texto = `¡Te desafío a un Duelo de Línea de Tiempo en Mentrix! ⏳\nEntra a mi mesa (${mesaNivel.apuesta} 🪙 de apuesta, hasta 6 jugadores):\n${enlaceSala}\nO ingresa el código: ${codigoSala}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  // Crear sala con apuesta
  const handleCrearSala = async () => {
    playSfx("tap");

    if (monedas < mesaNivel.apuesta) {
      toast.error(`Necesitas al menos ${mesaNivel.apuesta} monedas para entrar a esta mesa.`);
      return;
    }

    setCreandoSala(true);

    try {
      // Deducir apuesta local
      spendCoins(mesaNivel.apuesta);
      setMonedas(getCoins());

      const res = await crearSalaOnline({
        categoria: "todas",
        hostNombre: player.name,
        apuesta: mesaNivel.apuesta,
      });

      setCodigoSala(res.codigoSala);
      setSalaActual(res.sala);
      setEnSalaEspera(true);
      playSfx("victory");

      toast.success(`Mesa abierta con apuesta de ${mesaNivel.apuesta} 🪙. ¡Invita hasta 5 rivales!`);
    } catch (err) {
      // Reembolso en caso de error
      addCoins(mesaNivel.apuesta);
      setMonedas(getCoins());
      toast.error(err.message || "Error al crear la sala.");
    } finally {
      setCreandoSala(false);
    }
  };

  // Unirse a sala por código
  const handleUnirseSala = async (codeToJoin) => {
    const code = (codeToJoin || codigoIngresado).trim().toUpperCase();
    if (!code) {
      toast.error("Ingresa un código de sala válido");
      return;
    }

    playSfx("tap");
    setUniendose(true);

    try {
      const res = await unirseASalaOnline({
        codigoSala: code,
        guestNombre: player.name,
      });

      const apuestaSala = res.sala?.apuesta || 50;

      // Verificar monedas
      if (getCoins() < apuestaSala) {
        toast.error(`Esta mesa requiere una apuesta de ${apuestaSala} monedas.`);
        setUniendose(false);
        return;
      }

      spendCoins(apuestaSala);
      setMonedas(getCoins());

      setCodigoSala(code);
      setSalaActual(res.sala);
      setEnSalaEspera(true);
      playSfx("victory");
      toast.success(`¡Te uniste a la mesa ${code}!`);
    } catch (err) {
      toast.error(err.message || "No se pudo conectar a la sala.");
    } finally {
      setUniendose(false);
    }
  };

  // Iniciar partida (Host puede arrancar con 2 a 6 jugadores)
  const handleIniciarPartida = async () => {
    if (!salaActual || salaActual.jugadores.length < 2) {
      toast.error("Se necesitan al menos 2 jugadores para comenzar.");
      return;
    }

    setIniciandoPartida(true);
    playSfx("tap");

    try {
      await iniciarPartidaOnline({
        codigoSala,
        hostId: player.id,
      });
      playSfx("victory");
    } catch (err) {
      toast.error(err.message || "Error al iniciar la partida.");
      setIniciandoPartida(false);
    }
  };

  // Salir de la sala de espera y reembolsar monedas
  const handleSalirSala = async () => {
    playSfx("tap");
    try {
      await salirDeSalaOnline({ codigoSala, jugadorId: player.id });
    } catch {}
    // Reembolsar la apuesta
    addCoins(salaActual?.apuesta || mesaNivel.apuesta);
    setMonedas(getCoins());
    setEnSalaEspera(false);
    setSalaActual(null);
    setCodigoSala("");
    toast.info("Has salido de la sala. Tu apuesta ha sido reembolsada.");
  };

  const esHost = salaActual?.jugadores?.[0]?.id === player.id;
  const cantJugadores = salaActual?.jugadores?.length || 1;
  const pozoActual = (salaActual?.apuesta || mesaNivel.apuesta) * cantJugadores;

  return (
    <div className="space-y-4 select-none pb-16">
      {/* ── HEADER CON SALDO Y BOTÓN VOLVER ── */}
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (enSalaEspera) handleSalirSala();
            else navigate(-1);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{enSalaEspera ? "Abandonar Mesa" : "Volver"}</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Badge Saldo Monedas */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{monedas.toLocaleString()} 🪙</span>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/20 border-emerald-400/40 text-emerald-300 flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>2 A 6 ONLINE</span>
          </span>
        </div>
      </div>

      {/* ── MENTI ASESOR TEMPORAL CON BURBUJA FLOTANTE ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage={
            enSalaEspera
              ? esHost
                ? cantJugadores < 2
                  ? "¡Mesa creada! Invita a tus amigos por WhatsApp o comparte el código. Puedes iniciar en cuanto haya 2 o más jugadores (hasta 6)."
                  : `¡Genial! Hay ${cantJugadores} jugadores en la mesa. Puedes presionar 'Iniciar Partida' ahora o esperar a que se unan más rivales.`
                : "Esperando a que el anfitrión pulse Iniciar Partida. ¡Revisa la historia y prepárate para conquistar el Pozo!"
              : "¡Bienvenido a las Mesas Multijugador! Apuesta tus monedas al estilo Ludo, reúne de 2 a 6 crononautas y el ganador se lleva todo el Pozo acumulado."
          }
        />
      </div>

      {!enSalaEspera ? (
        <div className="space-y-4">
          
          {/* ── SELECTOR DE NIVEL DE MESA DE APUESTAS (ESTILO LUDO CLUB) ── */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c182c] via-[#091222] to-[#050a14] border border-amber-400/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎲</span>
                <div>
                  <h3 className="text-sm font-black text-white">Elige el Nivel de tu Mesa</h3>
                  <p className="text-[10px] text-slate-400">Apuesta fija por jugador · Capacidad de 2 a 6 jugadores</p>
                </div>
              </div>

              <a
                href="https://mentrixestudios.com/tienda"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-black text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Tienda Oficial</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {NIVELES_MESA.map((m) => {
                const seleccionada = mesaNivel.id === m.id;
                const alcanza = monedas >= m.apuesta;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playSfx("tap");
                      setMesaNivel(m);
                    }}
                    className={`relative p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      seleccionada
                        ? `bg-gradient-to-br ${m.color} ring-2 ring-amber-400 shadow-lg scale-[1.02]`
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide block text-amber-300">
                        {m.badge}
                      </span>
                      <h4 className="text-xs font-black text-white mt-0.5">{m.nombre}</h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">2 a 6 jug.</span>
                      <span className={alcanza ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {alcanza ? "Disponible" : "Sin saldo"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── ACCIONES PRINCIPALES: CREAR SALA O UNIRSE ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* OPCIÓN 1: CREAR MESA (ANFITRIÓN) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e2932] via-[#0b182c] to-[#080f1e] border-2 border-amber-400/60 p-4 sm:p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400" />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-md">
                    👑
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      MODO ANFITRIÓN
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                      Abrir Nueva Mesa ({mesaNivel.apuesta} 🪙)
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Crea tu mesa privada. Podrás iniciar la batalla en cuanto haya <strong>2, 3, 4, 5 o 6 jugadores</strong> listos. ¡El ganador se llevará el Pozo total acumulado!
                </p>

                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>Tu Apuesta:</span>
                    <span>{mesaNivel.apuesta} 🪙</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Pozo Potencial:</span>
                    <span>Hasta {mesaNivel.apuesta * 6} 🪙 (con 6 jug.)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCrearSala}
                disabled={creandoSala}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {creandoSala ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Abriendo Mesa...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Crear Mesa por {mesaNivel.apuesta} 🪙</span>
                  </>
                )}
              </button>
            </div>

            {/* OPCIÓN 2: UNIRSE POR CÓDIGO */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c35] via-[#0b1424] to-[#070d18] border-2 border-cyan-400/50 p-4 sm:p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-xl shadow-md">
                    ⚔️
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                      MODO INVITADO
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                      Unirse a Mesa Existente
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  ¿Un amigo te dio su clave? Escribe el código de 6 caracteres (ej. CRONO42) para sentarte a la mesa.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Código de Sala:
                  </label>
                  <input
                    type="text"
                    value={codigoIngresado}
                    onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                    placeholder="EJ: CRONO42"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-cyan-400/50 text-cyan-300 font-mono font-black text-base text-center placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 tracking-widest uppercase"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUnirseSala()}
                disabled={uniendose || !codigoIngresado.trim()}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {uniendose ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando a la mesa...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Unirme a la Mesa</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ── LISTADO DE MESAS PÚBLICAS EN ESPERA ── */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  Mesas Públicas en Espera (2 a 6 Jugadores)
                </h3>
              </div>

              <button
                type="button"
                onClick={cargarSalasActivas}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${cargandoSalas ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {salasActivas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {salasActivas.map((s) => {
                  const cant = s.jugadores?.length || 1;
                  const apuesta = s.apuesta || 50;

                  return (
                    <div
                      key={s.id || s.codigo_sala}
                      className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-950/80 to-blue-950/50 border border-white/10 hover:border-cyan-400/50 transition-all group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span className="text-amber-300 font-mono tracking-wider font-extrabold">{s.codigo_sala}</span>
                          <span className="text-[10px] font-normal text-slate-400 truncate">· {s.host_nombre || "Anfitrión"}</span>
                        </div>
                        <div className="text-[10px] text-cyan-300/80 font-medium flex items-center gap-2 mt-0.5">
                          <span>💰 {apuesta} 🪙</span>
                          <span>👥 {cant}/6 jug.</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnirseSala(s.codigo_sala)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        Unirme 🎲
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 px-3 rounded-2xl bg-black/20 border border-white/5">
                <p className="text-xs text-slate-400 m-0">
                  No hay mesas abiertas en espera en este momento.
                </p>
                <p className="text-[11px] text-cyan-300/80 font-bold mt-1 mb-0">
                  ¡Abre tu propia mesa arriba y comparte el enlace de WhatsApp con hasta 5 amigos!
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ── SALA DE ESPERA ACTIVA (LOBBY MULTIJUGADOR 2 A 6 JUGADORES) ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c182c] via-[#091222] to-[#050a14] border-2 border-amber-400/60 p-5 sm:p-6 space-y-6 shadow-2xl"
        >
          {/* Cabecera del Lobby */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 inline-block mb-1">
                MESA EN VIVO · {cantJugadores} DE 6 JUGADORES
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Lobby de Batalla Cronológica
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 px-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block">
                  POZO ACUMULADO
                </span>
                <span className="text-lg font-black text-amber-300 flex items-center gap-1 justify-center">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{pozoActual.toLocaleString()} 🪙</span>
                </span>
              </div>

              <div className="p-2.5 px-4 rounded-2xl bg-black/50 border border-white/15 text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                  CÓDIGO SALA
                </span>
                <span className="text-lg font-black text-cyan-300 font-mono tracking-widest">
                  {codigoSala}
                </span>
              </div>
            </div>
          </div>

          {/* ── CUADRÍCULA DE LOS 6 ASIENTOS DE LA MESA (ESTILO LUDO CLUB) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Asientos de la Mesa (Se puede jugar desde 2 hasta 6)</span>
              </span>
              <span className="text-[10px] font-bold text-amber-300">
                Apuesta: {salaActual?.apuesta || mesaNivel.apuesta} 🪙 c/u
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const jug = salaActual?.jugadores?.[idx];
                const esVacio = !jug;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                      jug
                        ? "bg-slate-800/80 border-amber-400/60 shadow-md"
                        : "bg-black/30 border-dashed border-white/15 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        jug
                          ? "bg-gradient-to-br from-amber-400/20 to-cyan-500/20 border border-amber-400/50 shadow-inner"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      {jug ? jug.avatar || AVATARES_MESA[idx] : "⏳"}
                    </div>

                    <div className="min-w-0 flex-1">
                      {jug ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-white truncate">
                              {jug.nombre}
                            </span>
                            {jug.esHost && <span className="text-xs" title="Anfitrión">👑</span>}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Listo ({jug.cartasEnMano?.length || 5} cartas)</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-slate-500 block">
                            Asiento {idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Esperando rival...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PANEL DE CONTROL / BOTÓN INICIAR PARTIDA ── */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            {esHost ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleIniciarPartida}
                  disabled={iniciandoPartida || cantJugadores < 2}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                    cantJugadores >= 2
                      ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 shadow-emerald-500/30 animate-pulse active:scale-95"
                      : "bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed"
                  }`}
                >
                  {iniciandoPartida ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Comenzando batalla...</span>
                    </>
                  ) : cantJugadores >= 2 ? (
                    <>
                      <Play className="w-5 h-5 fill-slate-950" />
                      <span>¡Iniciar Partida Ahora ({cantJugadores} Jugadores)! 🚀</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Esperando al menos 1 rival para comenzar (1/6)...</span>
                    </>
                  )}
                </button>

                {cantJugadores >= 2 && (
                  <p className="text-[11px] text-center text-emerald-300 font-bold">
                    ✨ Puedes iniciar con los {cantJugadores} jugadores presentes, o esperar a que se sumen más amigos hasta un máximo de 6.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-cyan-400/30 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-cyan-300 font-black text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Esperando que el anfitrión inicie la partida...</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hay {cantJugadores} de 6 jugadores listos en la mesa.
                </p>
              </div>
            )}

            {/* Botones de Invitación Rápida */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={compartirWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Invitar por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={copiarEnlace}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copiar Enlace de Sala</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="py-2.5 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Tarjeta Visual</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleSalirSala}
                className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Abandonar mesa y recuperar apuesta ({salaActual?.apuesta || mesaNivel.apuesta} 🪙)
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal para Compartir Tarjeta de Desafío */}
      <HistoryShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        mode="batalla"
        battleInfo={{
          roomCode: codigoSala,
          hostName: player?.name || "Jugador Mentrix",
        }}
      />
    </div>
  );
}
