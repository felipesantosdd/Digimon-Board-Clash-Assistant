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

    // Log detalhado dos tipos e vantagens
    console.log("🔍 [BATTLE DEBUG] Tipos e vantagens:", {
      atacante: {
        nome: attacker.name,
        tipo: attacker.typeId,
        atributo: attacker.attributeId,
      },
      defensor: {
        nome: defender.name,
        tipo: defender.typeId,
        atributo: defender.attributeId,
      },
      vantagem_tipo: this.attackerTypeAdvantage,
      vantagem_atributo: this.attackerAttributeAdvantage,
    });
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
  private calculateRawDamageFromAtk(atk: number, attackRoll: number): number {
    const multiplier = attackRoll * 0.05; // 5% por ponto do dado
    const rawDamage = atk * multiplier;
    return this.roundToHundred(rawDamage);
  }

  /**
   * Calcula a redução de dano baseada no DP e no D10 de defesa
   * Fórmula: DP × (D10_Defesa × 0.05) arredondado para múltiplo de 100
   */
  private calculateDefenseReductionFromDef(
    def: number,
    defenseRoll: number
  ): number {
    const multiplier = defenseRoll * 0.05; // 5% por ponto do dado
    const reduction = def * multiplier;
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

    return Math.round(baseDamage * multiplier);
  }

  /**
   * Calcula o poder de ataque fixo de um Digimon
   * Poder = DP / 3 arredondado para cima em múltiplos de 100
   */
  private calculateAttackPower(atkBase: number, attackBonus: number): number {
    // Poder base = atk do banco
    const basePower = atkBase;

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
   * Executa o combate com o novo sistema: usa atk/def/hp
   * Fórmula de dano: ATK × (1 - DEF/(DEF + ATK × 2))
   * Esta fórmula garante que sempre haverá dano proporcional ao ATK
   * e a DEF nunca anula 100% do dano
   * Apenas o defensor toma dano (sem contra-ataque)
   */
  public executeBattle(): BattleResult {
    // Determinar ATK/DEF com fallbacks para compatibilidade
    const baseAttackerAtk = (this.attacker as any).atk ?? 0;
    const baseDefenderDef = (this.defender as any).def ?? 0;

    // Aplicar vantagens (tipo/atributo) ao ATK do atacante
    let effectiveAtk = this.applyAdvantages(
      baseAttackerAtk,
      this.attackerTypeAdvantage,
      this.attackerAttributeAdvantage
    );

    // Aplicar modificador de status ao ATK final
    effectiveAtk = Math.max(
      0,
      Math.round(effectiveAtk + (this.attackerStatusModifier || 0))
    );

    // Fórmula balanceada: ATK × (1 - DEF/(DEF + ATK × 2))
    let attackerDamage = 0;

    if (effectiveAtk > 0) {
      const denominator = baseDefenderDef + effectiveAtk * 2;
      if (denominator > 0) {
        const penetrationRatio = 1 - baseDefenderDef / denominator;
        attackerDamage = Math.round(effectiveAtk * penetrationRatio);
      } else {
        // Caso extremo sem defesa: dano total
        attackerDamage = effectiveAtk;
      }
    }

    // Dano mínimo de 5 se houver ATK
    if (effectiveAtk > 0 && attackerDamage < 5) {
      attackerDamage = 5;
    }

    const defenderDamage = 0; // Sem contra-ataque

    console.log("💥 [BATTLE] Cálculo com penetração:", {
      atacante_atk_base: baseAttackerAtk,
      atacante_atk_efetivo: effectiveAtk,
      defensor_def: baseDefenderDef,
      formula: `${effectiveAtk} × (1 - ${baseDefenderDef}/(${baseDefenderDef} + ${effectiveAtk} × 2))`,
      penetracao: `${(
        (1 - baseDefenderDef / (baseDefenderDef + effectiveAtk * 2)) *
        100
      ).toFixed(1)}%`,
      dano_no_defensor: attackerDamage,
      vantagem_tipo: this.attackerTypeAdvantage,
      vantagem_atributo: this.attackerAttributeAdvantage,
    });

    // Calcular novos HPs
    const attackerNewHp = this.attacker.currentHp; // Atacante não toma dano
    const defenderNewHp = Math.max(0, this.defender.currentHp - attackerDamage);

    return {
      attackerDamage,
      defenderDamage,
      attackerAttackRoll: 0,
      attackerDefenseRoll: 0,
      defenderAttackRoll: 0,
      defenderDefenseRoll: 0,
      attackerNewHp,
      defenderNewHp,
      attackerTypeAdvantage: this.attackerTypeAdvantage,
      defenderTypeAdvantage: this.defenderTypeAdvantage,
      attackerAttributeAdvantage: this.attackerAttributeAdvantage,
      defenderAttributeAdvantage: this.defenderAttributeAdvantage,
      attackerCriticalSuccess: false,
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
