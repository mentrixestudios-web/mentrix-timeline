// Cloudflare Pages Function: /api/mercadopago
// Maneja solicitudes OPTIONS (CORS preflight) y POST (creación de preferencia en Mercado Pago)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, title, description, price, backUrl, userAccessToken } = body;

    // Prioridad de token: enviado por el cliente o variable de entorno de Cloudflare Pages
    const mpAccessToken =
      userAccessToken ||
      env.MERCADO_PAGO_ACCESS_TOKEN ||
      env.MP_ACCESS_TOKEN ||
      "APP_USR-4626354373308161-110915-847470180a5768b9596ccd705d15eeb3-2170323441";

    if (!mpAccessToken) {
      return new Response(
        JSON.stringify({ ok: false, error: "Falta configurar MERCADO_PAGO_ACCESS_TOKEN" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const host = backUrl || request.headers.get("origin") || "https://mentrixestudios.com";

    const preference = {
      items: [
        {
          id: id || "pack_coins",
          title: title || "Pack de Monedas Mentrix",
          description: description || "Monedas Billetera Global Mentrix",
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
      return new Response(
        JSON.stringify({
          ok: false,
          error: data.message || "Error al generar la preferencia en Mercado Pago",
          details: data,
        }),
        { status: mpRes.status || 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
        id: data.id,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "Error interno del servidor", details: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}
