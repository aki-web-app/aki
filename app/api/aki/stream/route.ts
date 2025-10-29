import OpenAI from "openai";

export const runtime = "nodejs";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message = body?.message ?? "";

  const client = getClient();
  if (!client) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const system = `Du bist Aki, ein zugewandter schwarzer Kater.
Du sprichst empathisch, klar, und rätst bei akuter Gefahr immer,
umgehend lokale Hilfen zu kontaktieren. Keine medizinische Diagnose.`;

  const stream = await client.responses.stream({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: message || "Sag Hallo." },
    ],
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
