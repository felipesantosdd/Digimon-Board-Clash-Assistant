import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("\n🌱 CADASTRANDO EFEITOS UTILITÁRIOS\n");
console.log("═".repeat(90));

const utilityEffects = [
  // Cura
  {
    name: "Cura de HP",
    description: "Restaura HP do Digimon",
    code: "heal_hp",
    type: "heal",
    value: 0, // Será definido por item
    statusType: "hp",
  },
  // Ataque
  {
    name: "Bônus de Ataque Permanente",
    description: "Aumenta o bônus de ataque permanentemente",
    code: "bonus_attack_permanent",
    type: "attack_bonus",
    value: 0, // Será definido por item
    statusType: "attack",
  },
  // Defesa
  {
    name: "Bônus de Defesa Permanente",
    description: "Aumenta o bônus de defesa permanentemente",
    code: "bonus_defense_permanent",
    type: "defense_bonus",
    value: 0, // Será definido por item
    statusType: "defense",
  },
  // Movimento
  {
    name: "Bônus de Movimento Permanente",
    description: "Aumenta a velocidade de movimento permanentemente",
    code: "bonus_movement_permanent",
    type: "movement",
    value: 0, // Será definido por item
    statusType: "movement",
  },
];

console.log("\n📋 Efeitos a serem cadastrados:\n");

let added = 0;
let skipped = 0;

for (const effect of utilityEffects) {
  // Verificar se já existe
  const existing = db
    .prepare("SELECT id FROM effects WHERE code = ?")
    .get(effect.code);

  if (existing) {
    console.log(`⏭️  ${effect.name} - já existe (código: ${effect.code})`);
    skipped++;
    continue;
  }

  // Inserir
  const result = db
    .prepare(
      `
    INSERT INTO effects (name, description, code, type, value, statusType)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      effect.name,
      effect.description,
      effect.code,
      effect.type,
      effect.value,
      effect.statusType
    );

  console.log(
    `✅ ${effect.name} cadastrado (ID: ${result.lastInsertRowid})`
  );
  added++;
}

console.log("\n\n═".repeat(90));
console.log(`\n✅ Processo concluído!`);
console.log(`   Adicionados: ${added}`);
console.log(`   Já existiam: ${skipped}`);

// Mostrar todos os efeitos utilitários
const allUtilityEffects = db
  .prepare(
    `
  SELECT * FROM effects 
  WHERE type IN ('heal', 'attack_bonus', 'defense_bonus', 'movement')
  ORDER BY type, name
`
  )
  .all();

console.log(`\n📊 Total de efeitos utilitários: ${allUtilityEffects.length}\n`);

db.close();

