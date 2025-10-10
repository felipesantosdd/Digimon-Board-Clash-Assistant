"use client";

interface BossCountdownProps {
  turnsRemaining: number;
}

export default function BossCountdown({ turnsRemaining }: BossCountdownProps) {
  return (
    <div className="relative w-full">
      {/* Card de Contagem Regressiva */}
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/30 to-black rounded-2xl p-8 shadow-2xl border-4 border-purple-500/50">
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-purple-500/10 rounded-2xl animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          {/* Ícone de Boss */}
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative text-9xl animate-bounce">👹</div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-500 drop-shadow-lg">
              BOSS CHEGANDO
            </h2>
            <p className="text-gray-400 text-lg">
              Prepare-se para a batalha...
            </p>
          </div>

          {/* Contagem Regressiva */}
          {/* <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-lg blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-6 border-4 border-red-400 min-w-[120px]">
                  <div className="text-6xl font-bold text-white text-center tabular-nums">
                    {turnsRemaining}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-gray-400 text-sm font-semibold uppercase tracking-wider">
                {turnsRemaining === 1 ? "Turno" : "Turnos"}
              </div>
            </div>
          </div>*/}

          {/* Aviso */}
          {/*  <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="text-sm text-yellow-200">
                <p className="font-semibold mb-1">Atenção!</p>
                <p className="text-yellow-300/80">
                  O boss causará <strong>10% do seu DP</strong> dividido entre
                  todos os Digimons vivos no <strong>Turno do Mundo</strong>.
                </p>
              </div>
            </div>
          </div>*/}

          {/* Animação de partículas */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: "3s",
                }}
              >
                {i % 2 === 0 ? "💀" : "⚡"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
