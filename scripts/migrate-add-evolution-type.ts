import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Migrando tabela effects para incluir tipo 'evolution'...\n");

try {
  // No SQLite, não podemos alterar CHECK constraints diretamente
  // Precisamos recriar a tabela

  console.log("📋 Buscando efeitos existentes...");
  const existingEffects = db.prepare("SELECT * FROM effects").all();
  console.log(`✅ ${existingEffects.length} efeitos encontrados`);

  console.log("\n🔄 Recriando tabela effects...");

  // Criar tabela temporária com nova constraint
  db.exec(`
    CREATE TABLE effects_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('heal', 'damage', 'buff', 'debuff', 'special', 'boss', 'evolution')),
      value INTEGER DEFAULT 0
    );
  `);

  console.log("✅ Tabela effects_new criada");

  // Copiar dados
  console.log("📦 Copiando dados...");
  const insertStmt = db.prepare(`
    INSERT INTO effects_new (id, name, description, code, type, value)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const effect of existingEffects as Array<{
    id: number;
    name: string;
    description: string;
    code: string;
    type: string;
    value: number;
  }>) {
    insertStmt.run(
      effect.id,
      effect.name,
      effect.description,
      effect.code,
      effect.type,
      effect.value
    );
  }

  console.log("✅ Dados copiados");

  // Dropar tabela antiga e renomear nova
  console.log("🔄 Substituindo tabelas...");
  db.exec(`
    DROP TABLE effects;
    ALTER TABLE effects_new RENAME TO effects;
  `);

  console.log("✅ Tabela effects atualizada com sucesso!");
  console.log("\n✅ Migração concluída!");
} catch (error) {
  console.error("❌ Erro na migração:", error);
  process.exit(1);
} finally {
  db.close();
}

