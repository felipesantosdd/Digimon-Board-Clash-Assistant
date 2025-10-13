import { GameDigimon } from "@/types/game";
import { calculateTypeAdvantage, calculateAttributeAdvantage } from "./utils";

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
  attackerAttributeAdvantage: number; // Vantagem de atributo elemental
  defenderAttributeAdvantage: number; // Vantagem de atributo elemental
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
  private attackerAttributeAdvantage: number;
  private defenderAttributeAdvantage: number;
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

    // Calcular vantagens de atributo elemental
    this.attackerAttributeAdvantage = calculateAttributeAdvantage(
      attacker.attributeId,
      defender.attributeId
    );
    this.defenderAttributeAdvantage = calculateAttributeAdvantage(
      defender.attributeId,
      attacker.attributeId
    );
  }

  /**
   * Rola um D20
   */
  private rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

  /**
   * Rola um D10
   */
  private rollD10(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Arredonda valor para múltiplo de 100
   */
  private roundToHundred(value: number): number {
    return Math.round(value / 100) * 100;
  }

  /**
   * Calcula o dano bruto baseado no DP e no D20 de ataque
   * Fórmula: DP × (D20_Ataque × 0.05) arredondado para múltiplo de 100
   */
  private calculateRawDamage(dp: number, attackRoll: number): number {
    const multiplier = attackRoll * 0.05; // 5% por ponto do dado
    const rawDamage = dp * multiplier;
    return this.roundToHundred(rawDamage);
  }

  /**
   * Calcula a redução de dano baseada no DP e no D10 de defesa
   * Fórmula: DP × (D10_Defesa × 0.05) arredondado para múltiplo de 100
   */
  private calculateDefenseReduction(dp: number, defenseRoll: number): number {
    const multiplier = defenseRoll * 0.05; // 5% por ponto do dado
    const reduction = dp * multiplier;
    return this.roundToHundred(reduction);
  }

  /**
   * Aplica modificadores de vantagem de tipo E atributo ao dano (ACUMULATIVO)
   * Tipo: ±35% | Atributo: ±20%
   */
  private applyAdvantages(
    baseDamage: number,
    typeAdvantage: number,
    attributeAdvantage: number
  ): number {
    let multiplier = 1.0;

    // Aplicar vantagem de TIPO (±35%)
    if (typeAdvantage === 1) {
      multiplier += 0.35; // +35%
    } else if (typeAdvantage === -1) {
      multiplier -= 0.35; // -35%
    }

    // Aplicar vantagem de ATRIBUTO (±20%) - ACUMULATIVO!
    if (attributeAdvantage === 1) {
      multiplier += 0.2; // +20%
    } else if (attributeAdvantage === -1) {
      multiplier -= 0.2; // -20%
    }

    return this.roundToHundred(baseDamage * multiplier);
  }

  /**
   * Calcula o poder de ataque fixo de um Digimon
   * Poder = DP / 3 arredondado para cima em múltiplos de 100
   */
  private calculateAttackPower(dp: number, attackBonus: number): number {
    // Poder base = 1/3 do DP
    const basePower = dp / 3;
    
    // Aplicar bônus de ataque como % (cada ponto = 2% de aumento)
    // Ex: +5 = +10%, +10 = +20%, +15 = +30%
    const bonusPercentage = (attackBonus || 0) * 2;
    const powerWithBonus = basePower * (1 + bonusPercentage / 100);
    
    // Arredondar para cima em múltiplos de 100
    return Math.ceil(powerWithBonus / 100) * 100;
  }

  /**
   * Calcula a redução de defesa baseada no próprio poder
   * Defesa = Poder próprio × % do bônus de defesa
   * Ex: Poder 1000, +10 defesa = 1000 × 20% = 200 de redução
   */
  private calculateDefenseFromPower(
    ownPower: number,
    defenseBonus: number
  ): number {
    if (!defenseBonus || defenseBonus === 0) return 0;
    
    // Cada ponto de defesa = 2% do próprio poder
    const defensePercentage = defenseBonus * 2;
    const defenseValue = ownPower * (defensePercentage / 100);
    
    // Arredondar para múltiplo de 100
    return this.roundToHundred(defenseValue);
  }

  /**
   * Executa o combate com sistema de poder fixo
   * Poder = DP/3 | Sem dados | Sem defesa
   */
  public executeBattle(): BattleResult {
    // Calcular poder de ataque de cada Digimon
    const attackerPower = this.calculateAttackPower(
      this.attacker.dp,
      this.attacker.attackBonus || 0
    );
    const defenderPower = this.calculateAttackPower(
      this.defender.dp,
      this.defender.attackBonus || 0
    );

    console.log("⚔️ [BATTLE] Poder de ataque:", {
      atacante: {
        dp: this.attacker.dp,
        bonusAtaque: this.attacker.attackBonus || 0,
        poderBase: Math.ceil((this.attacker.dp / 3) / 100) * 100,
        poderFinal: attackerPower,
      },
      defensor: {
        dp: this.defender.dp,
        bonusAtaque: this.defender.attackBonus || 0,
        poderBase: Math.ceil((this.defender.dp / 3) / 100) * 100,
        poderFinal: defenderPower,
      },
    });

    // Calcular defesa de cada Digimon (baseada no próprio poder)
    const attackerDefense = this.calculateDefenseFromPower(
      attackerPower,
      this.attacker.defenseBonus || 0
    );
    const defenderDefense = this.calculateDefenseFromPower(
      defenderPower,
      this.defender.defenseBonus || 0
    );

    console.log("🛡️ [BATTLE] Defesa calculada:", {
      atacante: {
        poder: attackerPower,
        bonusDefesa: this.attacker.defenseBonus || 0,
        defesa: attackerDefense,
      },
      defensor: {
        poder: defenderPower,
        bonusDefesa: this.defender.defenseBonus || 0,
        defesa: defenderDefense,
      },
    });

    // Aplicar vantagens de tipo E atributo ao poder (ACUMULATIVO)
    let attackerPowerWithAdvantages = this.applyAdvantages(
      attackerPower,
      this.attackerTypeAdvantage,
      this.attackerAttributeAdvantage
    );
    let defenderPowerWithAdvantages = this.applyAdvantages(
      defenderPower,
      this.defenderTypeAdvantage,
      this.defenderAttributeAdvantage
    );

    // Aplicar modificadores de status
    attackerPowerWithAdvantages = this.roundToHundred(
      Math.max(0, attackerPowerWithAdvantages + this.attackerStatusModifier)
    );
    defenderPowerWithAdvantages = this.roundToHundred(
      Math.max(0, defenderPowerWithAdvantages + this.defenderStatusModifier)
    );

    // Calcular dano líquido (Poder - Defesa do oponente)
    let attackerDamage = Math.max(
      0,
      attackerPowerWithAdvantages - defenderDefense
    );
    let defenderDamage = Math.max(
      0,
      defenderPowerWithAdvantages - attackerDefense
    );

    // DANO MÍNIMO DE 5
    if (attackerDamage > 0 && attackerDamage < 5) {
      attackerDamage = 5;
    }
    if (defenderDamage > 0 && defenderDamage < 5) {
      defenderDamage = 5;
    }

    console.log("💥 [BATTLE] Dano final:", {
      atacante_causa: attackerDamage,
      atacante_defesa_absorvida: defenderDefense,
      defensor_causa: defenderDamage,
      defensor_defesa_absorvida: attackerDefense,
    });

    // Calcular novos HPs
    const attackerNewHp = Math.max(
      0,
      this.attacker.currentHp - defenderDamage
    );
    const defenderNewHp = Math.max(
      0,
      this.defender.currentHp - attackerDamage
    );

    return {
      attackerDamage,
      defenderDamage,
      attackerAttackRoll: 0, // Não usa mais dados
      attackerDefenseRoll: 0, // Não usa mais dados
      defenderAttackRoll: 0, // Não usa mais dados
      defenderDefenseRoll: 0, // Não usa mais dados
      attackerNewHp,
      defenderNewHp,
      attackerTypeAdvantage: this.attackerTypeAdvantage,
      defenderTypeAdvantage: this.defenderTypeAdvantage,
      attackerAttributeAdvantage: this.attackerAttributeAdvantage,
      defenderAttributeAdvantage: this.defenderAttributeAdvantage,
      attackerCriticalSuccess: false, // Não tem mais críticos
      attackerCriticalFail: false,
      defenderCriticalSuccess: false,
      defenderCriticalFail: false,
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

  public getAttackerAttributeAdvantage(): number {
    return this.attackerAttributeAdvantage;
  }

  public getDefenderAttributeAdvantage(): number {
    return this.defenderAttributeAdvantage;
  }
}
