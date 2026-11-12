/**
 * Configuración de Eras Históricas para Mentrix: Línea de Tiempo
 * Proporciona identidad visual única (estilo carta coleccionable física de mesa),
 * paleta de colores inmersiva, textura y sellos para cada época de la historia.
 */

export const HISTORICAL_ERAS = {
  antiguedad: {
    id: "antiguedad",
    nombre: "Antigüedad Clásica",
    epoca: "a.C. · Cunas de la Civilización",
    icono: "🏛️",
    badgeLabel: "Era Antigua",
    // Gradiente pergamino/arcilla/bronce envejecido
    cardBg: "from-[#1f150b] via-[#160f08] to-[#24170d]",
    borderDefault: "border-amber-600/60 shadow-[0_4px_24px_rgba(217,119,6,0.18)]",
    headerBg: "from-amber-600 via-amber-500 to-yellow-600 text-slate-950",
    stampBg: "bg-amber-950/70 border-amber-500/40 text-amber-200",
    curioBg: "bg-amber-950/40 border-amber-600/30 text-amber-100",
    accentGlow: "bg-amber-500/10",
    cornerStyle: "border-amber-500/60",
    sealText: "CÓDICE DE BRONCE",
  },
  medieval: {
    id: "medieval",
    nombre: "Edad Media y Cruzadas",
    epoca: "Siglos V al XV · Época de Reinos",
    icono: "⚔️",
    badgeLabel: "Era Medieval",
    // Gradiente zafiro heráldico y piedra de castillo
    cardBg: "from-[#0c1836] via-[#081024] to-[#122247]",
    borderDefault: "border-blue-400/50 shadow-[0_4px_24px_rgba(59,130,246,0.18)]",
    headerBg: "from-blue-500 via-indigo-500 to-cyan-500 text-white",
    stampBg: "bg-blue-950/70 border-blue-400/40 text-blue-200",
    curioBg: "bg-blue-950/40 border-blue-500/30 text-blue-100",
    accentGlow: "bg-blue-500/10",
    cornerStyle: "border-blue-400/60",
    sealText: "CRÓNICA MEDIEVAL",
  },
  moderna: {
    id: "moderna",
    nombre: "Renacimiento e Ilustración",
    epoca: "Siglos XVI al XVIII · Descubrimientos",
    icono: "📜",
    badgeLabel: "Era Moderna",
    // Gradiente esmeralda alquimista y oro renacentista
    cardBg: "from-[#07241c] via-[#051813] to-[#0a3026]",
    borderDefault: "border-emerald-400/50 shadow-[0_4px_24px_rgba(16,185,129,0.18)]",
    headerBg: "from-emerald-500 via-teal-500 to-amber-500 text-slate-950",
    stampBg: "bg-emerald-950/70 border-emerald-400/40 text-emerald-200",
    curioBg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-100",
    accentGlow: "bg-emerald-500/10",
    cornerStyle: "border-emerald-400/60",
    sealText: "COMPÁS RENACENTISTA",
  },
  industrial: {
    id: "industrial",
    nombre: "Revolución Industrial y Guerras",
    epoca: "Siglo XIX a 1950 · Vapor y Acero",
    icono: "⚙️",
    badgeLabel: "Era Industrial",
    // Gradiente cobre oxidado, latón y hierro forjado
    cardBg: "from-[#29170e] via-[#1b0f09] to-[#361e12]",
    borderDefault: "border-orange-400/55 shadow-[0_4px_24px_rgba(249,115,22,0.18)]",
    headerBg: "from-orange-500 via-amber-500 to-yellow-600 text-slate-950",
    stampBg: "bg-orange-950/70 border-orange-400/40 text-orange-200",
    curioBg: "bg-orange-950/40 border-orange-500/30 text-orange-100",
    accentGlow: "bg-orange-500/10",
    cornerStyle: "border-orange-400/60",
    sealText: "PATENTE INDUSTRIAL",
  },
  contemporanea: {
    id: "contemporanea",
    nombre: "Era Espacial y Digital",
    epoca: "1951 al Presente · Futuro Abierto",
    icono: "🚀",
    badgeLabel: "Era Digital",
    // Gradiente amatista cósmico y cian cibernético
    cardBg: "from-[#1d0e38] via-[#120824] to-[#27124a]",
    borderDefault: "border-purple-400/55 shadow-[0_4px_24px_rgba(168,85,247,0.2)]",
    headerBg: "from-purple-500 via-indigo-500 to-cyan-400 text-white",
    stampBg: "bg-purple-950/70 border-purple-400/40 text-purple-200",
    curioBg: "bg-purple-950/40 border-purple-500/30 text-purple-100",
    accentGlow: "bg-purple-500/10",
    cornerStyle: "border-purple-400/60",
    sealText: "REGISTRO CONTEMPORÁNEO",
  },
};

/**
 * Determina la era histórica según el año numérico
 * @param {number} year - Año (negativo para a.C., positivo para d.C.)
 */
export function getEraByYear(year) {
  if (year === undefined || year === null || isNaN(year)) {
    return HISTORICAL_ERAS.antiguedad;
  }
  if (year < 0) {
    return HISTORICAL_ERAS.antiguedad;
  }
  if (year <= 1500) {
    return HISTORICAL_ERAS.medieval;
  }
  if (year <= 1800) {
    return HISTORICAL_ERAS.moderna;
  }
  if (year <= 1950) {
    return HISTORICAL_ERAS.industrial;
  }
  return HISTORICAL_ERAS.contemporanea;
}

/**
 * Retorna etiqueta de siglo formateada de forma pedagógica
 */
export function getCenturyLabel(year) {
  if (year < 0) {
    const c = Math.ceil(Math.abs(year) / 100);
    return `Siglo ${c} a.C.`;
  }
  const c = Math.ceil(year / 100);
  return `Siglo ${c} d.C.`;
}

/**
 * Iconos y temas por categoría
 */
export const CATEGORY_ICONS = {
  historia: "🏛️",
  biblia: "🕊️",
  ciencia: "🔬",
  musica: "🎵",
  cine: "🎬",
  conflictos: "⚔️",
  exploraciones: "🧭",
  arte: "🎨",
  deportes: "🏅",
  caos: "✨",
};
