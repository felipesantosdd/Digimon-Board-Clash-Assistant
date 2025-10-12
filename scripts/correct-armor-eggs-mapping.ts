import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔧 Corrigindo mapeamento correto dos Armor Eggs...\n");

try {
  // Buscar o efeito de evolução armor
  const evolutionEffect = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_armor'")
    .get() as { id: number } | undefined;

  if (!evolutionEffect) {
    console.log("❌ Efeito 'evolution_armor' não encontrado!");
    process.exit(1);
  }

  // Deletar TODOS os ovos existentes para recomeçar do zero
  console.log("🗑️  Removendo todos os ovos existentes...");
  db.prepare("DELETE FROM items WHERE name LIKE '%Ovo%' OR name LIKE '%Egg%'").run();
  console.log("✅ Ovos removidos!\n");

  // Mapeamento CORRETO baseado na série Digimon Adventure 02
  const correctMapping = [
    {
      name: "Ovo da Coragem",
      description: "O ovo do valor e bravura. Veemon usa para se tornar Flamedramon.",
      dropChance: 15,
      // Veemon evoluções com Coragem
      targetDigimons: [523], // Flamedramon (Shadramon é outra linha)
    },
    {
      name: "Ovo da Amizade",
      description: "O ovo dos laços eternos. Veemon usa para se tornar Raidramon.",
      dropChance: 15,
      // Veemon evoluções com Amizade
      targetDigimons: [524], // Raidramon
    },
    {
      name: "Ovo do Amor",
      description: "O ovo da compaixão e cuidado. Gatomon usa para se tornar Nefertimon.",
      dropChance: 15,
      // Gatomon evoluções com Amor
      targetDigimons: [526], // Nefertimon
    },
    {
      name: "Ovo da Pureza",
      description: "O ovo da inocência e sinceridade. Gatomon usa para se tornar Pegasusmon em algumas versões.",
      dropChance: 15,
      // Gatomon outras evoluções
      targetDigimons: [535], // Harpymon (Gatomon linha alternativa)
    },
    {
      name: "Ovo do Conhecimento",
      description: "O ovo da sabedoria e estratégia. Armadillomon usa para se tornar Digmon.",
      dropChance: 15,
      // Armadillomon evoluções com Conhecimento
      targetDigimons: [132], // Digmon
    },
    {
      name: "Ovo da Confiabilidade",
      description: "O ovo da lealdade inabalável. Armadillomon usa para se tornar Submarimon.",
      dropChance: 15,
      // Armadillomon evoluções com Confiabilidade
      targetDigimons: [538], // Submarimon
    },
    {
      name: "Ovo da Esperança",
      description: "O ovo da luz e renovação. Patamon usa para se tornar Pegasusmon.",
      dropChance: 15,
      // Patamon evoluções com Esperança
      targetDigimons: [98], // Pegasusmon
    },
    {
      name: "Ovo da Luz",
      description: "O ovo que dissipa as trevas. Usado por diversos Digimons.",
      dropChance: 15,
      // Evoluções com Luz (vários podem usar)
      targetDigimons: [151, 533], // Halsemon, Mantaraymon
    },
    {
      name: "Ovo da Gentileza",
      description: "O ovo da bondade e empatia. Wormmon usa para se tornar Shurimon.",
      dropChance: 15,
      // Wormmon evoluções com Gentileza
      targetDigimons: [525, 534, 537], // Shurimon, Sheepmon, Pipismon
    },
    {
      name: "Ovo dos Milagres",
      description: "O ovo lendário e raro. Veemon usa para se tornar Magnamon.",
      dropChance: 10,
      // Evoluções raras e especiais
      targetDigimons: [518, 539], // Magnamon, Goldveedramon
    },
    {
      name: "Ovo do Destino",
      description: "O ovo do potencial oculto. Usado por diversos Digimons para formas únicas.",
      dropChance: 10,
      // Evoluções únicas e especiais (linhas alternativas, formas raras)
      targetDigimons: [527, 528, 529, 530, 531, 532, 536, 540, 541, 522, 317], 
      // Shadramon, Quetzalmon, Yasyamon, Opossummon, Lynxmon, Togemogumon, 
      // Sethmon, Maildramon, Thunderbirmon, Sagittarimon, Rapidmon Perfect
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  console.log("📝 Criando ovos com mapeamento correto:\n");

  correctMapping.forEach((egg) => {
    const result = stmt.run(
      egg.name,
      egg.description,
      "/images/items/fallback.svg",
      "",
      evolutionEffect.id,
      egg.dropChance,
      JSON.stringify(egg.targetDigimons)
    );
    console.log(`✅ ${egg.name} (ID: ${result.lastInsertRowid})`);
    console.log(`   Evoluções: ${egg.targetDigimons.length} Digimon(s)`);
    console.log(`   IDs: [${egg.targetDigimons.join(", ")}]`);
    console.log("");
  });

  console.log("═".repeat(70));
  console.log("✅ Mapeamento corrigido com sucesso!");
  console.log(`✅ Total: ${correctMapping.length} Armor Eggs`);
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");

