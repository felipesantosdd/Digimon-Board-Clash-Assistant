import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n✅ ATIVANDO CHIPS DE DEFESA\n");
console.log("═".repeat(90));

// Ativar todos os chips de defesa
const result = db
  .prepare(
    `
  UPDATE items 
  SET active = 1 
  WHERE name LIKE '%Defesa%'
`
  )
  .run();

console.log(`\n✅ ${result.changes} chips de defesa ativados!\n`);

// Mostrar os chips ativados
const defenseChips = db
  .prepare(
    `
  SELECT name, active 
  FROM items 
  WHERE name LIKE '%Defesa%'
  ORDER BY name
`
  )
  .all() as Array<{ name: string; active: number }>;

console.log("📋 Chips de Defesa:\n");
defenseChips.forEach((chip) => {
  const status = chip.active === 1 ? "✅ ATIVO" : "⏸️ INATIVO";
  console.log(`   ${status} - ${chip.name}`);
});

console.log("\n✅ Sistema de defesa reativado!");
console.log("");

db.close();

