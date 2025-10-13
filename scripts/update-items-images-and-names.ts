import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔧 ATUALIZANDO IMAGENS E NOMES DOS ITENS\n");
console.log("═".repeat(90));

// 1. Buscar a imagem padrão (pode ser de qualquer chip, vamos usar a primeira que encontrar)
const defaultImage = "/images/items/1760317992697_image.webp"; // Imagem dos chips

console.log(`\n📷 Imagem padrão para itens: ${defaultImage}\n`);

// 2. Atualizar todos os itens com fallback.svg para usar a imagem padrão
const updateImagesResult = db
  .prepare(
    `
  UPDATE items 
  SET image = ? 
  WHERE image LIKE '%fallback%'
`
  )
  .run(defaultImage);

console.log(
  `✅ ${updateImagesResult.changes} itens tiveram suas imagens atualizadas\n`
);

// 3. Renomear Botas para Chip de Velocidade
const bootItems = db
  .prepare(
    `
  SELECT id, name 
  FROM items 
  WHERE name LIKE '%Botas%'
  ORDER BY name
`
  )
  .all() as Array<{ id: number; name: string }>;

console.log(`📋 Encontradas ${bootItems.length} botas para renomear:\n`);

const nameMapping: Record<string, string> = {
  "Botas Ágeis": "Chip de Velocidade I",
  "Botas Velozes": "Chip de Velocidade II",
  "Botas Rápidas": "Chip de Velocidade III",
  "Botas Supersônicas": "Chip de Velocidade IV",
  "Botas da Luz": "Chip de Velocidade V",
};

let renamed = 0;

for (const boot of bootItems) {
  const newName = nameMapping[boot.name];

  if (newName) {
    db.prepare(
      `
      UPDATE items 
      SET name = ? 
      WHERE id = ?
    `
    ).run(newName, boot.id);

    console.log(`   ✅ ${boot.name} → ${newName}`);
    renamed++;
  } else {
    console.log(`   ⏭️  ${boot.name} - sem mapeamento`);
  }
}

console.log("\n\n═".repeat(90));
console.log(`\n✅ Processo concluído!`);
console.log(`   Imagens atualizadas: ${updateImagesResult.changes}`);
console.log(`   Botas renomeadas: ${renamed}`);

// Verificar itens sem fallback agora
const itemsWithFallback = db
  .prepare(
    `
  SELECT COUNT(*) as total 
  FROM items 
  WHERE image LIKE '%fallback%'
`
  )
  .get() as { total: number };

console.log(`   Itens ainda com fallback: ${itemsWithFallback.total}`);
console.log("");

db.close();

