// src/components/Hero.tsx
export default function Hero(){
  return (
    <section className="mx-auto container-max px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Leben mit Paranoia — <span className="text-accent">Aki</span>
          </h1>
          <p className="mt-4 text-muted max-w-xl">
            Aki ist dein liebevoller, zugewandter digitaler Begleiter — vertraulich, empathisch, praxisnah.
            Starte den Krisenchat, erhalte strukturierte Hilfe und einfache Schritte für jetzt.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#chat" className="inline-flex items-center rounded-xl bg-accent px-5 py-2 text-white shadow-soft hover:opacity-95">Jetzt chatten</a>
            <a href="/info" className="inline-flex items-center rounded-xl border px-4 py-2 text-muted">Mehr erfahren</a>
          </div>
        </div>

        <div>
          <div className="card p-6">
            <div className="text-sm text-muted">Aki fragt:</div>
            <div className="mt-3 text-lg">„Wie fühlst du dich gerade? Erzähle mir kurz, was los ist.“</div>
          </div>
        </div>
      </div>
    </section>
  );
}
