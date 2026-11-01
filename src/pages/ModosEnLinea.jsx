import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  Users
} from "lucide-react";
import { toast } from "sonner";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";
import { 
  crearSalaOnline, 
  unirseASalaOnline, 
  suscribirASala, 
  getOnlinePlayerProfile 
} from "@/services/onlineMatchService";

export default function ModosEnLinea() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salaUrl = searchParams.get("sala") || "";

  const [player] = useState(() => getOnlinePlayerProfile());
  const [codigoSala, setCodigoSala] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState(salaUrl.toUpperCase());
  const [copiado, setCopiado] = useState(false);
  const [enSalaEspera, setEnSalaEspera] = useState(false);
  const [creandoSala, setCreandoSala] = useState(false);
  const [uniendose, setUniendose] = useState(false);
  const [rivalConectado, setRivalConectado] = useState(null);

  const enlaceSala = typeof window !== "undefined" 
    ? `${window.location.origin}/modos-online?sala=${codigoSala}`
    : `https://mentrixestudios.com/modos-online?sala=${codigoSala}`;

  // Si el usuario entra por enlace compartido, pre-cargar el código
  useEffect(() => {
    if (salaUrl) {
      setCodigoIngresado(salaUrl.toUpperCase());
    }
  }, [salaUrl]);

  // Suscribirse a la sala mientras el anfitrión está en espera
  useEffect(() => {
    if (!enSalaEspera || !codigoSala) return;

    const desuscribir = suscribirASala(codigoSala, (salaActualizada) => {
      if (salaActualizada.estado === "jugando") {
        setRivalConectado(salaActualizada.guest_nombre || "Rival");
        toast.success(`⚔️ ¡${salaActualizada.guest_nombre || "Tu rival"} se ha unido! Iniciando batalla...`);
        playSfx("victory");
        setTimeout(() => {
          navigate(`/juego-online?sala=${codigoSala}`);
        }, 1200);
      }
    });

    return () => desuscribir();
  }, [enSalaEspera, codigoSala, navigate]);

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlaceSala);
    setCopiado(true);
    playSfx("tap");
    toast.success("🔗 ¡Enlace de sala copiado!");
    setTimeout(() => setCopiado(false), 3000);
  };

  const compartirWhatsApp = () => {
    playSfx("tap");
    const texto = `¡Te desafío a un Duelo de Línea de Tiempo en Mentrix! ⏳\nEntra a mi sala de juego aquí: ${enlaceSala}\nO ingresa el código: ${codigoSala}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const handleCrearSala = async () => {
    playSfx("tap");
    setCreandoSala(true);

    try {
      const res = await crearSalaOnline({
        categoria: "todas",
        hostNombre: player.name,
      });

      setCodigoSala(res.codigoSala);
      setEnSalaEspera(true);
      playSfx("victory");

      if (res.isLocalDemo) {
        toast.info("Sala creada en modo local entre pestañas (Supabase aún por conectar).");
      } else {
        toast.success(`Sala ${res.codigoSala} abierta en tiempo real.`);
      }
    } catch (err) {
      toast.error(err.message || "Error al crear la sala.");
    } finally {
      setCreandoSala(false);
    }
  };

  const handleUnirseSala = async () => {
    const code = codigoIngresado.trim().toUpperCase();
    if (!code) {
      toast.error("Ingresa un código de sala válido");
      return;
    }

    playSfx("tap");
    setUniendose(true);

    try {
      await unirseASalaOnline({
        codigoSala: code,
        guestNombre: player.name,
      });

      playSfx("victory");
      toast.success(`¡Conectado a la sala ${code}!`);
      navigate(`/juego-online?sala=${code}`);
    } catch (err) {
      toast.error(err.message || "No se pudo conectar a la sala.");
    } finally {
      setUniendose(false);
    }
  };

  return (
    <div className="space-y-4 select-none pb-12">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            playSfx("tap");
            if (enSalaEspera) setEnSalaEspera(false);
            else navigate(-1);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{enSalaEspera ? "Cancelar Sala" : "Volver"}</span>
        </motion.button>

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/20 border-emerald-400/40 text-emerald-300 flex items-center gap-1">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>LOBBY ONLINE 1v1</span>
        </span>
      </div>

      {/* ── MENTI ASESOR TEMPORAL CON BURBUJA ACTIVA ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage={
            enSalaEspera
              ? "Sala abierta. Comparte el código o el link de WhatsApp con tu amigo. ¡En cuanto entre comenzará la batalla automáticamente!"
              : "¡Bienvenido al Portal Multijugador! Crea tu sala privada con código único o ingresa la clave de un amigo para batallar a distancia."
          }
        />
      </div>

      {!enSalaEspera ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          
          {/* ── TARJETA 1: CREAR SALA COMO ANFITRIÓN ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e2932] via-[#0b182c] to-[#080f1e] border-2 border-amber-400/60 p-4 sm:p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-md">
                    👑
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      OPCIÓN 1 · ANFITRIÓN
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                      Crear Sala de Batalla
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Genera una sala privada protegida con clave. Te daremos un código y un enlace de WhatsApp para invitar a tu rival.
              </p>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span>✓</span>
                  <span>558 Eventos históricos balanceados</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span>✓</span>
                  <span>Sincronización en tiempo real</span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              disabled={creandoSala}
              onClick={handleCrearSala}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {creandoSala ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Abriendo portal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Crear y Abrir Sala</span>
                </>
              )}
            </motion.button>
          </div>

          {/* ── TARJETA 2: UNIRSE A SALA EXISTENTE ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c183a] via-[#10132b] to-[#080d1e] border-2 border-purple-400/50 p-4 sm:p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-xl shadow-md">
                    ⚔️
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-400 text-slate-950">
                      OPCIÓN 2 · INVITADO
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                      Unirse con Código
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                ¿Tu amigo ya creó una sala y te dio la clave? Escríbela aquí abajo para ingresar al duelo.
              </p>

              {/* Input estilizado de código de sala */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                  Ingresa el Código de Sala:
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={codigoIngresado}
                  onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                  placeholder="Ej: CRONO42"
                  className="w-full py-3 px-4 rounded-2xl bg-black/50 border-2 border-purple-400/40 focus:border-purple-300 text-center text-xl font-black text-purple-200 tracking-widest placeholder:text-purple-300/30 uppercase outline-none shadow-inner"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              disabled={uniendose || !codigoIngresado.trim()}
              onClick={handleUnirseSala}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 text-white font-black text-sm tracking-wide shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {uniendose ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-purple-200" />
                  <span>Unirme a la Batalla</span>
                </>
              )}
            </motion.button>
          </div>

        </div>
      ) : (
        /* ── SALA DE ESPERA ACTIVA (ANFITRIÓN) ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e2932] via-[#0b182c] to-[#080f1e] border-2 border-emerald-400/70 p-6 space-y-6 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center text-3xl mx-auto animate-pulse">
            ⏳
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 inline-block mb-2">
              SALA ACTIVA Y ESPERANDO RIVAL
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Esperando a que tu rival se conecte...
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Envía el código o el link directo a tu amigo por WhatsApp. En cuanto entre a la sala, la partida empezará automáticamente.
            </p>
          </div>

          {/* Código destacado */}
          <div className="p-4 bg-black/50 rounded-2xl border border-amber-400/50 max-w-xs mx-auto shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/70 block mb-1">
              CÓDIGO DE LA SALA
            </span>
            <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-widest font-mono">
              {codigoSala}
            </span>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              type="button"
              onClick={compartirWhatsApp}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Invitar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={copiarEnlace}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setEnSalaEspera(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cerrar y cancelar sala
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
