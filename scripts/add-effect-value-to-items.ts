import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔧 ADICIONANDO CAMPO 'effectValue' NA TABELA ITEMS\n");
console.log("═".repeat(90));

// Verificar se a coluna já existe
const tableInfo = db.pragma("table_info(items)") as Array<{
  name: string;
}>;
const hasEffectValue = tableInfo.some((col) => col.name === "effectValue");

if (hasEffectValue) {
  console.log("\n✅ Campo 'effectValue' já existe na tabela items!");
} else {
  console.log("\n📝 Adicionando coluna 'effectValue'...");

  // Adicionar coluna effectValue (padrão: 0)
  db.prepare(`ALTER TABLE items ADD COLUMN effectValue INTEGER DEFAULT 0`).run();

  console.log("✅ Coluna 'effectValue' adicionada com sucesso!");
}

console.log("\n✅ Processo concluído!");
console.log("");

db.close();

