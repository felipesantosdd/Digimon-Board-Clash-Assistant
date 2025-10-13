import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔧 ADICIONANDO CAMPOS DE VALOR E STATUS AOS EFEITOS\n");
console.log("═".repeat(90));

// Verificar se as colunas já existem
const tableInfo = db.pragma("table_info(effects)") as Array<{
  name: string;
}>;

const hasValue = tableInfo.some((col) => col.name === "value");
const hasStatusType = tableInfo.some((col) => col.name === "statusType");

if (hasValue && hasStatusType) {
  console.log("\n✅ Campos 'value' e 'statusType' já existem!");
} else {
  console.log("\n📝 Adicionando colunas...");

  if (!hasValue) {
    db.prepare(`ALTER TABLE effects ADD COLUMN value INTEGER DEFAULT 0`).run();
    console.log("✅ Coluna 'value' adicionada!");
  }

  if (!hasStatusType) {
    db.prepare(
      `ALTER TABLE effects ADD COLUMN statusType TEXT DEFAULT NULL`
    ).run();
    console.log("✅ Coluna 'statusType' adicionada!");
  }
}

// Contar efeitos
const stats = db
  .prepare(
    `
  SELECT 
    COUNT(*) as total,
    COUNT(value) as com_valor,
    COUNT(statusType) as com_status
  FROM effects
`
  )
  .get() as { total: number; com_valor: number; com_status: number };

console.log("\n📊 Estatísticas:");
console.log(`   Total de efeitos: ${stats.total}`);
console.log(`   Com valor definido: ${stats.com_valor}`);
console.log(`   Com tipo de status: ${stats.com_status}`);

console.log("\n✅ Processo concluído!");
console.log("");

db.close();

