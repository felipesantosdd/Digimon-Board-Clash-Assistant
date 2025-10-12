"use client";

import { GameDigimon } from "@/types/game";
import { capitalize, DIGIMON_TYPE_NAMES } from "@/lib/utils";
import D20Display from "./D20Display";

interface BattleViewProps {
  attacker: {
    digimon: GameDigimon;
    playerName: string;
    attackDice: number;
    defenseDice: number;
    damage: number;
    typeAdvantage: number;
    attributeAdvantage?: number; // Vantagem de atributo elemental
    maxHp?: number; // Para bosses
  };
  defender: {
    digimon: GameDigimon;
    attackDice: number;
    defenseDice: number;
    damage: number;
    typeAdvantage: number;
    attributeAdvantage?: number; // Vantagem de atributo elemental
    maxHp?: number; // Para bosses
  };
  isRolling: boolean;
  battleComplete: boolean;
  onExecuteAttack: () => void;
  onEvolve?: (digimon: GameDigimon) => void;
}

export default function BattleView({
  attacker,
  defender,
  isRolling,
  battleComplete,
  onExecuteAttack,
  onEvolve,
}: BattleViewProps) {
  const attackerNewHp = Math.max(
    0,
    attacker.digimon.currentHp - (battleComplete ? defender.damage : 0)
  );
  const defenderNewHp = Math.max(
    0,
    defender.digimon.currentHp - (battleComplete ? attacker.damage : 0)
  );

  // Detectar se é boss (ID negativo)
  const isAttackerBoss = attacker.digimon.id < 0;
  const isDefenderBoss = defender.digimon.id < 0;

  // Para bosses, usar lógica especial de HP máximo
  // Se maxHp foi passado (para bosses), usar esse valor, senão usar DP
  const attackerMaxHp =
    isAttackerBoss && attacker.maxHp ? attacker.maxHp : attacker.digimon.dp;
  const defenderMaxHp =
    isDefenderBoss && defender.maxHp ? defender.maxHp : defender.digimon.dp;

  const attackerDead = attackerNewHp <= 0;
  const defenderDead = defenderNewHp <= 0;

  return (
    <div>
      <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 text-center">
        ⚔️ Campo de Batalha
      </h4>

      <div className="grid grid-cols-2 gap-1 sm:gap-4">
        {/* Atacante */}
        <div className="bg-gray-700 rounded-lg p-1.5 sm:p-4 border-2 border-blue-500">
          <h5 className="font-bold text-blue-400 mb-1 sm:mb-3 text-center text-[10px] sm:text-base">
            ⚔️{" "}
            <span className="hidden sm:inline">
              {capitalize(attacker.digimon.name)}
            </span>
            <span className="sm:hidden">
              {capitalize(attacker.digimon.name).substring(0, 12)}
              {capitalize(attacker.digimon.name).length > 12 ? "..." : ""}
            </span>
            <div className="text-[10px] sm:text-xs text-gray-300 mt-1">
              <span className="hidden sm:inline">
                {
                  DIGIMON_TYPE_NAMES[
                    attacker.digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
                  ]
                }
              </span>
              {attacker.typeAdvantage === 1 && (
                <span className="text-green-400 ml-1 sm:ml-2">
                  ⬆️ <span className="hidden sm:inline">Vantagem</span>
                </span>
              )}
              {attacker.typeAdvantage === -1 && (
                <span className="text-red-400 ml-1 sm:ml-2">
                  ⬇️ <span className="hidden sm:inline">Desvantagem</span>
                </span>
              )}
            </div>
          </h5>

          <div className="space-y-1.5 sm:space-y-3">
            {/* Imagem */}
            <div className="relative h-32 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden">
              {attacker.digimon.image ? (
                <img
                  src={attacker.digimon.image}
                  alt={attacker.digimon.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    battleComplete && attackerDead
                      ? "grayscale brightness-50"
                      : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gray-600"></div>
              )}

              {battleComplete && attackerDead && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">💀</div>
                    <p className="text-red-400 font-bold text-[10px] sm:text-sm">
                      ELIMINADO
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded">
                ⚔️ {attacker.digimon.dp.toLocaleString()}
              </div>

              {/* Badge de Vantagem de TIPO */}
              {attacker.typeAdvantage !== 0 && (
                <div
                  className={`absolute top-1 left-1 sm:top-2 sm:left-2 px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${
                    attacker.typeAdvantage === 1
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {attacker.typeAdvantage === 1 ? "⬆️" : "⬇️"}{" "}
                  <span className="hidden sm:inline">
                    {attacker.typeAdvantage === 1 ? "+35%" : "-35%"}
                  </span>
                </div>
              )}

              {/* Badge de Vantagem de ATRIBUTO */}
              {attacker.attributeAdvantage !== undefined &&
                attacker.attributeAdvantage !== 0 && (
                  <div
                    className={`absolute ${
                      attacker.typeAdvantage !== 0
                        ? "top-7 left-1 sm:top-10 sm:left-2"
                        : "top-1 left-1 sm:top-2 sm:left-2"
                    } px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${
                      attacker.attributeAdvantage === 1
                        ? "bg-cyan-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {attacker.attributeAdvantage === 1 ? "🔥" : "❄️"}{" "}
                    <span className="hidden sm:inline">
                      {attacker.attributeAdvantage === 1 ? "+20%" : "-20%"}
                    </span>
                  </div>
                )}
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] sm:text-xs">
                <span className="text-gray-400 font-semibold">HP</span>
                <span className="text-green-400 font-bold">
                  {attackerNewHp.toLocaleString()} /{" "}
                  {attackerMaxHp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2.5 sm:h-4 overflow-hidden border border-gray-500">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (attackerNewHp / attackerMaxHp) * 100)
                    )}%`,
                  }}
                >
                  <span className="text-[9px] sm:text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {Math.round(
                      Math.max(
                        0,
                        Math.min(100, (attackerNewHp / attackerMaxHp) * 100)
                      )
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* D20 de Ataque e Defesa */}
            <div className="flex gap-1 sm:gap-4 justify-center">
              <div className="flex-1 flex flex-col items-center gap-1">
                <D20Display
                  value={attacker.attackDice}
                  isRolling={isRolling}
                  label="⚔️ ATK"
                  damageDealt={battleComplete ? attacker.damage : undefined}
                />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <D20Display
                  value={attacker.defenseDice}
                  isRolling={isRolling}
                  label="🛡️ DEF"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Defensor */}
        <div className="bg-gray-700 rounded-lg p-1.5 sm:p-4 border-2 border-orange-500">
          <h5 className="font-bold text-orange-400 mb-1 sm:mb-3 text-center text-[10px] sm:text-base">
            🛡️{" "}
            <span className="hidden sm:inline">
              {capitalize(defender.digimon.name)}
            </span>
            <span className="sm:hidden">
              {capitalize(defender.digimon.name).substring(0, 12)}
              {capitalize(defender.digimon.name).length > 12 ? "..." : ""}
            </span>
            <div className="text-[10px] sm:text-xs text-gray-300 mt-1">
              <span className="hidden sm:inline">
                {
                  DIGIMON_TYPE_NAMES[
                    defender.digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
                  ]
                }
              </span>
              {defender.typeAdvantage === 1 && (
                <span className="text-green-400 ml-1 sm:ml-2">
                  ⬆️ <span className="hidden sm:inline">Vantagem</span>
                </span>
              )}
              {defender.typeAdvantage === -1 && (
                <span className="text-red-400 ml-1 sm:ml-2">
                  ⬇️ <span className="hidden sm:inline">Desvantagem</span>
                </span>
              )}
            </div>
          </h5>

          <div className="space-y-1.5 sm:space-y-3">
            {/* Imagem */}
            <div className="relative h-32 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden">
              {defender.digimon.image ? (
                <img
                  src={defender.digimon.image}
                  alt={defender.digimon.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    battleComplete && defenderDead
                      ? "grayscale brightness-50"
                      : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gray-600"></div>
              )}

              {battleComplete && defenderDead && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">💀</div>
                    <p className="text-red-400 font-bold text-[10px] sm:text-sm">
                      ELIMINADO
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded">
                ⚔️ {defender.digimon.dp.toLocaleString()}
              </div>

              {/* Badge de Vantagem de TIPO */}
              {defender.typeAdvantage !== 0 && (
                <div
                  className={`absolute top-1 left-1 sm:top-2 sm:left-2 px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${
                    defender.typeAdvantage === 1
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {defender.typeAdvantage === 1 ? "⬆️" : "⬇️"}{" "}
                  <span className="hidden sm:inline">
                    {defender.typeAdvantage === 1 ? "+35%" : "-35%"}
                  </span>
                </div>
              )}

              {/* Badge de Vantagem de ATRIBUTO */}
              {defender.attributeAdvantage !== undefined &&
                defender.attributeAdvantage !== 0 && (
                  <div
                    className={`absolute ${
                      defender.typeAdvantage !== 0
                        ? "top-7 left-1 sm:top-10 sm:left-2"
                        : "top-1 left-1 sm:top-2 sm:left-2"
                    } px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${
                      defender.attributeAdvantage === 1
                        ? "bg-cyan-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {defender.attributeAdvantage === 1 ? "🔥" : "❄️"}{" "}
                    <span className="hidden sm:inline">
                      {defender.attributeAdvantage === 1 ? "+20%" : "-20%"}
                    </span>
                  </div>
                )}
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] sm:text-xs">
                <span className="text-gray-400 font-semibold">HP</span>
                <span className="text-green-400 font-bold">
                  {defenderNewHp.toLocaleString()} /{" "}
                  {defenderMaxHp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2.5 sm:h-4 overflow-hidden border border-gray-500">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (defenderNewHp / defenderMaxHp) * 100)
                    )}%`,
                  }}
                >
                  <span className="text-[9px] sm:text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {Math.round(
                      Math.max(
                        0,
                        Math.min(100, (defenderNewHp / defenderMaxHp) * 100)
                      )
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* D20 de Ataque e Defesa */}
            <div className="flex gap-1 sm:gap-4 justify-center">
              <div className="flex-1 flex flex-col items-center gap-1">
                <D20Display
                  value={defender.attackDice}
                  isRolling={isRolling}
                  label="⚔️ ATK"
                  damageDealt={battleComplete ? defender.damage : undefined}
                />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <D20Display
                  value={defender.defenseDice}
                  isRolling={isRolling}
                  label="🛡️ DEF"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Executar Ataque */}
      {!battleComplete && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            onClick={onExecuteAttack}
            disabled={isRolling}
            className={`px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all ${
              !isRolling
                ? "bg-red-600 text-white hover:bg-red-700 transform hover:scale-105"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isRolling ? "⚔️ Executando..." : "⚔️ Executar Ataque"}
          </button>
        </div>
      )}

      {/* Botões de Evolução */}
      {battleComplete && onEvolve && (
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
          {attacker.digimon.canEvolve && attackerNewHp > 0 && (
            <button
              onClick={() => onEvolve(attacker.digimon)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Evoluir{" "}
              <span className="hidden sm:inline">
                {capitalize(attacker.digimon.name)}
              </span>
            </button>
          )}
          {defender.digimon.canEvolve && defenderNewHp > 0 && (
            <button
              onClick={() => onEvolve(defender.digimon)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Evoluir{" "}
              <span className="hidden sm:inline">
                {capitalize(defender.digimon.name)}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
