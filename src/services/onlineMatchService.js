import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { EVENTS_DB } from "@/data/eventsData";

// Palabras para generar códigos de sala amigables y fáciles de compartir
const PALABRAS_SALA = ["CRONO", "TIEMPO", "ROCA", "ERA", "SIGLO", "MENTI", "HISTORIA", "HORA"];

// Avatares visuales para los hasta 6 jugadores de la mesa
export const AVATARES_MESA = ["👑", "⚡", "🔮", "🚀", "🪐", "🛡️"];

// Niveles de mesa de apuestas tipo Ludo Club
export const NIVELES_MESA = [
  {
    id: "aprendiz",
    nombre: "Mesa Aprendiz",
    apuesta: 50,
    color: "from-amber-600/30 to-amber-900/40 border-amber-500/40 text-amber-300",
    badge: "🥉 50 🪙",
    descripcion: "Ideal para calentar motores",
    min: 2,
    max: 6,
  },
  {
    id: "aventurero",
    nombre: "Mesa Aventurero",
    apuesta: 200,
    color: "from-blue-600/30 to-cyan-900/40 border-cyan-500/40 text-cyan-300",
    badge: "🥈 200 🪙",
    descripcion: "Para historiadores intrépidos",
    min: 2,
    max: 6,
  },
  {
    id: "maestro",
    nombre: "Mesa Maestro",
    apuesta: 500,
    color: "from-purple-600/30 to-indigo-950/40 border-purple-500/40 text-purple-300",
    badge: "🥇 500 🪙",
    descripcion: "Altas apuestas y gran prestigio",
    min: 2,
    max: 6,
  },
  {
    id: "leyenda",
    nombre: "Mesa Leyenda",
    apuesta: 1500,
    color: "from-rose-600/30 to-amber-950/40 border-rose-500/40 text-rose-300",
    badge: "💎 1.500 🪙",
    descripcion: "Solo para Crononautas Supremos",
    min: 2,
    max: 6,
  },
];

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
 * Baraja y prepara el mazo para hasta 6 jugadores (5 cartas cada uno)
 */
function prepararMazoInicial(categoria = "todas") {
  let bolsa = [...EVENTS_DB];
  if (categoria && categoria !== "todas") {
    const filtradas = bolsa.filter((e) => (e.category || e.categoria) === categoria);
    if (filtradas.length >= 35) {
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
    siglo: e.siglo || "",
    datoCurioso: e.datoCurioso || e.pista || "",
    personajeClave: e.personajeClave || "",
  });

  const mesaInicial = [formatear(bolsa[0])];
  const cartasRestantes = bolsa.slice(1).map(formatear);

  return {
    mesaInicial,
    cartasRestantes,
  };
}

// -------------------------------------------------------------
// CANAL LOCAL FALLBACK (BROADCASTCHANNEL)
// Permite sincronización entre pestañas locales
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

/**
 * Normaliza cualquier formato de sala (antiguo 1v1 o nuevo de 2-6 jugadores)
 * asegurando una estructura uniforme `jugadores`, `apuesta` y `pozo_total`.
 */
export function normalizarSala(raw) {
  if (!raw) return null;
  const sala = { ...raw };

  const meta = sala.ultimo_movimiento?.meta_partida;
  const apuesta = meta?.apuesta ?? sala.apuesta ?? 50;
  const maxJugadores = meta?.max_jugadores ?? 6;
  const minJugadores = meta?.min_jugadores ?? 2;

  let jugadores = meta?.jugadores;

  if (!Array.isArray(jugadores) || jugadores.length === 0) {
    // Reconstruir lista desde formato legacy 1v1
    jugadores = [
      {
        id: sala.host_id,
        nombre: sala.host_nombre || "Anfitrión",
        avatar: AVATARES_MESA[0],
        vidas: sala.vidas_host ?? 3,
        cartasEnMano: sala.mano_host || [],
        esHost: true,
        eliminado: (sala.vidas_host ?? 3) <= 0,
      },
    ];

    if (sala.guest_id) {
      jugadores.push({
        id: sala.guest_id,
        nombre: sala.guest_nombre || "Jugador 2",
        avatar: AVATARES_MESA[1],
        vidas: sala.vidas_guest ?? 3,
        cartasEnMano: sala.mano_guest || [],
        esHost: false,
        eliminado: (sala.vidas_guest ?? 3) <= 0,
      });
    }
  }

  const pozoTotal = meta?.pozo_total ?? apuesta * jugadores.length;
  const ordenTurnos = meta?.orden_turnos || jugadores.map((j) => j.id);
  const indiceTurno = meta?.indice_turno ?? 0;

  sala.apuesta = apuesta;
  sala.pozo_total = pozoTotal;
  sala.max_jugadores = maxJugadores;
  sala.min_jugadores = minJugadores;
  sala.jugadores = jugadores;
  sala.orden_turnos = ordenTurnos;
  sala.indice_turno = indiceTurno;

  return sala;
}

/**
 * Empaqueta la sala para persistencia en Supabase y almacenamiento local
 */
function serializarSalaParaGuardar(sala) {
  const jugadores = sala.jugadores || [];
  const host = jugadores[0] || { id: sala.host_id, nombre: sala.host_nombre };
  const guest = jugadores[1] || { id: null, nombre: null };

  const meta_partida = {
    apuesta: sala.apuesta || 50,
    pozo_total: (sala.apuesta || 50) * jugadores.length,
    max_jugadores: 6,
    min_jugadores: 2,
    jugadores: jugadores,
    orden_turnos: sala.orden_turnos || jugadores.map((j) => j.id),
    indice_turno: sala.indice_turno || 0,
  };

  const payload = {
    codigo_sala: sala.codigo_sala,
    estado: sala.estado,
    categoria: sala.categoria || "todas",
    host_id: host.id,
    host_nombre: host.nombre,
    guest_id: guest.id || null,
    guest_nombre: guest.nombre || null,
    turno_jugador_id: sala.turno_jugador_id,
    linea_tiempo_mesa: sala.linea_tiempo_mesa || [],
    mazo_cartas: sala.mazo_cartas || [],
    mano_host: host.cartasEnMano || [],
    mano_guest: guest.cartasEnMano || [],
    vidas_host: host.vidas ?? 3,
    vidas_guest: guest.vidas ?? 3,
    ganador_id: sala.ganador_id || null,
    ultimo_movimiento: {
      ...(sala.ultimo_movimiento || {}),
      meta_partida,
    },
  };

  return payload;
}

// =============================================================
// SERVICIO PRINCIPAL DE SALAS EN LÍNEA (2 A 6 JUGADORES)
// =============================================================

/**
 * Crea una nueva sala multijugador con capacidad de hasta 6 jugadores y apuesta configurable
 */
export async function crearSalaOnline({
  categoria = "todas",
  hostNombre = "Jugador 1",
  apuesta = 50,
}) {
  const player = getOnlinePlayerProfile();
  const codigoSala = generarCodigoSala();
  const { mesaInicial, cartasRestantes } = prepararMazoInicial(categoria);

  // Repartir 5 cartas iniciales para el host
  const manoHost = cartasRestantes.slice(0, 5);
  const mazoRestante = cartasRestantes.slice(5);

  const jugadores = [
    {
      id: player.id,
      nombre: hostNombre || player.name,
      avatar: AVATARES_MESA[0],
      vidas: 3,
      cartasEnMano: manoHost,
      esHost: true,
      eliminado: false,
    },
  ];

  const salaObj = {
    codigo_sala: codigoSala,
    estado: "esperando", // 'esperando' | 'jugando' | 'finalizado' | 'cancelado'
    categoria,
    apuesta,
    pozo_total: apuesta * 1,
    max_jugadores: 6,
    min_jugadores: 2,
    jugadores,
    host_id: player.id,
    host_nombre: hostNombre || player.name,
    guest_id: null,
    guest_nombre: null,
    turno_jugador_id: player.id,
    linea_tiempo_mesa: mesaInicial,
    mano_host: manoHost,
    mano_guest: [],
    mazo_cartas: mazoRestante,
    vidas_host: 3,
    vidas_guest: 3,
    ganador_id: null,
    orden_turnos: [player.id],
    indice_turno: 0,
    ultimo_movimiento: {
      tipo: "creacion",
      mensaje: `${hostNombre || player.name} abrió la Mesa (${apuesta} 🪙)`,
      timestamp: Date.now(),
    },
  };

  const payload = serializarSalaParaGuardar(salaObj);

  // 1. Si Supabase está conectado, guardar en PostgreSQL
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      const salaNorm = normalizarSala(data);
      return { success: true, sala: salaNorm, codigoSala, isLocalDemo: false };
    } catch (err) {
      console.warn("Error creando sala en Supabase, recurriendo a canal local:", err);
    }
  }

  // 2. Fallback local (BroadcastChannel / SessionStorage)
  sessionStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(payload));
  localStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(payload));
  const channel = getLocalChannel(codigoSala);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: payload });
  }

  return { success: true, sala: normalizarSala(payload), codigoSala, isLocalDemo: true };
}

/**
 * Se une a una sala existente (admite del jugador 2 hasta el 6)
 */
export async function unirseASalaOnline({ codigoSala, guestNombre = "Viajero Temporal" }) {
  const code = codigoSala.trim().toUpperCase();
  const player = getOnlinePlayerProfile();

  let sala = await obtenerEstadoSala(code);
  if (!sala) {
    throw new Error("La sala no existe o el código es inválido.");
  }

  // Verificar si ya está en la sala
  const yaEsta = sala.jugadores.some((j) => j.id === player.id);
  if (yaEsta) {
    return { success: true, sala, codigoSala: code, isLocalDemo: false };
  }

  if (sala.estado !== "esperando") {
    throw new Error("Esta partida ya ha comenzado.");
  }

  if (sala.jugadores.length >= sala.max_jugadores) {
    throw new Error("La mesa ya está completa (máximo 6 jugadores).");
  }

  // Repartir 5 cartas al nuevo jugador del mazo
  const mazoActual = [...(sala.mazo_cartas || [])];
  const manoNuevo = mazoActual.splice(0, 5);

  const nuevoJugador = {
    id: player.id,
    nombre: guestNombre || player.name,
    avatar: AVATARES_MESA[sala.jugadores.length % AVATARES_MESA.length],
    vidas: 3,
    cartasEnMano: manoNuevo,
    esHost: false,
    eliminado: false,
  };

  const nuevaListaJugadores = [...sala.jugadores, nuevoJugador];
  sala.jugadores = nuevaListaJugadores;
  sala.mazo_cartas = mazoActual;
  sala.pozo_total = (sala.apuesta || 50) * nuevaListaJugadores.length;
  sala.orden_turnos = nuevaListaJugadores.map((j) => j.id);

  // Si es el segundo jugador, registrar en columnas legacy guest_id
  if (nuevaListaJugadores.length === 2) {
    sala.guest_id = player.id;
    sala.guest_nombre = nuevoJugador.nombre;
    sala.mano_guest = manoNuevo;
  }

  sala.ultimo_movimiento = {
    tipo: "conexion",
    mensaje: `¡${nuevoJugador.nombre} se unió a la mesa (${nuevaListaJugadores.length}/6)!`,
    timestamp: Date.now(),
  };

  const payload = serializarSalaParaGuardar(sala);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .update(payload)
        .eq("codigo_sala", code)
        .select()
        .single();

      if (error) throw error;
      const salaNorm = normalizarSala(data);
      return { success: true, sala: salaNorm, codigoSala: code, isLocalDemo: false };
    } catch (err) {
      console.warn("Fallo unirse en Supabase:", err);
      throw err;
    }
  }

  // Fallback local
  sessionStorage.setItem(`mt_local_room_${code}`, JSON.stringify(payload));
  localStorage.setItem(`mt_local_room_${code}`, JSON.stringify(payload));
  const channel = getLocalChannel(code);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: payload });
  }

  return { success: true, sala: normalizarSala(payload), codigoSala: code, isLocalDemo: true };
}

/**
 * Inicia la partida cuando hay entre 2 y 6 jugadores en la sala
 */
export async function iniciarPartidaOnline({ codigoSala, hostId }) {
  const code = codigoSala.trim().toUpperCase();
  const sala = await obtenerEstadoSala(code);
  if (!sala) throw new Error("Sala no encontrada.");

  if (sala.jugadores.length < 2) {
    throw new Error("Se necesitan al menos 2 jugadores para comenzar.");
  }

  if (sala.host_id !== hostId && sala.jugadores[0]?.id !== hostId) {
    throw new Error("Solo el anfitrión puede iniciar la partida.");
  }

  sala.estado = "jugando";
  sala.turno_jugador_id = sala.jugadores[0].id;
  sala.indice_turno = 0;
  sala.ultimo_movimiento = {
    tipo: "inicio",
    mensaje: `¡Comenzó la batalla de ${sala.jugadores.length} crononautas por ${sala.pozo_total} 🪙!`,
    timestamp: Date.now(),
  };

  const payload = serializarSalaParaGuardar(sala);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .update(payload)
        .eq("codigo_sala", code)
        .select()
        .single();

      if (error) throw error;
      return normalizarSala(data);
    } catch (err) {
      console.warn("Error iniciando partida en Supabase:", err);
    }
  }

  sessionStorage.setItem(`mt_local_room_${code}`, JSON.stringify(payload));
  localStorage.setItem(`mt_local_room_${code}`, JSON.stringify(payload));
  const channel = getLocalChannel(code);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: payload });
  }

  return normalizarSala(payload);
}

/**
 * Abandona la sala de espera antes de que inicie la partida
 */
export async function salirDeSalaOnline({ codigoSala, jugadorId }) {
  const code = codigoSala.trim().toUpperCase();
  const sala = await obtenerEstadoSala(code);
  if (!sala || sala.estado !== "esperando") return null;

  const esHost = sala.host_id === jugadorId || sala.jugadores[0]?.id === jugadorId;

  if (esHost) {
    // Si el host sale, la sala se cancela para todos
    sala.estado = "cancelado";
    sala.ultimo_movimiento = {
      tipo: "cancelacion",
      mensaje: "El anfitrión cerró la sala.",
      timestamp: Date.now(),
    };
  } else {
    // Si sale un invitado, removerlo de la lista
    sala.jugadores = sala.jugadores.filter((j) => j.id !== jugadorId);
    sala.pozo_total = (sala.apuesta || 50) * sala.jugadores.length;
    sala.orden_turnos = sala.jugadores.map((j) => j.id);
    sala.ultimo_movimiento = {
      tipo: "salida",
      mensaje: `Un jugador abandonó la sala (${sala.jugadores.length}/6).`,
      timestamp: Date.now(),
    };
  }

  const payload = serializarSalaParaGuardar(sala);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("timeline_rooms").update(payload).eq("codigo_sala", code);
    } catch {}
  }

  sessionStorage.setItem(`mt_local_room_${code}`, JSON.stringify(payload));
  localStorage.setItem(`mt_local_room_${code}`, JSON.stringify(payload));
  const channel = getLocalChannel(code);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: payload });
  }

  return normalizarSala(payload);
}

/**
 * Obtiene el estado actual de la sala normalizado
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

      if (!error && data) return normalizarSala(data);
    } catch {}
  }

  const raw =
    sessionStorage.getItem(`mt_local_room_${code}`) ||
    localStorage.getItem(`mt_local_room_${code}`);
  return raw ? normalizarSala(JSON.parse(raw)) : null;
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
            onActualizacion(normalizarSala(payload.new));
          }
        }
      )
      .subscribe();
  }

  // Suscripción canal local BroadcastChannel
  const localChannel = getLocalChannel(code);
  const handleLocalMessage = (event) => {
    if (event.data?.type === "room_updated" && event.data.sala) {
      onActualizacion(normalizarSala(event.data.sala));
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
 * Calcula el siguiente jugador vivo para rotar el turno en círculo
 */
function calcularSiguienteTurno(jugadores, jugadorActualId) {
  const vivos = jugadores.filter((j) => !j.eliminado && j.vidas > 0);
  if (vivos.length <= 1) return vivos[0]?.id || null;

  const currentIdx = vivos.findIndex((j) => j.id === jugadorActualId);
  const nextIdx = (currentIdx + 1) % vivos.length;
  return vivos[nextIdx].id;
}

/**
 * Valida la colocación de una carta e impacta el turno en tiempo real (de 2 a 6 jugadores)
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

  const jugadores = sala.jugadores.map((j) => ({ ...j }));
  const jIndex = jugadores.findIndex((j) => j.id === jugadorId);
  if (jIndex === -1) throw new Error("Jugador no registrado en esta mesa.");

  const jugador = jugadores[jIndex];
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
    // Acierto: se inserta en la mesa en orden cronológico
    mesa.splice(posicionInsertada, 0, carta);

    // Se retira de la mano del jugador
    jugador.cartasEnMano = jugador.cartasEnMano.filter((c) => c.id !== carta.id);

    // ¿Ganó la partida por vaciar su mano?
    if (jugador.cartasEnMano.length === 0) {
      nuevoEstado = "finalizado";
      ganadorId = jugador.id;
      ultimoMovimiento = {
        tipo: "victoria",
        esCorrecto: true,
        cartaTitulo: carta.title,
        carta,
        anio: carta.year,
        jugadorId: jugador.id,
        jugadorNombre: jugador.nombre,
        mensaje: `¡${jugador.nombre} colocó su última carta y se corona Campeón de la Mesa! 👑`,
        timestamp: Date.now(),
      };
    } else {
      ultimoMovimiento = {
        tipo: "acierto",
        esCorrecto: true,
        cartaTitulo: carta.title,
        carta,
        anio: carta.year,
        jugadorId: jugador.id,
        jugadorNombre: jugador.nombre,
        mensaje: `¡Acierto de ${jugador.nombre}! ${carta.title} (${carta.yearFormatted}) colocado correctamente.`,
        timestamp: Date.now(),
      };
    }
  } else {
    // Error: pierde 1 vida
    jugador.vidas = Math.max(0, jugador.vidas - 1);

    // Descartar la carta fallida y robar 1 nueva del mazo de reemplazo
    jugador.cartasEnMano = jugador.cartasEnMano.filter((c) => c.id !== carta.id);
    if (mazo.length > 0) {
      const robo = mazo.shift();
      jugador.cartasEnMano.push(robo);
    }

    if (jugador.vidas === 0) {
      jugador.eliminado = true;
      const vivosRestantes = jugadores.filter((j) => !j.eliminado && j.vidas > 0);

      // Si solo queda 1 jugador vivo, ese es el ganador
      if (vivosRestantes.length <= 1) {
        nuevoEstado = "finalizado";
        ganadorId = vivosRestantes[0]?.id || jugador.id;
        ultimoMovimiento = {
          tipo: "victoria",
          esCorrecto: false,
          cartaTitulo: carta.title,
          carta,
          anio: carta.year,
          jugadorId: jugador.id,
          jugadorNombre: jugador.nombre,
          mensaje: `¡${jugador.nombre} cayó sin vidas! ¡${vivosRestantes[0]?.nombre || "El último en pie"} gana la partida! 👑`,
          timestamp: Date.now(),
        };
      } else {
        ultimoMovimiento = {
          tipo: "eliminacion",
          esCorrecto: false,
          cartaTitulo: carta.title,
          carta,
          anio: carta.year,
          jugadorId: jugador.id,
          jugadorNombre: jugador.nombre,
          mensaje: `¡${jugador.nombre} se quedó sin vidas y fue eliminado! Quedan ${vivosRestantes.length} en juego.`,
          timestamp: Date.now(),
        };
      }
    } else {
      ultimoMovimiento = {
        tipo: "error",
        esCorrecto: false,
        cartaTitulo: carta.title,
        carta,
        anio: carta.year,
        jugadorId: jugador.id,
        jugadorNombre: jugador.nombre,
        mensaje: `¡Error de ${jugador.nombre}! ${carta.title} era de ${carta.yearFormatted}. -1 Vida (le quedan ${jugador.vidas} ❤️).`,
        timestamp: Date.now(),
      };
    }
  }

  // Calcular siguiente turno
  const siguienteTurnoId =
    nuevoEstado === "jugando"
      ? calcularSiguienteTurno(jugadores, jugadorId)
      : sala.turno_jugador_id;

  sala.jugadores = jugadores;
  sala.linea_tiempo_mesa = mesa;
  sala.mazo_cartas = mazo;
  sala.estado = nuevoEstado;
  sala.ganador_id = ganadorId;
  sala.turno_jugador_id = siguienteTurnoId;
  sala.ultimo_movimiento = ultimoMovimiento;

  const payload = serializarSalaParaGuardar(sala);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .update(payload)
        .eq("codigo_sala", codigoSala)
        .select()
        .single();

      if (!error && data) return normalizarSala(data);
    } catch (err) {
      console.warn("Fallo al actualizar turno en Supabase:", err);
    }
  }

  sessionStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(payload));
  localStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(payload));
  const channel = getLocalChannel(codigoSala);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: payload });
  }

  return sala;
}

/**
 * Pasa de turno por inactividad / temporizador (pierde 1 vida o pasa turno)
 */
export async function forzarPasoTurnoOnline({ codigoSala, jugadorId }) {
  const sala = await obtenerEstadoSala(codigoSala);
  if (!sala || sala.estado !== "jugando" || sala.turno_jugador_id !== jugadorId) return null;

  const jugadores = sala.jugadores.map((j) => ({ ...j }));
  const jIndex = jugadores.findIndex((j) => j.id === jugadorId);
  if (jIndex === -1) return null;

  const jugador = jugadores[jIndex];
  jugador.vidas = Math.max(0, jugador.vidas - 1);

  let nuevoEstado = "jugando";
  let ganadorId = null;

  if (jugador.vidas === 0) {
    jugador.eliminado = true;
    const vivos = jugadores.filter((j) => !j.eliminado && j.vidas > 0);
    if (vivos.length <= 1) {
      nuevoEstado = "finalizado";
      ganadorId = vivos[0]?.id || jugador.id;
    }
  }

  const siguienteTurnoId =
    nuevoEstado === "jugando"
      ? calcularSiguienteTurno(jugadores, jugadorId)
      : sala.turno_jugador_id;

  sala.jugadores = jugadores;
  sala.estado = nuevoEstado;
  sala.ganador_id = ganadorId;
  sala.turno_jugador_id = siguienteTurnoId;
  sala.ultimo_movimiento = {
    tipo: "tiempo_agotado",
    esCorrecto: false,
    jugadorId: jugador.id,
    jugadorNombre: jugador.nombre,
    mensaje: `⏰ ¡A ${jugador.nombre} se le agotó el tiempo! Pierde 1 ❤️ y pasa el turno.`,
    timestamp: Date.now(),
  };

  const payload = serializarSalaParaGuardar(sala);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("timeline_rooms")
        .update(payload)
        .eq("codigo_sala", codigoSala)
        .select()
        .single();
      if (!error && data) return normalizarSala(data);
    } catch {}
  }

  sessionStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(payload));
  localStorage.setItem(`mt_local_room_${codigoSala}`, JSON.stringify(payload));
  const channel = getLocalChannel(codigoSala);
  if (channel) {
    channel.postMessage({ type: "room_updated", sala: payload });
  }

  return sala;
}
