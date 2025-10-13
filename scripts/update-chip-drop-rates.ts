import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n📊 ATUALIZANDO TAXAS DE DROP DOS CHIPS\n");
console.log("═".repeat(90));

// Mapeamento de itens e suas taxas de drop
const chipDropRates: Record<string, number> = {
  // Chips de Força (P=40, M=15, G=7)
  "Chip de Força P": 40,
  "Chip de Força M": 15,
  "Chip de Força G": 7,

  // Chips de Defesa (P=40, M=15, G=7)
  "Chip de Defesa P": 40,
  "Chip de Defesa M": 15,
  "Chip de Defesa G": 7,

  // Chips de Velocidade (I=40, II=30, III=20, IV=10, V=5)
  "Chip de Velocidade I": 40,
  "Chip de Velocidade II": 30,
  "Chip de Velocidade III": 20,
  "Chip de Velocidade IV": 10,
  "Chip de Velocidade V": 5,

  // Chips de Recuperação (progressão de 40% a 5%)
  // Quanto maior a cura, menor a chance
  "Chip de Recuperação Pequeno": 40, // 2000 HP
  "Chip de Recuperação Médio I": 35, // 4000 HP
  "Chip de Recuperação Médio II": 30, // 6000 HP
  "Chip de Recuperação Grande I": 25, // 7000 HP
  "Chip de Recuperação Grande II": 20, // 9600 HP
  "Chip de Recuperação Super I": 15, // 10000 HP
  "Chip de Recuperação Super II": 12, // 14000 HP
  "Chip de Recuperação Ultra": 10, // 15000 HP
  "Chip de Recuperação Mega": 7, // 18000 HP
  "Chip de Recuperação Total": 5, // 24000 HP

  // Portão Dimensional (raro)
  "Portão Dimensional": 8,

  // Digivice (muito raro)
  Digivice: 3,
};

console.log(`\n📋 Atualizando ${Object.keys(chipDropRates).length} itens:\n`);

let updated = 0;
let notFound = 0;

for (const [itemName, dropRate] of Object.entries(chipDropRates)) {
  const item = db
    .prepare("SELECT id, name, dropChance FROM items WHERE name = ?")
    .get(itemName) as
    | { id: number; name: string; dropChance: number }
    | undefined;

  if (!item) {
    console.log(`❌ Item não encontrado: ${itemName}`);
    notFound++;
    continue;
  }

  // Atualizar a taxa de drop
  db.prepare(
    `
    UPDATE items 
    SET dropChance = ? 
    WHERE id = ?
  `
  ).run(dropRate, item.id);

  console.log(
    `   ✅ ${itemName.padEnd(35)} - Drop: ${String(item.dropChance).padStart(2)}% → ${dropRate}%`
  );
  updated++;
}

console.log("\n\n═".repeat(90));
console.log(`\n✅ Processo concluído!`);
console.log(`   Itens atualizados: ${updated}`);
console.log(`   Não encontrados: ${notFound}`);

// Mostrar resumo por categoria
console.log("\n📊 RESUMO POR CATEGORIA:\n");

const forceChips = db
  .prepare("SELECT name, dropChance FROM items WHERE name LIKE '%Força%' ORDER BY dropChance DESC")
  .all() as Array<{ name: string; dropChance: number }>;

const defenseChips = db
  .prepare("SELECT name, dropChance FROM items WHERE name LIKE '%Defesa%' ORDER BY dropChance DESC")
  .all() as Array<{ name: string; dropChance: number }>;

const speedChips = db
  .prepare("SELECT name, dropChance FROM items WHERE name LIKE '%Velocidade%' ORDER BY dropChance DESC")
  .all() as Array<{ name: string; dropChance: number }>;

const recoveryChips = db
  .prepare("SELECT name, dropChance FROM items WHERE name LIKE '%Recuperação%' ORDER BY dropChance DESC")
  .all() as Array<{ name: string; dropChance: number }>;

console.log("⚔️  Chips de Força:");
forceChips.forEach((chip) => {
  console.log(`   ${chip.name}: ${chip.dropChance}%`);
});

console.log("\n🛡️  Chips de Defesa:");
defenseChips.forEach((chip) => {
  console.log(`   ${chip.name}: ${chip.dropChance}%`);
});

console.log("\n🏃 Chips de Velocidade:");
speedChips.forEach((chip) => {
  console.log(`   ${chip.name}: ${chip.dropChance}%`);
});

console.log("\n💚 Chips de Recuperação:");
recoveryChips.forEach((chip) => {
  console.log(`   ${chip.name}: ${chip.dropChance}%`);
});

console.log("");

db.close();

