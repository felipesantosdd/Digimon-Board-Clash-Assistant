import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("📿 Adicionando Emblemas (Crests) da série Digimon Adventure...\n");

try {
  // Criar novo efeito de evolução por emblema
  const existingCrest = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_crest'")
    .get();

  let crestEffectId;

  if (!existingCrest) {
    console.log("📝 Criando efeito 'Evolução por Emblema'...");
    const result = db
      .prepare(
        `INSERT INTO effects (name, description, code, type, value) 
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        "Evolução por Emblema",
        "Permite evolução usando um Emblema lendário da série Adventure",
        "evolution_crest",
        "evolution",
        0
      );
    crestEffectId = result.lastInsertRowid as number;
    console.log(`✅ Efeito criado (ID: ${crestEffectId})\n`);
  } else {
    crestEffectId = (existingCrest as { id: number }).id;
    console.log(
      `✅ Efeito 'Evolução por Emblema' já existe (ID: ${crestEffectId})\n`
    );
  }

  // Definir os 8 Emblemas da série Adventure
  const crests = [
    {
      name: "Emblema da Coragem",
      description:
        "O emblema de Tai Kamiya. Permite evolução para formas supremas do fogo e dragão.",
      dropChance: 5,
      targetDigimons: [], // WarGreymon ainda não cadastrado
    },
    {
      name: "Emblema da Amizade",
      description:
        "O emblema de Matt Ishida. Permite evolução para lobos supremos de gelo.",
      dropChance: 5,
      targetDigimons: [], // MetalGarurumon ainda não cadastrado
    },
    {
      name: "Emblema do Amor",
      description:
        "O emblema de Sora Takenouchi. Permite evolução para aves supremas.",
      dropChance: 5,
      targetDigimons: [295], // Garudamon
    },
    {
      name: "Emblema do Conhecimento",
      description:
        "O emblema de Izzy Izumi. Permite evolução para insetos supremos.",
      dropChance: 5,
      targetDigimons: [], // MegaKabuterimon ainda não cadastrado
    },
    {
      name: "Emblema da Sinceridade",
      description:
        "O emblema de Mimi Tachikawa. Permite evolução para formas supremas da natureza.",
      dropChance: 5,
      targetDigimons: [446, 506], // Rosemon, Rosemon Burst Mode
    },
    {
      name: "Emblema da Confiabilidade",
      description:
        "O emblema de Joe Kido. Permite evolução para guerreiros supremos do mar.",
      dropChance: 5,
      targetDigimons: [302, 107], // Zudomon, Vikemon
    },
    {
      name: "Emblema da Esperança",
      description:
        "O emblema de T.K. Takaishi. Permite evolução para anjos supremos.",
      dropChance: 5,
      targetDigimons: [106, 142], // Seraphimon, ShadowSeraphimon
    },
    {
      name: "Emblema da Luz",
      description:
        "O emblema de Kari Kamiya. Permite evolução para seres divinos da luz.",
      dropChance: 5,
      targetDigimons: [109, 111, 112], // Angewomon, Ophanimon, Ophanimon Falldown Mode
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  console.log("📝 Criando Emblemas:\n");

  crests.forEach((crest) => {
    const result = stmt.run(
      crest.name,
      crest.description,
      "/images/items/fallback.svg",
      "",
      crestEffectId,
      crest.dropChance,
      JSON.stringify(crest.targetDigimons)
    );
    console.log(`✅ ${crest.name} (ID: ${result.lastInsertRowid})`);
    console.log(`   Drop Chance: ${crest.dropChance}% (RARO!)`);
    console.log(
      `   Evoluções: ${
        crest.targetDigimons.length > 0
          ? crest.targetDigimons.length + " Digimon(s)"
          : "Aguardando cadastro"
      }`
    );
    if (crest.targetDigimons.length > 0) {
      console.log(`   IDs: [${crest.targetDigimons.join(", ")}]`);
    }
    console.log("");
  });

  console.log("═".repeat(70));
  console.log(`✅ ${crests.length} Emblemas adicionados!`);
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
