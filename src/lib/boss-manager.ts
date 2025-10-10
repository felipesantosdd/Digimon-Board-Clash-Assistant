import { GameBoss, GameDigimon, GamePlayer } from "@/types/game";
import { Boss } from "@/types/boss";

/**
 * Gerenciador de Bosses
 * Responsável por spawnar, calcular stats e gerenciar mecânicas de bosses
 */
export class BossManager {
  /**
   * Calcula a média de DP dos Digimons vivos de todos os jogadores
   */
  static calculateAverageDp(players: GamePlayer[]): number {
    const aliveDigimons: GameDigimon[] = [];

    for (const player of players) {
      for (const digimon of player.digimons) {
        if (digimon.currentHp > 0) {
          aliveDigimons.push(digimon);
        }
      }
    }

    if (aliveDigimons.length === 0) return 1000; // Fallback se não houver ninguém vivo

    const totalDp = aliveDigimons.reduce((sum, d) => sum + d.dp, 0);
    return Math.floor(totalDp / aliveDigimons.length);
  }

  /**
   * Seleciona um boss aleatório próximo do DP médio
   */
  static async selectBoss(averageDp: number): Promise<Boss | null> {
    try {
      const response = await fetch("/api/bosses");
      if (!response.ok) return null;

      const allBosses: Boss[] = await response.json();
      if (allBosses.length === 0) return null;

      // Filtrar bosses com DP próximo (±50% do DP médio)
      const minDp = averageDp * 0.5;
      const maxDp = averageDp * 1.5;

      let suitableBosses = allBosses.filter(
        (boss) => boss.dp >= minDp && boss.dp <= maxDp
      );

      // Se não houver bosses adequados, pegar todos
      if (suitableBosses.length === 0) {
        suitableBosses = allBosses;
      }

      // Escolher aleatoriamente
      const randomIndex = Math.floor(Math.random() * suitableBosses.length);
      return suitableBosses[randomIndex];
    } catch (error) {
      console.error("❌ Erro ao buscar bosses:", error);
      return null;
    }
  }

  /**
   * Cria um GameBoss a partir de um Boss
   */
  static createGameBoss(
    boss: Boss,
    calculatedDp: number,
    currentTurn: number,
    totalAliveDigimons: number
  ): GameBoss {
    // HP do boss = DP * número de Digimons vivos * 0.5
    // Exemplo: Boss 18000 DP, 6 Digimons = 18000 * 6 * 0.5 = 54000 HP
    const maxHp = calculatedDp * totalAliveDigimons * 0.5;

    return {
      ...boss,
      currentHp: maxHp,
      maxHp: maxHp,
      calculatedDp: calculatedDp,
      spawnedAtTurn: currentTurn,
      isDefeated: false,
    };
  }

  /**
   * Spawna um novo boss no jogo
   */
  static async spawnBoss(
    players: GamePlayer[],
    currentTurn: number
  ): Promise<GameBoss | null> {
    const averageDp = this.calculateAverageDp(players);

    // Contar total de Digimons vivos
    let totalAliveDigimons = 0;
    for (const player of players) {
      totalAliveDigimons += player.digimons.filter(
        (d) => d.currentHp > 0
      ).length;
    }

    // Boss DP = média * total de Digimons vivos * 1.5
    // Exemplo: 6 Digimons com 2000 DP médio = 2000 * 6 * 1.5 = 18000 DP
    const bossMultiplier = Math.max(totalAliveDigimons * 1.5, 3); // Mínimo 3x
    const calculatedBossDp = averageDp * bossMultiplier;

    const boss = await this.selectBoss(calculatedBossDp);

    if (!boss) return null;

    return this.createGameBoss(
      boss,
      calculatedBossDp,
      currentTurn,
      totalAliveDigimons
    );
  }

  /**
   * Calcula dano do "Turno do Mundo" (boss ataca todos)
   * 50% do DP do boss dividido entre todos os Digimons vivos
   */
  static calculateWorldTurnDamage(
    boss: GameBoss,
    aliveDigimonsCount: number
  ): number {
    if (aliveDigimonsCount === 0) return 0;

    const totalDamage = boss.calculatedDp * 0.5;
    return Math.floor(totalDamage / aliveDigimonsCount);
  }

  /**
   * Executa o turno do mundo (boss ataca todos)
   */
  static executeWorldTurn(
    boss: GameBoss,
    players: GamePlayer[]
  ): { damagePerDigimon: number; affectedDigimons: number } {
    const aliveDigimons: GameDigimon[] = [];

    for (const player of players) {
      for (const digimon of player.digimons) {
        if (digimon.currentHp > 0) {
          aliveDigimons.push(digimon);
        }
      }
    }

    const damagePerDigimon = this.calculateWorldTurnDamage(
      boss,
      aliveDigimons.length
    );

    // Aplicar dano a todos
    for (const digimon of aliveDigimons) {
      digimon.currentHp = Math.max(0, digimon.currentHp - damagePerDigimon);
    }

    return {
      damagePerDigimon,
      affectedDigimons: aliveDigimons.length,
    };
  }

  /**
   * Verifica se é hora de spawnar um boss
   * Boss spawna após 2 turnos do início ou 2 turnos após derrotar o último
   */
  static shouldSpawnBoss(
    turnCount: number,
    lastBossDefeatedTurn?: number,
    activeBoss?: GameBoss | null
  ): boolean {
    // Já existe um boss ativo
    if (activeBoss && !activeBoss.isDefeated) return false;

    // Primeiro boss: turno 2
    if (lastBossDefeatedTurn === undefined) {
      return turnCount >= 2;
    }

    // Próximos bosses: 2 turnos após derrotar o último
    return turnCount >= lastBossDefeatedTurn + 2;
  }

  /**
   * Calcula recompensas do boss (drops)
   */
  static async calculateBossRewards(bossId: number): Promise<number[]> {
    try {
      const response = await fetch(`/api/bosses/drops?bossId=${bossId}`);
      if (!response.ok) return [];

      const drops = await response.json();
      const rewards: number[] = [];

      for (const drop of drops) {
        const roll = Math.floor(Math.random() * 100) + 1;
        if (roll <= drop.dropChance) {
          rewards.push(drop.itemId);
        }
      }

      return rewards;
    } catch (error) {
      console.error("❌ Erro ao calcular drops do boss:", error);
      return [];
    }
  }
}
