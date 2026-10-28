import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Zap, 
  Swords, 
  Globe, 
  Clock, 
  Loader2 
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

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/5 border-blue-400/40 text-blue-300">
          MULTIJUGADOR PWA 🌐
        </span>
      </div>

      {/* ── BANNER MULTIJUGADOR CON MENTI ── */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950/80 via-[#102047] to-indigo-950/80 border-2 border-blue-400/50 p-4 shadow-xl flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-300" />
            <h1 className="text-base sm:text-lg font-black text-white">
              Salas de Duelo en Línea 1v1
            </h1>
          </div>
          <p className="text-xs text-blue-200/80 font-medium mt-0.5">
            Invita a amigos por WhatsApp o código directo
          </p>
        </div>
        <div className="w-12 h-12 shrink-0">
          <MentrixMascot size="xs" showBubble={false} position="center" />
        </div>
      </div>

      {!enSalaEspera ? (
        <div className="space-y-3.5 pt-1">
          {/* ── SECCIÓN 1: CREAR SALA Y COMPARTIR ── */}
          <div className="rounded-3xl bg-[#0b1328]/95 border-2 border-amber-400/50 p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                1. Crear Nueva Sala de Batalla
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                TU CÓDIGO
              </span>
            </div>

            {/* Código generado */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
              <span className="text-2xl font-black text-amber-300 tracking-widest font-mono">
                {codigoSala}
              </span>
              <p className="text-[10px] text-white/50 mt-1">
                Tus amigos pueden entrar con este código o con tu enlace
              </p>
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
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-95 cursor-pointer"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? "¡Copiado!" : "Copiar Link"}</span>
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCrearSala}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4 fill-slate-950" />
              <span>Abrir Sala de Espera</span>
            </motion.button>
          </div>

          {/* ── SECCIÓN 2: UNIRSE A SALA EXISTENTE ── */}
          <div className="rounded-3xl bg-[#0b1328]/95 border border-white/10 p-4 space-y-3 shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
              2. ¿Tienes un código de amigo?
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="EJ: CRONO42"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm font-black text-white uppercase placeholder:text-white/30 focus:outline-none focus:border-blue-400 text-center tracking-widest"
              />
              <button
                type="button"
                onClick={handleUnirseSala}
                disabled={buscandoRival}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {buscandoRival ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Unirme</span>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── SALA DE ESPERA MULTIJUGADOR ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#0c1633] border-2 border-blue-400 p-5 text-center space-y-4 shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-black">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>SALA: {codigoSala}</span>
          </div>

          <h2 className="text-lg font-black text-white">
            Esperando al Rival...
          </h2>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 bg-white/5 rounded-2xl border border-emerald-400/40 space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center text-lg">
                👑
              </div>
              <p className="text-xs font-black text-white">Tú (Anfitrión)</p>
              <span className="text-[9px] text-emerald-300 font-bold">✓ Listo</span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-dashed border-white/20 space-y-1 flex flex-col justify-center items-center">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              <p className="text-[11px] text-white/50 font-bold">Esperando...</p>
              <span className="text-[9px] text-amber-300/80">Comparte el link</span>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-white/70">
            En cuanto compremos y configuremos el dominio con Supabase, los dos teléfonos se sincronizarán al segundo en vivo.
          </div>

          <button
            onClick={compartirWhatsApp}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Recordar a amigo por WhatsApp</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
