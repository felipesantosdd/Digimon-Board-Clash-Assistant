import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔧 ADICIONANDO CAMPO 'active' NA TABELA ITEMS\n");
console.log("═".repeat(90));

// Verificar se a coluna já existe
const tableInfo = db.pragma("table_info(items)") as Array<{
  name: string;
}>;
const hasActive = tableInfo.some((col) => col.name === "active");

if (hasActive) {
  console.log("\n✅ Campo 'active' já existe na tabela items!");
} else {
  console.log("\n📝 Adicionando coluna 'active'...");

  // Adicionar coluna active (padrão: 1 = ativo)
  db.prepare(`ALTER TABLE items ADD COLUMN active INTEGER DEFAULT 1`).run();

  console.log("✅ Coluna 'active' adicionada com sucesso!");
}

// Contar itens por status
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

console.log("\n📊 Estatísticas:");
console.log(`   Total de itens: ${stats.total}`);
console.log(`   Ativos: ${stats.ativos}`);
console.log(`   Inativos: ${stats.inativos}`);

console.log("\n✅ Processo concluído!");
console.log("");

db.close();

