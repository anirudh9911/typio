import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-175 h-125 rounded-full bg-white/3 blur-3xl" />
      </div>

      <div className="text-center max-w-2xl px-6 relative z-10">
        {/* Title + blinking cursor */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-white tracking-tight">
            typio
          </h1>
          <span className="ml-3 text-7xl md:text-8xl text-white/50 font-thin animate-pulse leading-none">
            |
          </span>
        </div>

        <p className="text-neutral-400 text-2xl md:text-3xl font-light mb-12 leading-snug">
          Real-time multiplayer typing races
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          <span className="text-neutral-400 text-sm px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
            Create or join rooms
          </span>
          <span className="text-neutral-400 text-sm px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
            Synchronized starts
          </span>
          <span className="text-neutral-400 text-sm px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
            Global leaderboard
          </span>
        </div>

        {/* CTA */}
        <Link
          href="/play"
          className="inline-block bg-white text-neutral-900 font-semibold px-12 py-4 rounded-xl text-lg hover:bg-neutral-100 transition-all duration-150 hover:scale-105 active:scale-95"
        >
          Start Racing →
        </Link>
      </div>
    </main>
  );
}
