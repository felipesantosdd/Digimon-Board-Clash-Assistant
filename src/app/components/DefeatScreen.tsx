"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { GameBoss } from "@/types/game";

interface DefeatScreenProps {
  isOpen: boolean;
  onClose: () => void;
  boss: GameBoss;
  defeatedPlayers: Array<{
    name: string;
    avatar: string;
    aliveDigimons: number;
  }>;
}

export default function DefeatScreen({
  isOpen,
  onClose,
  boss,
  defeatedPlayers,
}: DefeatScreenProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isClosing, setIsClosing] = useState(false);

  const handleReturnToMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      router.push("/");
    }, 500);
  };

  const handleTryAgain = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      // Recarregar a página para reiniciar o jogo
      window.location.reload();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[200] transition-opacity duration-500 p-2 sm:p-4 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-2xl max-h-[98vh] overflow-y-auto">
        {/* Fundo com efeito de fogo */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-black to-red-900 rounded-xl sm:rounded-2xl opacity-80"></div>

        {/* Efeitos de chamas animadas */}
        <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-12 sm:w-4 sm:h-16 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${10 + i * 12}%`,
                bottom: 0,
                animationDelay: `${i * 200}ms`,
                animationDuration: `${1500 + i * 100}ms`,
              }}
            />
          ))}
        </div>

        <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border-2 sm:border-4 border-red-600 shadow-2xl">
          {/* Header com ícone de derrota */}
          <div className="text-center mb-3 sm:mb-6">
            <div className="text-5xl sm:text-6xl md:text-8xl mb-2 sm:mb-4 animate-pulse">
              💀
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-red-500 mb-1 sm:mb-2 drop-shadow-lg">
              DERROTA!
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-300">
              Todos os Digimons foram eliminados
            </p>
          </div>

          {/* Boss vitorioso */}
          <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg sm:rounded-xl p-3 sm:p-6 md:p-8 mb-3 sm:mb-6 border border-red-500 sm:border-2">
            <div className="text-center">
              {/* Imagem grande do boss vitorioso */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-3 sm:mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-2 sm:border-4 border-red-400 shadow-2xl">
                  <img
                    src={boss.image}
                    alt={boss.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Coroa de vencedor */}
                <div className="absolute -top-1 sm:-top-2 left-1/2 transform -translate-x-1/2 text-3xl sm:text-4xl md:text-5xl animate-bounce">
                  👑
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                  👹 {boss.name}
                </h3>
                <p className="text-red-200 text-sm sm:text-lg md:text-xl mb-2 sm:mb-4">
                  O {boss.name} dominou o digimundo!
                </p>
                <div className="flex justify-center gap-2 sm:gap-3">
                  <div className="bg-red-700 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm md:text-base text-red-200 font-semibold">
                    {boss.calculatedDp >= 1000
                      ? `${Math.floor(boss.calculatedDp / 1000)}k DP`
                      : `${boss.calculatedDp} DP`}
                  </div>
                  <div className="bg-red-700 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm md:text-base text-red-200 font-semibold">
                    {boss.typeId === 1
                      ? "Data"
                      : boss.typeId === 2
                      ? "Vaccine"
                      : "Virus"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de jogadores derrotados */}
          <div className="mb-3 sm:mb-6">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-300 mb-2 sm:mb-3 text-center">
              🏴 Jogadores Derrotados
            </h3>
            <div className="space-y-1.5 sm:space-y-2">
              {defeatedPlayers.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-600"
                >
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-300 text-xs sm:text-sm truncate">{player.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {player.aliveDigimons} Digimon(s) restante(s)
                    </p>
                  </div>
                  <div className="text-red-500 text-lg sm:text-2xl flex-shrink-0">💀</div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas da derrota */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-6 border border-gray-600">
            <h4 className="text-base sm:text-lg font-bold text-gray-300 mb-2 sm:mb-3 text-center">
              📊 Estatísticas da Batalha
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-red-500">
                  {boss.spawnedAtTurn}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Turno de Spawn</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-red-500">
                  {defeatedPlayers.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Jogadores Derrotados</p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={handleReturnToMenu}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              🏠 Voltar ao Menu
            </button>
          </div>

          {/* Mensagem motivacional */}
          <div className="mt-3 sm:mt-6 text-center">
            <p className="text-gray-400 text-xs sm:text-sm italic">
              "A derrota é apenas uma oportunidade para evoluir e ficar mais
              forte!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
