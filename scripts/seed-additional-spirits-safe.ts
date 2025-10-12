import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log(
  "🔥 Adicionando Guerreiros e Espíritos Adicionais (Safe Mode)...\n"
);

try {
  // Buscar o efeito de evolução espiritual
  const spiritEffect = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_spirit'")
    .get() as { id: number } | undefined;

  if (!spiritEffect) {
    console.log("❌ Efeito 'evolution_spirit' não encontrado!");
    process.exit(1);
  }

  console.log(`✨ Efeito: Evolução Espiritual (ID: ${spiritEffect.id})\n`);

  // PARTE 1: Cadastrar novos guerreiros (Level 8 - Spirits)
  console.log("📝 CADASTRANDO/ATUALIZANDO GUERREIROS:\n");

  const warriorsToAdd = [
    { name: "grumblemon", typeId: 1 },
    { name: "gigasmon", typeId: 1 },
    { name: "arbormon", typeId: 2 },
    { name: "petaldramon", typeId: 2 },
    { name: "ranamon", typeId: 4 },
    { name: "calmaramon", typeId: 4 },
    { name: "sephirotmon", typeId: 5 },
    { name: "duskmon", typeId: 3 },
    { name: "velgemon", typeId: 3 },
    { name: "kaisergreymon", typeId: 1 },
  ];

  const warriorIds: { [key: string]: number } = {};

  warriorsToAdd.forEach((warrior) => {
    // Verificar se já existe
    const existing = db
      .prepare("SELECT id, level FROM digimons WHERE name = ?")
      .get(warrior.name) as { id: number; level: number } | undefined;

    if (existing) {
      // Atualizar para Level 8 se necessário
      if (existing.level !== 8) {
        db.prepare("UPDATE digimons SET level = 8 WHERE id = ?").run(
          existing.id
        );
        console.log(
          `✅ ${warrior.name.toUpperCase()} (ID: ${
            existing.id
          }) - Atualizado para Level 8`
        );
      } else {
        console.log(
          `ℹ️  ${warrior.name.toUpperCase()} (ID: ${
            existing.id
          }) - Já é Level 8`
        );
      }
      warriorIds[warrior.name] = existing.id;
    } else {
      // Criar novo
      const result = db
        .prepare(
          `INSERT INTO digimons (name, level, typeId, image, evolution, active, boss)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          warrior.name,
          8, // Level 8 - Spirits
          warrior.typeId,
          "/images/digimons/fallback.svg",
          "[]",
          1, // active
          0 // boss
        );

      const insertedId = result.lastInsertRowid as number;
      warriorIds[warrior.name] = insertedId;
      console.log(
        `✅ ${warrior.name.toUpperCase()} (ID: ${insertedId}) - NOVO`
      );
    }
  });

  // Adicionar Mercurymon e MagnaGarurumon existentes
  const mercurymon = db
    .prepare("SELECT id FROM digimons WHERE name = 'mercurymon'")
    .get() as { id: number } | undefined;

  if (mercurymon) {
    db.prepare("UPDATE digimons SET level = 8 WHERE id = ?").run(mercurymon.id);
    warriorIds["mercurymon"] = mercurymon.id;
    console.log(
      `✅ MERCURYMON (ID: ${mercurymon.id}) - Atualizado para Level 8`
    );
  }

  const magnagarurumon = db
    .prepare("SELECT id FROM digimons WHERE name = 'magnagarurumon'")
    .get() as { id: number } | undefined;

  if (magnagarurumon) {
    db.prepare("UPDATE digimons SET level = 8 WHERE id = ?").run(
      magnagarurumon.id
    );
    warriorIds["magnagarurumon"] = magnagarurumon.id;
    console.log(
      `✅ MAGNAGARURUMON (ID: ${magnagarurumon.id}) - Atualizado para Level 8`
    );
  }

  // PARTE 2: Criar os espíritos
  console.log("\n📝 CRIANDO ESPÍRITOS:\n");

  const newSpirits = [
    // TERRA
    {
      name: "Espírito Humano da Terra",
      description: "O espírito lendário da Terra. Transforma em Grumblemon.",
      dropChance: 8,
      targetDigimons: [warriorIds["grumblemon"]],
    },
    {
      name: "Espírito Bestial da Terra",
      description: "O espírito bestial da Terra. Transforma em Gigasmon.",
      dropChance: 5,
      targetDigimons: [warriorIds["gigasmon"]],
    },
    // MADEIRA
    {
      name: "Espírito Humano da Madeira",
      description: "O espírito lendário da Madeira. Transforma em Arbormon.",
      dropChance: 8,
      targetDigimons: [warriorIds["arbormon"]],
    },
    {
      name: "Espírito Bestial da Madeira",
      description: "O espírito bestial da Madeira. Transforma em Petaldramon.",
      dropChance: 5,
      targetDigimons: [warriorIds["petaldramon"]],
    },
    // ÁGUA
    {
      name: "Espírito Humano da Água",
      description: "O espírito lendário da Água. Transforma em Ranamon.",
      dropChance: 8,
      targetDigimons: [warriorIds["ranamon"]],
    },
    {
      name: "Espírito Bestial da Água",
      description: "O espírito bestial da Água. Transforma em Calmaramon.",
      dropChance: 5,
      targetDigimons: [warriorIds["calmaramon"]],
    },
    // AÇO
    {
      name: "Espírito Humano do Aço",
      description: "O espírito lendário do Aço. Transforma em Mercurymon.",
      dropChance: 8,
      targetDigimons: [warriorIds["mercurymon"]],
    },
    {
      name: "Espírito Bestial do Aço",
      description: "O espírito bestial do Aço. Transforma em Sephirotmon.",
      dropChance: 5,
      targetDigimons: [warriorIds["sephirotmon"]],
    },
    // TREVAS CORROMPIDO
    {
      name: "Espírito Humano das Trevas Corrompidas",
      description: "O espírito corrompido das Trevas. Transforma em Duskmon.",
      dropChance: 6,
      targetDigimons: [warriorIds["duskmon"]],
    },
    {
      name: "Espírito Bestial das Trevas Corrompidas",
      description: "O espírito bestial corrompido. Transforma em Velgemon.",
      dropChance: 4,
      targetDigimons: [warriorIds["velgemon"]],
    },
    // HÍBRIDOS FINAIS (muito raros)
    {
      name: "Espírito do Dragão Supremo",
      description:
        "Fusão dos 5 Espíritos do Fogo. Transforma em KaiserGreymon.",
      dropChance: 2,
      targetDigimons: [warriorIds["kaisergreymon"]],
    },
    {
      name: "Espírito do Lobo Supremo",
      description:
        "Fusão dos 5 Espíritos da Luz. Transforma em MagnaGarurumon.",
      dropChance: 2,
      targetDigimons: [warriorIds["magnagarurumon"]],
    },
  ];

  const stmtSpirit = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  newSpirits.forEach((spirit) => {
    if (spirit.targetDigimons[0]) {
      const result = stmtSpirit.run(
        spirit.name,
        spirit.description,
        "/images/items/fallback.svg",
        "",
        spiritEffect.id,
        spirit.dropChance,
        JSON.stringify(spirit.targetDigimons)
      );
      console.log(`✅ ${spirit.name} (ID: ${result.lastInsertRowid})`);
      console.log(`   Drop: ${spirit.dropChance}%`);
      console.log(`   Guerreiro: ID ${spirit.targetDigimons[0]}`);
      console.log("");
    } else {
      console.log(`⚠️  ${spirit.name} - Guerreiro não encontrado`);
    }
  });

  console.log("═".repeat(70));
  console.log(`✅ Guerreiros e Espíritos adicionados com sucesso!`);
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
