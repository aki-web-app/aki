"use client";
import React from "react";

export type Role = "user" | "aki" | "system";

export interface Message {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
}

export function Avatar({ role, size = 40 }: { role: Role; size?: number }) {
  if (role === "aki") {
    return (
      <div
        aria-hidden
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-black text-white"
      >
        <span className="sr-only">Aki</span>
        <svg viewBox="0 0 24 24" width={size * 0.7} height={size * 0.7} fill="currentColor" aria-hidden>
          <path d="M12 2c-1.5 0-2.5 1-3 2-1.2 0-3 .5-4 2-1 1.6-1 4-1 6 0 5.5 6 9 8 9s8-3.5 8-9c0-2 .1-4.4-1-6-1-1.5-2.8-2-4-2-.5-1-1.5-2-3-2z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-slate-700 text-white"
    >
      <span className="sr-only">Nutzer</span>
      <span className="font-medium">Du</span>
    </div>
  );
}

export default function MessageView({ message }: { message: Message }) {
  const isAki = message.role === "aki";
  const wrapper = isAki ? "items-start" : "items-end";
  const bubbleBase =
    "rounded-2xl px-4 py-3 max-w-[85%] break-words leading-6 text-sm shadow-sm";

  const bubbleStyle = isAki
    ? "bg-white text-gray-900 border border-gray-200"
    : "bg-blue-600 text-white";

  return (
    <article
      role="article"
      aria-label={isAki ? "Aki Antwort" : "Meine Nachricht"}
      className={`flex ${wrapper} gap-3 mb-3`}
    >
      {isAki ? (
        <>
          <Avatar role="aki" />
          <div className={`${bubbleBase} ${bubbleStyle}`} tabIndex={0}>
            <div className="whitespace-pre-wrap break-words">{message.text}</div>
            <div className="text-[11px] text-gray-400 mt-2" aria-hidden>
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <div className={`${bubbleBase} ${bubbleStyle}`} tabIndex={0}>
            <div className="whitespace-pre-wrap break-words">{message.text}</div>
            <div className="text-[11px] text-white/70 mt-2 text-right" aria-hidden>
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <Avatar role="user" />
        </>
      )}
    </article>
  );
}
