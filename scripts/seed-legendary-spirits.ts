import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔥 Adicionando Espíritos Lendários dos Guerreiros...\n");

try {
  // Criar novo efeito de evolução por espírito
  const existingSpirit = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_spirit'")
    .get();

  let spiritEffectId;

  if (!existingSpirit) {
    console.log("📝 Criando efeito 'Evolução Espiritual'...");
    const result = db
      .prepare(
        `INSERT INTO effects (name, description, code, type, value) 
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        "Evolução Espiritual",
        "Permite evolução usando um Espírito Lendário",
        "evolution_spirit",
        "evolution",
        0
      );
    spiritEffectId = result.lastInsertRowid as number;
    console.log(`✅ Efeito criado (ID: ${spiritEffectId})\n`);
  } else {
    spiritEffectId = (existingSpirit as { id: number }).id;
    console.log(
      `✅ Efeito 'Evolução Espiritual' já existe (ID: ${spiritEffectId})\n`
    );
  }

  // Definir os 10 Espíritos Lendários (5 elementos x 2 spirits cada = 10 spirits)
  // Baseado em Digimon Frontier
  const spirits = [
    {
      name: "Espírito Humano do Fogo",
      description:
        "O espírito lendário do elemento Fogo. Permite a transformação em Agunimon.",
      dropChance: 8,
      targetDigimons: [], // Agunimon não está no banco ainda
    },
    {
      name: "Espírito Bestial do Fogo",
      description:
        "O espírito bestial do Fogo. Transforma em BurningGreymon/Vritramon.",
      dropChance: 5,
      targetDigimons: [85], // BurningGreymon
    },
    {
      name: "Espírito Humano da Luz",
      description:
        "O espírito lendário da Luz. Permite a transformação em Lobomon.",
      dropChance: 8,
      targetDigimons: [75], // Lobomon
    },
    {
      name: "Espírito Bestial da Luz",
      description:
        "O espírito bestial da Luz. Transforma em KendoGarurumon/Garmmon.",
      dropChance: 5,
      targetDigimons: [82], // KendoGarurumon
    },
    {
      name: "Espírito Humano do Gelo",
      description:
        "O espírito lendário do Gelo. Permite a transformação em Kumamon.",
      dropChance: 8,
      targetDigimons: [], // Kumamon não está no banco
    },
    {
      name: "Espírito Bestial do Gelo",
      description: "O espírito bestial do Gelo. Transforma em Korikakumon.",
      dropChance: 5,
      targetDigimons: [], // Korikakumon não está no banco
    },
    {
      name: "Espírito Humano do Vento",
      description:
        "O espírito lendário do Vento. Permite a transformação em Kazemon.",
      dropChance: 8,
      targetDigimons: [], // Kazemon não está no banco
    },
    {
      name: "Espírito Bestial do Vento",
      description: "O espírito bestial do Vento. Transforma em Zephyrmon.",
      dropChance: 5,
      targetDigimons: [], // Zephyrmon não está no banco
    },
    {
      name: "Espírito Humano do Trovão",
      description:
        "O espírito lendário do Trovão. Permite a transformação em Beetlemon.",
      dropChance: 8,
      targetDigimons: [], // Beetlemon não está no banco
    },
    {
      name: "Espírito Bestial do Trovão",
      description:
        "O espírito bestial do Trovão. Transforma em MetalKabuterimon.",
      dropChance: 5,
      targetDigimons: [], // MetalKabuterimon não está no banco
    },
    {
      name: "Espírito Humano das Trevas",
      description:
        "O espírito lendário das Trevas. Permite a transformação em Lowemon.",
      dropChance: 8,
      targetDigimons: [], // Lowemon não está no banco
    },
    {
      name: "Espírito Bestial das Trevas",
      description:
        "O espírito bestial das Trevas. Transforma em JagerLowemon/KaiserLeomon.",
      dropChance: 5,
      targetDigimons: [], // JagerLowemon não está no banco
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  console.log("📝 Criando Espíritos Lendários:\n");

  spirits.forEach((spirit) => {
    const result = stmt.run(
      spirit.name,
      spirit.description,
      "/images/items/fallback.svg",
      "",
      spiritEffectId,
      spirit.dropChance,
      JSON.stringify(spirit.targetDigimons)
    );
    console.log(`✅ ${spirit.name} (ID: ${result.lastInsertRowid})`);
    console.log(`   Drop Chance: ${spirit.dropChance}%`);
    console.log(
      `   Evoluções: ${
        spirit.targetDigimons.length > 0
          ? spirit.targetDigimons.length + " Digimon(s)"
          : "Aguardando cadastro"
      }`
    );
    console.log("");
  });

  console.log("═".repeat(70));
  console.log(`✅ ${spirits.length} Espíritos Lendários adicionados!`);
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
