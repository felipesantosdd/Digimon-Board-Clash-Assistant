import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🎒 Cadastrando novos itens utilitários...\n");

try {
  // Criar efeitos necessários
  const effects = [
    {
      code: "movement_boost",
      name: "Aumento de Movimento",
      description: "Permite mover casas adicionais no tabuleiro",
      type: "special",
      value: 0,
    },
    {
      code: "dice_attack_boost",
      name: "Bônus de Ataque",
      description: "Adiciona bônus permanente nos dados de ataque",
      type: "buff",
      value: 0,
    },
    {
      code: "dice_defense_boost",
      name: "Bônus de Defesa",
      description: "Adiciona bônus permanente nos dados de defesa",
      type: "buff",
      value: 0,
    },
  ];

  console.log("📝 Criando efeitos necessários:\n");

  const effectIds: { [key: string]: number } = {};

  effects.forEach((effect) => {
    const existing = db
      .prepare("SELECT id FROM effects WHERE code = ?")
      .get(effect.code) as { id: number } | undefined;

    if (existing) {
      effectIds[effect.code] = existing.id;
      console.log(`✅ ${effect.name} já existe (ID: ${existing.id})`);
    } else {
      const result = db
        .prepare(
          `INSERT INTO effects (name, description, code, type, value) VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          effect.name,
          effect.description,
          effect.code,
          effect.type,
          effect.value
        );
      effectIds[effect.code] = result.lastInsertRowid as number;
      console.log(`✅ ${effect.name} criado (ID: ${result.lastInsertRowid})`);
    }
  });

  console.log("\n" + "═".repeat(70));
  console.log("\n📝 Cadastrando itens:\n");

  const items = [
    // PORTÃO DIMENSIONAL
    {
      name: "Portão Dimensional",
      description:
        "Permite movimento instantâneo. O Digimon pode andar 10 casas a mais no tabuleiro.",
      effectId: effectIds["movement_boost"],
      dropChance: 10,
      image: "/images/items/fallback.svg",
    },

    // CHIPS DE RECUPERAÇÃO (10 itens - baseados nas faixas de HP do sistema)
    {
      name: "Chip de Recuperação Pequeno",
      description: "Restaura 2.000 HP",
      effectId: null, // Efeito de cura será via código
      dropChance: 30,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Médio I",
      description: "Restaura 4.000 HP",
      effectId: null,
      dropChance: 25,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Médio II",
      description: "Restaura 6.000 HP",
      effectId: null,
      dropChance: 20,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Grande I",
      description: "Restaura 8.000 HP",
      effectId: null,
      dropChance: 18,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Grande II",
      description: "Restaura 10.000 HP",
      effectId: null,
      dropChance: 15,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Super I",
      description: "Restaura 12.000 HP",
      effectId: null,
      dropChance: 12,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Super II",
      description: "Restaura 14.000 HP",
      effectId: null,
      dropChance: 10,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Mega",
      description: "Restaura 16.000 HP",
      effectId: null,
      dropChance: 8,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Ultra",
      description: "Restaura 20.000 HP",
      effectId: null,
      dropChance: 6,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Recuperação Total",
      description: "Restaura 24.000 HP (HP máximo do sistema)",
      effectId: null,
      dropChance: 4,
      image: "/images/items/fallback.svg",
    },

    // CHIPS DE FORÇA (Ataque)
    {
      name: "Chip de Força P",
      description: "Bônus permanente: +5 nos dados de ataque",
      effectId: effectIds["dice_attack_boost"],
      dropChance: 20,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Força M",
      description: "Bônus permanente: +10 nos dados de ataque",
      effectId: effectIds["dice_attack_boost"],
      dropChance: 12,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Força G",
      description: "Bônus permanente: +15 nos dados de ataque",
      effectId: effectIds["dice_attack_boost"],
      dropChance: 6,
      image: "/images/items/fallback.svg",
    },

    // CHIPS DE DEFESA
    {
      name: "Chip de Defesa P",
      description: "Bônus permanente: +5 nos dados de defesa",
      effectId: effectIds["dice_defense_boost"],
      dropChance: 20,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Defesa M",
      description: "Bônus permanente: +10 nos dados de defesa",
      effectId: effectIds["dice_defense_boost"],
      dropChance: 12,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Chip de Defesa G",
      description: "Bônus permanente: +15 nos dados de defesa",
      effectId: effectIds["dice_defense_boost"],
      dropChance: 6,
      image: "/images/items/fallback.svg",
    },

    // ACESSÓRIOS DE BOTAS (Movimento)
    {
      name: "Botas Rápidas",
      description: "Permite andar +1 casa adicional no tabuleiro",
      effectId: effectIds["movement_boost"],
      dropChance: 25,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Botas Ágeis",
      description: "Permite andar +2 casas adicionais no tabuleiro",
      effectId: effectIds["movement_boost"],
      dropChance: 18,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Botas Velozes",
      description: "Permite andar +3 casas adicionais no tabuleiro",
      effectId: effectIds["movement_boost"],
      dropChance: 12,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Botas Supersônicas",
      description: "Permite andar +4 casas adicionais no tabuleiro",
      effectId: effectIds["movement_boost"],
      dropChance: 8,
      image: "/images/items/fallback.svg",
    },
    {
      name: "Botas da Luz",
      description: "Permite andar +5 casas adicionais no tabuleiro",
      effectId: effectIds["movement_boost"],
      dropChance: 5,
      image: "/images/items/fallback.svg",
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  items.forEach((item) => {
    const result = stmt.run(
      item.name,
      item.description,
      item.image,
      "",
      item.effectId || null,
      item.dropChance,
      "[]"
    );
    console.log(`✅ ${item.name} (ID: ${result.lastInsertRowid})`);
    console.log(`   Drop: ${item.dropChance}%`);
  });

  console.log("\n" + "═".repeat(70));
  console.log(`✅ ${items.length} itens cadastrados!`);
  console.log("═".repeat(70));
  console.log("\n📊 RESUMO:");
  console.log("   • 1 Portão Dimensional (movimento +10)");
  console.log("   • 10 Chips de Recuperação (2k a 24k HP)");
  console.log("   • 6 Chips de Força/Defesa (P/M/G)");
  console.log("   • 5 Acessórios de Botas (velocidade +1 a +5)");
  console.log("");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
