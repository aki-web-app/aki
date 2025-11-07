export const runtime = "nodejs"; // explizit: läuft auf Node, nicht Edge

export async function POST(req: Request) {
  try {
    // Browser senden entweder application/csp-report oder application/json
    const contentType = req.headers.get("content-type") || "";
    const payload = contentType.includes("json")
      ? await req.json().catch(() => ({}))
      : await req.text().then(t => { try { return JSON.parse(t); } catch { return { raw: t }; } });

    // Minimal-Logging (Server-Console). Für Produktion später an Log-Backend weiterleiten.
    console.warn("[CSP-Report]", JSON.stringify(payload));

    return new Response(null, { status: 204 });
  } catch (e) {
    console.error("[CSP-Report][ERROR]", e);
    return new Response(null, { status: 204 });
  }
}
