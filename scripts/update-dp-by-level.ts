import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Mapeamento de níveis para DP
const levelToDp: { [key: number]: number } = {
  1: 2000,
  2: 5000,
  3: 8000,
  4: 12000,
  5: 18000,
  6: 20000,
  7: 25000, // Adicionei level 7 como bonus
};

console.log("🔄 Atualizando DP de todos os Digimons baseado no nível...\n");

// Buscar todos os Digimons
const digimons = db
  .prepare("SELECT id, name, level, dp FROM digimons")
  .all() as {
  id: number;
  name: string;
  level: number;
  dp: number;
}[];

console.log(`📊 Total de Digimons encontrados: ${digimons.length}\n`);

// Atualizar cada Digimon
const updateStmt = db.prepare("UPDATE digimons SET dp = ? WHERE id = ?");

let updatedCount = 0;

digimons.forEach((digimon) => {
  const newDp = levelToDp[digimon.level];

  if (newDp && digimon.dp !== newDp) {
    updateStmt.run(newDp, digimon.id);
    console.log(
      `✅ ${digimon.name.padEnd(20)} | Level ${digimon.level} | ${digimon.dp
        .toString()
        .padStart(6)} DP → ${newDp.toString().padStart(6)} DP`
    );
    updatedCount++;
  } else if (newDp && digimon.dp === newDp) {
    console.log(
      `⏭️  ${digimon.name.padEnd(20)} | Level ${digimon.level} | ${newDp
        .toString()
        .padStart(6)} DP (já correto)`
    );
  } else {
    console.log(
      `⚠️  ${digimon.name.padEnd(20)} | Level ${
        digimon.level
      } | DP não definido para este nível`
    );
  }
});

console.log(`\n🎉 Atualização concluída!`);
console.log(`   - ${updatedCount} Digimons atualizados`);
console.log(
  `   - ${digimons.length - updatedCount} Digimons já estavam corretos`
);

db.close();
