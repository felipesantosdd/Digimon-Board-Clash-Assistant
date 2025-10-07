import Database from "better-sqlite3";
import path from "path";
import { jsonDb } from "./json-db";

// Detectar ambiente: usa SQLite em dev, JSON em produção
const isProduction = process.env.NODE_ENV === "production";

let db: any;

if (isProduction) {
  // Produção: usa dados do JSON
  console.log("🚀 Usando JSON database (produção)");
  db = jsonDb;
} else {
  // Desenvolvimento: usa SQLite
  const dbPath = path.join(process.cwd(), "database.sqlite");
  db = new Database(dbPath);

  // Criar tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS digimon_types (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      weakness INTEGER
    );

    CREATE TABLE IF NOT EXISTS digimons (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      level INTEGER NOT NULL,
      dp INTEGER NOT NULL,
      typeId INTEGER NOT NULL,
      evolution TEXT DEFAULT '[]',
      FOREIGN KEY (typeId) REFERENCES digimon_types(id)
    );
  `);
}

export default db;
