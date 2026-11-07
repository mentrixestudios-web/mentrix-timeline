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

  // Función de sincronización bidireccional inteligente (Billetera Global Unificada Mentrix)
  const syncWithCloud = useCallback(async (currentUser) => {
    if (!currentUser || !supabase) return;
    try {
      const meta = currentUser.user_metadata || {};
      
      // Monedas unificadas en la nube: busca balance global o el mayor entre los juegos
      const candidateCoins = [
        meta.mentrix_global_coins,
        meta.timeline_coins,
        meta.eb_coins,
        meta.mind_coins,
        meta[`${gameId}_coins`],
      ].filter((v) => v !== undefined && v !== null && Number.isFinite(Number(v))).map(Number);

      const cloudGlobalCoins = candidateCoins.length > 0 ? Math.max(...candidateCoins) : undefined;
      const cloudStarter = meta[`${gameId}_starter_claimed`];
      const cloudStreak = meta[`${gameId}_streak`];

      const localCoins = parseInt(localStorage.getItem(storageKeys.coins) || "0", 10);
      const localStarter = localStorage.getItem(storageKeys.starter) === "true";
      const localStreak = parseInt(localStorage.getItem(storageKeys.streak) || "0", 10);

      // Balance definitivo: el mayor entre local y nube global para nunca perder monedas
      let finalCoins = localCoins;
      if (cloudGlobalCoins !== undefined) {
        finalCoins = Math.max(localCoins, cloudGlobalCoins);
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

      // Notificar a todos los escuchadores de almacenamiento locales
      window.dispatchEvent(new Event(storageKeys.event));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("mt_storage_updated"));

      if (
        meta.mentrix_global_coins !== finalCoins ||
        meta[`${gameId}_coins`] !== finalCoins ||
        cloudStarter !== finalStarter ||
        cloudStreak !== finalStreak
      ) {
        await supabase.auth.updateUser({
          data: {
            mentrix_global_coins: finalCoins,
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

    // 1. Detectar si la URL trajo algún error de OAuth
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash
      );
      const errorMsg =
        searchParams.get("error_description") ||
        hashParams.get("error_description") ||
        searchParams.get("error") ||
        hashParams.get("error");
      if (errorMsg) {
        toast.error(`Error al autenticar: ${decodeURIComponent(errorMsg)}`, { duration: 6000 });
      }
    }

    // 2. Suscribirse síncronamente a los cambios de estado de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);

      if (u) {
        await syncWithCloud(u);
      }

      if (event === "SIGNED_IN" && u) {
        const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "Jugador";
        toast.success(`☁️ ¡Bienvenido, ${name}! Sesión iniciada con éxito.`);
        if (typeof window !== "undefined") {
          if (window.location.hash.includes("access_token") || window.location.search.includes("code=")) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      }
    });

    // 3. Obtener sesión almacenada localmente
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        syncWithCloud(u);
      }
      setLoading(false);
    });

    // Reconectar e importar cambios inmediatamente si el usuario vuelve a la app
    const handleAppResume = async () => {
      if (document.visibilityState === "visible") {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await syncWithCloud(session.user);
          }
        } catch {}
      }
    };

    // Auto-backup de monedas cuando cambian localmente mientras el usuario está conectado
    let saveTimeout = null;
    const handleCoinsChange = () => {
      const currentCoins = parseInt(localStorage.getItem(storageKeys.coins) || "0", 10);
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && currentCoins >= 0) {
            await supabase.auth.updateUser({
              data: {
                mentrix_global_coins: currentCoins,
                [`${gameId}_coins`]: currentCoins,
                last_backup_at: new Date().toISOString(),
              },
            });
          }
        } catch {}
      }, 1000);
    };

    document.addEventListener("visibilitychange", handleAppResume);
    window.addEventListener("focus", handleAppResume);
    window.addEventListener(storageKeys.event, handleCoinsChange);
    window.addEventListener("storage", handleCoinsChange);

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleAppResume);
      window.removeEventListener("focus", handleAppResume);
      window.removeEventListener(storageKeys.event, handleCoinsChange);
      window.removeEventListener("storage", handleCoinsChange);
    };
  }, [syncWithCloud, storageKeys.event, storageKeys.coins, gameId]);

  // Login con Google (redirige de vuelta a la misma pantalla donde estaba el usuario)
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("El servicio de cuentas no está configurado.");
      return;
    }
    try {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/Perfil";
      const cleanRedirect = `${window.location.origin}${currentPath}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: cleanRedirect,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
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
    if (data?.user) {
      setUser(data.user);
      await syncWithCloud(data.user);
    }
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
    if (data?.user) {
      setUser(data.user);
      await syncWithCloud(data.user);
    }
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

  // Guardar balance en la nube tras compras o partidas (Billetera Unificada)
  const backupCoinsToCloud = async (newCoinsAmount) => {
    if (!user || !supabase) return;
    try {
      const cleanAmount = Math.max(0, parseInt(newCoinsAmount, 10) || 0);
      await supabase.auth.updateUser({
        data: {
          mentrix_global_coins: cleanAmount,
          [`${gameId}_coins`]: cleanAmount,
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
