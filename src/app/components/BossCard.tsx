"use client";

import { GameBoss } from "@/types/game";
import Image from "next/image";
import { useState } from "react";

interface BossCardProps {
  boss: GameBoss;
  onAttack?: () => void;
  canAttack?: boolean;
  isAttacking?: boolean;
}

export default function BossCard({
  boss,
  onAttack,
  canAttack = false,
  isAttacking = false,
}: BossCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hpPercentage = (boss.currentHp / boss.maxHp) * 100;

  // Cor da barra de HP baseada na porcentagem
  const getHpBarColor = () => {
    if (hpPercentage > 60) return "bg-green-500";
    if (hpPercentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="relative w-full">
      {/* Card do Boss */}
      <div
        className={`
          relative bg-gradient-to-br from-purple-900 via-red-900 to-black
          rounded-xl p-3 sm:p-4 shadow-2xl border-2 sm:border-4 border-red-500
          transition-all duration-300
          ${isAttacking ? "scale-95 opacity-75" : "scale-100"}
          ${canAttack && !isAttacking ? "hover:scale-105 cursor-pointer" : ""}
        `}
        onClick={() => {
          if (canAttack && !isAttacking && onAttack) {
            onAttack();
          }
        }}
      >
        {/* Badge "BOSS" */}
        <div className="absolute -top-2 -right-2 bg-red-600 text-white font-bold px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm shadow-lg border-2 border-white animate-pulse z-10">
          👹 BOSS
        </div>

        {/* Contador de Turno */}
        <div className="absolute -top-2 -left-2 bg-yellow-500 text-black font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs shadow-lg border-2 border-white z-10">
          T{boss.spawnedAtTurn}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          {/* Imagem do Boss */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 sm:border-4 border-red-400 shadow-2xl">
              <Image
                src={boss.image}
                alt={boss.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Informações do Boss */}
          <div className="flex-1 space-y-2 sm:space-y-3 w-full">
            {/* Nome e Descrição */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                {boss.name}
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm line-clamp-2">{boss.description}</p>
            </div>

            {/* Stats e Barra de HP */}
            <div className="flex gap-2 items-center">
              {/* DP */}
              <div className="bg-black/40 rounded-lg p-1.5 sm:p-2 border border-red-500/30">
                <div className="text-gray-400 text-[9px] sm:text-[10px]">DP</div>
                <div className="text-white text-sm sm:text-lg font-bold">
                  {boss.calculatedDp >= 1000 ? `${Math.floor(boss.calculatedDp / 1000)}k` : boss.calculatedDp.toLocaleString()}
                </div>
              </div>
              
              {/* Barra de HP */}
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[10px] sm:text-xs text-gray-400">
                  <span>HP: {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()}</span>
                  <span>{hpPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-4 sm:h-5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                  <div
                    className={`h-full ${getHpBarColor()} transition-all duration-500 ease-out relative`}
                    style={{ width: `${hpPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-1.5 sm:gap-2">
              {canAttack && !isAttacking && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttack?.();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50 border border-red-400 text-xs sm:text-sm"
                >
                  ⚔️ Atacar
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all duration-200 text-xs sm:text-sm"
              >
                {showDetails ? "📖" : "📖"}
              </button>
            </div>

            {/* Detalhes Expandidos */}
            {showDetails && (
              <div className="bg-black/60 rounded-lg p-2 sm:p-3 border border-purple-500/30 space-y-1 sm:space-y-1.5 animate-fadeIn">
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-400">Tipo:</span>{" "}
                  <span className="text-white font-semibold">
                    {boss.typeId === 1
                      ? "🌊 Data"
                      : boss.typeId === 2
                      ? "💉 Vaccine"
                      : "🦠 Virus"}
                  </span>
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-400">Efeito:</span>{" "}
                  <span className="text-purple-300 font-semibold">
                    {boss.effectId ? `Effect ID: ${boss.effectId}` : "Nenhum"}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-yellow-300 font-semibold">
                  ⚠️ Turno do Mundo: 10% DP dividido entre Digimons vivos
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de Ataque */}
      {isAttacking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="text-white text-2xl font-bold animate-pulse">
            ⚔️ Atacando...
          </div>
        </div>
      )}
    </div>
  );
}
