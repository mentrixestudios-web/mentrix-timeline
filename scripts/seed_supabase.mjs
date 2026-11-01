import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env o .env.local si existen
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];

  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [k, ...v] = trimmed.split("=");
        if (k && v.length > 0) {
          const val = v.join("=").trim().replace(/^['"]|['"]$/g, "");
          process.env[k.trim()] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Faltan las variables de entorno de Supabase.");
  console.error("Asegúrate de definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o SUPABASE_SERVICE_ROLE_KEY) en tu archivo .env.local");
  console.error("Ejemplo:\n  VITE_SUPABASE_URL=https://xyz.supabase.co\n  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log("🚀 Iniciando Seed en Supabase (MentrixDB)...");
  console.log(`📡 URL: ${supabaseUrl}`);

  // 1. Leer JSON de eventos
  const eventsPath = path.join(__dirname, "timeline_events.json");
  const museumPath = path.join(__dirname, "timeline_museum.json");

  const events = JSON.parse(fs.readFileSync(eventsPath, "utf8"));
  const museum = JSON.parse(fs.readFileSync(museumPath, "utf8"));

  console.log(`\n📦 Subiendo ${events.length} eventos a 'timeline_events'...`);
  const chunkSize = 50;
  for (let i = 0; i < events.length; i += chunkSize) {
    const batch = events.slice(i, i + chunkSize);
    const { error } = await supabase.from("timeline_events").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error en lote de eventos ${i} - ${i + batch.length}:`, error.message);
    } else {
      process.stdout.write(`  ✅ Eventos insertados: ${Math.min(i + chunkSize, events.length)}/${events.length}\r`);
    }
  }
  console.log("\n✨ Eventos completados exitosamente.");

  console.log(`\n📦 Subiendo ${museum.length} coleccionables a 'timeline_museum'...`);
  for (let i = 0; i < museum.length; i += chunkSize) {
    const batch = museum.slice(i, i + chunkSize);
    const { error } = await supabase.from("timeline_museum").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error en lote de museo ${i} - ${i + batch.length}:`, error.message);
    } else {
      process.stdout.write(`  ✅ Ítems insertados: ${Math.min(i + chunkSize, museum.length)}/${museum.length}\r`);
    }
  }
  console.log("\n✨ Museo completado exitosamente.");
  console.log("\n🎉 ¡Poblado de MentrixDB finalizado con éxito!");
}

runSeed().catch((err) => {
  console.error("❌ Error inesperado durante el seed:", err);
  process.exit(1);
});
