"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { GameDigimon, GamePlayer } from "@/types/game";
import { capitalize } from "@/lib/utils";
import { BattleManager, BattleResult } from "@/lib/battle-manager";
import PlayerWithDigimons from "./battle/PlayerWithDigimons";
import BattleView from "./battle/BattleView";

interface AttackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    targetDigimon: GameDigimon,
    attackerDamage: number,
    defenderDamage: number
  ) => void;
  onEvolve?: (digimon: GameDigimon) => void;
  attacker: {
    digimon: GameDigimon;
    playerName: string;
  } | null;
  players: GamePlayer[];
  currentPlayerId: number;
}

export default function AttackDialog({
  isOpen,
  onClose,
  onConfirm,
  onEvolve,
  attacker,
  players,
  currentPlayerId,
}: AttackDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
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
  const [attackerDiceValue, setAttackerDiceValue] = useState(0);
  const [defenderDiceValue, setDefenderDiceValue] = useState(0);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedPlayerId(null);
      setSelectedDigimon(null);
      setStep("select-digimon");
      setBattleResult(null);
      setAttackerDiceValue(0);
      setDefenderDiceValue(0);
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

    setSelectedPlayerId(playerId);
    setSelectedDigimon(digimon);
    setBattleResult(null);
    setAttackerDiceValue(0);
    setDefenderDiceValue(0);
    setIsRolling(false);
    setBattleComplete(false);
    setStep("battle");
  };

  const executeAttack = () => {
    if (!attacker || !selectedDigimon) return;

    setIsRolling(true);

    // Simular animação de rolagem de dados
    let count = 0;
    const rollInterval = setInterval(() => {
      setAttackerDiceValue(Math.floor(Math.random() * 20) + 1);
      setDefenderDiceValue(Math.floor(Math.random() * 20) + 1);
      count++;

      if (count >= 15) {
        clearInterval(rollInterval);

        // Executar batalha usando o BattleManager
        const battleManager = new BattleManager(
          attacker.digimon,
          selectedDigimon
        );
        const result = battleManager.executeBattle();

        // Atualizar estados com resultado
        setAttackerDiceValue(result.attackerDiceRoll);
        setDefenderDiceValue(result.defenderDiceRoll);
        setBattleResult(result);
        setIsRolling(false);

        // Aplicar dano imediatamente
        onConfirm(selectedDigimon, result.attackerDamage, result.defenderDamage);
        setBattleComplete(true);

        // Feedback de críticos/falhas
        if (result.attackerDiceRoll === 20) {
          enqueueSnackbar(
            `🎉 ${capitalize(attacker.digimon.name)} rolou CRÍTICO! 20!`,
            { variant: "success" }
          );
        } else if (result.attackerDiceRoll === 1) {
          enqueueSnackbar(
            `💀 ${capitalize(attacker.digimon.name)} falhou... Rolou 1!`,
            { variant: "error" }
          );
        }

        if (result.defenderDiceRoll === 20) {
          enqueueSnackbar(
            `🎉 ${capitalize(selectedDigimon.name)} rolou CRÍTICO! 20!`,
            { variant: "success" }
          );
        } else if (result.defenderDiceRoll === 1) {
          enqueueSnackbar(
            `💀 ${capitalize(selectedDigimon.name)} falhou... Rolou 1!`,
            { variant: "error" }
          );
        }
      }
    }, 100);
  };

  const handleBack = () => {
    if (step === "battle") {
      setSelectedDigimon(null);
      setSelectedPlayerId(null);
      setBattleResult(null);
      setBattleComplete(false);
      setAttackerDiceValue(0);
      setDefenderDiceValue(0);
      setStep("select-digimon");
    }
  };

  const handleClose = () => {
    setSelectedPlayerId(null);
    setSelectedDigimon(null);
    setStep("select-digimon");
    setBattleResult(null);
    setAttackerDiceValue(0);
    setDefenderDiceValue(0);
    setIsRolling(false);
    setBattleComplete(false);
    onClose();
  };

  if (!isOpen || !attacker) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border-2 border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            Sistema de Ataque
          </h3>
          <p className="text-sm text-red-100 mt-1">
            {capitalize(attacker.digimon.name)} ({attacker.playerName})
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Etapa: Selecionar Digimon */}
          {step === "select-digimon" && (
            <div>
              <h4 className="text-lg font-bold text-white mb-4">
                Selecione o Digimon alvo
              </h4>
              <div className="space-y-6">
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
                diceValue: attackerDiceValue,
                damage: battleResult.attackerDamage,
                typeAdvantage: battleResult.attackerTypeAdvantage,
              }}
              defender={{
                digimon: selectedDigimon,
                diceValue: defenderDiceValue,
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
                diceValue: 0,
                damage: 0,
                typeAdvantage: new BattleManager(
                  attacker.digimon,
                  selectedDigimon
                ).getAttackerTypeAdvantage(),
              }}
              defender={{
                digimon: selectedDigimon,
                diceValue: 0,
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
          {step !== "select-digimon" && !battleComplete && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
            >
              ← Voltar
            </button>
          )}
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
          >
            {battleComplete ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}
