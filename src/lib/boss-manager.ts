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


      if (candidates.length === 0) {
        // Fallback: pegar qualquer boss disponível
        const randomIndex = Math.floor(Math.random() * bossDigimons.length);
        const selectedBoss = bossDigimons[randomIndex];

        return selectedBoss;
      }

      // Sortear aleatoriamente entre os candidatos
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const selectedBoss = candidates[randomIndex];


      return selectedBoss;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cria um GameBoss a partir de um Digimon
   *
   * SISTEMA ATUALIZADO:
   * - HP do Boss = HP original do Digimon × 3 (triplicado para maior desafio)
   * - ATK do Boss = ATK original do Digimon salvo no banco (mantém o mesmo)
   * - Se não houver valores no banco, usa fallback com valores gerados
   *
   * Exemplo: Devimon (HP: 695, ATK: 375)
   * - HP Máximo = 2.085 (695 × 3)
   * - ATK de Combate = 375
   */
  static createGameBoss(bossDigimon: Digimon, currentTurn: number): GameBoss {
    // Usar HP e ATK originais do banco, ou fallback para valores gerados
    let hp = bossDigimon.hp || 0;
    let atk = bossDigimon.atk || 0;

    // Fallback: se não houver HP/ATK no banco, usar sistema antigo
    if (hp === 0 || atk === 0) {
      const generated = generateBossStats(bossDigimon.level);
      hp = hp || generated.hp;
      atk = atk || generated.dp;
    }

    // TRIPLICAR o HP do boss para maior desafio
    const maxHp = hp * 3;

    // DP calculado = ATK do boss (usado para combate)
    const calculatedDp = atk;

    return {
      id: bossDigimon.id,
      name: bossDigimon.name,
      image: bossDigimon.image,
      description: "",
      effectId: 1,
      dp: atk, // DP base = ATK original
      typeId: bossDigimon.typeId,
      level: bossDigimon.level, // Adicionar nível do boss para cálculos de Armor
      currentHp: maxHp,
      maxHp: maxHp,
      calculatedDp: calculatedDp, // DP de combate = ATK original
      spawnedAtTurn: currentTurn,
      isDefeated: false,
    };
  }

  /**
   * Spawna um novo boss no jogo
   *
   * SISTEMA ATUALIZADO:
   * - Boss é selecionado baseado no nível mais comum dos jogadores + 1
   * - Boss usará HP e ATK originais salvos no banco de dados
   * - Valores são balanceados individualmente para cada boss
   */
  static async spawnBoss(
    players: GamePlayer[],
    currentTurn: number
  ): Promise<GameBoss | null> {
    // Encontrar o nível mais comum entre os Digimons vivos
    const mostCommonLevel = this.findMostCommonLevel(players);


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
   * Executa o turno do mundo (boss ataca jogador com maior aggro ou aleatório)
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
      playerId: number;
    }> = [];

    players.forEach((player, playerIndex) => {
      player.digimons.forEach((digimon, digimonIndex) => {
        if (digimon.currentHp > 0) {
          aliveDigimons.push({
            digimon,
            playerIndex,
            digimonIndex,
            playerId: player.id,
          });
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

    // 2. Escolher alvo baseado em aggro (Digimon específico)
    let target;

    if (
      boss.topAggroDigimonId !== undefined &&
      boss.topAggroDigimonId !== null
    ) {
      // Boss ataca o Digimon específico que causou mais dano
      const targetDigimon = aliveDigimons.find(
        (ad) => ad.digimon.id === boss.topAggroDigimonId
      );

      if (targetDigimon) {
        // Digimon com aggro ainda está vivo
        target = targetDigimon;
      } else {
        // Digimon com aggro está nocauteado, escolher aleatório
        const randomIndex = Math.floor(Math.random() * aliveDigimons.length);
        target = aliveDigimons[randomIndex];
      }
    } else {
      // Ninguém atacou o boss, escolher aleatório
      const randomIndex = Math.floor(Math.random() * aliveDigimons.length);
      target = aliveDigimons[randomIndex];
    }

    // 3. Calcular poder de ataque do boss (DP / 3)
    const bossPower = Math.ceil(boss.calculatedDp / 3 / 100) * 100;

    // 4. Calcular poder do Digimon alvo
    const targetPower = Math.ceil(target.digimon.dp / 3 / 100) * 100;

    // 5. Calcular defesa do Digimon (baseada no próprio poder)
    const targetDefenseBonus = target.digimon.defenseBonus || 0;
    const targetDefensePercentage = targetDefenseBonus * 2; // Cada ponto = 2%
    const targetDefense =
      Math.round((targetPower * (targetDefensePercentage / 100)) / 100) * 100;

    // 6. Calcular dano líquido (Poder boss - Defesa do Digimon)
    let netDamage = Math.max(0, bossPower - targetDefense);

    // 7. Limitar dano máximo a 1/3 da vida máxima do Digimon alvo
    const maxDamage = Math.ceil(target.digimon.dp / 3);
    if (netDamage > maxDamage) {
      netDamage = maxDamage;
    }

    // 8. Aplicar dano mínimo de 5
    if (netDamage > 0 && netDamage < 5) {
      netDamage = 5;
    }


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
      if (!Array.isArray(drops) || drops.length === 0) return [];

      // Sortear apenas 1 item com probabilidade proporcional ao dropChance
      const totalWeight = drops.reduce(
        (sum: number, d: { dropChance: number }) => sum + (d.dropChance || 0),
        0
      );
      if (totalWeight <= 0) return [];

      let r = Math.random() * totalWeight;
      for (const d of drops) {
        r -= d.dropChance || 0;
        if (r <= 0) {
          return [d.itemId];
        }
      }

      // Fallback (devido a ponto flutuante): retorna o último
      return [drops[drops.length - 1].itemId];
    } catch (error) {
      return [];
    }
  }
}
