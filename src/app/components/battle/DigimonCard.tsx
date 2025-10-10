"use client";

import { GameDigimon } from "@/types/game";
import { capitalize, getLevelName, DIGIMON_TYPE_NAMES } from "@/lib/utils";

interface DigimonCardProps {
  digimon: GameDigimon;
  onClick?: () => void;
  disabled?: boolean;
  showTypeAdvantage?: {
    advantage: number; // 1 = vantagem, -1 = desvantagem, 0 = neutro
  };
}

export default function DigimonCard({
  digimon,
  onClick,
  disabled,
  showTypeAdvantage,
}: DigimonCardProps) {
  const isDead = digimon.currentHp <= 0;
  const hpPercentage = Math.max(0, (digimon.currentHp / digimon.dp) * 100);

  return (
    <button
      onClick={onClick}
      disabled={disabled || isDead}
      className={`p-2 sm:p-3 rounded-lg transition-all text-left border-2 ${
        isDead || disabled
          ? "bg-gray-800 border-gray-700 cursor-not-allowed opacity-50"
          : "bg-gray-600 hover:bg-gray-500 border-gray-500 hover:border-red-500"
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Imagem do Digimon */}
        <div className="relative flex-shrink-0">
          {digimon.image ? (
            <img
              src={digimon.image}
              alt={digimon.name}
              className={`w-12 h-12 sm:w-14 sm:h-14 object-contain rounded ${
                isDead ? "grayscale" : ""
              }`}
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded"></div>
          )}

          {/* Badge de Vantagem/Desvantagem */}
          {showTypeAdvantage && showTypeAdvantage.advantage !== 0 && (
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                showTypeAdvantage.advantage === 1
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {showTypeAdvantage.advantage === 1 ? "↑" : "↓"}
            </div>
          )}
        </div>

        {/* Informações do Digimon */}
        <div className="flex-1 min-w-0">
          {/* Nome */}
          <p className="font-bold text-white text-xs sm:text-sm truncate">
            {capitalize(digimon.name)}
          </p>

          {/* Tipo */}
          <p className="text-[10px] sm:text-xs text-blue-400">
            {
              DIGIMON_TYPE_NAMES[
                digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
              ]
            }
          </p>

          {/* Level */}
          <p className="text-[10px] sm:text-xs text-gray-400">
            {getLevelName(digimon.level)}
          </p>

          {/* ATK */}
          <p className="text-[10px] sm:text-xs text-red-400 font-bold">
            ⚔️ {digimon.dp.toLocaleString()} ATK
          </p>

          {/* Barra de HP */}
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
            <div className="flex-1 bg-gray-700 rounded-full h-1 sm:h-1.5">
              <div
                className="bg-green-500 h-1 sm:h-1.5 rounded-full transition-all"
                style={{
                  width: `${hpPercentage}%`,
                }}
              />
            </div>
            <span className="text-[10px] sm:text-xs text-green-400 font-bold">
              {Math.round(hpPercentage)}%
            </span>
          </div>

          {/* Status de morte */}
          {isDead && (
            <p className="text-red-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
              💀 Morto
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
