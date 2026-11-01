import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EVENTS_DB } from "../src/data/eventsData.js";
import { LEARNING_CARDS } from "../src/data/learningCards.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

console.log(`Exportando ${EVENTS_DB.length} eventos y ${LEARNING_CARDS.length} coleccionables...`);

// 1. Exportar JSON puros
const eventsPayload = EVENTS_DB.map((e) => ({
  id: e.id,
  categoria: e.category || e.categoria || "historia",
  nombre: e.title || e.nombre,
  anio: parseInt(e.year ?? e.anio ?? 0, 10),
  descripcion: e.description || e.descripcion || "",
  pista: e.datoCurioso || e.pista || "",
  siglo: e.siglo || "",
  icono: e.icon || e.icono || "Pyramid",
  dificultad: "medio",
}));

const museumPayload = LEARNING_CARDS.map((c) => ({
  id: c.id,
  categoria: c.category || c.categoria || "historia",
  tipo: c.tier || c.tipo || "codice",
  titulo: c.title || c.titulo,
  subtitulo: c.era || c.subtitulo || "",
  siglo_texto: c.yearFormatted || c.siglo_texto || (c.year ? `${c.year} d.C.` : ""),
  extracto: c.citaHistorica || c.extracto || "",
  relato_historico: c.leccionPedagogica || c.relato_historico || "",
  significado_cultural: c.desbloqueoRequisito || c.significado_cultural || "",
  dato_curioso: c.sabiasQue || c.dato_curioso || "",
  coste_desbloqueo: parseInt(c.recompensaMonedas || c.coste_desbloqueo || 0, 10),
}));

fs.writeFileSync(
  path.join(__dirname, "timeline_events.json"),
  JSON.stringify(eventsPayload, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "timeline_museum.json"),
  JSON.stringify(museumPayload, null, 2),
  "utf8"
);

// 2. Generar SQL de inserción con UPSERT (ON CONFLICT (id) DO UPDATE)
let sqlEvents = `-- =========================================================================\n`;
sqlEvents += `-- SEED: timeline_events (558 Eventos Históricos Oficiales de Mentrix)\n`;
sqlEvents += `-- =========================================================================\n\n`;

const chunkSize = 50;
for (let i = 0; i < eventsPayload.length; i += chunkSize) {
  const chunk = eventsPayload.slice(i, i + chunkSize);
  sqlEvents += `INSERT INTO public.timeline_events (id, categoria, nombre, anio, descripcion, pista, siglo, icono, dificultad)\nVALUES\n`;
  const values = chunk.map((e) => {
    return `  (${escapeSql(e.id)}, ${escapeSql(e.categoria)}, ${escapeSql(e.nombre)}, ${e.anio}, ${escapeSql(e.descripcion)}, ${escapeSql(e.pista)}, ${escapeSql(e.siglo)}, ${escapeSql(e.icono)}, ${escapeSql(e.dificultad)})`;
  });
  sqlEvents += values.join(",\n");
  sqlEvents += `\nON CONFLICT (id) DO UPDATE SET\n`;
  sqlEvents += `  categoria = EXCLUDED.categoria,\n`;
  sqlEvents += `  nombre = EXCLUDED.nombre,\n`;
  sqlEvents += `  anio = EXCLUDED.anio,\n`;
  sqlEvents += `  descripcion = EXCLUDED.descripcion,\n`;
  sqlEvents += `  pista = EXCLUDED.pista,\n`;
  sqlEvents += `  siglo = EXCLUDED.siglo,\n`;
  sqlEvents += `  icono = EXCLUDED.icono,\n`;
  sqlEvents += `  dificultad = EXCLUDED.dificultad;\n\n`;
}

fs.writeFileSync(path.join(__dirname, "seed_timeline_events.sql"), sqlEvents, "utf8");

// 3. Generar SQL de inserción para Museo
let sqlMuseum = `-- =========================================================================\n`;
sqlMuseum += `-- SEED: timeline_museum (72 Códices y Reliquias Oficiales de Mentrix)\n`;
sqlMuseum += `-- =========================================================================\n\n`;

for (let i = 0; i < museumPayload.length; i += chunkSize) {
  const chunk = museumPayload.slice(i, i + chunkSize);
  sqlMuseum += `INSERT INTO public.timeline_museum (id, categoria, tipo, titulo, subtitulo, siglo_texto, extracto, relato_historico, significado_cultural, dato_curioso, coste_desbloqueo)\nVALUES\n`;
  const values = chunk.map((c) => {
    return `  (${escapeSql(c.id)}, ${escapeSql(c.categoria)}, ${escapeSql(c.tipo)}, ${escapeSql(c.titulo)}, ${escapeSql(c.subtitulo)}, ${escapeSql(c.siglo_texto)}, ${escapeSql(c.extracto)}, ${escapeSql(c.relato_historico)}, ${escapeSql(c.significado_cultural)}, ${escapeSql(c.dato_curioso)}, ${c.coste_desbloqueo})`;
  });
  sqlMuseum += values.join(",\n");
  sqlMuseum += `\nON CONFLICT (id) DO UPDATE SET\n`;
  sqlMuseum += `  categoria = EXCLUDED.categoria,\n`;
  sqlMuseum += `  tipo = EXCLUDED.tipo,\n`;
  sqlMuseum += `  titulo = EXCLUDED.titulo,\n`;
  sqlMuseum += `  subtitulo = EXCLUDED.subtitulo,\n`;
  sqlMuseum += `  siglo_texto = EXCLUDED.siglo_texto,\n`;
  sqlMuseum += `  extracto = EXCLUDED.extracto,\n`;
  sqlMuseum += `  relato_historico = EXCLUDED.relato_historico,\n`;
  sqlMuseum += `  significado_cultural = EXCLUDED.significado_cultural,\n`;
  sqlMuseum += `  dato_curioso = EXCLUDED.dato_curioso,\n`;
  sqlMuseum += `  coste_desbloqueo = EXCLUDED.coste_desbloqueo;\n\n`;
}

fs.writeFileSync(path.join(__dirname, "seed_timeline_museum.sql"), sqlMuseum, "utf8");

console.log("¡Archivos exportados exitosamente!");
console.log(`- scripts/timeline_events.json (${eventsPayload.length} eventos)`);
console.log(`- scripts/timeline_museum.json (${museumPayload.length} coleccionables)`);
console.log(`- scripts/seed_timeline_events.sql`);
console.log(`- scripts/seed_timeline_museum.sql`);
