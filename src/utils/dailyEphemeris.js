import { EFEMERIDES_CURADAS } from "@/data/efemeridesData";
import { EVENTS_DB } from "@/data/eventsData";
import { addCoins, addXp, getCoins } from "@/utils/gameStorage";

const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const CATEGORIA_LABELS = {
  historia: "Historia Universal",
  ciencia: "Ciencia & Tecnología",
  descubrimientos: "Grandes Descubrimientos",
  cultura_pop: "Cultura Pop & Cine",
  chile: "Historia de Chile",
  conflictos: "Grandes Batallas & Conflictos",
  exploraciones: "Exploraciones & Navegación",
  arte: "Arte, Literatura & Filosofía",
  deportes: "Deportes & Hazañas"
};

const CATEGORIA_ICONS = {
  historia: "🏛️",
  ciencia: "🔬",
  descubrimientos: "💡",
  cultura_pop: "🎬",
  chile: "🇨🇱",
  conflictos: "⚔️",
  exploraciones: "🧭",
  arte: "🎨",
  deportes: "🏆"
};

/**
 * Obtiene el número del día del año (1 a 366)
 */
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Genera una efeméride dinámica a partir de un evento de EVENTS_DB
 */
function adaptEventToEphemeris(event, dia, mes) {
  const cat = event.category || "historia";
  const fechaTexto = `${dia} de ${NOMBRES_MESES[mes - 1]}`;
  const anio = event.year ?? event.anio ?? 0;
  const anioTexto = event.yearFormatted || (anio >= 0 ? `${anio} d.C.` : `${Math.abs(anio)} a.C.`);

  return {
    id: `dyn_${event.id}`,
    dia,
    mes,
    fechaTexto,
    anio,
    anioTexto,
    siglo: event.siglo || "Era Histórica",
    categoria: cat,
    categoriaLabel: CATEGORIA_LABELS[cat] || "Historia",
    icono: CATEGORIA_ICONS[cat] || "⏳",
    titulo: event.title || event.nombre || "Acontecimiento Histórico",
    personajeClave: event.personajeClave || "Protagonistas de la época",
    resumenCorto: event.description || event.descripcion || "Un hito que moldeó el curso de nuestra civilización.",
    relato: `Un día como hoy en la cronología histórica (${anioTexto}), tuvo lugar: ${event.description || event.descripcion || event.title}. Este suceso transformó para siempre la realidad de su tiempo e influyó en las generaciones posteriores.`,
    impacto: `Constituye uno de los pilares del desarrollo de la categoría ${CATEGORIA_LABELS[cat] || "Historia"}, marcando el compás del ${event.siglo || "periodo histórico"}.`,
    curiosidad: event.datoCurioso || event.pista || "Un acontecimiento cuya resonancia y trascendencia continúan vigentes en los libros de historia universal.",
    preguntaTrivia: `¿En qué era o siglo se sitúa este hito histórico?`
  };
}

/**
 * Retorna la efeméride correspondiente a una fecha específica
 */
export function getEphemerisForDate(date = new Date()) {
  const dia = date.getDate();
  const mes = date.getMonth() + 1; // 1-12

  // 1. Buscar coincidencia exacta en las efemérides curadas
  const match = EFEMERIDES_CURADAS.find(e => e.dia === dia && e.mes === mes);
  if (match) return match;

  // 2. Si no hay efeméride curada fija, seleccionar de forma determinista entre los 558 eventos
  if (EVENTS_DB && EVENTS_DB.length > 0) {
    const dayOfYear = getDayOfYear(date);
    const eventIndex = (dayOfYear * 7) % EVENTS_DB.length;
    const selectedEvent = EVENTS_DB[eventIndex];
    return adaptEventToEphemeris(selectedEvent, dia, mes);
  }

  // Fallback seguro
  return EFEMERIDES_CURADAS[0];
}

/**
 * Retorna una efeméride aleatoria para explorar la historia
 */
export function getRandomEphemeris() {
  const usarCurada = Math.random() > 0.4 && EFEMERIDES_CURADAS.length > 0;
  if (usarCurada) {
    const idx = Math.floor(Math.random() * EFEMERIDES_CURADAS.length);
    return EFEMERIDES_CURADAS[idx];
  }

  if (EVENTS_DB && EVENTS_DB.length > 0) {
    const randIdx = Math.floor(Math.random() * EVENTS_DB.length);
    const randEvent = EVENTS_DB[randIdx];
    const randDia = Math.floor(Math.random() * 28) + 1;
    const randMes = Math.floor(Math.random() * 12) + 1;
    return adaptEventToEphemeris(randEvent, randDia, randMes);
  }

  return EFEMERIDES_CURADAS[0];
}

/**
 * Verifica si el jugador ya leyó la efeméride del día de hoy
 */
export function isDailyEphemerisReadToday() {
  const today = new Date().toISOString().slice(0, 10);
  const lastRead = localStorage.getItem("mt_ephemeris_last_read_date");
  return lastRead === today;
}

/**
 * Marca la efeméride como leída hoy, premia al jugador con monedas/XP y actualiza la racha
 */
export function markDailyEphemerisAsRead() {
  const today = new Date().toISOString().slice(0, 10);
  const lastRead = localStorage.getItem("mt_ephemeris_last_read_date");
  
  if (lastRead === today) {
    return { yaLeida: true, monedasGanadas: 0, rachaActualizada: false };
  }

  // Registrar lectura de hoy
  localStorage.setItem("mt_ephemeris_last_read_date", today);

  // Actualizar racha diaria
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastPlay = localStorage.getItem("mt_last_play_date");
  let streak = parseInt(localStorage.getItem("mt_streak") || "0", 10);

  if (lastPlay !== today) {
    if (lastPlay === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    localStorage.setItem("mt_streak", String(streak));
    localStorage.setItem("mt_last_play_date", today);
  }

  // Premiar con 30 monedas y 25 XP
  addCoins(30);
  addXp(25);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mt_storage_updated"));
  }

  return {
    yaLeida: false,
    monedasGanadas: 30,
    racha: streak,
    rachaActualizada: true
  };
}
