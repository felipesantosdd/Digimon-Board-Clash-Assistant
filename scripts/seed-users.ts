import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🌱 Cadastrando usuários...\n");

const users = [
  { name: "Felipe S. Oliveira", image: "01" },
  { name: "Talessa M. Rodrigues", image: "02" },
  { name: "Luiz F. de Almeida", image: "03" },
];

const insertStmt = db.prepare(`
  INSERT INTO tamers (name, image)
  VALUES (?, ?)
`);

// Limpar tabela antes de popular
db.prepare("DELETE FROM tamers").run();
console.log("🗑️  Tabela limpa\n");

users.forEach((user, index) => {
  insertStmt.run(user.name, user.image);
  console.log(
    `✅ Usuário ${(index + 1).toString().padStart(2)} | ${user.name.padEnd(
      25
    )} | ${user.image}`
  );
});

console.log(`\n🎉 ${users.length} usuários cadastrados com sucesso!`);

db.close();
