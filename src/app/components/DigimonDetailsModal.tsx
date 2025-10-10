"use client";

import { useState } from "react";
import { GameDigimon } from "@/types/game";
import { capitalize, getLevelName, getTypeColor } from "@/lib/utils";
import TypeIcon from "./TypeIcons";

interface DigimonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: GameDigimon | null;
  playerName: string;
  onEvolve: (digimon: GameDigimon) => void;
  onLoot: (digimon: GameDigimon) => void;
  onRest: (digimon: GameDigimon) => void;
  onAttack: (digimon: GameDigimon) => void;
  onDefend?: (digimon: GameDigimon, targetDigimonId: number) => void;
  onProvoke?: (digimon: GameDigimon, targetDigimonId: number) => void;
  isCurrentPlayerTurn: boolean;
  onUseItem?: (digimon: GameDigimon, itemId: number) => void;
  onDiscardItem?: (digimon: GameDigimon, itemId: number) => void;
  onGiveItem?: (
    fromDigimon: GameDigimon,
    toDigimonId: number,
    itemId: number
  ) => void;
  playerDigimons?: GameDigimon[]; // Lista de digimons do jogador para transferência
  allPlayers?: GameDigimon[][]; // Todos os jogadores com seus Digimons (para provocar)
  currentTurnCount?: number; // Turno global atual
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
  onDefend,
  onProvoke,
  isCurrentPlayerTurn,
  onUseItem,
  onDiscardItem,
  onGiveItem,
  playerDigimons = [],
  allPlayers = [],
  currentTurnCount = 0,
}: DigimonDetailsModalProps) {
  const [showBag, setShowBag] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showGiveDialog, setShowGiveDialog] = useState(false);
  const [showDefendDialog, setShowDefendDialog] = useState(false);
  const [showProvokeDialog, setShowProvokeDialog] = useState(false);

  if (!isOpen || !digimon) return null;

  const hpPercentage = (digimon.currentHp / digimon.dp) * 100;
  const isDead = digimon.currentHp <= 0;

  const handleUseItem = (itemId: number) => {
    if (onUseItem && digimon) {
      onUseItem(digimon, itemId);
      setShowBag(false);
    }
  };

  const handleDiscardItem = (itemId: number) => {
    if (onDiscardItem && digimon) {
      onDiscardItem(digimon, itemId);
    }
  };

  const handleOpenGiveDialog = (itemId: number) => {
    setSelectedItemId(itemId);
    setShowGiveDialog(true);
  };

  const handleGiveItem = (toDigimonId: number) => {
    if (onGiveItem && digimon && selectedItemId !== null) {
      onGiveItem(digimon, toDigimonId, selectedItemId);
      setShowGiveDialog(false);
      setSelectedItemId(null);
      setShowBag(false);
    }
  };

  const handleDefend = (targetDigimonId: number) => {
    if (onDefend && digimon) {
      onDefend(digimon, targetDigimonId);
      setShowDefendDialog(false);
      onClose();
    }
  };

  const handleProvoke = (targetDigimonId: number) => {
    if (onProvoke && digimon) {
      onProvoke(digimon, targetDigimonId);
      setShowProvokeDialog(false);
      onClose();
    }
  };

  // Verificar se pode provocar (cooldown de 3 turnos)
  const canProvoke = () => {
    if (!digimon || digimon.level < 2) return false;
    if (!digimon.lastProvokeTurn) return true;
    return currentTurnCount - digimon.lastProvokeTurn >= 3;
  };

  const getProvokeCooldown = () => {
    if (!digimon || !digimon.lastProvokeTurn) return 0;
    const turnsLeft = 3 - (currentTurnCount - digimon.lastProvokeTurn);
    return Math.max(0, turnsLeft);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto border-2 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200 text-2xl sm:text-3xl font-bold leading-none"
          >
            ×
          </button>
          <h2 className="text-xl sm:text-2xl font-bold pr-8">
            {capitalize(digimon.name)}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1">
            Parceiro de {capitalize(playerName)}
          </p>
        </div>

        {/* Imagem do Digimon */}
        <div className="relative h-48 sm:h-72 md:h-96 lg:h-[32rem] bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
          {/* Overlay de Morte */}
          {isDead && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-5xl sm:text-7xl mb-2 sm:mb-3">💀</div>
                <p className="text-red-400 font-bold text-lg sm:text-xl">
                  MORTO
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2">
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
            <div className="w-full h-full bg-gray-600"></div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-blue-600 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-lg">
            {getLevelName(digimon.level)}
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-600 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-lg">
            ⚔️ {digimon.dp.toLocaleString()} ATK
          </div>
        </div>

        {/* Informações */}
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Barra de HP */}
          <div>
            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <span className="text-gray-300 font-semibold text-xs sm:text-sm">
                💚 Pontos de Vida
              </span>
              <span className="text-green-400 font-bold text-sm sm:text-lg">
                {digimon.currentHp.toLocaleString()} /{" "}
                {digimon.dp.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 sm:h-6 overflow-hidden border-2 border-gray-600 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out flex items-center justify-center"
                style={{
                  width: `${hpPercentage}%`,
                }}
              >
                <span className="text-xs sm:text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {Math.round(hpPercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Evolução (XP) - COMENTADO (Mecânica Oculta) */}
          {/* {!isDead && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-semibold text-sm">
                  ⭐ Progresso de Evolução (TESTE)
                </span>
                <span className="text-blue-400 font-bold text-lg">
                  {(digimon.evolutionProgress || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden border-2 border-gray-600 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    width: `${digimon.evolutionProgress || 0}%`,
                  }}
                >
                  {(digimon.evolutionProgress || 0) >= 30 && (
                    <span className="text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {(digimon.evolutionProgress || 0).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )} */}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
            <div className="bg-gray-700 rounded-lg p-2 sm:p-3 border border-gray-600">
              <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                Level
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {digimon.level}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 sm:p-3 border border-gray-600">
              <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                ATK
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                {digimon.dp.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-700 rounded-lg p-2 sm:p-3 border border-gray-600">
            <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
              Status
            </div>
            <div className="flex items-center gap-2">
              {hpPercentage > 75 ? (
                <>
                  <span className="text-lg sm:text-2xl">💪</span>
                  <span className="text-green-400 font-bold text-sm sm:text-base">
                    Excelente condição
                  </span>
                </>
              ) : hpPercentage > 50 ? (
                <>
                  <span className="text-lg sm:text-2xl">👍</span>
                  <span className="text-yellow-400 font-bold text-sm sm:text-base">
                    Bom estado
                  </span>
                </>
              ) : hpPercentage > 25 ? (
                <>
                  <span className="text-lg sm:text-2xl">⚠️</span>
                  <span className="text-orange-400 font-bold text-sm sm:text-base">
                    Enfraquecido
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg sm:text-2xl">🆘</span>
                  <span className="text-red-400 font-bold text-sm sm:text-base">
                    Crítico!
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="bg-gray-900 px-3 sm:px-6 py-3 sm:py-4 rounded-b-lg border-t border-gray-700">
          {!isDead ? (
            <div className="space-y-2 sm:space-y-3">
              {/* Botões de Ação (apenas se for turno do jogador) */}
              {isCurrentPlayerTurn && !digimon.hasActedThisTurn && (
                <div className="space-y-1 sm:space-y-2">
                  {/* Linha 1 - Botões Ativos */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        onAttack(digimon);
                        onClose();
                      }}
                      className="px-2 sm:px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1"
                    >
                      <span className="text-lg sm:text-2xl">⚔️</span>
                      <span className="text-[10px] sm:text-xs">Atacar</span>
                    </button>
                    <button
                      onClick={() => {
                        onRest(digimon);
                        onClose();
                      }}
                      className="px-2 sm:px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1"
                    >
                      <span className="text-lg sm:text-2xl">😴</span>
                      <span className="text-[10px] sm:text-xs">Descansar</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoot(digimon);
                        onClose();
                      }}
                      className="px-2 sm:px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1"
                    >
                      <span className="text-lg sm:text-2xl">💰</span>
                      <span className="text-[10px] sm:text-xs">Explorar</span>
                    </button>
                  </div>

                  {/* Linha 2 - Botões (Bag, Defender e Provocar) */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    <button
                      onClick={() => setShowBag(true)}
                      className="px-2 sm:px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1"
                    >
                      <span className="text-lg sm:text-2xl">🎒</span>
                      <span className="text-[10px] sm:text-xs">Bag</span>
                    </button>
                    <button
                      onClick={() => setShowDefendDialog(true)}
                      className="px-2 sm:px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1"
                    >
                      <span className="text-lg sm:text-2xl">🛡️</span>
                      <span className="text-[10px] sm:text-xs">Defender</span>
                    </button>
                    <button
                      onClick={() => setShowProvokeDialog(true)}
                      disabled={!canProvoke()}
                      className={`px-2 sm:px-4 py-2 font-bold rounded-lg transition-all transform shadow-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                        canProvoke()
                          ? "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                      title={
                        !canProvoke() && digimon && digimon.level < 2
                          ? "Apenas Level 2+ pode provocar"
                          : !canProvoke()
                          ? `Cooldown: ${getProvokeCooldown()} turnos restantes`
                          : "Provocar inimigo"
                      }
                    >
                      <span className="text-lg sm:text-2xl">💢</span>
                      <span className="text-[10px] sm:text-xs">
                        {canProvoke() ? "Provocar" : `${getProvokeCooldown()}T`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Aviso se já agiu */}
              {isCurrentPlayerTurn && digimon.hasActedThisTurn && (
                <div className="text-center py-2 bg-gray-800 rounded-lg border border-gray-600">
                  <p className="text-gray-400 font-semibold text-xs sm:text-sm">
                    ⏸️ Já realizou uma ação neste turno
                  </p>
                </div>
              )}

              {/* Aviso se não é turno do jogador */}
              {!isCurrentPlayerTurn && (
                <div className="text-center py-2 bg-gray-800 rounded-lg border border-gray-600">
                  <p className="text-gray-400 font-semibold text-xs sm:text-sm">
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
                className={`w-full px-3 sm:px-6 py-2 sm:py-3 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-1 sm:gap-2 relative overflow-hidden ${
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
                <span className="text-lg sm:text-xl relative z-10">
                  {digimon.canEvolve ? "✨" : "🔒"}
                </span>
                <span className="relative z-10 text-sm sm:text-base">
                  {digimon.canEvolve ? "Evolução" : "Bloqueado"}
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-red-400 font-bold text-sm sm:text-lg mb-1 sm:mb-2">
                💀 Digimon Derrotado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Bag */}
      {showBag && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]"
          onClick={(e) => {
            e.stopPropagation();
            setShowBag(false);
          }}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto border-2 border-purple-500 m-2 sm:m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🎒</span>
                    Inventário
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-100 mt-0.5 sm:mt-1">
                    {capitalize(digimon.name)}
                  </p>
                </div>
                <button
                  onClick={() => setShowBag(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Lista de Itens */}
            <div className="p-4">
              {!digimon.bag || digimon.bag.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎒</div>
                  <p className="text-gray-400 font-semibold text-lg">
                    Inventário vazio
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Este Digimon não possui itens
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {digimon.bag.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Imagem do Item */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                        </div>

                        {/* Informações do Item */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-white font-bold text-base">
                              {item.name}
                            </h4>
                            <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                              x{item.quantity}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-purple-400 font-semibold bg-purple-900/30 px-2 py-1 rounded">
                              {item.effect}
                            </span>
                          </div>

                          {/* Botões de Ação */}
                          {isCurrentPlayerTurn && !digimon.hasActedThisTurn && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleUseItem(item.id)}
                                className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-all"
                              >
                                ✓ Usar
                              </button>
                              <button
                                onClick={() => handleOpenGiveDialog(item.id)}
                                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all"
                              >
                                🎁 Dar
                              </button>
                              <button
                                onClick={() => handleDiscardItem(item.id)}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-all"
                              >
                                🗑️ Descartar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-900 px-6 py-4 rounded-b-lg border-t border-gray-700 sticky bottom-0">
              <button
                onClick={() => setShowBag(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selecionar Digimon para Dar Item */}
      {showGiveDialog && selectedItemId !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]"
          onClick={(e) => {
            e.stopPropagation();
            setShowGiveDialog(false);
            setSelectedItemId(null);
          }}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border-2 border-blue-500 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  Dar Item
                </h3>
                <button
                  onClick={() => {
                    setShowGiveDialog(false);
                    setSelectedItemId(null);
                  }}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-blue-100 mt-1">
                Selecione o Digimon que vai receber o item
              </p>
            </div>

            {/* Item Selecionado */}
            {(() => {
              const selectedItem = digimon?.bag?.find(
                (i) => i.id === selectedItemId
              );
              return selectedItem ? (
                <div className="bg-gray-700 border-b-2 border-blue-500 p-4">
                  <div className="flex items-center gap-3">
                    {/* Imagem do Item */}
                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500 flex-shrink-0">
                      {selectedItem.image ? (
                        <img
                          src={selectedItem.image}
                          alt={selectedItem.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl flex items-center justify-center h-full">
                          📦
                        </span>
                      )}
                    </div>
                    {/* Info do Item */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm">
                        {selectedItem.name}
                      </h4>
                      <p className="text-gray-300 text-xs mt-0.5 line-clamp-1">
                        {selectedItem.description}
                      </p>
                    </div>
                    {/* Quantidade */}
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      x1
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Lista de Digimons */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {playerDigimons
                  .filter((d) => d.id !== digimon?.id && d.currentHp > 0)
                  .map((targetDigimon) => (
                    <button
                      key={targetDigimon.id}
                      onClick={() => handleGiveItem(targetDigimon.id)}
                      className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-500 rounded-lg p-3 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        {/* Imagem */}
                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 flex-shrink-0">
                          {targetDigimon.image ? (
                            <img
                              src={targetDigimon.image}
                              alt={targetDigimon.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-600"></div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">
                            {capitalize(targetDigimon.name)}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              HP: {targetDigimon.currentHp.toLocaleString()} /{" "}
                              {targetDigimon.dp.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Ícone */}
                        <div className="text-2xl">→</div>
                      </div>
                    </button>
                  ))}

                {playerDigimons.filter(
                  (d) => d.id !== digimon?.id && d.currentHp > 0
                ).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Nenhum outro Digimon vivo disponível
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 px-6 py-4 rounded-b-lg border-t border-gray-700">
              <button
                onClick={() => {
                  setShowGiveDialog(false);
                  setSelectedItemId(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selecionar Digimon para Defender */}
      {showDefendDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]"
          onClick={(e) => {
            e.stopPropagation();
            setShowDefendDialog(false);
          }}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-xl border-2 border-cyan-500 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  Defender Aliado
                </h3>
                <button
                  onClick={() => setShowDefendDialog(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-cyan-100 mt-1">
                Selecione um aliado de nível igual ou inferior para proteger
              </p>
            </div>

            {/* Lista de Digimons */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {playerDigimons
                  .filter(
                    (d) =>
                      d.id !== digimon?.id &&
                      d.currentHp > 0 &&
                      d.level <= (digimon?.level || 0) &&
                      // Não pode defender quem já está sendo defendido
                      !playerDigimons.some(
                        (defender) =>
                          defender.defending === d.id && defender.currentHp > 0
                      )
                  )
                  .map((targetDigimon) => {
                    const hpPercentage =
                      (targetDigimon.currentHp / targetDigimon.dp) * 100;
                    const hpColor =
                      hpPercentage > 75
                        ? "text-green-400"
                        : hpPercentage > 50
                        ? "text-yellow-400"
                        : hpPercentage > 25
                        ? "text-orange-400"
                        : "text-red-400";

                    return (
                      <button
                        key={targetDigimon.id}
                        onClick={() => handleDefend(targetDigimon.id)}
                        className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-cyan-500 rounded-lg p-3 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          {/* Imagem */}
                          <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 flex-shrink-0 relative">
                            {targetDigimon.image ? (
                              <img
                                src={targetDigimon.image}
                                alt={targetDigimon.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-600"></div>
                            )}
                            {/* Badge de Nível */}
                            <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-br">
                              Lv{targetDigimon.level}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm truncate mb-1">
                              {capitalize(targetDigimon.name)}
                            </h4>

                            {/* Tipo */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-[10px] ${getTypeColor(
                                  targetDigimon.typeId
                                )} font-bold px-1.5 py-0.5 rounded flex items-center gap-1`}
                              >
                                <TypeIcon
                                  typeId={targetDigimon.typeId}
                                  size={8}
                                  className="text-white"
                                />
                                {
                                  {
                                    1: "Data",
                                    2: "Vaccine",
                                    3: "Virus",
                                    4: "Free",
                                    5: "Variable",
                                    6: "Unknown",
                                  }[targetDigimon.typeId]
                                }
                              </span>
                              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                                ⚔️ {targetDigimon.dp.toLocaleString()} ATK
                              </span>
                            </div>

                            {/* Barra de HP */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  HP
                                </span>
                                <span
                                  className={`text-xs font-bold ${hpColor}`}
                                >
                                  {targetDigimon.currentHp.toLocaleString()} /{" "}
                                  {targetDigimon.dp.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    hpPercentage > 75
                                      ? "bg-green-500"
                                      : hpPercentage > 50
                                      ? "bg-yellow-500"
                                      : hpPercentage > 25
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${hpPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Ícone */}
                          <div className="text-2xl flex-shrink-0">🛡️</div>
                        </div>
                      </button>
                    );
                  })}

                {playerDigimons.filter(
                  (d) =>
                    d.id !== digimon?.id &&
                    d.currentHp > 0 &&
                    d.level <= (digimon?.level || 0) &&
                    !playerDigimons.some(
                      (defender) =>
                        defender.defending === d.id && defender.currentHp > 0
                    )
                ).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Nenhum aliado disponível para defender
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Digimons já protegidos ou de nível superior não podem ser
                      defendidos
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 px-6 py-4 rounded-b-lg border-t border-gray-700">
              <button
                onClick={() => setShowDefendDialog(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selecionar Digimon para Provocar */}
      {showProvokeDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]"
          onClick={(e) => {
            e.stopPropagation();
            setShowProvokeDialog(false);
          }}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border-2 border-orange-500 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">💢</span>
                  Provocar Inimigo
                </h3>
                <button
                  onClick={() => setShowProvokeDialog(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-orange-100 mt-1">
                Selecione um inimigo para provocar. Ele só poderá atacar você no
                próximo turno dele!
              </p>
            </div>

            {/* Lista de Inimigos */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {allPlayers.map((enemyDigimons, playerIndex) => {
                  // Filtrar apenas inimigos vivos
                  const validEnemies = enemyDigimons.filter(
                    (d) => d.currentHp > 0
                  );

                  if (validEnemies.length === 0) return null;

                  return (
                    <div key={playerIndex}>
                      <div className="space-y-2">
                        {validEnemies.map((targetDigimon) => {
                          const hpPercentage =
                            (targetDigimon.currentHp / targetDigimon.dp) * 100;
                          const hpColor =
                            hpPercentage > 75
                              ? "text-green-400"
                              : hpPercentage > 50
                              ? "text-yellow-400"
                              : hpPercentage > 25
                              ? "text-orange-400"
                              : "text-red-400";

                          return (
                            <button
                              key={targetDigimon.id}
                              onClick={() => handleProvoke(targetDigimon.id)}
                              className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-orange-500 rounded-lg p-3 transition-all text-left"
                            >
                              <div className="flex items-center gap-3">
                                {/* Imagem */}
                                <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 flex-shrink-0 relative">
                                  {targetDigimon.image ? (
                                    <img
                                      src={targetDigimon.image}
                                      alt={targetDigimon.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-600"></div>
                                  )}
                                  {/* Badge de Nível */}
                                  <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-br">
                                    Lv{targetDigimon.level}
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-bold text-sm truncate mb-1">
                                    {capitalize(targetDigimon.name)}
                                  </h4>

                                  {/* Tipo */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <span
                                      className={`text-[10px] ${getTypeColor(
                                        targetDigimon.typeId
                                      )} font-bold px-1.5 py-0.5 rounded flex items-center gap-1`}
                                    >
                                      <TypeIcon
                                        typeId={targetDigimon.typeId}
                                        size={8}
                                        className="text-white"
                                      />
                                      {
                                        {
                                          1: "Data",
                                          2: "Vaccine",
                                          3: "Virus",
                                          4: "Free",
                                          5: "Variable",
                                          6: "Unknown",
                                        }[targetDigimon.typeId]
                                      }
                                    </span>
                                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                                      ⚔️ {targetDigimon.dp.toLocaleString()} ATK
                                    </span>
                                  </div>

                                  {/* Barra de HP */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-400">
                                        HP
                                      </span>
                                      <span
                                        className={`text-xs font-bold ${hpColor}`}
                                      >
                                        {targetDigimon.currentHp.toLocaleString()}{" "}
                                        / {targetDigimon.dp.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${
                                          hpPercentage > 75
                                            ? "bg-green-500"
                                            : hpPercentage > 50
                                            ? "bg-yellow-500"
                                            : hpPercentage > 25
                                            ? "bg-orange-500"
                                            : "bg-red-500"
                                        }`}
                                        style={{ width: `${hpPercentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Ícone */}
                                <div className="text-2xl flex-shrink-0">💢</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {allPlayers.every((enemies) =>
                  enemies.every((d) => d.currentHp <= 0)
                ) && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Nenhum inimigo vivo disponível para provocar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 px-6 py-4 rounded-b-lg border-t border-gray-700">
              <button
                onClick={() => setShowProvokeDialog(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
