/**
 * shareUtils.js - Utilidades universales para compartir en PWA y navegadores móviles
 */

export async function compartirImagen(blob, filename = "mentrix-compartir.png", title = "Mentrix", text = "") {
  // 1. Probar Web Share API con soporte para archivos
  if (navigator.share) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return { success: true, method: "web-share" };
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        return { success: false, method: "aborted" };
      }
      console.warn("Fallo Web Share API de archivos, usando descarga...", err);
    }
  }

  // 2. Fallback: Descargar la imagen
  descargarBlob(blob, filename);

  // Si había texto, copiarlo al portapapeles para facilitar compartir
  if (text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  return { success: true, method: "download" };
}

export function descargarBlob(blob, filename = "mentrix-compartir.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function compartirTexto({ title = "Mentrix", text = "" } = {}) {
  const t = String(text || "").trim();
  const ttl = String(title || "").trim();

  if (navigator.share) {
    try {
      await navigator.share({ title: ttl, text: t });
      return { success: true, method: "web-share" };
    } catch (err) {
      if (err?.name === "AbortError") return { success: false, method: "aborted" };
    }
  }

  try {
    await navigator.clipboard.writeText(t);
    return { success: true, method: "clipboard" };
  } catch {
    return { success: false, method: "failed" };
  }
}

export function compartirWhatsApp(text = "") {
  const t = String(text || "").trim();
  const encoded = encodeURIComponent(t);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
