"use client";
import React from "react";

type Role = "user" | "assistant" | "system";

export default function Message({ role, content }: { role: Role; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`} role="listitem">
      {!isUser && (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 text-white" aria-hidden>
          🐈‍⬛
        </div>
      )}
      <div
        className={[
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-subtle ring-1 ring-inset",
          isUser
            ? "bg-accent text-white ring-transparent"
            : "bg-white text-brand-900 ring-brand-100",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
}
