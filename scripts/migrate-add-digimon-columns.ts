import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Migrando banco de dados: adicionando colunas active, boss, effectId e description...\n");

try {
  // Verificar se as colunas já existem
  const tableInfo = db.pragma("table_info(digimons)");
  const columnNames = tableInfo.map((col: { name: string }) => col.name);

  // Adicionar coluna 'active' se não existir
  if (!columnNames.includes("active")) {
    console.log("➕ Adicionando coluna 'active'...");
    db.exec("ALTER TABLE digimons ADD COLUMN active INTEGER DEFAULT 1");
    console.log("✅ Coluna 'active' adicionada");
  } else {
    console.log("⏭️  Coluna 'active' já existe");
  }

  // Adicionar coluna 'boss' se não existir
  if (!columnNames.includes("boss")) {
    console.log("➕ Adicionando coluna 'boss'...");
    db.exec("ALTER TABLE digimons ADD COLUMN boss INTEGER DEFAULT 0");
    console.log("✅ Coluna 'boss' adicionada");
  } else {
    console.log("⏭️  Coluna 'boss' já existe");
  }

  // Adicionar coluna 'effectId' se não existir
  if (!columnNames.includes("effectId")) {
    console.log("➕ Adicionando coluna 'effectId'...");
    db.exec("ALTER TABLE digimons ADD COLUMN effectId INTEGER");
    console.log("✅ Coluna 'effectId' adicionada");
  } else {
    console.log("⏭️  Coluna 'effectId' já existe");
  }

  // Adicionar coluna 'description' se não existir
  if (!columnNames.includes("description")) {
    console.log("➕ Adicionando coluna 'description'...");
    db.exec("ALTER TABLE digimons ADD COLUMN description TEXT DEFAULT ''");
    console.log("✅ Coluna 'description' adicionada");
  } else {
    console.log("⏭️  Coluna 'description' já existe");
  }

  console.log("\n✅ Migração concluída com sucesso!");
} catch (error) {
  console.error("❌ Erro na migração:", error);
  process.exit(1);
} finally {
  db.close();
}

