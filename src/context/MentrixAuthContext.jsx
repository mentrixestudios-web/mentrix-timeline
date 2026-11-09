import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { toast } from "sonner";

const MentrixAuthContext = createContext(null);

const STORAGE_KEYS_BY_GAME = {
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
};

function isSameUser(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.id !== b.id || a.email !== b.email) return false;
  const metaA = a.user_metadata || {};
  const metaB = b.user_metadata || {};
  return (
    metaA.full_name === metaB.full_name &&
    metaA.avatar_url === metaB.avatar_url &&
    metaA.mentrix_global_coins === metaB.mentrix_global_coins &&
    metaA.timeline_coins === metaB.timeline_coins &&
    metaA.mind_coins === metaB.mind_coins &&
    metaA.eb_coins === metaB.eb_coins
  );
}

export function MentrixAuthProvider({ children, gameId = "timeline" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isSyncingRef = useRef(false);
  const userRef = useRef(null);
  const lastSyncAtRef = useRef(0);
  const initialCheckedRef = useRef(false);

  const storageKeys = STORAGE_KEYS_BY_GAME[gameId] || STORAGE_KEYS_BY_GAME.timeline;

  const updateUserSafe = useCallback((nextUser) => {
    const normalized = nextUser ?? null;
    if (!isSameUser(userRef.current, normalized)) {
      userRef.current = normalized;
      setUser(normalized);
    }
  }, []);

  // Función de sincronización bidireccional inteligente (Billetera Global Unificada Mentrix)
  const syncWithCloud = useCallback(async (currentUser, force = false) => {
    if (!currentUser || !supabase) return;
    if (isSyncingRef.current) return;

    const now = Date.now();
    if (!force && now - lastSyncAtRef.current < 15000) {
      return;
    }

    isSyncingRef.current = true;
    lastSyncAtRef.current = now;

    try {
      const meta = currentUser.user_metadata || {};

      // Monedas unificadas en la nube: busca balance global o el mayor entre los juegos
      const candidateCoins = [
        meta.mentrix_global_coins,
        meta.timeline_coins,
        meta.eb_coins,
        meta.mind_coins,
        meta[`${gameId}_coins`],
      ]
        .filter((v) => v !== undefined && v !== null && Number.isFinite(Number(v)))
        .map(Number);

      const cloudGlobalCoins = candidateCoins.length > 0 ? Math.max(...candidateCoins) : undefined;
      const cloudStarter = meta[`${gameId}_starter_claimed`];
      const cloudStreak = meta[`${gameId}_streak`];

      const localCoins = parseInt(localStorage.getItem(storageKeys.coins) || "0", 10) || 0;
      const localStarter = localStorage.getItem(storageKeys.starter) === "true";
      const localStreak = parseInt(localStorage.getItem(storageKeys.streak) || "0", 10) || 0;

      // Balance definitivo: el mayor entre local y nube global para nunca perder monedas
      let finalCoins = localCoins;
      if (cloudGlobalCoins !== undefined) {
        finalCoins = Math.max(localCoins, cloudGlobalCoins);
      }

      const finalStarter = Boolean(localStarter || cloudStarter);
      const finalStreak = Math.max(localStreak, Number(cloudStreak) || 0);

      let localChanged = false;

      if (finalCoins > 0 && finalCoins !== localCoins) {
        localStorage.setItem(storageKeys.coins, finalCoins.toString());
        localChanged = true;
      }
      if (finalStarter && !localStarter) {
        localStorage.setItem(storageKeys.starter, "true");
        localChanged = true;
      }
      if (finalStreak > 0 && finalStreak !== localStreak) {
        localStorage.setItem(storageKeys.streak, finalStreak.toString());
        localChanged = true;
      }

      // Notificar a la UI únicamente si hubo un cambio real en los datos locales
      if (localChanged && typeof window !== "undefined") {
        window.dispatchEvent(new Event(storageKeys.event));
      }

      const needsCloudUpdate =
        meta.mentrix_global_coins !== finalCoins ||
        meta[`${gameId}_coins`] !== finalCoins ||
        Boolean(cloudStarter) !== finalStarter ||
        (Number(cloudStreak) || 0) !== finalStreak;

      if (needsCloudUpdate) {
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
    } finally {
      isSyncingRef.current = false;
    }
  }, [gameId, storageKeys]);

  // Cargar sesión inicial y suscribirse a cambios de estado una sola vez al montar
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

    // 2. Suscribirse a los cambios de estado de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "USER_UPDATED") {
        updateUserSafe(session?.user ?? null);
        return;
      }

      const u = session?.user ?? null;
      updateUserSafe(u);
      setLoading(false);

      if (event === "SIGNED_IN" && u) {
        initialCheckedRef.current = true;
        await syncWithCloud(u, true);
        if (typeof window !== "undefined") {
          if (window.location.hash.includes("access_token") || window.location.search.includes("code=")) {
            const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "Jugador";
            toast.success(`☁️ ¡Bienvenido, ${name}! Sesión iniciada con éxito.`);
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      } else if (event === "INITIAL_SESSION") {
        initialCheckedRef.current = true;
        if (u) {
          await syncWithCloud(u, false);
        }
      } else if (event === "SIGNED_OUT") {
        updateUserSafe(null);
      }
    });

    // 3. Fallback de sesión local si INITIAL_SESSION aún no se disparó
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      updateUserSafe(u);
      setLoading(false);
      if (u && !initialCheckedRef.current) {
        initialCheckedRef.current = true;
        syncWithCloud(u, false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Reconectar si el usuario vuelve a la app tras estar en segundo plano
    const handleAppResume = async () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastSyncAtRef.current < 30000) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            updateUserSafe(session.user);
            await syncWithCloud(session.user, false);
          }
        } catch {}
      }
    };

    document.addEventListener("visibilitychange", handleAppResume);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleAppResume);
    };
  }, [syncWithCloud, updateUserSafe]);

  // Login con Google (redirige de vuelta a la misma pantalla donde estaba el usuario)
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("El servicio de cuentas no está configurado.");
      return;
    }
    try {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/perfil";
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
      updateUserSafe(data.user);
      await syncWithCloud(data.user, true);
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
      updateUserSafe(data.user);
      await syncWithCloud(data.user, true);
    }
    return data;
  };

  // Cerrar sesión
  const logout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      updateUserSafe(null);
      toast.info("Has cerrado sesión. Tus datos locales siguen en tu dispositivo.");
    } catch {
      toast.error("Error al cerrar sesión.");
    }
  };

  // Guardar balance en la nube tras compras o partidas (Billetera Unificada)
  const backupCoinsToCloud = useCallback(async (newCoinsAmount) => {
    if (!userRef.current || !supabase) return;
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
  }, [gameId]);

  const value = useMemo(() => ({
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
    syncWithCloud: () => syncWithCloud(userRef.current, true),
  }), [user, loading, showAuthModal, backupCoinsToCloud, syncWithCloud]);

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
