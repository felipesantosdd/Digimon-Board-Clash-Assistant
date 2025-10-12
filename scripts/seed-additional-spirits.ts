import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔥 Adicionando Guerreiros e Espíritos Adicionais...\n");

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
  console.log("📝 CADASTRANDO NOVOS GUERREIROS:\n");

  const newWarriors = [
    // TERRA
    { name: "grumblemon", typeId: 1 }, // Data
    { name: "gigasmon", typeId: 1 }, // Data
    // MADEIRA
    { name: "arbormon", typeId: 2 }, // Vaccine
    { name: "petaldramon", typeId: 2 }, // Vaccine
    // ÁGUA
    { name: "ranamon", typeId: 4 }, // Free
    { name: "calmaramon", typeId: 4 }, // Free
    // AÇO (Mercurymon já existe)
    { name: "sephirotmon", typeId: 5 }, // Variable
    // TREVAS CORROMPIDO
    { name: "duskmon", typeId: 3 }, // Virus
    { name: "velgemon", typeId: 3 }, // Virus
    // HÍBRIDO FINAL DO FOGO
    { name: "kaisergreymon", typeId: 1 }, // Data (EmperorGreymon)
    // MagnaGarurumon já existe (ID: 91), será atualizado
  ];

  const stmtWarrior = db.prepare(`
    INSERT INTO digimons (name, level, typeId, image, evolution, active, boss)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const warriorIds: { [key: string]: number } = {};

  newWarriors.forEach((warrior) => {
    const result = stmtWarrior.run(
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
    console.log(`✅ ${warrior.name.toUpperCase()} (ID: ${insertedId})`);
  });

  // Verificar se Mercurymon e MagnaGarurumon existem e adicionar ao mapeamento
  const mercurymon = db
    .prepare("SELECT id FROM digimons WHERE name = 'mercurymon'")
    .get() as { id: number } | undefined;

  if (mercurymon) {
    // Atualizar Mercurymon para Level 8
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
    // Atualizar MagnaGarurumon para Level 8
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
      description:
        "O espírito corrompido das Trevas. Transforma em Duskmon.",
      dropChance: 6,
      targetDigimons: [warriorIds["duskmon"]],
    },
    {
      name: "Espírito Bestial das Trevas Corrompidas",
      description:
        "O espírito bestial corrompido. Transforma em Velgemon.",
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
  });

  console.log("═".repeat(70));
  console.log(`✅ ${newWarriors.length} guerreiros cadastrados!`);
  console.log(`✅ ${newSpirits.length} espíritos criados!`);
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");

