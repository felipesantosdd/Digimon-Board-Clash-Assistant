import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n📊 ATUALIZANDO TAXA DE DROP DOS OVOS E EMBLEMAS PARA 15%\n");
console.log("═".repeat(90));

// Buscar todos os ovos e emblemas
const evolutionItems = db
  .prepare(
    `
  SELECT id, name, dropChance, active 
  FROM items 
  WHERE name LIKE '%Ovo%' OR name LIKE '%Emblema%' OR name LIKE '%Espírito%'
  ORDER BY name
`
  )
  .all() as Array<{
  id: number;
  name: string;
  dropChance: number;
  active: number;
}>;

console.log(`\n📋 Encontrados ${evolutionItems.length} itens de evolução:\n`);

if (evolutionItems.length === 0) {
  console.log("❌ Nenhum item encontrado!");
  db.close();
  process.exit(0);
}

// Mostrar os itens antes da atualização
evolutionItems.forEach((item) => {
  const status = item.active === 1 ? "✅" : "⏸️";
  console.log(`   ${status} ${item.name} - Drop: ${item.dropChance}%`);
});

// Atualizar todos os itens para 15% de drop
const result = db
  .prepare(
    `
  UPDATE items 
  SET dropChance = 15 
  WHERE name LIKE '%Ovo%' OR name LIKE '%Emblema%' OR name LIKE '%Espírito%'
`
  )
  .run();

console.log("\n\n═".repeat(90));
console.log(
  `\n✅ ${result.changes} itens atualizados para 15% de drop chance!\n`
);

// Verificar resultado
const updatedItems = db
  .prepare(
    `
  SELECT name, dropChance, active 
  FROM items 
  WHERE name LIKE '%Ovo%' OR name LIKE '%Emblema%' OR name LIKE '%Espírito%'
  ORDER BY name
`
  )
  .all() as Array<{ name: string; dropChance: number; active: number }>;

console.log("📊 Status final:\n");
updatedItems.forEach((item) => {
  const status = item.active === 1 ? "✅" : "⏸️";
  console.log(`   ${status} ${item.name} - Drop: ${item.dropChance}%`);
});

console.log("");

db.close();

