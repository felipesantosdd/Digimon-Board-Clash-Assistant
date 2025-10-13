import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🎯 Atualizando drops de bosses por nível...\n");

try {
  // Desabilitar FOREIGN KEY temporariamente
  db.prepare("PRAGMA foreign_keys = OFF").run();
  
  // 1. Buscar todos os chips de defesa disponíveis
  const chips = db
    .prepare(
      `SELECT id, name FROM items 
       WHERE name LIKE '%Chip de Defesa%' 
       OR name LIKE '%Chip de Força%'
       ORDER BY name`
    )
    .all() as { id: number; name: string }[];

  console.log("📦 Chips disponíveis:");
  chips.forEach((chip) => {
    console.log(`   - ID ${chip.id}: ${chip.name}`);
  });

  // 2. Mapear chips por nível (P=nível 1-2, M=nível 3-4, G=nível 5+)
  const chipsByLevel: Record<string, number[]> = {
    "1-2": chips
      .filter((c) => c.name.includes(" P"))
      .map((c) => c.id),
    "3-4": chips
      .filter((c) => c.name.includes(" M"))
      .map((c) => c.id),
    "5+": chips
      .filter((c) => c.name.includes(" G"))
      .map((c) => c.id),
  };

  console.log("\n🗂️ Chips por categoria:");
  console.log(`   - Nível 1-2 (P): ${chipsByLevel["1-2"].join(", ")}`);
  console.log(`   - Nível 3-4 (M): ${chipsByLevel["3-4"].join(", ")}`);
  console.log(`   - Nível 5+ (G): ${chipsByLevel["5+"].join(", ")}`);

  // 3. Buscar todos os digimons marcados como boss
  const bosses = db
    .prepare(
      `SELECT id, name, level 
       FROM digimons 
       WHERE boss = 1
       ORDER BY level`
    )
    .all() as { id: number; name: string; level: number }[];

  console.log("\n👹 Bosses encontrados:");
  bosses.forEach((boss) => {
    console.log(`   - ID ${boss.id}: ${boss.name} (Nível ${boss.level})`);
  });

  // 4. Limpar drops existentes
  db.prepare("DELETE FROM boss_drops").run();
  console.log("\n🗑️ Drops antigos removidos");

  // 5. Adicionar novos drops baseados no nível
  let totalDrops = 0;
  
  for (const boss of bosses) {
    const level = boss.level;
    
    // Determinar quais chips dropar
    let chipsForBoss: number[] = [];
    let dropChance = 100; // 100% de chance garantida
    
    if (level <= 2) {
      // Nível 1-2: Chip P (Pequeno)
      chipsForBoss = chipsByLevel["1-2"];
      dropChance = 100;
      console.log(`\n📝 Boss: ${boss.name} (Nível ${level}) → Chips P`);
    } else if (level <= 4) {
      // Nível 3-4: Chip M (Médio)
      chipsForBoss = chipsByLevel["3-4"];
      dropChance = 100;
      console.log(`\n📝 Boss: ${boss.name} (Nível ${level}) → Chips M`);
    } else {
      // Nível 5+: Chip G (Grande)
      chipsForBoss = chipsByLevel["5+"];
      dropChance = 100;
      console.log(`\n📝 Boss: ${boss.name} (Nível ${level}) → Chips G`);
    }
    
    // Adicionar TODOS os chips da categoria como drops possíveis
    for (const chipId of chipsForBoss) {
      db.prepare(
        `INSERT INTO boss_drops (bossId, itemId, dropChance)
         VALUES (?, ?, ?)`
      ).run(boss.id, chipId, dropChance);
      
      const chipName = chips.find((c) => c.id === chipId)?.name;
      console.log(`   ✅ Drop: ${chipName} (${dropChance}%)`);
      totalDrops++;
    }
  }

  console.log(`\n✨ Total de ${totalDrops} drops configurados!`);
  console.log("🎉 Atualização concluída com sucesso!");

  db.close();
  process.exit(0);
} catch (error) {
  console.error("❌ Erro:", error);
  db.close();
  process.exit(1);
}

