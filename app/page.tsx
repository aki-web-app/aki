cat > app/page.tsx <<'EOF'
import Chat from "@/components/chat/Chat";

export default function Home() {
  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-4xl">
        <header className="text-center mb-6">
          <div className="text-6xl">🐈‍⬛</div>
          <h1 className="text-3xl font-semibold">Leben mit Paranoia — Aki</h1>
        </header>

        <Chat />
      </div>
    </main>
  );
}
EOF
