"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Message from "./Message";

type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hey, ich bin Aki 🐈‍⬛ — wie kann ich dir gerade am besten helfen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, sending]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void onSend(); }
  };
  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  async function onSend() {
    const text = input.trim(); if (!text || sending) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }]);
    setInput(""); setSending(true);

    try {
      const res = await fetch("/api/aki", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content: text },
          ],
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json().catch(() => ({}));
      const assistantText = data?.message?.content ?? data?.content ?? "Ich konnte gerade nichts erzeugen.";
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: assistantText }]);
    } catch (e) {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "Ups, da ist was schiefgelaufen. Versuch es nochmal." }]);
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-[min(80vh,700px)] w-full flex-col rounded-2xl border border-brand-100 bg-white p-3">
      <div role="list" aria-live="polite" aria-busy={sending ? "true" : "false"} className="flex-1 overflow-y-auto rounded-xl bg-white p-4">
        {messages.map((m) => <Message key={m.id} role={m.role} content={m.content} />)}
        {sending && (
          <div className="mt-3 flex items-center gap-2 text-sm text-brand-600">
            <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.14s]" />
            <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.07s]" />
            <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-brand-300" />
            <span className="sr-only">Aki schreibt …</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void onSend(); }} className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
        <label htmlFor="aki-input" className="sr-only">Deine Nachricht</label>
        <textarea
          id="aki-input" rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
          placeholder="Schreib Aki eine Nachricht …"
          className="min-h-[44px] max-h-40 w-full resize-y rounded-xl border border-brand-200 bg-white p-3 text-[0.95rem] leading-6 placeholder:text-brand-400 focus-visible:border-accent"
        />
        <button
          type="submit" disabled={!canSend}
          className={`inline-flex h-[44px] items-center justify-center rounded-xl px-4 text-[0.95rem] font-medium transition
          ${canSend ? "bg-accent text-white hover:bg-accent-700" : "bg-brand-200 text-brand-600 cursor-not-allowed"}`}
          aria-label="Nachricht senden"
        >
          Senden
        </button>
      </form>
    </section>
  );
}
