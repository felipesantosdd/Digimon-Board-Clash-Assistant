import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔄 MIGRANDO TABELA EFFECTS PARA INCLUIR TIPOS UTILITÁRIOS\n");
console.log("═".repeat(90));

try {
  console.log("\n📝 Recriando tabela effects...\n");

  // 1. Criar tabela temporária com a nova estrutura
  db.exec(`
    CREATE TABLE effects_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('heal', 'damage', 'buff', 'debuff', 'special', 'boss', 'evolution', 'movement', 'attack_bonus', 'defense_bonus')),
      value INTEGER DEFAULT 0,
      statusType TEXT DEFAULT NULL
    )
  `);

  console.log("✅ Tabela temporária criada");

  // 2. Copiar dados da tabela antiga
  db.exec(`
    INSERT INTO effects_new (id, name, description, code, type, value, statusType)
    SELECT id, name, description, code, type, value, statusType
    FROM effects
  `);

  console.log("✅ Dados copiados");

  // 3. Remover tabela antiga
  db.exec(`DROP TABLE effects`);

  console.log("✅ Tabela antiga removida");

  // 4. Renomear tabela nova
  db.exec(`ALTER TABLE effects_new RENAME TO effects`);

  console.log("✅ Tabela renomeada");

  // 5. Verificar resultado
  const count = db.prepare("SELECT COUNT(*) as total FROM effects").get() as {
    total: number;
  };

  console.log("\n\n═".repeat(90));
  console.log(`\n✅ Migração concluída com sucesso!`);
  console.log(`   Total de efeitos: ${count.total}`);
  console.log("");
} catch (error) {
  console.error("\n❌ Erro na migração:", error);
  throw error;
} finally {
  db.close();
}

