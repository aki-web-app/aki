// src/app/layout.tsx  — ersetze den relevanten Abschnitt
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Leben mit Paranoia – Aki",
  description: "Liebevoller, zugewandter digitaler Begleiter. Krisenchat mit Aki.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <head>
        {/* Statischer Link zur erzeugten CSS-Datei — erzwingt das Laden */}
        <link rel="stylesheet" href="/_next/static/css/aki.css" />
      </head>
      <body className="min-h-dvh text-brand-800 antialiased">
        {/* ... restlicher Layout-Code ... */}
        {children}
      </body>
    </html>
  );
}
