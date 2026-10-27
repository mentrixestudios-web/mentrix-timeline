import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Bell, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { 
  isNotificationsEnabled, 
  setNotificationsEnabled, 
  sendTestNotification, 
  requestNotificationPermission 
} from "@/utils/notificationSystem";

export default function Perfil() {
  const [notifEnabled, setNotifEnabled] = useState(() => isNotificationsEnabled());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleToggleNotif = async () => {
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
    toast.success(next ? "Notificaciones activadas" : "Notificaciones desactivadas");
  };

  const handleTestNotif = async () => {
    const ok = await sendTestNotification();
    if (!ok) {
      toast.error("Permiso denegado. Concede permiso en el navegador.");
      return;
    }
    toast.message("Te llegará una notificación de prueba en 5 segundos.", { duration: 3500 });
  };

  const handleResetData = () => {
    localStorage.clear();
    setShowConfirmReset(false);
    toast.success("Progreso restablecido correctamente.");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white">Ajustes y Perfil</h2>
          <p className="text-xs text-white/50">Personaliza tu experiencia de juego</p>
        </div>
      </div>

      {/* Notificaciones Card */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Notificaciones PWA</h4>
              <p className="text-xs text-white/50">Desafío diario y recordatorio de racha</p>
            </div>
          </div>

          <button
            onClick={handleToggleNotif}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              notifEnabled ? "bg-blue-600" : "bg-white/20"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                notifEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleTestNotif}
          className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all text-center"
        >
          Probar notificación (5 segundos)
        </button>
      </div>

      {/* Info de la app */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-2 text-center">
        <p className="font-bold text-sm text-white">Mentrix: Línea de Tiempo</p>
        <p className="text-xs text-white/40">Versión 1.0.0 (PWA Responsive)</p>
        <p className="text-[11px] text-blue-400 font-semibold pt-1">Mentrix Studios © 2026</p>
      </div>

      {/* Zona de Peligro / Reset */}
      <div className="border border-red-500/20 bg-red-950/20 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-bold text-sm">Zona de Peligro</span>
        </div>

        <p className="text-xs text-white/50">
          Esta acción borrará todas tus monedas, récords y estadísticas guardadas localmente.
        </p>

        {showConfirmReset ? (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleResetData}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all"
            >
              Confirmar: Borrar todo mi progreso
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="w-full py-2 rounded-xl bg-white/5 text-white/60 text-xs hover:text-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-semibold text-xs transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Restablecer todo el progreso</span>
          </button>
        )}
      </div>
    </div>
  );
}
