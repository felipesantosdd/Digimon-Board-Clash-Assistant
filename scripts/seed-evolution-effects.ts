import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🧬 Adicionando efeitos de evolução especial...\n");

const evolutionEffects = [
  {
    name: "Evolução Armor",
    description: "Permite evolução para um Digimon Armor aleatório",
    code: "evolution_armor",
    type: "evolution",
    value: 0,
  },
  {
    name: "Evolução Especial",
    description: "Permite evolução para um Digimon especial configurado",
    code: "evolution_special",
    type: "evolution",
    value: 0,
  },
  {
    name: "Digi-Egg",
    description: "Ovo de evolução que transforma em Armor Digimon",
    code: "evolution_digiegg",
    type: "evolution",
    value: 0,
  },
];

const stmt = db.prepare(`
  INSERT INTO effects (name, description, code, type, value)
  VALUES (?, ?, ?, ?, ?)
`);

let added = 0;

evolutionEffects.forEach((effect) => {
  try {
    // Verificar se já existe
    const existing = db
      .prepare("SELECT id FROM effects WHERE code = ?")
      .get(effect.code);

    if (existing) {
      console.log(`⏭️  ${effect.name} já existe (${effect.code})`);
    } else {
      stmt.run(
        effect.name,
        effect.description,
        effect.code,
        effect.type,
        effect.value
      );
      console.log(`✅ ${effect.name} adicionado (${effect.code})`);
      added++;
    }
  } catch (error) {
    console.error(`❌ Erro ao adicionar ${effect.name}:`, error);
  }
});

console.log("\n" + "═".repeat(60));
console.log(`✅ ${added} efeitos de evolução adicionados`);
console.log("═".repeat(60) + "\n");

db.close();
console.log("✅ Processo concluído!");

