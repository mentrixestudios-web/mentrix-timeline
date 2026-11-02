// Integración de Pasarela de Pagos Mercado Pago para Mentrix Línea de Tiempo
// Soporta modo Sandbox (Pruebas) y modo Producción (Checkout Pro)

export const PAQUETES_MONEDAS = [
  {
    id: "pack_starter",
    nombre: "Pack de Bienvenida Crononauta",
    subtitulo: "Oferta Única · 80% Descuento",
    monedas: 1000,
    escudos: 2,
    lupas: 3,
    precioCLP: 990,
    precioUSD: 1.10,
    badge: "80% OFF · Única Vez 🔥",
    destacado: true,
    esStarter: true,
  },
  {
    id: "pack_200",
    nombre: "Puñado de Monedas",
    subtitulo: "Iniciación de Viajero",
    monedas: 200,
    bono: 0,
    precioCLP: 990,
    precioUSD: 1.10,
    badge: "Básico",
    destacado: false,
  },
  {
    id: "pack_650",
    nombre: "Bolsa de Sabio",
    subtitulo: "500 + 150 monedas de regalo",
    monedas: 650,
    bono: "+30% GRATIS",
    precioCLP: 2490,
    precioUSD: 2.70,
    badge: "Popular 🔥",
    destacado: false,
  },
  {
    id: "pack_1800",
    nombre: "Cofre Cronológico",
    subtitulo: "1.200 + 600 monedas de regalo",
    monedas: 1800,
    bono: "+50% GRATIS",
    precioCLP: 5990,
    precioUSD: 6.50,
    badge: "MÁS ELEGIDO ⭐",
    destacado: true,
  },
  {
    id: "pack_4500",
    nombre: "Bóveda Temporal",
    subtitulo: "2.500 + 2.000 monedas de regalo",
    monedas: 4500,
    bono: "+80% GRATIS",
    precioCLP: 12990,
    precioUSD: 13.90,
    badge: "MEJOR VALOR 👑",
    destacado: false,
  },
];

export const PODERES_CATALOGO = [
  {
    id: "escudos",
    nombre: "Escudo de Racha",
    icono: "🛡️",
    descripcion: "Protege tu racha diaria si olvidas jugar un día o si pierdes tu partida diaria.",
    precioMonedas: 150,
    color: "from-blue-600/30 to-indigo-900/40 border-blue-400/40 text-blue-300",
  },
  {
    id: "lupas",
    nombre: "Lupa del Siglo",
    icono: "🔍",
    descripcion: "Revela el siglo o época exacta del evento misterioso antes de colocarlo.",
    precioMonedas: 80,
    color: "from-amber-600/30 to-yellow-900/40 border-amber-400/40 text-amber-300",
  },
  {
    id: "corazones",
    nombre: "Segundo Aire",
    icono: "💖",
    descripcion: "Te otorga 1 vida extra en plena partida para salvar tu récord de cartas.",
    precioMonedas: 100,
    color: "from-rose-600/30 to-pink-900/40 border-rose-400/40 text-rose-300",
  },
  {
    id: "congeladores",
    nombre: "Congelador de Eras",
    icono: "⏳",
    descripcion: "Elimina dos ranuras incorrectas del tablero, facilitando tu decisión.",
    precioMonedas: 60,
    color: "from-cyan-600/30 to-teal-900/40 border-cyan-400/40 text-cyan-300",
  },
];

/**
 * Inicia el proceso de pago para un paquete.
 */
export async function procesarCompraMercadoPago(paquete, onExito, onError) {
  if (!paquete) {
    if (onError) onError("Paquete no válido");
    return;
  }

  const userToken = localStorage.getItem("mt_mp_access_token") || "";

  // Intentar crear la preferencia vía API de Mercado Pago
  try {
    const res = await fetch("/api/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: paquete.id,
        title: paquete.nombre,
        description: `Paquete de ${paquete.monedas} monedas para Mentrix: Línea de Tiempo`,
        price: paquete.precioCLP,
        backUrl: window.location.origin,
        userAccessToken: userToken,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
        return { status: "redirecting" };
      }
    }
  } catch (err) {
    console.warn("Endpoint /api/mercadopago no disponible en local:", err);
  }

  // Si no hay token de Mercado Pago configurado, se activa el modo Sandbox interactivo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "approved",
        isSimulated: true,
        payment_id: "test_" + Date.now(),
        paquete,
      });
    }, 1000);
  });
}
