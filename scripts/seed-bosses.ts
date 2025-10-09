import db from "../src/lib/db";

try {
  console.log("🐉 Iniciando seed de Bosses...");

  // Limpar dados existentes
  db.prepare("DELETE FROM boss_drops").run();
  db.prepare("DELETE FROM bosses").run();

  console.log("✅ Dados antigos limpos");

  // Inserir bosses de exemplo
  const bosses = [
    {
      name: "Devimon",
      image: "/images/bosses/devimon.png",
      description:
        "Um Digimon Anjo Caído do tipo Vírus. Extremamente perigoso!",
      effect: "boss_dark_aura", // Efeito especial do boss
      dp: 15000,
      typeId: 3, // Virus
    },
    {
      name: "Myotismon",
      image: "/images/bosses/myotismon.png",
      description: "Um vampiro Digimon com poderes sombrios devastadores.",
      effect: "boss_vampire_drain",
      dp: 25000,
      typeId: 3, // Virus
    },
    {
      name: "MetalSeadramon",
      image: "/images/bosses/metalseadramon.png",
      description: "Mestre dos oceanos digitais, com poder destrutivo imenso.",
      effect: "boss_ocean_fury",
      dp: 30000,
      typeId: 1, // Data
    },
  ];

  const bossIds: number[] = [];

  for (const boss of bosses) {
    const result = db
      .prepare(
        `
        INSERT INTO bosses (name, image, description, effect, dp, typeId)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        boss.name,
        boss.image,
        boss.description,
        boss.effect,
        boss.dp,
        boss.typeId
      );

    bossIds.push(Number(result.lastInsertRowid));
    console.log(`✅ Boss criado: ${boss.name} (ID: ${result.lastInsertRowid})`);
  }

  console.log("🎁 Criando drops para bosses...");

  // Drops para Devimon (Boss ID 1)
  const devimonDrops = [
    { itemId: 1, dropChance: 80 }, // Item 1 (80%)
    { itemId: 2, dropChance: 50 }, // Item 2 (50%)
    { itemId: 3, dropChance: 20 }, // Item 3 (20%)
  ];

  // Drops para Myotismon (Boss ID 2)
  const myotismonDrops = [
    { itemId: 2, dropChance: 70 }, // Item 2 (70%)
    { itemId: 3, dropChance: 40 }, // Item 3 (40%)
    { itemId: 4, dropChance: 15 }, // Item 4 (15%)
  ];

  // Drops para MetalSeadramon (Boss ID 3)
  const metalseadramonDrops = [
    { itemId: 3, dropChance: 60 }, // Item 3 (60%)
    { itemId: 4, dropChance: 30 }, // Item 4 (30%)
    { itemId: 5, dropChance: 10 }, // Item 5 (10%)
  ];

  const allDrops = [
    ...devimonDrops.map((d) => ({ bossId: bossIds[0], ...d })),
    ...myotismonDrops.map((d) => ({ bossId: bossIds[1], ...d })),
    ...metalseadramonDrops.map((d) => ({ bossId: bossIds[2], ...d })),
  ];

  for (const drop of allDrops) {
    db.prepare(
      `
      INSERT INTO boss_drops (bossId, itemId, dropChance)
      VALUES (?, ?, ?)
    `
    ).run(drop.bossId, drop.itemId, drop.dropChance);
  }

  console.log(`✅ ${allDrops.length} drops criados`);

  // Verificar resultado
  const totalBosses = db
    .prepare("SELECT COUNT(*) as count FROM bosses")
    .get() as { count: number };
  const totalDrops = db
    .prepare("SELECT COUNT(*) as count FROM boss_drops")
    .get() as { count: number };

  console.log("📊 Resumo:");
  console.log(`   - ${totalBosses.count} bosses`);
  console.log(`   - ${totalDrops.count} drops configurados`);
  console.log("🎉 Seed de bosses concluído com sucesso!");

  process.exit(0);
} catch (error) {
  console.error("❌ Erro ao fazer seed de bosses:", error);
  process.exit(1);
}
