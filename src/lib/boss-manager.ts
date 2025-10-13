import { GameBoss, GameDigimon, GamePlayer } from "@/types/game";
import { Digimon } from "@/app/database/database_type";
import { generateBossStats } from "@/lib/utils";

/**
 * Gerenciador de Bosses
 * Responsável por spawnar, calcular stats e gerenciar mecânicas de bosses
 */
export class BossManager {
  /**
   * Conta Digimons por nível e retorna o nível mais comum
   */
  static countDigimonsByLevel(players: GamePlayer[]): {
    [level: number]: number;
  } {
    const levelCount: { [level: number]: number } = {};

    for (const player of players) {
      for (const digimon of player.digimons) {
        if (digimon.currentHp > 0) {
          levelCount[digimon.level] = (levelCount[digimon.level] || 0) + 1;
        }
      }
    }

    return levelCount;
  }

  /**
   * Encontra o nível com mais Digimons
   */
  static findMostCommonLevel(players: GamePlayer[]): number {
    const levelCount = this.countDigimonsByLevel(players);

    if (Object.keys(levelCount).length === 0) return 1; // Fallback

    const mostCommonLevel = Object.entries(levelCount).reduce(
      (max, [level, count]) => {
        return count > max.count ? { level: parseInt(level), count } : max;
      },
      { level: 1, count: 0 }
    );

    return mostCommonLevel.level;
  }

  /**
   * Seleciona um boss baseado no nível mais comum dos jogadores
   *
   * NOVA LÓGICA:
   * 1. Conta quantos Digimons existem de cada nível
   * 2. Boss será do nível com mais Digimons + 1
   * 3. Se houver múltiplos bosses do mesmo nível, sorteia aleatoriamente
   *
   * Exemplo: 3 Level 1, 2 Level 2, 1 Level 3
   * - Boss será Level 2 (mais comum + 1)
   *
   * Exemplo: 2 Level 1, 2 Level 2
   * - Boss será Level 3 (mais comum + 1, sorteio se houver empate)
   */
  static async selectBoss(mostCommonLevel: number): Promise<Digimon | null> {
    try {
      const response = await fetch("/api/digimons");
      if (!response.ok) return null;

      const allDigimons: Digimon[] = await response.json();

      // Filtrar apenas Digimons marcados como boss
      const bossDigimons = allDigimons.filter((d) => d.boss === true);
      if (bossDigimons.length === 0) return null;

      // Boss será do nível mais comum + 1
      const bossLevel = mostCommonLevel + 1;

      // Filtrar bosses do nível desejado
      const candidates = bossDigimons.filter((d) => d.level === bossLevel);

      console.log("🎲 [BOSS] Seleção:", {
        nivelMaisComum: mostCommonLevel,
        nivelBoss: bossLevel,
        candidatos: candidates.map((d) => `${d.name} (Level ${d.level})`),
      });

      if (candidates.length === 0) {
        // Fallback: pegar qualquer boss disponível
        const randomIndex = Math.floor(Math.random() * bossDigimons.length);
        const selectedBoss = bossDigimons[randomIndex];

        console.log(
          `⚠️ [BOSS] Nenhum boss Level ${bossLevel}, usando fallback: ${selectedBoss.name}`
        );
        return selectedBoss;
      }

      // Sortear aleatoriamente entre os candidatos
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const selectedBoss = candidates[randomIndex];

      console.log(
        `✅ [BOSS] Selecionado: ${selectedBoss.name} (Level ${selectedBoss.level})`
      );

      return selectedBoss;
    } catch (error) {
      console.error("❌ Erro ao buscar bosses:", error);
      return null;
    }
  }

  /**
   * Cria um GameBoss a partir de um Digimon
   *
   * NOVO SISTEMA DE BALANCEAMENTO:
   * - HP do Boss = valor máximo do nível × 3
   * - DP de Combate = valor máximo do nível (para dano/defesa equilibrados)
   *
   * Exemplo: Devimon Level 2
   * - DP máximo Level 2 = 6.000
   * - HP Máximo = 6.000 × 3 = 18.000 HP
   * - DP de Combate = 6.000 (usado para atacar/defender)
   */
  static createGameBoss(bossDigimon: Digimon, currentTurn: number): GameBoss {
    // Gerar stats máximos para o nível do boss
    const { hp, dp } = generateBossStats(bossDigimon.level);

    return {
      id: bossDigimon.id,
      name: bossDigimon.name,
      image: bossDigimon.image,
      description: "",
      effectId: 1,
      dp: dp, // DP base (não usado mais no cálculo)
      typeId: bossDigimon.typeId,
      level: bossDigimon.level, // Adicionar nível do boss para cálculos de Armor
      currentHp: hp,
      maxHp: hp,
      calculatedDp: dp, // DP de combate = valor máximo do nível
      spawnedAtTurn: currentTurn,
      isDefeated: false,
    };
  }

  /**
   * Spawna um novo boss no jogo
   *
   * NOVO SISTEMA:
   * - Boss é selecionado baseado no nível mais comum dos jogadores + 1
   * - Boss terá HP = valor máximo do nível × 3
   * - Boss usará valor máximo do nível para combate
   */
  static async spawnBoss(
    players: GamePlayer[],
    currentTurn: number
  ): Promise<GameBoss | null> {
    // Encontrar o nível mais comum entre os Digimons vivos
    const mostCommonLevel = this.findMostCommonLevel(players);

    console.log("🎲 [BOSS] Análise de níveis:", {
      contagemPorNivel: this.countDigimonsByLevel(players),
      nivelMaisComum: mostCommonLevel,
    });

    // Selecionar boss do nível mais comum + 1
    const bossDigimon = await this.selectBoss(mostCommonLevel);

    if (!bossDigimon) return null;

    return this.createGameBoss(bossDigimon, currentTurn);
  }

  /**
   * Calcula dano do "Turno do Mundo" (boss ataca todos)
   *
   * NOVO SISTEMA:
   * - Dano total = DP calculado × 0.5
   * - Dividido igualmente entre todos os Digimons vivos
   *
   * Exemplo: Devimon Level 2 (6.000 DP) vs 6 Digimons
   * - Dano total = 6.000 × 0.5 = 3.000
   * - Por Digimon = 3.000 / 6 = 500 dano
   */
  static calculateWorldTurnDamage(
    boss: GameBoss,
    aliveDigimonsCount: number
  ): number {
    if (aliveDigimonsCount === 0) return 0;

    const totalDamage = boss.calculatedDp * 0.5; // Usar DP calculado (valor máximo do nível)
    const damagePerDigimon = totalDamage / aliveDigimonsCount;

    // Arredondar para múltiplo de 100
    return Math.round(damagePerDigimon / 100) * 100;
  }

  /**
   * Executa o turno do mundo (boss ataca UM Digimon aleatório com poder fixo)
   */
  static executeWorldTurn(
    boss: GameBoss,
    players: GamePlayer[]
  ): {
    damageDealt: number;
    targetDigimonName: string;
    bossPower: number;
    targetDefense: number;
    updatedPlayers: GamePlayer[];
  } {
    // 1. Coletar todos os Digimons vivos
    const aliveDigimons: Array<{
      digimon: GameDigimon;
      playerIndex: number;
      digimonIndex: number;
    }> = [];

    players.forEach((player, playerIndex) => {
      player.digimons.forEach((digimon, digimonIndex) => {
        if (digimon.currentHp > 0) {
          aliveDigimons.push({ digimon, playerIndex, digimonIndex });
        }
      });
    });

    if (aliveDigimons.length === 0) {
      return {
        damageDealt: 0,
        targetDigimonName: "",
        bossPower: 0,
        targetDefense: 0,
        updatedPlayers: players,
      };
    }

    // 2. Escolher um Digimon aleatório
    const randomIndex = Math.floor(Math.random() * aliveDigimons.length);
    const target = aliveDigimons[randomIndex];

    // 3. Calcular poder de ataque do boss (DP / 4 - rebalanceado)
    const bossPower = Math.ceil((boss.calculatedDp / 4) / 100) * 100;

    // 4. Calcular poder do Digimon alvo
    const targetPower = Math.ceil((target.digimon.dp / 3) / 100) * 100;

    // 5. Calcular defesa do Digimon (baseada no próprio poder)
    const targetDefenseBonus = target.digimon.defenseBonus || 0;
    const targetDefensePercentage = targetDefenseBonus * 2; // Cada ponto = 2%
    const targetDefense = Math.round(
      (targetPower * (targetDefensePercentage / 100)) / 100
    ) * 100;

    // 6. Calcular dano líquido (Poder boss - Defesa do Digimon)
    let netDamage = Math.max(0, bossPower - targetDefense);

    // 7. Aplicar dano mínimo de 5
    if (netDamage > 0 && netDamage < 5) {
      netDamage = 5;
    }

    console.log("👹 [BOSS WORLD TURN] Cálculos:", {
      bossPower,
      targetName: target.digimon.name,
      targetPower,
      targetDefense,
      danoFinal: netDamage,
    });

    // 8. Criar nova estrutura de players com dano aplicado
    const updatedPlayers = players.map((player, pIdx) => ({
      ...player,
      digimons: player.digimons.map((digimon, dIdx) => {
        if (pIdx === target.playerIndex && dIdx === target.digimonIndex) {
          return {
            ...digimon,
            currentHp: Math.max(0, digimon.currentHp - netDamage),
          };
        }
        return digimon;
      }),
    }));

    return {
      damageDealt: netDamage,
      targetDigimonName: target.digimon.name,
      bossPower,
      targetDefense,
      updatedPlayers,
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
