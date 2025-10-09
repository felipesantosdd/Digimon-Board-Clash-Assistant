"use client";

import { GameDigimon } from "@/types/game";
import { capitalize, getLevelName } from "@/lib/utils";

interface DigimonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: GameDigimon | null;
  playerName: string;
  onEvolve: (digimon: GameDigimon) => void;
  onLoot: (digimon: GameDigimon) => void;
  onRest: (digimon: GameDigimon) => void;
  onAttack: (digimon: GameDigimon) => void;
  isCurrentPlayerTurn: boolean;
}

export default function DigimonDetailsModal({
  isOpen,
  onClose,
  digimon,
  playerName,
  onEvolve,
  onLoot,
  onRest,
  onAttack,
  isCurrentPlayerTurn,
}: DigimonDetailsModalProps) {
  if (!isOpen || !digimon) return null;

  const hpPercentage = (digimon.currentHp / digimon.dp) * 100;
  const isDead = digimon.currentHp <= 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border-2 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200 text-3xl font-bold leading-none"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold">{capitalize(digimon.name)}</h2>
          <p className="text-sm text-blue-100 mt-1">
            Parceiro de {capitalize(playerName)}
          </p>
        </div>

        {/* Imagem do Digimon */}
        <div className="relative h-72 sm:h-96 lg:h-[32rem] bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
          {/* Overlay de Morte */}
          {isDead && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-7xl mb-3">💀</div>
                <p className="text-red-400 font-bold text-xl">MORTO</p>
                <p className="text-gray-300 text-sm mt-2">
                  Este Digimon foi derrotado
                </p>
              </div>
            </div>
          )}
          {digimon.image ? (
            <img
              src={digimon.image}
              alt={digimon.name}
              className="w-full h-full object-contain"
              style={
                isDead
                  ? {
                      filter: "grayscale(100%) brightness(0.7)",
                    }
                  : undefined
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              ❓
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {getLevelName(digimon.level)}
          </div>
          <div className="absolute top-3 right-3 bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {digimon.dp.toLocaleString()} DP
          </div>
        </div>

        {/* Informações */}
        <div className="p-6 space-y-4">
          {/* Barra de HP */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 font-semibold text-sm">
                💚 Pontos de Vida
              </span>
              <span className="text-green-400 font-bold text-lg">
                {digimon.currentHp.toLocaleString()} /{" "}
                {digimon.dp.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden border-2 border-gray-600 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out flex items-center justify-center"
                style={{
                  width: `${hpPercentage}%`,
                }}
              >
                <span className="text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {Math.round(hpPercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
              <div className="text-xs text-gray-400 mb-1">Level</div>
              <div className="text-2xl font-bold text-blue-400">
                {digimon.level}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
              <div className="text-xs text-gray-400 mb-1">DP</div>
              <div className="text-2xl font-bold text-purple-400">
                {digimon.dp.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className="flex items-center gap-2">
              {hpPercentage > 75 ? (
                <>
                  <span className="text-2xl">💪</span>
                  <span className="text-green-400 font-bold">
                    Excelente condição
                  </span>
                </>
              ) : hpPercentage > 50 ? (
                <>
                  <span className="text-2xl">👍</span>
                  <span className="text-yellow-400 font-bold">Bom estado</span>
                </>
              ) : hpPercentage > 25 ? (
                <>
                  <span className="text-2xl">⚠️</span>
                  <span className="text-orange-400 font-bold">
                    Enfraquecido
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🆘</span>
                  <span className="text-red-400 font-bold">Crítico!</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="bg-gray-900 px-6 py-4 rounded-b-lg border-t border-gray-700">
          {!isDead ? (
            <div className="space-y-3">
              {/* Botões de Ação (apenas se for turno do jogador) */}
              {isCurrentPlayerTurn && !digimon.hasActedThisTurn && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onLoot(digimon);
                      onClose();
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-2xl">💰</span>
                    <span className="text-xs">Explorar</span>
                  </button>
                  <button
                    onClick={() => {
                      onRest(digimon);
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-2xl">😴</span>
                    <span className="text-xs">Descansar</span>
                  </button>
                  <button
                    onClick={() => {
                      onAttack(digimon);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-2xl">⚔️</span>
                    <span className="text-xs">Atacar</span>
                  </button>
                </div>
              )}

              {/* Aviso se já agiu */}
              {isCurrentPlayerTurn && digimon.hasActedThisTurn && (
                <div className="text-center py-2 bg-gray-800 rounded-lg border border-gray-600">
                  <p className="text-gray-400 font-semibold text-sm">
                    ⏸️ Já realizou uma ação neste turno
                  </p>
                </div>
              )}

              {/* Aviso se não é turno do jogador */}
              {!isCurrentPlayerTurn && (
                <div className="text-center py-2 bg-gray-800 rounded-lg border border-gray-600">
                  <p className="text-gray-400 font-semibold text-sm">
                    ⏳ Aguarde seu turno para agir
                  </p>
                </div>
              )}

              {/* Botão de Evolução */}
              <button
                onClick={() => {
                  onEvolve(digimon);
                  // Não fecha o modal - mantém aberto
                }}
                disabled={!digimon.canEvolve}
                className={`w-full px-6 py-3 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden ${
                  digimon.canEvolve
                    ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white transform hover:scale-105 animate-pulse"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                }`}
                style={
                  digimon.canEvolve
                    ? {
                        backgroundSize: "200% 100%",
                        animation:
                          "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, gradient 3s ease infinite",
                      }
                    : undefined
                }
              >
                <span className="text-xl relative z-10">
                  {digimon.canEvolve ? "✨" : "🔒"}
                </span>
                <span className="relative z-10">
                  {digimon.canEvolve ? "Evolução" : "Bloqueado"}
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-red-400 font-bold text-lg mb-2">
                💀 Digimon Derrotado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
