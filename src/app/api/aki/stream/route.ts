// app/api/aki/stream/route.ts
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";
import OpenAI from "openai";

export const runtime = "nodejs";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

/**
 * Konvertiert ein AsyncIterable (OpenAI responses.stream) in einen Web ReadableStream,
 * wobei jedes Element als SSE "data: <json>\n\n" ausgegeben wird.
 */
function streamToSSEReadable(stream: AsyncIterable<any>) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // Falls SDK bereits Strings sendet, gebe sie unverändert weiter
          if (typeof chunk === "string") {
            controller.enqueue(encoder.encode(chunk));
            continue;
          }

          // Standardfall: serialisiere das Chunk-Objekt als JSON in einem SSE data-frame
          try {
            const s = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(s));
          } catch (err) {
            const errFrame = `data: ${JSON.stringify({ error: "JSON_SERIALIZE_ERROR" })}\n\n`;
            controller.enqueue(encoder.encode(errFrame));
          }
        }

        controller.close();
      } catch (err) {
        // Bei Fehlern sende einen Fehler-Frame und markiere den Stream als fehlerhaft
        try {
          const errFrame = `data: ${JSON.stringify({ error: String(err) })}\n\n`;
          controller.enqueue(encoder.encode(errFrame));
        } catch {}
        controller.error(err);
      }
    },

    cancel(reason) {
      // Optional: Cleanup (z. B. Abbruch-Logik)
    },
  });
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

  const system = `Du bist Aki, ein zugewandeter schwarzer Kater.
Du sprichst empathisch, klar, und rätst bei akuter Gefahr immer,
umgehend lokale Hilfen zu kontaktieren. Keine medizinische Diagnose.`;

  // Responses-API stream (async iterable)
  const stream = await client.responses.stream({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: message || "Sag Hallo." },
    ],
  });

  // Konvertiere das AsyncIterable in einen ReadableStream mit SSE-Frames
  const bodyStream = streamToSSEReadable(stream as AsyncIterable<any>);

  return new Response(bodyStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
