import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("📿 Adicionando Emblemas faltantes...\n");

try {
  // Buscar o efeito de evolução por emblema
  const crestEffect = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_crest'")
    .get() as { id: number } | undefined;

  if (!crestEffect) {
    console.log("❌ Efeito 'evolution_crest' não encontrado!");
    process.exit(1);
  }

  console.log(`✨ Efeito: Evolução por Emblema (ID: ${crestEffect.id})\n`);

  // Verificar quais emblemas já existem
  const existingCrests = db
    .prepare("SELECT name FROM items WHERE effectId = ?")
    .all(crestEffect.id) as Array<{ name: string }>;

  console.log("📋 Emblemas existentes:");
  existingCrests.forEach((c) => console.log(`   - ${c.name}`));
  console.log("");

  // Definir os 3 emblemas faltantes
  const newCrests = [
    {
      name: "Emblema dos Milagres",
      description:
        "O emblema dos eventos raros e extraordinários. Permite evolução para formas Mega lendárias.",
      dropChance: 5,
      targetDigimons: [], // Será configurado via interface
    },
    {
      name: "Emblema do Destino",
      description:
        "O emblema do potencial oculto. Permite evolução para formas Mega únicas.",
      dropChance: 5,
      targetDigimons: [], // Será configurado via interface
    },
    {
      name: "Emblema da Gentileza",
      description:
        "O emblema da bondade e empatia. Permite evolução para formas Mega compassivas.",
      dropChance: 5,
      targetDigimons: [], // Será configurado via interface
    },
  ];

  // Verificar se os emblemas já existem
  const toAdd = newCrests.filter(
    (crest) => !existingCrests.find((e) => e.name === crest.name)
  );

  if (toAdd.length === 0) {
    console.log("✅ Todos os emblemas já existem!");
  } else {
    const stmt = db.prepare(`
      INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    console.log("📝 Adicionando emblemas:\n");

    toAdd.forEach((crest) => {
      const result = stmt.run(
        crest.name,
        crest.description,
        "/images/items/fallback.svg",
        "",
        crestEffect.id,
        crest.dropChance,
        JSON.stringify(crest.targetDigimons)
      );
      console.log(`✅ ${crest.name} (ID: ${result.lastInsertRowid})`);
    });
  }

  console.log("\n" + "═".repeat(70));
  console.log("✅ Emblemas configurados!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
