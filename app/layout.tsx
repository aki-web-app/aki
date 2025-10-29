// app/layout.tsx — header snippet replacement
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
