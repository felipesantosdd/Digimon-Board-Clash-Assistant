"use client";

import { capitalize } from "@/lib/utils";

interface BossAttackCardProps {
  boss: {
    id: number;
    name: string;
    image?: string;
    currentHp: number;
    maxHp: number;
    calculatedDp: number;
    typeId: number;
  };
  onBossSelect: () => void;
}

export default function BossAttackCard({
  boss,
  onBossSelect,
}: BossAttackCardProps) {
  const hpPercentage = Math.max(
    0,
    Math.min(100, (boss.currentHp / boss.maxHp) * 100)
  );

  return (
    <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 sm:p-4 border-2 border-red-600">
      {/* Header do Boss */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-red-600">
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-red-700 border-2 border-red-500 flex items-center justify-center">
          <span className="text-lg sm:text-2xl">👹</span>
        </div>
        <div>
          <p className="font-bold text-sm sm:text-lg text-red-200">
            {capitalize(boss.name)}
          </p>
          <p className="text-xs sm:text-sm text-red-300">Boss Ativo</p>
        </div>
      </div>

      {/* Informações do Boss */}
      <div className="space-y-2">
        {/* HP */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-red-200 text-xs sm:text-sm font-semibold">
              HP
            </span>
            <span className="text-red-300 text-xs sm:text-sm font-bold">
              {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-red-900 rounded-full h-1.5 sm:h-2 overflow-hidden border border-red-700">
            <div
              className="bg-gradient-to-r from-red-500 to-red-400 h-full transition-all"
              style={{
                width: `${hpPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* DP e Botão de Ataque lado a lado */}
        <div className="flex gap-2">
          {/* DP */}
          <div className="bg-red-800 rounded p-1.5 sm:p-2 border border-red-600 flex-1">
            <div className="text-[9px] sm:text-[10px] text-red-300 mb-0.5">
              DP
            </div>
            <div className="text-sm sm:text-lg font-bold text-red-200">
              {boss.calculatedDp >= 1000
                ? `${Math.floor(boss.calculatedDp / 1000)}k`
                : boss.calculatedDp.toLocaleString()}
            </div>
          </div>

          {/* Botão de Ataque */}
          <button
            onClick={onBossSelect}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-1"
          >
            <span className="text-sm sm:text-lg">⚔️</span>
            <span className="text-[10px] sm:text-xs">Atacar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
