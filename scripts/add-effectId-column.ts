import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Adicionando coluna effectId à tabela items...\n");

try {
  // Verificar se a coluna já existe
  const tableInfo = db.pragma("table_info(items)");
  const columnNames = tableInfo.map((col: { name: string }) => col.name);

  if (!columnNames.includes("effectId")) {
    console.log("➕ Adicionando coluna 'effectId'...");
    db.exec("ALTER TABLE items ADD COLUMN effectId INTEGER");
    console.log("✅ Coluna 'effectId' adicionada com sucesso!");
  } else {
    console.log("⏭️  Coluna 'effectId' já existe");
  }

  console.log("\n✅ Migração concluída!");
} catch (error) {
  console.error("❌ Erro na migração:", error);
  process.exit(1);
} finally {
  db.close();
}

