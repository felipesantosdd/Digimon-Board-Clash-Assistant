import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n✅ ATIVANDO ITENS QUE AGORA TÊM IMAGEM\n");
console.log("═".repeat(90));

// Ativar todos os itens que não são fallback e estão inativos
const result = db
  .prepare(
    `
  UPDATE items 
  SET active = 1 
  WHERE image NOT LIKE '%fallback%' 
  AND active = 0
`
  )
  .run();

console.log(`\n✅ ${result.changes} itens ativados!\n`);

// Mostrar estatísticas
const stats = db
  .prepare(
    `
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as ativos,
    SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) as inativos
  FROM items
`
  )
  .get() as { total: number; ativos: number; inativos: number };

console.log("📊 Estatísticas finais:");
console.log(`   Total de itens: ${stats.total}`);
console.log(`   ✅ Ativos: ${stats.ativos}`);
console.log(`   ⏸️ Inativos: ${stats.inativos}`);

// Mostrar itens inativos (se houver)
if (stats.inativos > 0) {
  const inactiveItems = db
    .prepare(
      `
    SELECT name 
    FROM items 
    WHERE active = 0
    ORDER BY name
  `
    )
    .all() as Array<{ name: string }>;

  console.log(`\n⏸️ Itens ainda inativos (${stats.inativos}):`);
  inactiveItems.forEach((item) => {
    console.log(`   - ${item.name}`);
  });
}

console.log("");

db.close();

