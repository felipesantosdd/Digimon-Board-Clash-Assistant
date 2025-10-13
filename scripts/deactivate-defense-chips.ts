import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔒 DESATIVANDO CHIPS DE DEFESA\n");
console.log("═".repeat(90));

// Desativar todos os chips de defesa
const result = db
  .prepare(
    `
  UPDATE items 
  SET active = 0 
  WHERE name LIKE '%Defesa%'
`
  )
  .run();

console.log(`\n✅ ${result.changes} chips de defesa desativados!\n`);

// Mostrar os chips desativados
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

console.log("\n✅ Sistema de defesa removido do loot!");
console.log("");

db.close();

