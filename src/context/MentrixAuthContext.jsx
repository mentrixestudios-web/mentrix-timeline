import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { toast } from "sonner";

const MentrixAuthContext = createContext(null);

export function MentrixAuthProvider({ children, gameId = "timeline" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Claves de almacenamiento según el juego
  const storageKeys = {
    timeline: {
      coins: "mt_coins",
      streak: "mt_streak",
      starter: "mt_starter_pack_claimed",
      cards: "mt_unlocked_cards",
      event: "mt_storage_updated",
    },
    mind: {
      coins: "gameCoins",
      streak: "racha_dias",
      starter: "starter_pack_claimed",
      event: "storage",
    },
    eb: {
      coins: "gameCoins",
      streak: "racha_dias",
      starter: "starter_pack_claimed",
      event: "storage",
    },
  }[gameId] || {
    coins: "mt_coins",
    streak: "mt_streak",
    starter: "mt_starter_pack_claimed",
    event: "mt_storage_updated",
  };

  // Función de sincronización bidireccional inteligente
  const syncWithCloud = useCallback(async (currentUser) => {
    if (!currentUser || !supabase) return;
    try {
      const meta = currentUser.user_metadata || {};
      const cloudCoins = meta[`${gameId}_coins`];
      const cloudStarter = meta[`${gameId}_starter_claimed`];
      const cloudStreak = meta[`${gameId}_streak`];

      const localCoins = parseInt(localStorage.getItem(storageKeys.coins) || "0", 10);
      const localStarter = localStorage.getItem(storageKeys.starter) === "true";
      const localStreak = parseInt(localStorage.getItem(storageKeys.streak) || "0", 10);

      // Determinar balance definitivo (el mayor entre local y nube)
      let finalCoins = localCoins;
      if (cloudCoins !== undefined && Number.isFinite(Number(cloudCoins))) {
        finalCoins = Math.max(localCoins, Number(cloudCoins));
      }

      const finalStarter = Boolean(localStarter || cloudStarter);
      const finalStreak = Math.max(localStreak, Number(cloudStreak) || 0);

      // Guardar en local storage
      if (finalCoins > 0) {
        localStorage.setItem(storageKeys.coins, finalCoins.toString());
      }
      if (finalStarter) {
        localStorage.setItem(storageKeys.starter, "true");
      }
      if (finalStreak > 0) {
        localStorage.setItem(storageKeys.streak, finalStreak.toString());
      }

      // Notificar a la UI
      window.dispatchEvent(new Event(storageKeys.event));

      // Si local tiene datos más recientes o no estaban en la nube, actualizar la nube
      if (
        cloudCoins !== finalCoins ||
        cloudStarter !== finalStarter ||
        cloudStreak !== finalStreak
      ) {
        await supabase.auth.updateUser({
          data: {
            [`${gameId}_coins`]: finalCoins,
            [`${gameId}_starter_claimed`]: finalStarter,
            [`${gameId}_streak`]: finalStreak,
            last_sync_at: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      console.warn("Mentrix Cloud Sync error:", err);
    }
  }, [gameId, storageKeys]);

  // Cargar sesión inicial y suscribirse a cambios de estado
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof window !== "undefined" && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.session?.user) {
              setUser(data.session.user);
              syncWithCloud(data.session.user);
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState(null, "", cleanUrl);
              setLoading(false);
              return;
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          syncWithCloud(session.user);
        }
      } catch (e) {
        console.warn("Mentrix initAuth error:", e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleAppResume = async () => {
      if (document.visibilityState === "visible") {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser((prev) => {
              if (prev?.id !== session.user.id) {
                syncWithCloud(session.user);
                return session.user;
              }
              return prev;
            });
          }
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener("visibilitychange", handleAppResume);
    window.addEventListener("focus", handleAppResume);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await syncWithCloud(u);
      }
      if (event === "SIGNED_IN") {
        const name = u?.user_metadata?.full_name || u?.email?.split("@")[0] || "Usuario";
        toast.success(`☁️ ¡Sesión iniciada con éxito! Bienvenido, ${name}.`);
        if (typeof window !== "undefined") {
          if (window.location.hash.includes("access_token")) {
            window.history.replaceState(null, "", window.location.pathname);
          }
          if (window.location.search.includes("code=")) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleAppResume);
      window.removeEventListener("focus", handleAppResume);
    };
  }, [syncWithCloud]);

  // Login con Google
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("El servicio de cuentas no está configurado.");
      return;
    }
    try {
      const cleanRedirect = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: cleanRedirect,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err?.message || "Error al conectar con Google.");
    }
  };

  // Login con Correo y Contraseña
  const loginWithEmail = async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error("El servicio de cuentas no está configurado.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return data;
  };

  // Registro con Correo
  const registerWithEmail = async (email, password, fullName) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error("El servicio de cuentas no está configurado.");
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // Cerrar sesión
  const logout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.info("Has cerrado sesión. Tus datos locales siguen en tu dispositivo.");
    } catch {
      toast.error("Error al cerrar sesión.");
    }
  };

  // Guardar balance en la nube tras compras o partidas
  const backupCoinsToCloud = async (newCoinsAmount) => {
    if (!user || !supabase) return;
    try {
      await supabase.auth.updateUser({
        data: {
          [`${gameId}_coins`]: newCoinsAmount,
          last_backup_at: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn("Error guardando monedas en la nube:", e);
    }
  };

  const value = {
    user,
    isLoggedIn: Boolean(user),
    loading,
    showAuthModal,
    setShowAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    backupCoinsToCloud,
    syncWithCloud: () => syncWithCloud(user),
  };

  return (
    <MentrixAuthContext.Provider value={value}>
      {children}
    </MentrixAuthContext.Provider>
  );
}

export function useMentrixAuth() {
  const ctx = useContext(MentrixAuthContext);
  if (!ctx) {
    throw new Error("useMentrixAuth debe usarse dentro de MentrixAuthProvider");
  }
  return ctx;
}
