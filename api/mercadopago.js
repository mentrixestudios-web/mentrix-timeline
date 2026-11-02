// Vercel Serverless Function: Crea preferencia de Checkout Pro en Mercado Pago para Mentrix Línea de Tiempo
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const { id, title, description, price, backUrl, userAccessToken } = req.body || {};

    const mpAccessToken = 
      userAccessToken || 
      process.env.MERCADO_PAGO_ACCESS_TOKEN || 
      process.env.MP_ACCESS_TOKEN;

    if (!mpAccessToken) {
      return res.status(400).json({
        ok: false,
        error: "Falta configurar MERCADO_PAGO_ACCESS_TOKEN en las variables de entorno o en la app.",
      });
    }

    const host = backUrl || req.headers.origin || "https://mentrix-timeline.vercel.app";

    const preference = {
      items: [
        {
          id: id || "pack_coins",
          title: title || "Pack de Monedas Mentrix",
          description: description || "Monedas para Mentrix Línea de Tiempo",
          quantity: 1,
          currency_id: "CLP",
          unit_price: Number(price) || 990,
        },
      ],
      back_urls: {
        success: `${host}/tienda?status=approved&pack_id=${id}`,
        failure: `${host}/tienda?status=rejected&pack_id=${id}`,
        pending: `${host}/tienda?status=pending&pack_id=${id}`,
      },
      auto_return: "approved",
      statement_descriptor: "MENTRIX APP",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken.trim()}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok || !data.init_point) {
      return res.status(mpRes.status || 500).json({
        ok: false,
        error: data.message || "Error al generar la preferencia en Mercado Pago",
        details: data,
      });
    }

    return res.status(200).json({
      ok: true,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      id: data.id,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
}
