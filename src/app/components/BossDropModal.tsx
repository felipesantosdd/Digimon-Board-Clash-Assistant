"use client";

import { useState, useEffect } from "react";
import { GameBoss } from "@/types/game";
import { Item } from "@/types/item";

interface BossDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  boss: GameBoss;
  winnerName: string;
  winnerAvatar: string;
  drops: Item[];
}

export default function BossDropModal({
  isOpen,
  onClose,
  boss,
  winnerName,
  winnerAvatar,
  drops,
}: BossDropModalProps) {
  const [showItems, setShowItems] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    if (isOpen && drops.length > 0) {
      // Mostrar itens sequencialmente com delay
      const timer = setTimeout(() => {
        setShowItems(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, drops.length]);

  useEffect(() => {
    if (showItems && drops.length > 1) {
      // Mostrar próximo item a cada 800ms
      const timer = setInterval(() => {
        setCurrentItemIndex((prev) => (prev + 1) % drops.length);
      }, 800);

      return () => clearInterval(timer);
    }
  }, [showItems, drops.length]);

  const handleClose = () => {
    setShowItems(false);
    setCurrentItemIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[150] backdrop-blur-md">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Fundo com efeito dourado */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900 via-black to-yellow-900 rounded-2xl opacity-80"></div>

        {/* Efeitos de brilho animados */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-20 bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-40 animate-pulse"
              style={{
                left: `${5 + i * 8}%`,
                top: "20%",
                animationDelay: `${i * 100}ms`,
                animationDuration: `${2000 + i * 50}ms`,
              }}
            />
          ))}
        </div>

        <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl p-6 sm:p-8 border-4 border-yellow-500 shadow-2xl">
          {/* Header com vitória */}
          <div className="text-center mb-6">
            <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
              BOSS DERROTADO!
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              {winnerName} conquistou a vitória!
            </p>
          </div>

          {/* Boss derrotado */}
          <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-xl p-4 sm:p-6 mb-6 border-2 border-red-500">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-red-400 shadow-lg opacity-50">
                  <img
                    src={boss.image}
                    alt={boss.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                {/* X de derrota */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-500 text-2xl font-bold">❌</div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  👹 {boss.name}
                </h3>
                <p className="text-red-200 text-sm sm:text-base">
                  Boss derrotado!
                </p>
                <div className="mt-2 flex gap-2">
                  <div className="bg-red-700 px-2 py-1 rounded text-xs sm:text-sm text-red-200">
                    {boss.calculatedDp >= 1000
                      ? `${Math.floor(boss.calculatedDp / 1000)}k DP`
                      : `${boss.calculatedDp} DP`}
                  </div>
                  <div className="bg-red-700 px-2 py-1 rounded text-xs sm:text-sm text-red-200">
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

          {/* Vencedor */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 rounded-xl p-4 sm:p-6 mb-6 border-2 border-yellow-500">
            <div className="flex items-center gap-4">
              <img
                src={winnerAvatar}
                alt={winnerName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  👑 {winnerName}
                </h3>
                <p className="text-yellow-200 text-sm sm:text-base">
                  O herói que derrotou o boss!
                </p>
              </div>
              <div className="text-yellow-400 text-3xl">🏆</div>
            </div>
          </div>

          {/* Drops */}
          {drops.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-4 text-center">
                🎁 Recompensas Obtidas
              </h3>

              {showItems ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {drops.map((item, index) => (
                    <div
                      key={item.id}
                      className={`bg-gradient-to-r from-yellow-800 to-yellow-700 rounded-lg p-4 border-2 border-yellow-500 transition-all duration-500 ${
                        index === currentItemIndex
                          ? "scale-105 shadow-lg"
                          : "opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg flex items-center justify-center text-2xl">
                          {item.icon || "📦"}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm sm:text-base">
                            {item.name}
                          </h4>
                          <p className="text-yellow-200 text-xs sm:text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2 animate-spin">🎁</div>
                  <p className="text-yellow-400">Calculando recompensas...</p>
                </div>
              )}
            </div>
          )}

          {/* Botão de fechar */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ✨ Continuar Jogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
