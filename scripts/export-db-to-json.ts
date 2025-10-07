import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Exportar digimon_types
const types = db.prepare("SELECT * FROM digimon_types").all();

// Exportar digimons
const digimons = db.prepare("SELECT * FROM digimons").all();

// Criar diretório de dados se não existir
const dataDir = path.join(process.cwd(), "src", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Salvar como JSON
fs.writeFileSync(
  path.join(dataDir, "digimon-types.json"),
  JSON.stringify(types, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, "digimons.json"),
  JSON.stringify(digimons, null, 2)
);

console.log("✅ Dados exportados com sucesso!");
console.log(`   - ${types.length} tipos de Digimon`);
console.log(`   - ${digimons.length} Digimons`);

db.close();
