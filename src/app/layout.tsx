// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Leben mit Paranoia – Aki",
  description: "Liebevoller, zugewandter digitaler Begleiter. Krisenchat mit Aki.",
  openGraph: {
    title: "Leben mit Paranoia – Aki",
    description: "Liebevoller, zugewandter digitaler Begleiter. Krisenchat mit Aki.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-dvh text-brand-800 antialiased">
        {/* Direkt im BODY: expliziter Stylesheet-Link, funktioniert zuverlässig */}
        <link rel="stylesheet" href="/_next/static/css/aki.css" />

        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 aki-gradient animate-aki-gradient" aria-hidden="true" />
        <div className="aki-grain" aria-hidden="true" />

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-transparent bg-white/70 backdrop-blur-sm">
          <div className="mx-auto container-max px-6 h-16 flex items-center justify-between">
            <a href="/" className="inline-flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-brand text-white">🐈‍⬛</div>
              <span className="text-lg font-semibold">Leben mit Paranoia</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
              <a className="hover:text-accent" href="#chat">Krisenchat</a>
              <a className="hover:text-accent" href="/about">Über</a>
              <a className="hover:text-accent" href="/kontakt">Kontakt</a>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto container-max px-6 py-10">{children}</main>

        {/* Footer */}
        <footer className="mt-16 border-t bg-white">
          <div className="mx-auto container-max px-6 py-8 text-sm text-brand-600">
            © {new Date().getFullYear()} Leben mit Paranoia – Aki. Alle Rechte vorbehalten.
          </div>
        </footer>
      </body>
    </html>
  );
}
