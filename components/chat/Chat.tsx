"use client";
import React, { useEffect, useRef, useState } from "react";
import MessageView, { Message } from "./Message";

type SendResult = { ok: boolean; message?: string };

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // small client-side rate limit: max 6 requests / minute
  const [tokens, setTokens] = useState(6);
  useEffect(() => {
    const t = setInterval(() => {
      setTokens((prev) => Math.min(6, prev + 1));
    }, 10_000); // refill 1 token every 10 sec => 6/min
    return () => clearInterval(t);
  }, []);

  function addMessage(role: "user" | "aki" | "system", text = "") {
    const m: Message = { id: (crypto as any).randomUUID?.() ?? String(Date.now()) , role, text, createdAt: Date.now() };
    setMessages((prev) => [...prev, m]);
    return m;
  }

  function updateMessage(id: string, patch: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function processSSEChunk(chunk: string) {
    const events = chunk.split("\n\n").filter(Boolean);
    for (const ev of events) {
      const lines = ev.split("\n").map((l) => l.replace(/^data:\s?/, ""));
      for (const line of lines) {
        if (!line) continue;
        if (line === "[DONE]") {
          continue;
        }
        try {
          const obj = JSON.parse(line);
          if (obj?.type === "response.output_text.delta" && typeof obj.delta === "string") {
            setMessages((prev) => {
              const last = [...prev].reverse().find((m) => m.role === "aki");
              if (!last) return prev;
              return prev.map((m) => (m.id === last.id ? { ...m, text: m.text + obj.delta } : m));
            });
          } else if (obj?.type === "response.completed") {
            // nothing
          } else if (obj?.type === "response.output_text") {
            setMessages((prev) => {
              const last = [...prev].reverse().find((m) => m.role === "aki");
              if (!last) return prev;
              return prev.map((m) => (m.id === last.id ? { ...m, text: obj.text ?? m.text } : m));
            });
          } else if (obj?.error) {
            setError(String(obj.error));
          } else {
            // ignore unknown chunks
          }
        } catch (err) {
          setMessages((prev) => {
            const last = [...prev].reverse().find((m) => m.role === "aki");
            if (!last) return prev;
            return prev.map((m) => (m.id === last.id ? { ...m, text: m.text + line } : m));
          });
        }
      }
    }
  }

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    if (!input.trim()) return;
    if (tokens <= 0) {
      setError("Bitte kurz warten – zu viele Anfragen. Versuche es in wenigen Sekunden erneut.");
      return;
    }

    abortRef.current?.abort?.();
    abortRef.current = new AbortController();

    const userMsg = addMessage("user", input);
    const assistantMsg = addMessage("aki", "");

    setLoading(true);
    setTokens((t) => Math.max(0, t - 1));

    try {
      const res = await fetch("/api/aki/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Serverfehler: ${res.status} ${text}`);
        updateMessage(assistantMsg.id, { text: "[Fehler beim Laden]" });
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const last = buffer.lastIndexOf("\n\n");
        if (last !== -1) {
          const chunk = buffer.slice(0, last + 2);
          buffer = buffer.slice(last + 2);
          processSSEChunk(chunk);
        }
      }

      if (buffer) processSSEChunk(buffer);
    } catch (err: any) {
      if (err.name === "AbortError") {
        updateMessage(assistantMsg.id, { text: (assistantMsg.text || "") + "\n\n[Abgebrochen]" });
      } else {
        setError(String(err));
        updateMessage(assistantMsg.id, { text: "[Fehler beim Stream]" });
      }
    } finally {
      setLoading(false);
      setInput("");
      const el = document.getElementById("aki-input") as HTMLTextAreaElement | null;
      el?.focus();
    }
  }

  function stopStream() {
    abortRef.current?.abort();
    setLoading(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="mx-auto max-w-3xl w-full p-4">
      <header className="mb-4 text-center">
        <h2 className="text-2xl font-semibold">Aki — Dein digitaler Begleiter</h2>
        <p className="text-sm text-gray-600">Sicher, liebevoll, immer zugewandt</p>
      </header>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        className="mb-4 h-[50vh] overflow-y-auto rounded-lg border bg-gray-50 p-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500">Aki wartet auf deine Nachricht…</div>
        )}
        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}
      </div>

      {error && (
        <div role="status" aria-live="assertive" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={sendMessage} className="space-y-3">
        <label htmlFor="aki-input" className="sr-only">
          Nachricht an Aki
        </label>
        <textarea
          id="aki-input"
          name="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Was beschäftigt dich gerade? (Enter = senden, Shift+Enter = neue Zeile)"
          className="w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Nachricht an Aki"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              aria-disabled={loading}
            >
              {loading ? "Aki tippt…" : "Senden"}
            </button>

            <button
              type="button"
              onClick={stopStream}
              disabled={!loading}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
              aria-disabled={!loading}
            >
              Stop
            </button>
          </div>

          <div className="text-sm text-gray-500">
            Tokens: <span aria-hidden>{tokens}</span>
          </div>
        </div>
      </form>
    </section>
  );
}
