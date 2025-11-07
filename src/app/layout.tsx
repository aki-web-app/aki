import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Leben mit Paranoia – Aki",
  description: "Liebevoller, zugewandter digitaler Begleiter. Krisenchat mit Aki.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-dvh text-brand-800 antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
