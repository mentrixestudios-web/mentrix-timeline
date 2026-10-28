import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Wifi
} from "lucide-react";
import { toast } from "sonner";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";

function generarCodigoSala() {
  const palabras = ["CRONO", "TIEMPO", "ROCA", "ERA", "SIGLO", "MENTI"];
  const randP = palabras[Math.floor(Math.random() * palabras.length)];
  const randN = Math.floor(10 + Math.random() * 90);
  return `${randP}${randN}`;
}

export default function ModosEnLinea() {
  const navigate = useNavigate();

  const [codigoSala, setCodigoSala] = useState(generarCodigoSala());
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [enSalaEspera, setEnSalaEspera] = useState(false);
  const [buscandoRival, setBuscandoRival] = useState(false);

  const enlaceSala = `https://mentrix.cl/duelo?sala=${codigoSala}`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlaceSala);
    setCopiado(true);
    playSfx("tap");
    toast.success("🔗 ¡Enlace de sala copiado!");
    setTimeout(() => setCopiado(false), 3000);
  };

  const compartirWhatsApp = () => {
    playSfx("tap");
    const texto = `¡Te desafío a un Duelo de Línea de Tiempo en Mentrix! ⏳\nEntra a mi sala aquí: ${enlaceSala}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const handleCrearSala = () => {
    playSfx("victory");
    setEnSalaEspera(true);
  };

  const handleUnirseSala = () => {
    if (!codigoIngresado.trim()) {
      toast.error("Ingresa un código de sala válido");
      return;
    }
    playSfx("tap");
    setBuscandoRival(true);
    setTimeout(() => {
      setBuscandoRival(false);
      setEnSalaEspera(true);
      toast.success(`Conectado a la sala: ${codigoIngresado.toUpperCase()}`);
    }, 1500);
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
          <span>{enSalaEspera ? "Salir de Sala" : "Volver"}</span>
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
          customMessage="¡Bienvenido al Portal Multijugador! Crea tu sala privada con código único y envíalo por WhatsApp, o ingresa el código de un amigo para batallar a distancia."
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

              {/* Código generado estilo bóveda */}
              <div className="p-3.5 bg-black/45 rounded-2xl border border-amber-400/30 text-center space-y-1 shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300/70 block">
                  CLAVE DE TU SALA PRIVADA
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-widest font-mono block">
                  {codigoSala}
                </span>
              </div>

              {/* Botones de compartir */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={compartirWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 border border-white/15 transition-all active:scale-95 cursor-pointer"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? "¡Copiado!" : "Copiar Link"}</span>
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCrearSala}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4 fill-slate-950" />
              <span>Abrir Sala de Espera</span>
            </motion.button>
          </div>

          {/* ── TARJETA 2: UNIRSE CON CÓDIGO DE AMIGO ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102048] via-[#0c1633] to-[#080d1f] border-2 border-blue-400/50 p-4 sm:p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500" />

            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-xl shadow-md">
                  🚀
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/40">
                    OPCIÓN 2 · INVITADO
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                    Unirse con Código
                  </h3>
                </div>
              </div>

              <p className="text-xs text-blue-100/70 font-medium leading-relaxed">
                ¿Tu amigo ya creó una partida? Escribe aquí la clave de 6 a 7 caracteres para entrar directo al duelo:
              </p>

              <input
                type="text"
                placeholder="EJ: CRONO42"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full px-4 py-3.5 rounded-2xl bg-black/45 border border-blue-400/35 text-base font-black text-white uppercase placeholder:text-white/25 focus:outline-none focus:border-amber-400 text-center tracking-widest shadow-inner"
              />
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleUnirseSala}
              disabled={buscandoRival}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              {buscandoRival ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sincronizando Sala...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Conectar a la Sala</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      ) : (
        /* ── SALA DE ESPERA MULTIJUGADOR PREMIUM ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#102048] to-[#0a1228] border-2 border-blue-400 p-5 sm:p-6 text-center space-y-4 shadow-2xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-black">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>SALA ACTIVA: {codigoSala}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white">
            Esperando Conexión del Rival...
          </h2>

          <div className="grid grid-cols-2 gap-3 py-2 max-w-md mx-auto">
            <div className="p-3.5 bg-emerald-950/30 rounded-2xl border border-emerald-400/50 space-y-1 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/25 border border-emerald-400 mx-auto flex items-center justify-center text-xl">
                👑
              </div>
              <p className="text-xs font-black text-white pt-1">Tú (Anfitrión)</p>
              <span className="text-[9px] text-emerald-300 font-black uppercase bg-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                ✓ Conectado
              </span>
            </div>

            <div className="p-3.5 bg-black/40 rounded-2xl border border-dashed border-amber-400/40 space-y-1 flex flex-col justify-center items-center">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              <p className="text-xs text-white/70 font-black pt-1">Rival 1v1</p>
              <span className="text-[9px] text-amber-300/90 font-bold">Esperando ingreso...</span>
            </div>
          </div>

          <div className="p-3 bg-black/35 rounded-2xl border border-white/10 text-xs text-blue-200/80 max-w-md mx-auto">
            💡 Comparte el enlace por WhatsApp para que tu rival entre directo a la sala <strong className="text-amber-300">{codigoSala}</strong>.
          </div>

          <button
            type="button"
            onClick={compartirWhatsApp}
            className="w-full max-w-md mx-auto py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar Invitación por WhatsApp</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
