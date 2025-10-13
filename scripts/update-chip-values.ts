import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🔧 ATUALIZANDO VALORES DOS CHIPS\n");
console.log("═".repeat(90));

// Mapeamento de itens e seus valores
const chipValues: Record<string, number> = {
  // Chips de Força
  "Chip de Força P": 5,
  "Chip de Força M": 10,
  "Chip de Força G": 15,

  // Chips de Defesa
  "Chip de Defesa P": 5,
  "Chip de Defesa M": 10,
  "Chip de Defesa G": 15,

  // Chips de Velocidade
  "Chip de Velocidade I": 2,
  "Chip de Velocidade II": 4,
  "Chip de Velocidade III": 6,
  "Chip de Velocidade IV": 8,
  "Chip de Velocidade V": 10,

  // Chips de Recuperação (baseado nas janelas de HP por nível)
  "Chip de Recuperação Pequeno": 2000, // Nível 1 (1600-2400)
  "Chip de Recuperação Médio I": 4000, // Nível 2 min
  "Chip de Recuperação Médio II": 6000, // Nível 2 max
  "Chip de Recuperação Grande I": 7000, // Nível 3 médio
  "Chip de Recuperação Grande II": 9600, // Nível 3 max
  "Chip de Recuperação Super I": 10000, // Nível 4 min
  "Chip de Recuperação Super II": 14000, // Nível 4 max
  "Chip de Recuperação Ultra": 15000, // Nível 5 min
  "Chip de Recuperação Mega": 18000, // Nível 5 max
  "Chip de Recuperação Total": 24000, // Nível 6 max

  // Portão Dimensional
  "Portão Dimensional": 10, // 10 casas extras
};

console.log(`\n📋 Atualizando ${Object.keys(chipValues).length} itens:\n`);

let updated = 0;
let notFound = 0;

for (const [itemName, value] of Object.entries(chipValues)) {
  const item = db
    .prepare("SELECT id, name, effectValue FROM items WHERE name = ?")
    .get(itemName) as
    | { id: number; name: string; effectValue: number }
    | undefined;

  if (!item) {
    console.log(`❌ Item não encontrado: ${itemName}`);
    notFound++;
    continue;
  }

  // Atualizar o valor
  db.prepare(
    `
    UPDATE items 
    SET effectValue = ? 
    WHERE id = ?
  `
  ).run(value, item.id);

  console.log(
    `   ✅ ${itemName} - effectValue: ${item.effectValue} → ${value}`
  );
  updated++;
}

console.log("\n\n═".repeat(90));
console.log(`\n✅ Processo concluído!`);
console.log(`   Itens atualizados: ${updated}`);
console.log(`   Não encontrados: ${notFound}`);

// Mostrar resumo por categoria
const summary = db
  .prepare(
    `
  SELECT name, effectValue 
  FROM items 
  WHERE effectValue > 0
  ORDER BY effectValue, name
`
  )
  .all() as Array<{ name: string; effectValue: number }>;

console.log(`\n📊 Total de itens com valores: ${summary.length}`);
console.log("");

db.close();

