"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { GameDigimon, GamePlayer } from "@/types/game";
import { capitalize } from "@/lib/utils";
import { BattleManager, BattleResult } from "@/lib/battle-manager";
import PlayerWithDigimons from "./battle/PlayerWithDigimons";
import BattleView from "./battle/BattleView";
import BossAttackCard from "./battle/BossAttackCard";

interface AttackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    targetDigimon: GameDigimon,
    attackerDamage: number,
    defenderDamage: number,
    battleResult: BattleResult
  ) => void;
  onEvolve?: (digimon: GameDigimon) => void;
  attacker: {
    digimon: GameDigimon;
    playerName: string;
  } | null;
  players: GamePlayer[];
  currentPlayerId: number;
  getStatusModifier?: (digimon: GameDigimon) => number;
  activeBoss?: {
    id: number;
    name: string;
    image?: string;
    currentHp: number;
    maxHp: number;
    calculatedDp: number;
    typeId: number;
  } | null;
}

export default function AttackDialog({
  isOpen,
  onClose,
  onConfirm,
  onEvolve,
  attacker,
  players,
  currentPlayerId,
  getStatusModifier = () => 0,
  activeBoss,
}: AttackDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedDigimon, setSelectedDigimon] = useState<GameDigimon | null>(
    null
  );
  const [step, setStep] = useState<"select-digimon" | "battle">(
    "select-digimon"
  );

  // Dados da batalha
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [battleComplete, setBattleComplete] = useState(false);
  const [attackerAttackDice, setAttackerAttackDice] = useState(0);
  const [attackerDefenseDice, setAttackerDefenseDice] = useState(0);
  const [defenderAttackDice, setDefenderAttackDice] = useState(0);
  const [defenderDefenseDice, setDefenderDefenseDice] = useState(0);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedDigimon(null);
      setStep("select-digimon");
      setBattleResult(null);
      setAttackerAttackDice(0);
      setAttackerDefenseDice(0);
      setDefenderAttackDice(0);
      setDefenderDefenseDice(0);
      setIsRolling(false);
      setBattleComplete(false);
    }
  }, [isOpen]);

  const handleDigimonSelect = (digimon: GameDigimon, playerId: number) => {
    if (playerId === currentPlayerId) {
      enqueueSnackbar("Você não pode atacar seus próprios Digimons!", {
        variant: "warning",
      });
      return;
    }

    if (digimon.currentHp <= 0) {
      enqueueSnackbar("Não é possível atacar um Digimon morto!", {
        variant: "warning",
      });
      return;
    }

    // 💢 VERIFICAR SE ATACANTE ESTÁ PROVOCADO
    if (attacker && attacker.digimon.provokedBy) {
      const provoker = players
        .flatMap((p) => p.digimons)
        .find((d) => d.id === attacker.digimon.provokedBy);

      if (provoker && provoker.currentHp > 0) {
        // Só pode atacar o provocador
        if (digimon.id !== provoker.id) {
          enqueueSnackbar(
            `💢 ${capitalize(
              attacker.digimon.name
            )} está provocado por ${capitalize(
              provoker.name
            )}! Só pode atacar ele!`,
            { variant: "warning" }
          );
          return;
        }
      }
    }

    // 🛡️ VERIFICAR SE O ALVO TEM DEFENSOR
    const defender = players
      .flatMap((p) => p.digimons)
      .find((d) => d.defending === digimon.id && d.currentHp > 0);

    let targetDigimon = digimon;

    if (defender) {
      // Redirecionar ataque para o defensor
      targetDigimon = defender;
      // Toast removido - redirecionamento é visual (badge já mostra)
    }

    setSelectedDigimon(targetDigimon);
    setBattleResult(null);
    setAttackerAttackDice(0);
    setAttackerDefenseDice(0);
    setDefenderAttackDice(0);
    setDefenderDefenseDice(0);
    setIsRolling(false);
    setBattleComplete(false);
    setStep("battle");
  };

  const handleBossSelect = () => {
    if (!activeBoss) {
      enqueueSnackbar("Nenhum boss ativo no momento!", {
        variant: "warning",
      });
      return;
    }

    if (activeBoss.currentHp <= 0) {
      enqueueSnackbar("O boss já foi derrotado!", {
        variant: "warning",
      });
      return;
    }

    // Converter boss para GameDigimon para compatibilidade
    const bossAsDigimon: GameDigimon = {
      id: -1, // ID negativo para identificar como boss
      name: activeBoss.name,
      image: activeBoss.image || "",
      level: 7, // Boss sempre level max
      dp: activeBoss.calculatedDp,
      typeId: activeBoss.typeId,
      currentHp: activeBoss.currentHp,
      hasActedThisTurn: false,
      provokedBy: undefined,
      canEvolve: false,
    };

    setSelectedDigimon(bossAsDigimon);
    setBattleResult(null);
    setAttackerAttackDice(0);
    setAttackerDefenseDice(0);
    setDefenderAttackDice(0);
    setDefenderDefenseDice(0);
    setIsRolling(false);
    setBattleComplete(false);
    setStep("battle");
  };

  const executeAttack = () => {
    if (!attacker || !selectedDigimon) return;

    setIsRolling(true);

    // Simular animação de rolagem de dados (agora são 4 dados)
    let count = 0;
    const rollInterval = setInterval(() => {
      setAttackerAttackDice(Math.floor(Math.random() * 20) + 1);
      setAttackerDefenseDice(Math.floor(Math.random() * 20) + 1);
      setDefenderAttackDice(Math.floor(Math.random() * 20) + 1);
      setDefenderDefenseDice(Math.floor(Math.random() * 20) + 1);
      count++;

      if (count >= 15) {
        clearInterval(rollInterval);

        // Calcular modificadores de status
        const attackerModifier = getStatusModifier(attacker.digimon);
        const defenderModifier = getStatusModifier(selectedDigimon);

        console.log("💪 [BATTLE] Modificadores de status:", {
          atacante: attackerModifier,
          defensor: defenderModifier,
        });

        // Executar batalha usando o BattleManager
        const battleManager = new BattleManager(
          attacker.digimon,
          selectedDigimon,
          attackerModifier,
          defenderModifier
        );
        const result = battleManager.executeBattle();

        // Atualizar estados com resultado (4 dados)
        setAttackerAttackDice(result.attackerAttackRoll);
        setAttackerDefenseDice(result.attackerDefenseRoll);
        setDefenderAttackDice(result.defenderAttackRoll);
        setDefenderDefenseDice(result.defenderDefenseRoll);
        setBattleResult(result);
        setIsRolling(false);

        // Aplicar dano imediatamente e passar resultado completo
        onConfirm(
          selectedDigimon,
          result.attackerDamage,
          result.defenderDamage,
          result // Passar resultado completo com informações de críticos
        );
        setBattleComplete(true);

        // Toasts removidos - resultados são visíveis na tela de batalha
      }
    }, 100);
  };

  const handleClose = () => {
    setSelectedDigimon(null);
    setStep("select-digimon");
    setBattleResult(null);
    setAttackerAttackDice(0);
    setAttackerDefenseDice(0);
    setDefenderAttackDice(0);
    setDefenderDefenseDice(0);
    setIsRolling(false);
    setBattleComplete(false);
    onClose();
  };

  if (!isOpen || !attacker) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4"
      onClick={step === "select-digimon" ? handleClose : undefined}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl max-h-[96vh] sm:max-h-[95vh] overflow-y-auto border-2 border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 sm:px-6 py-2 sm:py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
            <span className="text-lg sm:text-2xl">⚔️</span>
            Sistema de Ataque
          </h3>
          <p className="text-xs sm:text-sm text-red-100 mt-0.5 sm:mt-1">
            {capitalize(attacker.digimon.name)} ({attacker.playerName})
          </p>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-6 space-y-2 sm:space-y-4">
          {/* Etapa: Selecionar Digimon */}
          {step === "select-digimon" && (
            <div>
              <h4 className="text-sm sm:text-lg font-bold text-white mb-2 sm:mb-4">
                Selecione o alvo do ataque
              </h4>
              <div className="space-y-2 sm:space-y-6">
                {/* Boss Card (se houver boss ativo) */}
                {activeBoss && activeBoss.currentHp > 0 && (
                  <BossAttackCard
                    boss={activeBoss}
                    onBossSelect={handleBossSelect}
                  />
                )}

                {/* Players */}
                {players
                  .filter((p) => p.id !== currentPlayerId)
                  .map((player) => (
                    <PlayerWithDigimons
                      key={player.id}
                      player={player}
                      onDigimonSelect={handleDigimonSelect}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Etapa: Batalha */}
          {step === "battle" && selectedDigimon && battleResult !== null && (
            <BattleView
              attacker={{
                digimon: attacker.digimon,
                playerName: attacker.playerName,
                attackDice: attackerAttackDice,
                defenseDice: attackerDefenseDice,
                damage: battleResult.attackerDamage,
                typeAdvantage: battleResult.attackerTypeAdvantage,
              }}
              defender={{
                digimon: selectedDigimon,
                attackDice: defenderAttackDice,
                defenseDice: defenderDefenseDice,
                damage: battleResult.defenderDamage,
                typeAdvantage: battleResult.defenderTypeAdvantage,
              }}
              isRolling={isRolling}
              battleComplete={battleComplete}
              onExecuteAttack={executeAttack}
              onEvolve={onEvolve}
            />
          )}

          {/* Etapa: Batalha (antes de executar) */}
          {step === "battle" && selectedDigimon && battleResult === null && (
            <BattleView
              attacker={{
                digimon: attacker.digimon,
                playerName: attacker.playerName,
                attackDice: 0,
                defenseDice: 0,
                damage: 0,
                typeAdvantage: new BattleManager(
                  attacker.digimon,
                  selectedDigimon
                ).getAttackerTypeAdvantage(),
              }}
              defender={{
                digimon: selectedDigimon,
                attackDice: 0,
                defenseDice: 0,
                damage: 0,
                typeAdvantage: new BattleManager(
                  attacker.digimon,
                  selectedDigimon
                ).getDefenderTypeAdvantage(),
              }}
              isRolling={isRolling}
              battleComplete={battleComplete}
              onExecuteAttack={executeAttack}
              onEvolve={onEvolve}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-6 py-4 rounded-b-lg flex gap-3">
          {step === "select-digimon" && (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
            >
              Cancelar
            </button>
          )}
          {step === "battle" && battleComplete && (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
            >
              Fechar
            </button>
          )}
          {step === "battle" && !battleComplete && (
            <div className="flex-1 text-center py-2 text-yellow-400 font-semibold">
              ⚠️ Execute o ataque para prosseguir
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
