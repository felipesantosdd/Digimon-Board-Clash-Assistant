"use client";

import { GameDigimon } from "@/types/game";
import { capitalize, DIGIMON_TYPE_NAMES } from "@/lib/utils";
import D20Display from "./D20Display";

interface BattleViewProps {
  attacker: {
    digimon: GameDigimon;
    playerName: string;
    diceValue: number;
    damage: number;
    typeAdvantage: number;
  };
  defender: {
    digimon: GameDigimon;
    diceValue: number;
    damage: number;
    typeAdvantage: number;
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

  const attackerDead = attackerNewHp <= 0;
  const defenderDead = defenderNewHp <= 0;

  return (
    <div>
      <h4 className="text-lg font-bold text-white mb-4 text-center">
        ⚔️ Campo de Batalha
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Atacante */}
        <div className="bg-gray-700 rounded-lg p-4 border-2 border-blue-500">
          <h5 className="font-bold text-blue-400 mb-3 text-center">
            ⚔️ {capitalize(attacker.digimon.name)}
            <div className="text-xs text-gray-300 mt-1">
              {
                DIGIMON_TYPE_NAMES[
                  attacker.digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
                ]
              }
              {attacker.typeAdvantage === 1 && (
                <span className="text-green-400 ml-2">⬆️ Vantagem</span>
              )}
              {attacker.typeAdvantage === -1 && (
                <span className="text-red-400 ml-2">⬇️ Desvantagem</span>
              )}
            </div>
          </h5>

          <div className="space-y-3">
            {/* Imagem */}
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden">
              {attacker.digimon.image ? (
                <img
                  src={attacker.digimon.image}
                  alt={attacker.digimon.name}
                  className={`w-full h-full object-contain transition-all duration-500 ${
                    battleComplete && attackerDead
                      ? "grayscale brightness-50"
                      : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  ❓
                </div>
              )}

              {battleComplete && attackerDead && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💀</div>
                    <p className="text-red-400 font-bold text-sm">ELIMINADO</p>
                  </div>
                </div>
              )}

              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                {attacker.digimon.dp.toLocaleString()} DP
              </div>

              {attacker.typeAdvantage !== 0 && (
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                    attacker.typeAdvantage === 1
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {attacker.typeAdvantage === 1 ? "⬆️ +35%" : "⬇️ -35%"}
                </div>
              )}
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">HP</span>
                <span className="text-green-400 font-bold">
                  {attackerNewHp.toLocaleString()} /{" "}
                  {attacker.digimon.dp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden border border-gray-500">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    width: `${Math.max(
                      0,
                      (attackerNewHp / attacker.digimon.dp) * 100
                    )}%`,
                  }}
                >
                  <span className="text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {Math.round(
                      Math.max(0, (attackerNewHp / attacker.digimon.dp) * 100)
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* D20 */}
            <D20Display
              value={attacker.diceValue}
              isRolling={isRolling}
              damageDealt={battleComplete ? attacker.damage : undefined}
            />
          </div>
        </div>

        {/* Defensor */}
        <div className="bg-gray-700 rounded-lg p-4 border-2 border-orange-500">
          <h5 className="font-bold text-orange-400 mb-3 text-center">
            🛡️ {capitalize(defender.digimon.name)}
            <div className="text-xs text-gray-300 mt-1">
              {
                DIGIMON_TYPE_NAMES[
                  defender.digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
                ]
              }
              {defender.typeAdvantage === 1 && (
                <span className="text-green-400 ml-2">⬆️ Vantagem</span>
              )}
              {defender.typeAdvantage === -1 && (
                <span className="text-red-400 ml-2">⬇️ Desvantagem</span>
              )}
            </div>
          </h5>

          <div className="space-y-3">
            {/* Imagem */}
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden">
              {defender.digimon.image ? (
                <img
                  src={defender.digimon.image}
                  alt={defender.digimon.name}
                  className={`w-full h-full object-contain transition-all duration-500 ${
                    battleComplete && defenderDead
                      ? "grayscale brightness-50"
                      : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  ❓
                </div>
              )}

              {battleComplete && defenderDead && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💀</div>
                    <p className="text-red-400 font-bold text-sm">ELIMINADO</p>
                  </div>
                </div>
              )}

              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                {defender.digimon.dp.toLocaleString()} DP
              </div>

              {defender.typeAdvantage !== 0 && (
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                    defender.typeAdvantage === 1
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {defender.typeAdvantage === 1 ? "⬆️ +35%" : "⬇️ -35%"}
                </div>
              )}
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">HP</span>
                <span className="text-green-400 font-bold">
                  {defenderNewHp.toLocaleString()} /{" "}
                  {defender.digimon.dp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden border border-gray-500">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    width: `${Math.max(
                      0,
                      (defenderNewHp / defender.digimon.dp) * 100
                    )}%`,
                  }}
                >
                  <span className="text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {Math.round(
                      Math.max(0, (defenderNewHp / defender.digimon.dp) * 100)
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* D20 */}
            <D20Display
              value={defender.diceValue}
              isRolling={isRolling}
              damageDealt={battleComplete ? defender.damage : undefined}
            />
          </div>
        </div>
      </div>

      {/* Botão de Executar Ataque */}
      {!battleComplete && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onExecuteAttack}
            disabled={isRolling}
            className={`px-8 py-3 font-semibold rounded-lg transition-all ${
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
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {attacker.digimon.canEvolve && attackerNewHp > 0 && (
            <button
              onClick={() => onEvolve(attacker.digimon)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Evoluir {capitalize(attacker.digimon.name)}
            </button>
          )}
          {defender.digimon.canEvolve && defenderNewHp > 0 && (
            <button
              onClick={() => onEvolve(defender.digimon)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Evoluir {capitalize(defender.digimon.name)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
