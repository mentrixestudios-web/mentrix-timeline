import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Swords, 
  Trophy, 
  Calendar, 
  Clock, 
  Compass,
  Flame,
  MessageCircle
} from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { compartirImagen, compartirWhatsApp } from "@/utils/shareUtils";
import { playSfx } from "@/utils/soundSystem";

export const SHARE_THEMES = {
  codice: {
    id: "codice",
    name: "Códice Imperial",
    icon: "📜",
    bg: "linear-gradient(165deg, #FFFDF7 0%, #FBF3DC 30%, #F5E2B3 70%, #E8CD9C 100%)",
    border: "2px solid #D4AF37",
    innerBorder: "1px solid rgba(180, 130, 40, 0.25)",
    tagBg: "rgba(92, 51, 0, 0.1)",
    tagBorder: "1px solid rgba(212, 175, 55, 0.6)",
    tagText: "#5C3300",
    titleColor: "#2C1802",
    subtitleColor: "#6B3A02",
    bodyColor: "#3D2200",
    quoteBg: "rgba(255, 255, 255, 0.65)",
    quoteBorder: "1px solid rgba(180, 130, 40, 0.3)",
    quoteText: "#4A2700",
    footerBg: "linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(245, 226, 179, 0.6))",
    footerBorder: "1px solid rgba(180, 130, 40, 0.35)",
    footerTitle: "#4A2700",
    footerSub: "#7A4505",
    btnGrad: "from-amber-600 to-yellow-600",
  },
  zafiro: {
    id: "zafiro",
    name: "Noche Zafiro",
    icon: "🌌",
    bg: "linear-gradient(165deg, #050b18 0%, #0c1a36 40%, #0d284f 75%, #051428 100%)",
    border: "2px solid rgba(56, 189, 248, 0.7)",
    innerBorder: "1px solid rgba(56, 189, 248, 0.2)",
    tagBg: "rgba(14, 165, 233, 0.15)",
    tagBorder: "1px solid rgba(56, 189, 248, 0.4)",
    tagText: "#7dd3fc",
    titleColor: "#ffffff",
    subtitleColor: "#38bdf8",
    bodyColor: "#e0f2fe",
    quoteBg: "rgba(12, 74, 110, 0.3)",
    quoteBorder: "1px solid rgba(56, 189, 248, 0.3)",
    quoteText: "#bae6fd",
    footerBg: "linear-gradient(145deg, rgba(14, 165, 233, 0.15), rgba(3, 105, 161, 0.25))",
    footerBorder: "1px solid rgba(56, 189, 248, 0.35)",
    footerTitle: "#ffffff",
    footerSub: "#7dd3fc",
    btnGrad: "from-cyan-600 to-blue-600",
  },
  obsidiana: {
    id: "obsidiana",
    name: "Obsidiana & Oro",
    icon: "🔥",
    bg: "linear-gradient(165deg, #0a0a0c 0%, #15151c 45%, #221c17 80%, #100f0d 100%)",
    border: "2px solid rgba(245, 158, 11, 0.8)",
    innerBorder: "1px solid rgba(245, 158, 11, 0.25)",
    tagBg: "rgba(245, 158, 11, 0.15)",
    tagBorder: "1px solid rgba(245, 158, 11, 0.5)",
    tagText: "#fcd34d",
    titleColor: "#ffffff",
    subtitleColor: "#fbbf24",
    bodyColor: "#fef3c7",
    quoteBg: "rgba(30, 24, 16, 0.7)",
    quoteBorder: "1px solid rgba(245, 158, 11, 0.35)",
    quoteText: "#fef08a",
    footerBg: "linear-gradient(145deg, rgba(30, 24, 16, 0.9), rgba(45, 32, 14, 0.8))",
    footerBorder: "1px solid rgba(245, 158, 11, 0.4)",
    footerTitle: "#ffffff",
    footerSub: "#fcd34d",
    btnGrad: "from-amber-600 to-orange-600",
  },
};

export default function HistoryShareModal({
  open,
  onClose,
  mode = "efemeride", // 'efemeride' | 'victoria' | 'batalla'
  efemeride = null,
  gameStats = null, // { score, categoryName, streak, maxSiglo }
  battleInfo = null, // { roomCode, hostName }
}) {
  const [themeId, setThemeId] = useState("codice");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mentiBase64, setMentiBase64] = useState("/icons/menti-192.png");
  const cardRef = useRef(null);

  const currentTheme = SHARE_THEMES[themeId] || SHARE_THEMES.codice;

  // Convertir la mascota local a DataURL para capturar en html2canvas sin problemas de CORS
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          if (active) setMentiBase64(canvas.toDataURL("image/png"));
          return;
        }
      } catch {}
      if (active) setMentiBase64("/icons/menti-192.png");
    };
    img.onerror = () => {
      if (active) setMentiBase64("/icons/menti-192.png");
    };
    img.src = "/icons/menti-192.png";

    return () => {
      active = false;
    };
  }, []);

  // Construcción de texto para portapapeles y WhatsApp
  const shareText = useMemo(() => {
    if (mode === "efemeride" && efemeride) {
      return `⏳ *Un día como hoy en la historia:* (${efemeride.fechaTexto} · ${efemeride.anioTexto})\n\n*"${efemeride.titulo}"*\n${efemeride.relato || efemeride.resumenCorto}\n\n💡 _Dato curioso:_ ${efemeride.curiosidad}\n\n📜 ¿Te atreves a ordenar la historia? Juega gratis en:\n👉 https://linea.mentrixestudios.com`;
    }
    if (mode === "victoria" && gameStats) {
      return `🏆 ¡He colocado ${gameStats.score || 0} acontecimientos históricos en orden cronológico en Mentrix: Línea de Tiempo!\n${gameStats.categoryName ? `Categoría: ${gameStats.categoryName}\n` : ""}¿Crees que puedes superarme sin quebrar la historia?\n👉 https://linea.mentrixestudios.com`;
    }
    if (mode === "batalla" && battleInfo) {
      return `⚔️ ¡Te desafío a una Batalla de Sabiduría Histórica en vivo en Mentrix: Línea de Tiempo!\n\n🔑 Código de sala: *${battleInfo.roomCode}*\n👉 Únete aquí: https://linea.mentrixestudios.com/modos-online?room=${battleInfo.roomCode}`;
    }
    return `📜 Descubre y juega gratis a Mentrix: Línea de Tiempo en https://linea.mentrixestudios.com`;
  }, [mode, efemeride, gameStats, battleInfo]);

  if (!open) return null;

  // Generar imagen PNG en alta definición (escala 3x)
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    playSfx("tap");

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3, // 3x para ultra nitidez en WhatsApp / Instagram
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        try {
          if (!blob) {
            toast.error("No se pudo procesar la imagen");
            return;
          }
          const filename = mode === "efemeride" 
            ? "efemeride-mentrix-historia.png" 
            : mode === "batalla" 
            ? "desafio-batalla-mentrix.png" 
            : "victoria-cronologica-mentrix.png";

          await compartirImagen(blob, filename, "Mentrix: Línea de Tiempo", shareText);
          toast.success("¡Imagen lista para compartir!");
        } catch (err) {
          console.error("Error al compartir:", err);
          toast.error("Error al compartir la imagen");
        } finally {
          setGenerating(false);
        }
      }, "image/png");
    } catch (err) {
      console.error("Error html2canvas:", err);
      toast.error("Hubo un problema al generar la tarjeta visual");
      setGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      playSfx("tap");
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("¡Texto copiado al portapapeles!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("No se pudo copiar el texto");
    }
  };

  const handleShareWhatsApp = () => {
    playSfx("tap");
    compartirWhatsApp(shareText);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3 sm:p-4 select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-400/30 p-4 sm:p-5 text-white shadow-2xl relative my-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">
                  Compartir Tarjeta Ilustrada
                </h3>
                <p className="text-[10px] text-amber-200/70">
                  Alta calidad con Menti y sello Mentrix
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Temas */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 mb-3">
            {Object.values(SHARE_THEMES).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  playSfx("tap");
                  setThemeId(t.id);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  themeId === t.id
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{t.icon}</span>
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </div>

          {/* ========================================================
              CONTENEDOR DE LA TARJETA EXPORTABLE (CAPTURA HTML2CANVAS)
             ======================================================== */}
          <div className="w-full overflow-hidden rounded-2xl p-0.5 bg-black/30 border border-white/10 shadow-inner flex justify-center mb-3">
            <div
              ref={cardRef}
              className="w-full max-w-[370px] rounded-2xl p-4 sm:p-5 relative transition-all"
              style={{
                background: currentTheme.bg,
                border: currentTheme.border,
                boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Marco ornamental interior */}
              <div
                className="absolute inset-1.5 rounded-xl pointer-events-none"
                style={{ border: currentTheme.innerBorder }}
              />

              {/* Cabecera de la Tarjeta con Mascota Menti */}
              <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-md p-1"
                    style={{
                      background: currentTheme.tagBg,
                      border: currentTheme.tagBorder,
                    }}
                  >
                    <img
                      src={mentiBase64}
                      alt="Menti"
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                  <div>
                    <div
                      className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                      style={{ color: currentTheme.subtitleColor }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>MENTRIX · LÍNEA DE TIEMPO</span>
                    </div>
                    <div
                      className="text-xs font-black tracking-wide leading-tight"
                      style={{ color: currentTheme.titleColor }}
                    >
                      {mode === "efemeride" && "Expediente del Día"}
                      {mode === "victoria" && "Hazaña Histórica"}
                      {mode === "batalla" && "Desafío de Batalla"}
                    </div>
                  </div>
                </div>

                <div
                  className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: currentTheme.tagBg,
                    border: currentTheme.tagBorder,
                    color: currentTheme.tagText,
                  }}
                >
                  {mode === "efemeride" && (efemeride?.categoriaLabel || "Historia")}
                  {mode === "victoria" && "Victoria"}
                  {mode === "batalla" && "Duelo 1v1"}
                </div>
              </div>

              {/* CUERPO SEGÚN EL MODO */}
              {mode === "efemeride" && efemeride && (
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: currentTheme.subtitleColor }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {efemeride.fechaTexto}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {efemeride.anioTexto}
                    </span>
                    <span>·</span>
                    <span>{efemeride.siglo}</span>
                  </div>

                  <h3
                    className="text-base sm:text-lg font-black leading-snug tracking-tight m-0"
                    style={{ color: currentTheme.titleColor }}
                  >
                    {efemeride.titulo}
                  </h3>

                  <p
                    className="text-[11px] sm:text-xs leading-relaxed m-0 font-medium"
                    style={{ color: currentTheme.bodyColor }}
                  >
                    {efemeride.resumenCorto || efemeride.relato}
                  </p>

                  {/* Caja de Curiosidad / Sabías que */}
                  {efemeride.curiosidad && (
                    <div
                      className="p-2.5 rounded-xl text-[10px] sm:text-[11px] leading-snug italic font-medium"
                      style={{
                        background: currentTheme.quoteBg,
                        border: currentTheme.quoteBorder,
                        color: currentTheme.quoteText,
                      }}
                    >
                      💡 <strong>¿Sabías que?</strong> "{efemeride.curiosidad}"
                    </div>
                  )}

                  {efemeride.personajeClave && (
                    <div className="text-[10px] font-bold" style={{ color: currentTheme.subtitleColor }}>
                      👤 Protagonistas: <span className="font-semibold">{efemeride.personajeClave}</span>
                    </div>
                  )}
                </div>
              )}

              {mode === "victoria" && (
                <div className="space-y-3 relative z-10 py-1 text-center">
                  <div className="inline-flex p-3 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-3xl">
                    🏆
                  </div>

                  <h3
                    className="text-lg sm:text-xl font-black leading-tight tracking-tight m-0"
                    style={{ color: currentTheme.titleColor }}
                  >
                    ¡Línea Temporal Intacta!
                  </h3>

                  <div
                    className="p-3 rounded-2xl space-y-1"
                    style={{
                      background: currentTheme.quoteBg,
                      border: currentTheme.quoteBorder,
                    }}
                  >
                    <div
                      className="text-2xl sm:text-3xl font-black tracking-tight"
                      style={{ color: currentTheme.titleColor }}
                    >
                      {gameStats?.score || 0}
                    </div>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: currentTheme.subtitleColor }}
                    >
                      Cartas ordenadas sin quebrar la historia
                    </div>
                    {gameStats?.categoryName && (
                      <div className="text-[10px] font-semibold" style={{ color: currentTheme.bodyColor }}>
                        Categoría: {gameStats.categoryName}
                      </div>
                    )}
                  </div>

                  <p
                    className="text-[11px] sm:text-xs italic leading-tight m-0"
                    style={{ color: currentTheme.bodyColor }}
                  >
                    "El conocimiento del pasado es la llave del futuro." ⏳
                  </p>
                </div>
              )}

              {mode === "batalla" && (
                <div className="space-y-3 relative z-10 py-1 text-center">
                  <div className="inline-flex p-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/50 text-3xl">
                    ⚔️
                  </div>

                  <h3
                    className="text-lg sm:text-xl font-black leading-tight tracking-tight m-0"
                    style={{ color: currentTheme.titleColor }}
                  >
                    ¡Te desafío a un Duelo Histórico!
                  </h3>

                  <p
                    className="text-[11px] sm:text-xs leading-snug m-0 font-medium"
                    style={{ color: currentTheme.bodyColor }}
                  >
                    ¿Quién colocará más siglos y eventos sin fallar? Acepta el reto en tiempo real.
                  </p>

                  {battleInfo?.roomCode && (
                    <div
                      className="p-3 rounded-2xl space-y-1"
                      style={{
                        background: currentTheme.quoteBg,
                        border: currentTheme.quoteBorder,
                      }}
                    >
                      <div
                        className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: currentTheme.subtitleColor }}
                      >
                        Clave de la Sala Privada
                      </div>
                      <div
                        className="text-2xl font-black tracking-widest uppercase font-mono"
                        style={{ color: currentTheme.titleColor }}
                      >
                        {battleInfo.roomCode}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pie de la Tarjeta con Enlace Viral */}
              <div
                className="mt-3 p-2 rounded-xl flex items-center justify-between gap-2 relative z-10"
                style={{
                  background: currentTheme.footerBg,
                  border: currentTheme.footerBorder,
                }}
              >
                <div className="text-left">
                  <div
                    className="text-[10px] font-black uppercase tracking-wide leading-tight"
                    style={{ color: currentTheme.footerTitle }}
                  >
                    Juega y desafía el tiempo gratis
                  </div>
                  <div
                    className="text-[9px] font-bold"
                    style={{ color: currentTheme.footerSub }}
                  >
                    linea.mentrixestudios.com
                  </div>
                </div>
                <div
                  className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/20 text-white shrink-0"
                >
                  Entrar ⏳
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleShareImage}
              disabled={generating}
              className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                generating ? "opacity-75 cursor-wait" : ""
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{generating ? "Generando imagen ultra nítida..." : "Compartir Tarjeta (Imagen)"}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-900/30 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "¡Copiado!" : "Copiar Texto"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
