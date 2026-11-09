import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Cloud, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useMentrixAuth } from "@/context/MentrixAuthContext";
import { toast } from "sonner";
import { playSfx } from "@/utils/soundSystem";

export default function MentrixAuthModal({ open, onClose }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, isLoggedIn, user, logout } = useMentrixAuth();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    playSfx("tap");
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSfx("tap");
    if (!email || !password) {
      toast.error("Por favor completa todos los campos.");
      return;
    }
    if (tab === "register" && !fullName) {
      toast.error("Por favor ingresa tu nombre de jugador.");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      if (tab === "login") {
        await loginWithEmail(email, password);
        toast.success("¡Bienvenido de nuevo!");
        onClose();
      } else {
        const data = await registerWithEmail(email, password, fullName);
        if (data?.session) {
          toast.success("¡Cuenta creada con éxito! Bienvenido a Mentrix.");
          onClose();
        } else {
          toast.success("¡Cuenta creada! Ya puedes iniciar sesión con tu correo.");
          setTab("login");
        }
      }
    } catch (err) {
      toast.error(err?.message || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
        <div
          className="absolute inset-0 bg-transparent"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-400/50 p-5 sm:p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative select-none z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Encabezado */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                ☁️
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white m-0 tracking-tight flex items-center gap-1.5">
                <span>Cuenta Mentrix Cloud</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              </h3>
              <p className="text-xs text-amber-200/80 m-0">
                Respalda tus monedas, racha y compras en la nube
              </p>
            </div>
          </div>

          {isLoggedIn ? (
            /* Vista de Usuario ya Autenticado */
            <div className="space-y-4 py-2">
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-emerald-500/30 flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border-2 border-emerald-400 shadow-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm text-white truncate">
                    {user.user_metadata?.full_name || "Jugador Mentrix"}
                  </div>
                  <div className="text-xs text-slate-300 truncate">{user.email}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Progreso respaldado ☁️
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300/85 leading-relaxed bg-amber-500/10 border border-amber-400/20 p-3 rounded-xl m-0">
                🔒 Tus compras de monedas y logros se sincronizan automáticamente. Si desinstalas la aplicación o juegas en otro dispositivo, tu saldo y avances se restaurarán al iniciar sesión.
              </p>

              <button
                type="button"
                onClick={async () => {
                  playSfx("tap");
                  await logout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 border border-white/10 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cerrar sesión en este dispositivo
              </button>
            </div>
          ) : (
            /* Vista de Formulario de Inicio / Registro */
            <div className="space-y-4">
              {/* Botón Continuar con Google */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 transition-all cursor-pointer border border-white active:scale-98 disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{submitting ? "Conectando con Google..." : "Continuar con Google"}</span>
              </button>

              <div className="flex items-center gap-2 my-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase font-bold text-slate-400">o con tu correo</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Selector Tabs: Iniciar Sesión / Crear Cuenta */}
              <div className="flex bg-slate-950/70 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tab === "login"
                      ? "bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tab === "register"
                      ? "bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === "register" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Tu Nombre o Apodo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej. Juan de Patmos"
                        className="w-full bg-slate-950/80 border border-white/15 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@gmail.com"
                      className="w-full bg-slate-950/80 border border-white/15 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-950/80 border border-white/15 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{tab === "login" ? "Ingresar a mi cuenta" : "Registrar y proteger cuenta"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-[10px] text-center text-slate-400 pt-1">
                ⚡ El acceso con correo funciona al 100% dentro de la app sin abrir navegadores externos.
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
