import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔧 CORRIGINDO NOMES DOS CHIPS DE VELOCIDADE\n");
console.log("═".repeat(90));

// Buscar todos os Chip de Velocidade I (deve ter 2)
const velocidadeI = db
  .prepare(
    `
  SELECT id, name 
  FROM items 
  WHERE name = 'Chip de Velocidade I'
  ORDER BY id
`
  )
  .all() as Array<{ id: number; name: string }>;

console.log(`\n📋 Encontrados ${velocidadeI.length} "Chip de Velocidade I":\n`);

if (velocidadeI.length === 2) {
  // Renomear o segundo para III
  const secondId = velocidadeI[1].id;

  db.prepare(
    `
    UPDATE items 
    SET name = 'Chip de Velocidade III' 
    WHERE id = ?
  `
  ).run(secondId);

  console.log(
    `   ✅ Item ID ${secondId} renomeado de "Chip de Velocidade I" → "Chip de Velocidade III"`
  );
} else {
  console.log("⚠️  Esperava 2 itens duplicados, mas encontrou", velocidadeI.length);
}

// Verificar resultado final
const allVelocidade = db
  .prepare(
    `
  SELECT name 
  FROM items 
  WHERE name LIKE '%Velocidade%'
  ORDER BY name
`
  )
  .all() as Array<{ name: string }>;

console.log("\n\n═".repeat(90));
console.log(`\n📊 Chips de Velocidade finais:\n`);
allVelocidade.forEach((item) => {
  console.log(`   ✅ ${item.name}`);
});

console.log("");

db.close();

