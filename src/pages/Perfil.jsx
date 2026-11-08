import MentrixAccountBanner from "@/components/auth/MentrixAccountBanner";
import TermsAndConditionsModal from "@/components/settings/TermsAndConditionsModal";
import PrivacyPolicyModal from "@/components/settings/PrivacyPolicyModal";
import TutorialModal from "@/components/tutorial/TutorialModal";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Bell, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck,
  Trophy,
  Flame,
  Coins,
  Crown,
  Volume2,
  Award,
  Layers,
  ChevronRight
} from "lucide-react";
import { 
  isNotificationsEnabled, 
  setNotificationsEnabled, 
  sendTestNotification, 
  requestNotificationPermission 
} from "@/utils/notificationSystem";
import {
  getStats,
  getHighScore,
  getStreakInfo,
  getLevelInfo,
  getCoins,
  getUnlockedCardIds,
  getClaimedAchievementIds
} from "@/utils/gameStorage";
import { LEARNING_CARDS } from "@/data/learningCards";
import { ACHIEVEMENTS } from "@/data/achievements";
import MentrixMascot from "@/components/game/MentrixMascot";
import { playSfx } from "@/utils/soundSystem";

function getRangoJugador(nivel) {
  if (nivel >= 15) return { titulo: "Señor del Tiempo", icono: "👑", color: "from-amber-400 to-yellow-500" };
  if (nivel >= 10) return { titulo: "Gran Crononauta", icono: "🔮", color: "from-purple-400 to-pink-500" };
  if (nivel >= 5) return { titulo: "Guardián de Eras", icono: "🛡️", color: "from-blue-400 to-indigo-500" };
  return { titulo: "Viajero Temporal", icono: "⏳", color: "from-emerald-400 to-teal-500" };
}

export default function Perfil() {
  const navigate = useNavigate();
  const [notifEnabled, setNotifEnabled] = useState(() => isNotificationsEnabled());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [stats, setStats] = useState(getStats());
  const [highScore, setHighScore] = useState(getHighScore());
  const [streakInfo, setStreakInfo] = useState(getStreakInfo());
  const [levelInfo, setLevelInfo] = useState(getLevelInfo());
  const [coins, setCoins] = useState(getCoins());
  const [unlockedCards, setUnlockedCards] = useState(getUnlockedCardIds());
  const [claimedAch, setClaimedAch] = useState(getClaimedAchievementIds());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getStats());
      setHighScore(getHighScore());
      setStreakInfo(getStreakInfo());
      setLevelInfo(getLevelInfo());
      setCoins(getCoins());
      setUnlockedCards(getUnlockedCardIds());
      setClaimedAch(getClaimedAchievementIds());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    return () => window.removeEventListener("mt_storage_updated", handleUpdate);
  }, []);

  const rango = getRangoJugador(levelInfo.nivel);

  const handleToggleNotif = async () => {
    playSfx("tap");
    const next = !notifEnabled;
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error("Permiso denegado en el navegador.");
        return;
      }
    }
    setNotificationsEnabled(next);
    setNotifEnabled(next);
    toast.success(next ? "🔔 Notificaciones activadas" : "🔕 Notificaciones desactivadas");
  };

  const handleTestNotif = async () => {
    playSfx("tap");
    const ok = await sendTestNotification();
    if (!ok) {
      toast.error("Permiso denegado. Concede permiso en el navegador.");
      return;
    }
    toast.message("✨ Te llegará una notificación de prueba en 5 segundos.", { duration: 3500 });
  };

  const handleResetData = () => {
    playSfx("wrong");
    localStorage.clear();
    setShowConfirmReset(false);
    toast.success("Progreso restablecido correctamente.");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="space-y-4 select-none pb-14">
      {/* ── HEADER SUPERIOR ESTÁNDAR PREMIUM ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={() => playSfx("tap")}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver</span>
        </Link>

        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm">
          PERFIL DEL VIAJERO 👤
        </span>
      </div>

      {/* ── CUENTA MENTRIX CLOUD SYNC ── */}
      <MentrixAccountBanner />

      {/* ── MENTI ASESOR ACTIVO CON BURBUJA ── */}
      <div className="w-full">
        <MentrixMascot
          layout="default"
          customMessage={`¡Hola, ${rango.titulo}! Estás en el Nivel ${levelInfo.nivel} con ${unlockedCards.length} reliquias en tu bóveda. Aquí puedes revisar tu rango y configurar tus alertas diarias.`}
        />
      </div>

      {/* ── TARJETA HERO DE IDENTIDAD Y NIVEL DEL JUGADOR ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#162652] via-[#0e1938] to-[#080e20] border-2 border-amber-400/60 shadow-xl space-y-4"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-purple-500" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${rango.color} flex items-center justify-center text-3xl shadow-lg border-2 border-white/30 shrink-0`}>
              {rango.icono}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                  NIVEL {levelInfo.nivel}
                </span>
                <span className="text-[9px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {levelInfo.experiencia} XP Total
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight mt-1 truncate">
                {rango.titulo}
              </h2>
              <p className="text-[11px] text-white/65 font-semibold">
                Licencia Oficial de Crononauta Mentrix
              </p>
            </div>
          </div>

          <Link
            to="/tienda"
            onClick={() => playSfx("tap")}
            className="px-3 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 flex flex-col items-center shrink-0 transition-all"
          >
            <div className="flex items-center gap-1 text-amber-300 font-black text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins}</span>
            </div>
            <span className="text-[8px] font-bold text-white/60 uppercase mt-0.5">Ir a Tienda</span>
          </Link>
        </div>

        {/* Barra de Experiencia de Nivel */}
        <div className="space-y-1.5 pt-2 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-black">
            <span className="text-amber-200/80">Progreso al Nivel {levelInfo.nivel + 1}</span>
            <span className="text-amber-400">{levelInfo.xpActual} / {levelInfo.xpMax} XP ({levelInfo.xpPct}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.xpPct}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── CUADRÍCULA DE INSIGNIAS DE ESTADO (4 CHIPS 3D) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div
          onClick={() => {
            playSfx("tap");
            navigate("/estadisticas?tab=records");
          }}
          className="cursor-pointer relative overflow-hidden rounded-2xl p-3 bg-[#0b1328]/90 border border-amber-500/30 hover:border-amber-400 transition-all shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-white/60 uppercase">Mayor Línea</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base font-black text-amber-300">{highScore} <span className="text-[10px] text-white/60">cartas</span></p>
        </div>

        <div
          onClick={() => {
            playSfx("tap");
            navigate("/desafio");
          }}
          className="cursor-pointer relative overflow-hidden rounded-2xl p-3 bg-[#0b1328]/90 border border-orange-500/30 hover:border-orange-400 transition-all shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-white/60 uppercase">Racha Activa</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-base font-black text-orange-300">{streakInfo.racha} <span className="text-[10px] text-white/60">días</span></p>
        </div>

        <div
          onClick={() => {
            playSfx("tap");
            navigate("/estadisticas?tab=codice");
          }}
          className="cursor-pointer relative overflow-hidden rounded-2xl p-3 bg-[#0b1328]/90 border border-purple-500/30 hover:border-purple-400 transition-all shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-white/60 uppercase">Reliquias</span>
            <Crown className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-base font-black text-purple-300">{unlockedCards.length} <span className="text-[10px] text-white/60">/ {LEARNING_CARDS.length}</span></p>
        </div>

        <div
          onClick={() => {
            playSfx("tap");
            navigate("/estadisticas?tab=logros");
          }}
          className="cursor-pointer relative overflow-hidden rounded-2xl p-3 bg-[#0b1328]/90 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-white/60 uppercase">Logros</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-base font-black text-emerald-300">{claimedAch.length} <span className="text-[10px] text-white/60">/ {ACHIEVEMENTS.length}</span></p>
        </div>
      </div>

      {/* ── SECCIÓN DE CONFIGURACIÓN & SISTEMA (2 COLUMNAS EN DESKTOP) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1: Notificaciones PWA */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e1b38] to-[#0b1328] border border-blue-400/35 rounded-3xl p-4 space-y-3.5 shadow-lg flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-xl shrink-0 shadow-inner">
                🔔
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ALERTAS TEMPORALES
                </span>
                <h4 className="font-black text-sm text-white mt-0.5">Notificaciones PWA</h4>
                <p className="text-[11px] text-white/60">Recordatorio de reto diario y racha</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleNotif}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                notifEnabled ? "bg-emerald-500" : "bg-white/20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                  notifEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestNotif}
            className="w-full text-xs font-black py-2.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-200 transition-all text-center cursor-pointer"
          >
            ⚡ Enviar Notificación de Prueba (5s)
          </button>
        </div>

        {/* Card 2: Zona de Mantenimiento / Reinicio */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#26111c] to-[#0b1328] border border-red-500/30 rounded-3xl p-4 space-y-3 shadow-lg flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-xl shrink-0">
              ⚠️
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30">
                DATOS LOCALES
              </span>
              <h4 className="font-black text-sm text-white mt-0.5">Reiniciar Bóveda</h4>
              <p className="text-[11px] text-white/60">
                Restablece monedas, récords y reliquias a cero
              </p>
            </div>
          </div>

          {showConfirmReset ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetData}
                className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-[11px] transition-all cursor-pointer"
              >
                Sí, Borrar Todo
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="py-2 rounded-xl bg-white/10 text-white/80 font-bold text-[11px] hover:bg-white/20 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                setShowConfirmReset(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-black text-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Restablecer Progreso</span>
            </button>
          )}
        </div>
      </div>

      {/* ── GUÍA Y ASPECTOS LEGALES ── */}
      <div className="bg-[#0b1328]/80 border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <span className="text-white font-black text-sm">Información Legal & Guías</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            📖 Ver Tutorial
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            📄 Términos
          </button>
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            🛡️ Privacidad
          </button>
        </div>
      </div>

      <TermsAndConditionsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TutorialModal open={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* ── SELLO OFICIAL MENTRIX STUDIOS ── */}
      <div className="rounded-2xl bg-[#0b1328]/80 border border-white/10 p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-sm">
            ⏳
          </div>
          <div>
            <p className="font-black text-white text-xs">Mentrix: Línea de Tiempo v1.0</p>
            <p className="text-[10px] text-white/45">Ecosistema Educativo Mentrix Studios © 2026</p>
          </div>
        </div>
        <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-1 rounded-full">
          ✓ PWA Activa
        </span>
      </div>
    </div>
  );
}
