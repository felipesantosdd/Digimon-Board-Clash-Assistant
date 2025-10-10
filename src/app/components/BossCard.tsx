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
      {/* Card do Boss no formato de Digimon */}
      <div
        className={`
          relative bg-gradient-to-br from-purple-900 via-red-900 to-black
          rounded-lg p-2 sm:p-3 shadow-2xl border-2 border-red-500
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
        {/* Badges no topo direito */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex flex-col gap-1 z-10">
          {/* Badge "BOSS" */}
          <div 
            className="bg-red-600 text-white font-bold px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs shadow-lg border border-white animate-pulse cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            title="Clique para ver detalhes"
          >
            👹 BOSS
          </div>
          
          {/* Badge de Turno */}
          <div className="bg-yellow-500 text-black font-bold px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs shadow-lg border border-white">
            T{boss.spawnedAtTurn}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Imagem do Boss */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden border border-red-400 shadow-lg">
              <Image
                src={boss.image}
                alt={boss.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-red-500 rounded opacity-20 animate-pulse"></div>
          </div>

          {/* Informações do Boss */}
          <div className="flex-1 min-w-0">
            {/* Nome */}
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {boss.name}
            </p>

            {/* Tipo e DP */}
            <div className="flex gap-1 mt-0.5">
              <div className="bg-purple-600 text-white text-[9px] sm:text-[10px] px-1 py-0.5 rounded">
                {boss.typeId === 1
                  ? "Data"
                  : boss.typeId === 2
                  ? "Vaccine"
                  : "Virus"}
              </div>
              <div className="bg-purple-600 text-white text-[9px] sm:text-[10px] px-1 py-0.5 rounded">
                {boss.calculatedDp >= 1000
                  ? `${Math.floor(boss.calculatedDp / 1000)}k DP`
                  : `${boss.calculatedDp} DP`}
              </div>
            </div>

            {/* Barra de HP */}
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
              <div className="flex-1 bg-gray-700 rounded-full h-1 sm:h-1.5">
                <div
                  className={`h-1 sm:h-1.5 rounded-full transition-all relative ${getHpBarColor()}`}
                  style={{ width: `${hpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] text-white font-bold">
                {Math.round(hpPercentage)}%
              </span>
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
