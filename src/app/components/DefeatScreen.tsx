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
      className={`fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[200] transition-opacity duration-500 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-2xl mx-4">
        {/* Fundo com efeito de fogo */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-black to-red-900 rounded-2xl opacity-80"></div>

        {/* Efeitos de chamas animadas */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-16 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${10 + i * 12}%`,
                bottom: 0,
                animationDelay: `${i * 200}ms`,
                animationDuration: `${1500 + i * 100}ms`,
              }}
            />
          ))}
        </div>

        <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl p-6 sm:p-8 border-4 border-red-600 shadow-2xl">
          {/* Header com ícone de derrota */}
          <div className="text-center mb-6">
            <div className="text-6xl sm:text-8xl mb-4 animate-pulse">💀</div>
            <h1 className="text-3xl sm:text-5xl font-bold text-red-500 mb-2 drop-shadow-lg">
              DERROTA!
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              Todos os Digimons foram eliminados
            </p>
          </div>

          {/* Boss vitorioso */}
          <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-xl p-6 sm:p-8 mb-6 border-2 border-red-500">
            <div className="text-center">
              {/* Imagem grande do boss vitorioso */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-red-400 shadow-2xl">
                  <img
                    src={boss.image}
                    alt={boss.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Coroa de vencedor */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-4xl sm:text-5xl animate-bounce">
                  👑
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  👹 {boss.name}
                </h3>
                <p className="text-red-200 text-lg sm:text-xl mb-4">
                  O boss permaneceu invicto!
                </p>
                <div className="flex justify-center gap-3">
                  <div className="bg-red-700 px-3 py-2 rounded-lg text-sm sm:text-base text-red-200 font-semibold">
                    {boss.calculatedDp >= 1000
                      ? `${Math.floor(boss.calculatedDp / 1000)}k DP`
                      : `${boss.calculatedDp} DP`}
                  </div>
                  <div className="bg-red-700 px-3 py-2 rounded-lg text-sm sm:text-base text-red-200 font-semibold">
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
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-300 mb-3 text-center">
              🏴 Jogadores Derrotados
            </h3>
            <div className="space-y-2">
              {defeatedPlayers.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 border border-gray-600"
                >
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-300">{player.name}</p>
                    <p className="text-sm text-gray-400">
                      {player.aliveDigimons} Digimon(s) restante(s)
                    </p>
                  </div>
                  <div className="text-red-500 text-2xl">💀</div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas da derrota */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
            <h4 className="text-lg font-bold text-gray-300 mb-3 text-center">
              📊 Estatísticas da Batalha
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {boss.spawnedAtTurn}
                </p>
                <p className="text-sm text-gray-400">Turno de Spawn</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {defeatedPlayers.length}
                </p>
                <p className="text-sm text-gray-400">Jogadores Derrotados</p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={handleReturnToMenu}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🏠 Voltar ao Menu
            </button>
          </div>

          {/* Mensagem motivacional */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm italic">
              "A derrota é apenas uma oportunidade para evoluir e ficar mais
              forte!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
