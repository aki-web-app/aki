import OpenAI from "openai";

export const runtime = "nodejs"; // für Serverfähigkeiten; Edge geht auch mit fetch-basiertem Client

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY not set", { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const userText: string = body?.message ?? "";

  // Später: stärkerer System-Prompt, Deeskalation, Notfallhinweise, Logging-Strategie (DSGVO).
  const system = `Du bist Aki, ein zugewandter schwarzer Kater.
  Du sprichst empathisch, klar, und rätst bei akuter Gefahr immer,
  umgehend lokale Hilfen zu kontaktieren. Keine medizinische Diagnose.`;

  // Erstmal: einfache Komplettantwort (ohne Streaming zum Client).
  const resp = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: userText || "Sag Hallo." },
    ],
  });

  // Responses API vereinheitlicht Output; wir holen reinen Text:
  const text = resp.output_text ?? "…";
  return new Response(JSON.stringify({ text }), {
    headers: { "content-type": "application/json" },
  });
}
