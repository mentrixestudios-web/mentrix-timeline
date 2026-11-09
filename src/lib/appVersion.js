const FALLBACK_INFO = {
  version: "2.7.3",
  build: "33",
  appName: "Mentrix Línea de Tiempo",
};

function normalizePart(part) {
  const parsed = Number.parseInt(String(part).replace(/\D+/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function compareVersionStrings(a = "0.0.0", b = "0.0.0") {
  const aParts = String(a).split(".");
  const bParts = String(b).split(".");
  const max = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < max; i += 1) {
    const left = normalizePart(aParts[i] ?? 0);
    const right = normalizePart(bParts[i] ?? 0);
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
}

export async function getInstalledAppInfo() {
  return FALLBACK_INFO;
}

export async function fetchLatestAppInfo() {
  const response = await fetch(`/version.json?ts=${Date.now()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo verificar la última versión disponible.");
  }

  const data = await response.json();
  return {
    version: String(data.version || FALLBACK_INFO.version),
    build: String(data.build || FALLBACK_INFO.build),
    publishedAt: data.publishedAt || null,
    notes: data.notes || "",
  };
}
