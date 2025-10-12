import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🥚 Adicionando todos os 11 Armor Eggs...\n");

try {
  // Buscar o efeito de evolução armor
  const evolutionEffect = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_armor'")
    .get() as { id: number; name: string } | undefined;

  if (!evolutionEffect) {
    console.log("❌ Efeito 'evolution_armor' não encontrado!");
    process.exit(1);
  }

  console.log(
    `✨ Efeito encontrado: ${evolutionEffect.name} (ID: ${evolutionEffect.id})\n`
  );

  // Atualizar os ovos existentes com effectId correto
  const existingEggs = [10, 11, 12, 13, 14]; // IDs dos ovos existentes

  existingEggs.forEach((id) => {
    db.prepare("UPDATE items SET effectId = ? WHERE id = ?").run(
      evolutionEffect.id,
      id
    );
  });
  console.log(
    `✅ Atualizados ${existingEggs.length} ovos existentes com effectId correto\n`
  );

  // Definir os novos ovos (os 6 faltantes)
  const newEggs = [
    {
      name: "Ovo da Amizade",
      description: "Fortalece laços e trabalho em equipe entre parceiros.",
      image: "/images/items/fallback.svg",
      dropChance: 15,
      targetDigimons: [524, 522, 531], // Raidramon, Sagittarimon, Lynxmon
    },
    {
      name: "Ovo da Confiabilidade",
      description: "Amplifica a determinação e lealdade inabalável.",
      image: "/images/items/fallback.svg",
      dropChance: 15,
      targetDigimons: [538, 530], // Submarimon, Opossummon
    },
    {
      name: "Ovo da Esperança",
      description: "Ilumina caminhos com otimismo e renovação.",
      image: "/images/items/fallback.svg",
      dropChance: 15,
      targetDigimons: [98, 540], // Pegasusmon, Maildramon
    },
    {
      name: "Ovo da Luz",
      description: "Dissipa trevas com poder radiante e puro.",
      image: "/images/items/fallback.svg",
      dropChance: 15,
      targetDigimons: [526, 533], // Nefertimon, Mantaraymon
    },
    {
      name: "Ovo da Gentileza",
      description: "Promove compaixão e empatia em batalhas.",
      image: "/images/items/fallback.svg",
      dropChance: 15,
      targetDigimons: [537, 534], // Pipismon, Sheepmon
    },
    {
      name: "Ovo do Destino",
      description: "Desbloqueia potencial oculto e destino único.",
      image: "/images/items/fallback.svg",
      dropChance: 10,
      targetDigimons: [529, 536, 541, 532, 317], // Yasyamon, Sethmon, Thunderbirmon, Togemogumon, Rapidmon Perfect
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  newEggs.forEach((egg) => {
    const result = stmt.run(
      egg.name,
      egg.description,
      egg.image,
      "",
      evolutionEffect.id,
      egg.dropChance,
      JSON.stringify(egg.targetDigimons)
    );
    console.log(`✅ ${egg.name} adicionado (ID: ${result.lastInsertRowid})`);
    console.log(`   Evoluções: ${egg.targetDigimons.length} Digimons`);
  });

  console.log("\n" + "═".repeat(70));
  console.log(`✅ ${newEggs.length} novos Armor Eggs adicionados!`);
  console.log("✅ Total de 11 Armor Eggs no sistema!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro ao adicionar Armor Eggs:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
