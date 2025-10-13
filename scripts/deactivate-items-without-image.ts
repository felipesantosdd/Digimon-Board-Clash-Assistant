import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔒 DESATIVANDO ITENS SEM IMAGEM\n");
console.log("═".repeat(90));

// Buscar todos os itens
const allItems = db
  .prepare(
    `
  SELECT id, name, image, active 
  FROM items 
  ORDER BY name
`
  )
  .all() as Array<{ id: number; name: string; image: string; active: number }>;

console.log(`\n📋 Total de itens no banco: ${allItems.length}\n`);

// Filtrar itens sem imagem (fallback.svg ou imagem inexistente)
const itemsWithoutImage: Array<{
  id: number;
  name: string;
  image: string;
  active: number;
}> = [];

for (const item of allItems) {
  const isFallback = item.image.includes("fallback");
  let imageExists = false;

  if (!isFallback && item.image) {
    // Verificar se o arquivo existe
    const imagePath = path.join(process.cwd(), "public", item.image);
    imageExists = fs.existsSync(imagePath);
  }

  if (isFallback || !imageExists) {
    itemsWithoutImage.push(item);
  }
}

console.log(`🔍 Encontrados ${itemsWithoutImage.length} itens sem imagem:\n`);

if (itemsWithoutImage.length === 0) {
  console.log("✅ Todos os itens têm imagens!");
  db.close();
  process.exit(0);
}

// Mostrar os itens
itemsWithoutImage.forEach((item) => {
  const status = item.active === 1 ? "✅" : "⏸️";
  console.log(`   ${status} ${item.name} - ${item.image}`);
});

// Desativar todos os itens sem imagem
const itemIds = itemsWithoutImage.map((item) => item.id);
const placeholders = itemIds.map(() => "?").join(",");

const result = db
  .prepare(
    `
  UPDATE items 
  SET active = 0 
  WHERE id IN (${placeholders})
`
  )
  .run(...itemIds);

console.log("\n\n═".repeat(90));
console.log(`\n✅ ${result.changes} itens desativados com sucesso!\n`);

// Verificar resultado
const updatedItems = db
  .prepare(
    `
  SELECT name, image, active 
  FROM items 
  WHERE id IN (${placeholders})
  ORDER BY name
`
  )
  .all(...itemIds) as Array<{ name: string; image: string; active: number }>;

console.log("📊 Status final:\n");
updatedItems.forEach((item) => {
  const status = item.active === 1 ? "✅ ATIVO" : "⏸️ INATIVO";
  console.log(`   ${status} - ${item.name}`);
});

console.log("");

db.close();

