// /srv/aki/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Leben mit Paranoia – Aki",
  description: "Liebevoller, zugewandter Begleiter. Krisenchat mit Aki.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-dvh text-brand-900 antialiased">
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
            <a href="/" className="inline-flex items-center gap-2 font-medium">
              <span className="text-2xl leading-none">🐈‍⬛</span>
              <span>Leben mit Paranoia</span>
            </a>
            <nav aria-label="Hauptnavigation" className="hidden sm:flex items-center gap-6 text-sm">
              <a className="hover:text-accent-700" href="#chat">Krisenchat</a>
              <a className="hover:text-accent-700" href="/impressum">Impressum</a>
              <a className="hover:text-accent-700" href="/datenschutz">Datenschutz</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <footer className="mt-16 border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-brand-600">
            © {new Date().getFullYear()} Leben mit Paranoia – Aki. Alle Rechte vorbehalten.
          </div>
        </footer>
      </body>
    </html>
  );
}
