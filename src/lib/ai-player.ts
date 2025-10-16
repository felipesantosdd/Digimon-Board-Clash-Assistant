import { GameDigimon, GamePlayer, GameState, GameBoss } from "@/types/game";

/**
 * IA para testes automáticos do jogo
 * Toma decisões estratégicas baseadas em vantagens de tipo/elemento
 */
export class AIPlayer {
  /**
   * Calcula vantagem de tipo entre dois Digimons
   */
  static getTypeAdvantage(
    attackerTypeId: number,
    defenderTypeId: number
  ): number {
    // DATA (1) > VACCINE (2) > VIRUS (3) > DATA
    const typeChart: Record<number, number[]> = {
      1: [2], // Data forte contra Vaccine
      2: [3], // Vaccine forte contra Virus
      3: [1], // Virus forte contra Data
      4: [], // Free (sem vantagem)
      5: [], // Variable (sem vantagem)
      6: [], // Unknown (sem vantagem)
    };

    const strongAgainst = typeChart[attackerTypeId] || [];
    return strongAgainst.includes(defenderTypeId) ? 1 : 0;
  }

  /**
   * Calcula vantagem de atributo elemental
   */
  static getAttributeAdvantage(
    attackerAttr: number | undefined,
    defenderAttr: number | undefined
  ): number {
    if (!attackerAttr || !defenderAttr) return 0;

    // Fogo > Natureza > Água > Fogo
    // Luz > Trevas
    const advantageMap: Record<number, number[]> = {
      2: [5], // Fogo > Natureza
      5: [3], // Natureza > Água
      3: [2], // Água > Fogo
      9: [10], // Luz > Trevas
    };

    const strongAgainst = advantageMap[attackerAttr] || [];
    return strongAgainst.includes(defenderAttr) ? 1 : 0;
  }

  /**
   * Avalia se vale a pena atacar o boss ou um inimigo
   */
  static shouldAttackBoss(
    myDigimon: GameDigimon,
    enemies: GameDigimon[],
    boss: GameBoss | null | undefined
  ): boolean {
    if (!boss || boss.isDefeated || boss.currentHp <= 0) return false;

    // Se não há inimigos vivos, atacar boss
    const aliveEnemies = enemies.filter((e) => e.currentHp > 0);
    if (aliveEnemies.length === 0) return true;

    // Se o boss está com HP baixo (<50%), priorizar
    const bossHpPercentage = (boss.currentHp / boss.maxHp) * 100;
    if (bossHpPercentage < 50) return true;

    // 50% de chance de atacar boss (balanceado entre boss e PvP)
    if (Math.random() < 0.5) return true;

    // Caso contrário, atacar inimigos
    return false;
  }

  /**
   * Escolhe o melhor alvo inimigo baseado em vantagens
   */
  static chooseBestTarget(
    myDigimon: GameDigimon,
    enemies: GameDigimon[]
  ): GameDigimon | null {
    const aliveEnemies = enemies.filter((e) => e.currentHp > 0);
    if (aliveEnemies.length === 0) return null;

    // Calcular score para cada inimigo
    const scores = aliveEnemies.map((enemy) => {
      let score = 0;

      // Vantagem de tipo (+10 pontos)
      const typeAdv = this.getTypeAdvantage(myDigimon.typeId, enemy.typeId);
      score += typeAdv * 10;

      // Vantagem de atributo (+5 pontos)
      const attrAdv = this.getAttributeAdvantage(
        myDigimon.attributeId,
        enemy.attributeId
      );
      score += attrAdv * 5;

      // Preferir inimigos com HP baixo (+5 pontos se <50% HP)
      const hpPercentage = (enemy.currentHp / enemy.dp) * 100;
      if (hpPercentage < 50) score += 5;

      // Preferir inimigos mais fracos (+3 pontos se DP < 80% do meu)
      if (enemy.dp < myDigimon.dp * 0.8) score += 3;

      return { enemy, score };
    });

    // Ordenar por score (maior primeiro)
    scores.sort((a, b) => b.score - a.score);

    return scores[0].enemy;
  }

  /**
   * Decide a melhor ação para o Digimon
   */
  static decideBestAction(
    myDigimon: GameDigimon,
    myTeam: GameDigimon[],
    enemies: GameDigimon[],
    boss: GameBoss | null | undefined
  ): {
    action: "attack" | "attack_boss" | "explore" | "rest" | "evolve";
    target?: GameDigimon;
  } {
    // Se pode evoluir, evoluir!
    if (myDigimon.canEvolve && myDigimon.currentHp > 0) {
      return { action: "evolve" };
    }

    // Se está nocauteado, não pode agir
    if (myDigimon.currentHp <= 0) {
      return { action: "rest" }; // Vai tentar levantar
    }

    // Filtrar apenas inimigos vivos
    const aliveEnemies = enemies.filter((e) => e.currentHp > 0);

    // PRIORIDADE: Se não há inimigos vivos mas há boss, atacar boss!
    if (
      aliveEnemies.length === 0 &&
      boss &&
      !boss.isDefeated &&
      boss.currentHp > 0
    ) {
      console.log(
        `🤖 [AI] ${myDigimon.name} vai atacar o boss (sem inimigos vivos)!`
      );
      return { action: "attack_boss" };
    }

    // Se HP < 30%, considerar descansar (mas não se for o único alive e tem boss)
    const hpPercentage = (myDigimon.currentHp / myDigimon.dp) * 100;
    if (hpPercentage < 30 && Math.random() < 0.3 && aliveEnemies.length > 0) {
      return { action: "rest" };
    }

    // Decidir entre atacar boss ou inimigo
    if (this.shouldAttackBoss(myDigimon, aliveEnemies, boss)) {
      return { action: "attack_boss" };
    }

    // Escolher melhor alvo inimigo
    const bestTarget = this.chooseBestTarget(myDigimon, aliveEnemies);
    if (bestTarget) {
      return { action: "attack", target: bestTarget };
    }

    // Se não há inimigos mas há boss, atacar boss
    if (boss && !boss.isDefeated && boss.currentHp > 0) {
      return { action: "attack_boss" };
    }

    // Explorar como fallback (20% de chance)
    if (Math.random() < 0.2) {
      return { action: "explore" };
    }

    // Default: descansar
    return { action: "rest" };
  }

  /**
   * Escolhe qual Digimon deve agir (prioriza o mais forte que ainda não agiu)
   */
  static chooseDigimonToAct(digimons: GameDigimon[]): GameDigimon | null {
    const available = digimons.filter(
      (d) => !d.hasActedThisTurn && d.currentHp > 0
    );

    if (available.length === 0) return null;

    // Priorizar Digimon com maior DP que ainda não agiu
    available.sort((a, b) => b.dp - a.dp);
    return available[0];
  }
}
