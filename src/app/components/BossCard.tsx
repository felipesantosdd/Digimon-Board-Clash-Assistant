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
          rounded-2xl p-6 shadow-2xl border-4 border-red-500
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
        <div className="absolute -top-3 -right-3 bg-red-600 text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg border-2 border-white animate-pulse z-10">
          👹 BOSS
        </div>

        {/* Contador de Bosses Derrotados (se necessário) */}
        <div className="absolute -top-3 -left-3 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full text-xs shadow-lg border-2 border-white z-10">
          Turno {boss.spawnedAtTurn}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Imagem do Boss */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-red-400 shadow-2xl">
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
          <div className="flex-1 space-y-4 w-full">
            {/* Nome e Descrição */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {boss.name}
              </h2>
              <p className="text-gray-300 text-sm">{boss.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                <div className="text-gray-400 text-xs">DP</div>
                <div className="text-white text-2xl font-bold">
                  {boss.calculatedDp.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                <div className="text-gray-400 text-xs">HP</div>
                <div className="text-white text-2xl font-bold">
                  {boss.currentHp.toLocaleString()} /{" "}
                  {boss.maxHp.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Barra de HP */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>HP</span>
                <span>{hpPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
                <div
                  className={`h-full ${getHpBarColor()} transition-all duration-500 ease-out relative`}
                  style={{ width: `${hpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="flex gap-2">
              {canAttack && !isAttacking && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttack?.();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50 border-2 border-red-400"
                >
                  ⚔️ Atacar Boss
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
              >
                {showDetails ? "📖 Ocultar" : "📖 Detalhes"}
              </button>
            </div>

            {/* Detalhes Expandidos */}
            {showDetails && (
              <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30 space-y-2 animate-fadeIn">
                <div className="text-sm">
                  <span className="text-gray-400">Tipo:</span>{" "}
                  <span className="text-white font-semibold">
                    {boss.typeId === 1
                      ? "🌊 Data"
                      : boss.typeId === 2
                      ? "💉 Vaccine"
                      : "🦠 Virus"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Efeito Especial:</span>{" "}
                  <span className="text-purple-300 font-semibold">
                    {boss.effectId ? `Effect ID: ${boss.effectId}` : "Nenhum"}
                  </span>
                </div>
                <div className="text-sm text-yellow-300 font-semibold">
                  ⚠️ Turno do Mundo: 10% do DP dividido entre todos os Digimons
                  vivos!
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
