import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { EVENTS_DB } from "@/data/eventsData";

// Palabras para generar códigos de sala amigables y fáciles de compartir
const PALABRAS_SALA = ["CRONO", "TIEMPO", "ROCA", "ERA", "SIGLO", "MENTI", "HISTORIA", "HORA"];

/**
 * Obtiene o crea el perfil local del jugador para partidas en línea
 */
export function getOnlinePlayerProfile() {
  let playerId = sessionStorage.getItem("mt_online_player_id");
  if (!playerId) {
    playerId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem("mt_online_player_id", playerId);
  }

  const savedName = localStorage.getItem("mt_player_name") || "Viajero Temporal";
  return {
    id: playerId,
    name: savedName,
  };
}

/**
 * Genera un código de sala aleatorio tipo "CRONO42"
 */
export function generarCodigoSala() {
  const palabra = PALABRAS_SALA[Math.floor(Math.random() * PALABRAS_SALA.length)];
  const numero = Math.floor(10 + Math.random() * 90);
  return `${palabra}${numero}`;
}

/**
 * Baraja y reparte cartas iniciales desde EVENTS_DB
 */
function repartirCartasPartida(categoria = "todas") {
  let bolsa = [...EVENTS_DB];
  if (categoria && categoria !== "todas") {
    const filtradas = bolsa.filter(e => (e.category || e.categoria) === categoria);
    if (filtradas.length >= 12) {
      bolsa = filtradas;
    }
  }

  // Barajar con Fisher-Yates
  for (let i = bolsa.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]];
  }

  // Formatear cartas simplificadas para la red
  const formatear = (e) => ({
    id: e.id,
    title: e.title || e.nombre,
    year: e.year ?? e.anio ?? 0,
    yearFormatted: e.yearFormatted || (e.year >= 0 ? `${e.year} d.C.` : `${Math.abs(e.year)} a.C.`),
    description: e.description || e.descripcion || "",
    category: e.category || e.categoria || "historia",
    icon: e.icon || e.icono || "Pyramid",
    siglo: e.siglo || ""
  });

  const mesaInicial = [formatear(bolsa[0])];
  const manoHost = bolsa.slice(1, 6).map(formatear);
  const manoGuest = bolsa.slice(6, 11).map(formatear);
  const mazoRestante = bolsa.slice(11, 35).map(formatear);

  return {
    mesaInicial,
    manoHost,
    manoGuest,
    mazoRestante,
  };
}

// -------------------------------------------------------------
// CANAL LOCAL FALLBACK (BROADCASTCHANNEL)
// Permite probar multijugador entre pestañas si Supabase aún no está configurado
// -------------------------------------------------------------
const localChannels = new Map();

function getLocalChannel(codigoSala) {
  if (typeof window === "undefined" || !window.BroadcastChannel) return null;
  if (!localChannels.has(codigoSala)) {
    const channel = new BroadcastChannel(`mt_room_${codigoSala}`);
    localChannels.set(codigoSala, channel);
  }
  return localChannels.get(codigoSala);
}

// =============================================================
// SERVICIO PRINCIPAL DE SALAS EN LÍNEA
// =============================================================

/**
 * Crea una nueva sala multijugador
 */
export async function crearSalaOnline({ categoria = "todas", hostNombre = "Jugador 1" }) {
  const player = getOnlinePlayerProfile();
  const codigoSala = generarCodigoSala();
  const { mesaInicial, manoHost, manoGuest, mazoRestante } = repartirCartasPartida(categoria);

  const nuevaSala = {
    codigo_sala: codigoSala,
    estado: "esperando", // 'esperando' | 'jugando' | 'finalizado' | 'cancelado'
    categoria,
    host_id: player.id,
    host_nombre: hostNombre || player.name,
    guest_id: null,
    guest_nombre: null,
    turno_jugador_id: player.id,
    linea_tiempo_mesa: mesaInicial,
    mano_host: manoHost,
    mano_guest: manoGuest,
    mazo_cartas: mazoRestante,
    vidas_host: 3,
    vidas_guest: 3,
    ganador_id: null,
    ultimo_movimiento: {
      tipo: "creacion",
      mensaje: `${hostNombre} creó la sala`,
      timestamp: Date.now(),
    },
  };

  // 1. Si Supabase está conectado, guardar en PostgreSQL
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .insert([nuevaSala])
        .select()
        .single();

      if (error) throw error;
      return { success: true, sala: data, codigoSala, isLocalDemo: false };
    } catch (err) {
      console.warn("Error creando sala en Supabase, recurriendo a canal local:", err);
    }
  }

  // 2. Fallback local (BroadcastChannel / SessionStorage)
  sessionStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(nuevaSala));
  const channel = getLocalChannel(codigoSala);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: nuevaSala });
  }

  return { success: true, sala: nuevaSala, codigoSala, isLocalDemo: true };
}

/**
 * Se une a una sala existente mediante su código
 */
export async function unirseASalaOnline({ codigoSala, guestNombre = "Jugador 2" }) {
  const code = codigoSala.trim().toUpperCase();
  const player = getOnlinePlayerProfile();

  // 1. Si Supabase está configurado
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: salaExistente, error: fetchErr } = await supabase
        .from("timeline_rooms")
        .select("*")
        .eq("codigo_sala", code)
        .single();

      if (fetchErr || !salaExistente) {
        throw new Error("La sala no existe o el código es inválido.");
      }

      if (salaExistente.estado !== "esperando" && salaExistente.guest_id !== player.id) {
        throw new Error("Esta sala ya está completa o la partida ha comenzado.");
      }

      // Si el mismo host intenta unirse como guest
      if (salaExistente.host_id === player.id) {
        return { success: true, sala: salaExistente, codigoSala: code, isLocalDemo: false };
      }

      const { data: salaActualizada, error: updateErr } = await supabase
        .from("timeline_rooms")
        .update({
          guest_id: player.id,
          guest_nombre: guestNombre || player.name,
          estado: "jugando",
          ultimo_movimiento: {
            tipo: "conexion",
            mensaje: `${guestNombre || "Jugador 2"} se unió a la partida`,
            timestamp: Date.now(),
          },
        })
        .eq("codigo_sala", code)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return { success: true, sala: salaActualizada, codigoSala: code, isLocalDemo: false };
    } catch (err) {
      console.warn("Fallo unirse en Supabase, probando canal local:", err);
      if (isSupabaseConfigured()) {
        throw err;
      }
    }
  }

  // 2. Fallback local
  const raw = sessionStorage.getItem(`mt_local_room_${code}`) || localStorage.getItem(`mt_local_room_${code}`);
  if (!raw) {
    throw new Error("Código de sala no encontrado en la sesión local.");
  }

  const salaLocal = JSON.parse(raw);
  if (salaLocal.host_id !== player.id) {
    salaLocal.guest_id = player.id;
    salaLocal.guest_nombre = guestNombre || player.name;
    salaLocal.estado = "jugando";
    salaLocal.ultimo_movimiento = {
      tipo: "conexion",
      mensaje: `${guestNombre || "Jugador 2"} se unió a la partida`,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(`mt_local_room_${code}`, JSON.stringify(salaLocal));
    localStorage.setItem(`mt_local_room_${code}`, JSON.stringify(salaLocal));

    const channel = getLocalChannel(code);
    if (channel) {
      channel.postMessage({ type: "room_updated", sala: salaLocal });
    }
  }

  return { success: true, sala: salaLocal, codigoSala: code, isLocalDemo: true };
}

/**
 * Obtiene el estado actual de la sala
 */
export async function obtenerEstadoSala(codigoSala) {
  const code = codigoSala.trim().toUpperCase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .select("*")
        .eq("codigo_sala", code)
        .single();

      if (!error && data) return data;
    } catch {}
  }

  const raw = sessionStorage.getItem(`mt_local_room_${code}`) || localStorage.getItem(`mt_local_room_${code}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Suscribe al canal Realtime de la sala (o al BroadcastChannel local)
 */
export function suscribirASala(codigoSala, onActualizacion) {
  const code = codigoSala.trim().toUpperCase();

  // Suscripción Realtime en Supabase
  let supabaseChannel = null;
  if (isSupabaseConfigured() && supabase) {
    supabaseChannel = supabase
      .channel(`room:${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timeline_rooms",
          filter: `codigo_sala=eq.${code}`,
        },
        (payload) => {
          if (payload.new) {
            onActualizacion(payload.new);
          }
        }
      )
      .subscribe();
  }

  // Suscripción canal local BroadcastChannel (respaldo / sincronización entre pestañas)
  const localChannel = getLocalChannel(code);
  const handleLocalMessage = (event) => {
    if (event.data?.type === "room_updated" && event.data.sala) {
      onActualizacion(event.data.sala);
    }
  };

  if (localChannel) {
    localChannel.addEventListener("message", handleLocalMessage);
  }

  // Retornar función de desuscripción
  return () => {
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
    if (localChannel) {
      localChannel.removeEventListener("message", handleLocalMessage);
    }
  };
}

/**
 * Valida la colocación de una carta e impacta el turno en tiempo real
 */
export async function colocarCartaEnLinea({
  codigoSala,
  jugadorId,
  carta,
  posicionInsertada, // índice donde el jugador colocó la carta en la línea de la mesa
}) {
  const sala = await obtenerEstadoSala(codigoSala);
  if (!sala) throw new Error("Sala no encontrada.");

  if (sala.estado !== "jugando") {
    throw new Error("La partida no está activa.");
  }

  if (sala.turno_jugador_id !== jugadorId) {
    throw new Error("No es tu turno.");
  }

  const esHost = sala.host_id === jugadorId;
  const manoActual = esHost ? [...(sala.mano_host || [])] : [...(sala.mano_guest || [])];
  let vidasActuales = esHost ? sala.vidas_host : sala.vidas_guest;
  let mesa = [...(sala.linea_tiempo_mesa || [])];
  let mazo = [...(sala.mazo_cartas || [])];

  // 1. Validar si la posición es cronológicamente correcta
  const anterior = mesa[posicionInsertada - 1];
  const posterior = mesa[posicionInsertada];

  const mayorOIgualQueAnterior = !anterior || carta.year >= anterior.year;
  const menorOIgualQuePosterior = !posterior || carta.year <= posterior.year;
  const esCorrecto = mayorOIgualQueAnterior && menorOIgualQuePosterior;

  let nuevoEstado = "jugando";
  let ganadorId = null;
  let ultimoMovimiento = {};

  if (esCorrecto) {
    // Acierto: se inserta en la mesa en orden
    mesa.splice(posicionInsertada, 0, carta);
    // Se quita de la mano
    const nuevaMano = manoActual.filter((c) => c.id !== carta.id);

    // ¿Ganó la partida por quedarse sin cartas?
    if (nuevaMano.length === 0) {
      nuevoEstado = "finalizado";
      ganadorId = jugadorId;
      ultimoMovimiento = {
        tipo: "victoria",
        esCorrecto: true,
        cartaTitulo: carta.title,
        anio: carta.year,
        mensaje: `¡${esHost ? sala.host_nombre : sala.guest_nombre} colocó su última carta y ganó el duelo! 👑`,
        timestamp: Date.now(),
      };
    } else {
      ultimoMovimiento = {
        tipo: "acierto",
        esCorrecto: true,
        cartaTitulo: carta.title,
        anio: carta.year,
        mensaje: `¡Acierto! ${carta.title} (${carta.yearFormatted}) colocado correctamente.`,
        timestamp: Date.now(),
      };
    }

    if (esHost) {
      sala.mano_host = nuevaMano;
    } else {
      sala.mano_guest = nuevaMano;
    }
  } else {
    // Error: pierde 1 vida
    vidasActuales = Math.max(0, vidasActuales - 1);

    // Descartar la carta fallida y robar 1 nueva del mazo de reemplazo
    let nuevaMano = manoActual.filter((c) => c.id !== carta.id);
    if (mazo.length > 0) {
      const robo = mazo.shift();
      nuevaMano.push(robo);
    }

    // ¿Perdió la partida por quedarse sin vidas?
    if (vidasActuales === 0) {
      nuevoEstado = "finalizado";
      ganadorId = esHost ? sala.guest_id : sala.host_id;
      ultimoMovimiento = {
        tipo: "derrota_vidas",
        esCorrecto: false,
        cartaTitulo: carta.title,
        anio: carta.year,
        mensaje: `¡${esHost ? sala.host_nombre : sala.guest_nombre} se quedó sin vidas!`,
        timestamp: Date.now(),
      };
    } else {
      ultimoMovimiento = {
        tipo: "error",
        esCorrecto: false,
        cartaTitulo: carta.title,
        anio: carta.year,
        mensaje: `¡Error! ${carta.title} era de ${carta.yearFormatted}. -1 Vida y roba nueva carta.`,
        timestamp: Date.now(),
      };
    }

    if (esHost) {
      sala.vidas_host = vidasActuales;
      sala.mano_host = nuevaMano;
    } else {
      sala.vidas_guest = vidasActuales;
      sala.mano_guest = nuevaMano;
    }
  }

  // Cambio de turno (si la partida sigue activa)
  const siguienteTurno = esHost ? sala.guest_id : sala.host_id;
  sala.linea_tiempo_mesa = mesa;
  sala.mazo_cartas = mazo;
  sala.estado = nuevoEstado;
  sala.ganador_id = ganadorId;
  sala.turno_jugador_id = nuevoEstado === "jugando" ? siguienteTurno : sala.turno_jugador_id;
  sala.ultimo_movimiento = ultimoMovimiento;

  // Actualizar en Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .update({
          linea_tiempo_mesa: sala.linea_tiempo_mesa,
          mano_host: sala.mano_host,
          mano_guest: sala.mano_guest,
          mazo_cartas: sala.mazo_cartas,
          vidas_host: sala.vidas_host,
          vidas_guest: sala.vidas_guest,
          estado: sala.estado,
          ganador_id: sala.ganador_id,
          turno_jugador_id: sala.turno_jugador_id,
          ultimo_movimiento: sala.ultimo_movimiento,
        })
        .eq("codigo_sala", codigoSala)
        .select()
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn("Fallo al actualizar turno en Supabase:", err);
    }
  }

  // Actualizar en LocalStorage / BroadcastChannel
  sessionStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(sala));
  localStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(sala));
  const channel = getLocalChannel(codigoSala);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala });
  }

  return sala;
}
