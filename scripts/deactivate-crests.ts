import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔒 DESATIVANDO TODOS OS EMBLEMAS\n");
console.log("═".repeat(90));

// Buscar todos os itens que são emblemas (contêm "Emblema" no nome)
const crests = db
  .prepare(
    `
  SELECT id, name, active 
  FROM items 
  WHERE name LIKE '%Emblema%'
  ORDER BY name
`
  )
  .all() as Array<{ id: number; name: string; active: number }>;

console.log(`\n📋 Encontrados ${crests.length} emblemas:\n`);

if (crests.length === 0) {
  console.log("❌ Nenhum emblema encontrado!");
  db.close();
  process.exit(0);
}

// Mostrar os emblemas encontrados
crests.forEach((crest) => {
  const status = crest.active === 1 ? "✅ ATIVO" : "⏸️ INATIVO";
  console.log(`   ${status} - ${crest.name} (ID: ${crest.id})`);
});

// Desativar todos os emblemas
const result = db
  .prepare(
    `
  UPDATE items 
  SET active = 0 
  WHERE name LIKE '%Emblema%'
`
  )
  .run();

console.log("\n\n═".repeat(90));
console.log(`\n✅ ${result.changes} emblemas desativados com sucesso!\n`);

// Verificar resultado
const updatedCrests = db
  .prepare(
    `
  SELECT name, active 
  FROM items 
  WHERE name LIKE '%Emblema%'
  ORDER BY name
`
  )
  .all() as Array<{ name: string; active: number }>;

console.log("📊 Status final dos emblemas:\n");
updatedCrests.forEach((crest) => {
  const status = crest.active === 1 ? "✅ ATIVO" : "⏸️ INATIVO";
  console.log(`   ${status} - ${crest.name}`);
});

console.log("");

db.close();
