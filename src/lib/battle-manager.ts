import { GameDigimon } from "@/types/game";
import { calculateTypeAdvantage } from "./utils";

export interface BattleResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerDiceRoll: number;
  defenderDiceRoll: number;
  attackerNewHp: number;
  defenderNewHp: number;
  attackerTypeAdvantage: number;
  defenderTypeAdvantage: number;
}

export class BattleManager {
  private attacker: GameDigimon;
  private defender: GameDigimon;
  private attackerTypeAdvantage: number;
  private defenderTypeAdvantage: number;

  constructor(attacker: GameDigimon, defender: GameDigimon) {
    this.attacker = attacker;
    this.defender = defender;

    // Calcular vantagens de tipo
    this.attackerTypeAdvantage = calculateTypeAdvantage(
      attacker.typeId,
      defender.typeId
    );
    this.defenderTypeAdvantage = calculateTypeAdvantage(
      defender.typeId,
      attacker.typeId
    );
  }

  /**
   * Rola um D20
   */
  private rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

  /**
   * Calcula o dano base baseado no DP e no valor do dado
   */
  private calculateBaseDamage(dp: number, diceRoll: number): number {
    const multiplier = diceRoll * 0.05; // 5% por ponto do dado
    return Math.round(dp * multiplier);
  }

  /**
   * Aplica modificador de vantagem de tipo ao dano
   */
  private applyTypeAdvantage(baseDamage: number, advantage: number): number {
    if (advantage === 1) {
      return Math.round(baseDamage * 1.35); // +35%
    } else if (advantage === -1) {
      return Math.round(baseDamage * 0.65); // -35%
    }
    return baseDamage;
  }

  /**
   * Executa o combate completo
   */
  public executeBattle(): BattleResult {
    // Rolar dados
    const attackerRoll = this.rollD20();
    const defenderRoll = this.rollD20();

    // Calcular danos base
    const attackerBaseDamage = this.calculateBaseDamage(
      this.attacker.dp,
      attackerRoll
    );
    const defenderBaseDamage = this.calculateBaseDamage(
      this.defender.dp,
      defenderRoll
    );

    // Aplicar vantagens de tipo
    const attackerFinalDamage = this.applyTypeAdvantage(
      attackerBaseDamage,
      this.attackerTypeAdvantage
    );
    const defenderFinalDamage = this.applyTypeAdvantage(
      defenderBaseDamage,
      this.defenderTypeAdvantage
    );

    // Calcular novos HPs
    const attackerNewHp = Math.max(
      0,
      this.attacker.currentHp - defenderFinalDamage
    );
    const defenderNewHp = Math.max(
      0,
      this.defender.currentHp - attackerFinalDamage
    );

    return {
      attackerDamage: attackerFinalDamage,
      defenderDamage: defenderFinalDamage,
      attackerDiceRoll: attackerRoll,
      defenderDiceRoll: defenderRoll,
      attackerNewHp,
      defenderNewHp,
      attackerTypeAdvantage: this.attackerTypeAdvantage,
      defenderTypeAdvantage: this.defenderTypeAdvantage,
    };
  }

  /**
   * Calcula chance de evolução baseada no HP perdido
   */
  public calculateEvolutionChance(
    currentHp: number,
    maxHp: number,
    currentlyCanEvolve: boolean
  ): { canEvolve: boolean; chance: number; roll: number } {
    if (currentlyCanEvolve || currentHp <= 0) {
      return { canEvolve: currentlyCanEvolve, chance: 0, roll: 0 };
    }

    // Calcular % de vida perdida TOTAL
    const hpLostPercentage = ((maxHp - currentHp) / maxHp) * 100;

    // Chance base de 20% + 5% a cada 10% de vida perdida
    const chance = 20 + Math.floor(hpLostPercentage / 10) * 5;

    // Rolar D100
    const roll = Math.floor(Math.random() * 100) + 1;

    return {
      canEvolve: roll <= chance,
      chance,
      roll,
    };
  }

  public getAttackerTypeAdvantage(): number {
    return this.attackerTypeAdvantage;
  }

  public getDefenderTypeAdvantage(): number {
    return this.defenderTypeAdvantage;
  }
}
