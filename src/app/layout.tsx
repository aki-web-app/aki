// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = { /* ... wie bei dir ... */ };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-dvh text-brand-800 antialiased">
        <div className="fixed inset-0 -z-10 aki-gradient animate-aki-gradient" aria-hidden="true" />
        <div className="aki-grain" aria-hidden="true" />
        {/* ... dein Header / Main / Footer ... */}
        {children}
      </body>
    </html>
  );
}
