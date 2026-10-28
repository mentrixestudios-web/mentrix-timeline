// Integración de Pasarela de Pagos Mercado Pago para Mentrix
// Soporta modo Sandbox (Pruebas) y modo Producción

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
 * En modo Sandbox / Desarrollo, simula el proceso de pago de forma segura y completa.
 * Cuando configures tu Access Token de Mercado Pago en variables de entorno,
 * abrirá el Checkout Pro real de Mercado Pago con Webpay, CuentaRUT y tarjetas.
 */
export async function procesarCompraMercadoPago(paquete, onExito, onError) {
  if (!paquete) {
    if (onError) onError("Paquete no válido");
    return;
  }

  // Comprobar si hay credencial configurada en localStorage o env
  const mpAccessToken = localStorage.getItem("mt_mp_access_token") || "";

  if (!mpAccessToken) {
    // Modo Simulación de Pago (Sandbox interactivo) para pruebas inmediatas
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: "approved",
          payment_id: "test_" + Date.now(),
          paquete,
        });
      }, 1200);
    });
  }

  // Flujo real de Mercado Pago Checkout Pro
  try {
    const preference = {
      items: [
        {
          id: paquete.id,
          title: paquete.nombre,
          description: `Paquete de ${paquete.monedas} monedas para Mentrix: Línea de Tiempo`,
          quantity: 1,
          currency_id: "CLP",
          unit_price: paquete.precioCLP,
        },
      ],
      back_urls: {
        success: `${window.location.origin}/tienda?status=approved&pack_id=${paquete.id}`,
        failure: `${window.location.origin}/tienda?status=rejected`,
        pending: `${window.location.origin}/tienda?status=pending`,
      },
      auto_return: "approved",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      throw new Error(data.message || "No se pudo generar la preferencia de pago");
    }
  } catch (err) {
    if (onError) onError(err.message || "Error al conectar con Mercado Pago");
  }
}
