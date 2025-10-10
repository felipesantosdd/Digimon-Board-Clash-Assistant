import { GameDigimon } from "@/types/game";
import { calculateTypeAdvantage } from "./utils";

export interface BattleResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerAttackRoll: number; // D20 de ataque do atacante
  attackerDefenseRoll: number; // D20 de defesa do atacante
  defenderAttackRoll: number; // D20 de ataque do defensor
  defenderDefenseRoll: number; // D20 de defesa do defensor
  attackerNewHp: number;
  defenderNewHp: number;
  attackerTypeAdvantage: number;
  defenderTypeAdvantage: number;
  attackerCriticalSuccess: boolean; // D20 de ataque = 20
  attackerCriticalFail: boolean; // D20 de ataque = 1
  defenderCriticalSuccess: boolean; // D20 de ataque = 20
  defenderCriticalFail: boolean; // D20 de ataque = 1
}

export class BattleManager {
  private attacker: GameDigimon;
  private defender: GameDigimon;
  private attackerTypeAdvantage: number;
  private defenderTypeAdvantage: number;
  private attackerStatusModifier: number;
  private defenderStatusModifier: number;

  constructor(
    attacker: GameDigimon,
    defender: GameDigimon,
    attackerStatusModifier: number = 0,
    defenderStatusModifier: number = 0
  ) {
    this.attacker = attacker;
    this.defender = defender;
    this.attackerStatusModifier = attackerStatusModifier;
    this.defenderStatusModifier = defenderStatusModifier;

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
   * Calcula o dano bruto baseado no DP e no D20 de ataque
   * Fórmula: DP × (D20_Ataque × 0.05)
   */
  private calculateRawDamage(dp: number, attackRoll: number): number {
    const multiplier = attackRoll * 0.05; // 5% por ponto do dado
    return Math.round(dp * multiplier);
  }

  /**
   * Calcula a redução de dano baseada no DP e no D20 de defesa
   * Fórmula: DP × (D20_Defesa × 0.05)
   */
  private calculateDefenseReduction(dp: number, defenseRoll: number): number {
    const multiplier = defenseRoll * 0.05; // 5% por ponto do dado
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
   * Executa o combate completo com sistema de 2 dados por Digimon
   * Cada Digimon rola 1 D20 de ataque e 1 D20 de defesa
   */
  public executeBattle(): BattleResult {
    // Rolar 4 dados (2 para cada Digimon)
    const attackerAttackRoll = this.rollD20(); // Ataque do atacante
    const attackerDefenseRoll = this.rollD20(); // Defesa do atacante
    const defenderAttackRoll = this.rollD20(); // Ataque do defensor
    const defenderDefenseRoll = this.rollD20(); // Defesa do defensor

    console.log("🎲 [BATTLE] Dados rolados:", {
      atacante: { ataque: attackerAttackRoll, defesa: attackerDefenseRoll },
      defensor: { ataque: defenderAttackRoll, defesa: defenderDefenseRoll },
    });

    // Detectar críticos (apenas nos dados de ATAQUE)
    const attackerCriticalSuccess = attackerAttackRoll === 20;
    const attackerCriticalFail = attackerAttackRoll === 1;
    const defenderCriticalSuccess = defenderAttackRoll === 20;
    const defenderCriticalFail = defenderAttackRoll === 1;

    // ATACANTE: Calcular dano bruto e defesa do oponente
    const attackerRawDamage = this.calculateRawDamage(
      this.attacker.dp,
      attackerAttackRoll
    );
    const defenderDefenseReduction = this.calculateDefenseReduction(
      this.defender.dp,
      defenderDefenseRoll
    );

    // DEFENSOR: Calcular dano bruto e defesa do oponente
    const defenderRawDamage = this.calculateRawDamage(
      this.defender.dp,
      defenderAttackRoll
    );
    const attackerDefenseReduction = this.calculateDefenseReduction(
      this.attacker.dp,
      attackerDefenseRoll
    );

    console.log("⚔️ [BATTLE] Cálculos:", {
      atacante: {
        dano_bruto: attackerRawDamage,
        defesa_oponente: defenderDefenseReduction,
      },
      defensor: {
        dano_bruto: defenderRawDamage,
        defesa_oponente: attackerDefenseReduction,
      },
    });

    // Calcular dano líquido (Dano - Defesa)
    let attackerNetDamage = Math.max(
      0,
      attackerRawDamage - defenderDefenseReduction
    );
    let defenderNetDamage = Math.max(
      0,
      defenderRawDamage - attackerDefenseReduction
    );

    // Aplicar vantagens de tipo
    attackerNetDamage = this.applyTypeAdvantage(
      attackerNetDamage,
      this.attackerTypeAdvantage
    );
    defenderNetDamage = this.applyTypeAdvantage(
      defenderNetDamage,
      this.defenderTypeAdvantage
    );

    // Aplicar modificadores de status (+20 ou -20)
    attackerNetDamage = Math.max(
      0,
      attackerNetDamage + this.attackerStatusModifier
    );
    defenderNetDamage = Math.max(
      0,
      defenderNetDamage + this.defenderStatusModifier
    );

    console.log("💥 [BATTLE] Dano final:", {
      atacante_causa: attackerNetDamage,
      defensor_causa: defenderNetDamage,
    });

    // Calcular novos HPs
    const attackerNewHp = Math.max(
      0,
      this.attacker.currentHp - defenderNetDamage
    );
    const defenderNewHp = Math.max(
      0,
      this.defender.currentHp - attackerNetDamage
    );

    return {
      attackerDamage: attackerNetDamage,
      defenderDamage: defenderNetDamage,
      attackerAttackRoll,
      attackerDefenseRoll,
      defenderAttackRoll,
      defenderDefenseRoll,
      attackerNewHp,
      defenderNewHp,
      attackerTypeAdvantage: this.attackerTypeAdvantage,
      defenderTypeAdvantage: this.defenderTypeAdvantage,
      attackerCriticalSuccess,
      attackerCriticalFail,
      defenderCriticalSuccess,
      defenderCriticalFail,
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
