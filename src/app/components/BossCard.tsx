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
      {/* Card do Boss no formato de Digimon - MAIOR QUE CARDS NORMAIS */}
      <div
        className={`
          relative bg-gradient-to-br from-purple-900 via-red-900 to-black
          rounded-xl p-4 sm:p-6 shadow-2xl border-4 border-red-500
          transition-all duration-300 transform
          ${isAttacking ? "scale-95 opacity-75" : "scale-110"}
          ${canAttack && !isAttacking ? "hover:scale-115 cursor-pointer" : ""}
        `}
        onClick={() => {
          if (canAttack && !isAttacking && onAttack) {
            onAttack();
          }
        }}
      >
        {/* Badges no topo direito */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10">
          {/* Badge "BOSS" */}
          <div
            className="bg-red-600 text-white font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm shadow-lg border-2 border-white animate-pulse cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            title="Clique para ver detalhes"
          >
            👹 BOSS
          </div>

          {/* Badge de Turno */}
          <div className="bg-yellow-500 text-black font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm shadow-lg border-2 border-white">
            T{boss.spawnedAtTurn}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Imagem do Boss - MAIOR */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-4 border-red-400 shadow-2xl">
              <Image
                src={boss.image}
                alt={boss.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-red-500 rounded-lg opacity-20 animate-pulse"></div>
          </div>

          {/* Informações do Boss */}
          <div className="flex-1 min-w-0">
            {/* Nome */}
            <p className="text-base sm:text-lg md:text-xl font-bold text-white truncate mb-2">
              {boss.name}
            </p>

            {/* Tipo e DP */}
            <div className="flex gap-2 mt-2">
              <div className="bg-purple-600 text-white text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold">
                {boss.typeId === 1
                  ? "Data"
                  : boss.typeId === 2
                  ? "Vaccine"
                  : "Virus"}
              </div>
              <div className="bg-red-600 text-white text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold">
                ⚔️ {boss.calculatedDp.toLocaleString()} ATK
              </div>
            </div>

            {/* Barra de HP */}
            <div className="flex items-center gap-2 mt-2 sm:mt-3">
              <div className="flex-1 bg-gray-700 rounded-full h-3 sm:h-4 border-2 border-gray-600">
                <div
                  className={`h-full rounded-full transition-all relative ${getHpBarColor()}`}
                  style={{ width: `${hpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-white font-bold min-w-[45px] text-right">
                {Math.round(hpPercentage)}%
              </span>
            </div>

            {/* HP Numérico */}
            <div className="text-xs sm:text-sm text-gray-300 mt-1 font-semibold">
              💚 {boss.currentHp.toLocaleString()} /{" "}
              {boss.maxHp.toLocaleString()} HP
            </div>
          </div>
        </div>

        {/* Detalhes Expandidos */}
        {showDetails && (
          <div className="mt-2 bg-black/60 rounded p-2 border border-purple-500/30 space-y-1 animate-fadeIn">
            <div className="text-[10px] sm:text-xs">
              <span className="text-gray-400">Efeito:</span>{" "}
              <span className="text-purple-300 font-semibold">
                {boss.effectId ? `Effect ID: ${boss.effectId}` : "Nenhum"}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-yellow-300 font-semibold">
              ⚠️ Turno do Mundo: 50% DP dividido entre Digimons vivos
            </div>
          </div>
        )}
      </div>

      {/* Indicador de Ataque */}
      {isAttacking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-white text-lg font-bold animate-pulse">
            ⚔️ Atacando...
          </div>
        </div>
      )}
    </div>
  );
}
