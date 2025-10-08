import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🌱 Populando tabela de Tamers...\n");

const tamers = [
  { name: "Tai", image: "🦖" },
  { name: "Matt", image: "🐺" },
  { name: "Sora", image: "🦅" },
  { name: "Izzy", image: "🐞" },
  { name: "Mimi", image: "🌺" },
  { name: "Joe", image: "🦭" },
  { name: "T.K.", image: "👼" },
  { name: "Kari", image: "😺" },
];

const insertStmt = db.prepare(`
  INSERT INTO tamers (name, image)
  VALUES (?, ?)
`);

// Limpar tabela antes de popular (opcional)
db.prepare("DELETE FROM tamers").run();
console.log("🗑️  Tabela limpa\n");

tamers.forEach((tamer, index) => {
  insertStmt.run(tamer.name, tamer.image);
  console.log(
    `✅ Tamer ${(index + 1).toString().padStart(2)} | ${tamer.name.padEnd(
      10
    )} | ${tamer.image}`
  );
});

console.log(`\n🎉 ${tamers.length} Tamers adicionados com sucesso!`);

db.close();
