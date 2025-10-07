import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Convertendo nomes de Digimons para lowercase...\n");

// Buscar todos os Digimons
const digimons = db.prepare("SELECT id, name FROM digimons").all() as {
  id: number;
  name: string;
}[];

console.log(`📊 Total de Digimons encontrados: ${digimons.length}\n`);

// Atualizar cada Digimon
const updateStmt = db.prepare("UPDATE digimons SET name = ? WHERE id = ?");

let updatedCount = 0;

digimons.forEach((digimon) => {
  const lowerName = digimon.name.toLowerCase();

  if (digimon.name !== lowerName) {
    updateStmt.run(lowerName, digimon.id);
    console.log(
      `✅ ID ${digimon.id.toString().padStart(3)} | ${digimon.name.padEnd(
        25
      )} → ${lowerName}`
    );
    updatedCount++;
  } else {
    console.log(
      `⏭️  ID ${digimon.id.toString().padStart(3)} | ${lowerName.padEnd(
        25
      )} (já lowercase)`
    );
  }
});

console.log(`\n🎉 Conversão concluída!`);
console.log(`   - ${updatedCount} Digimons convertidos`);
console.log(
  `   - ${digimons.length - updatedCount} Digimons já estavam em lowercase`
);

db.close();
