import Database from "better-sqlite3";
import path from "path";
import { jsonDb } from "./json-db";

// Detectar ambiente: usa SQLite em dev, JSON em produção
const isProduction = process.env.NODE_ENV === "production";

let db: Database.Database | typeof jsonDb;

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
      typeId INTEGER NOT NULL,
      evolution TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      boss INTEGER DEFAULT 0,
      effectId INTEGER,
      description TEXT DEFAULT '',
      hp INTEGER DEFAULT 0,
      atk INTEGER DEFAULT 0,
      def INTEGER DEFAULT 0,
      attribute_id INTEGER,
      FOREIGN KEY (typeId) REFERENCES digimon_types(id)
    );

    CREATE TABLE IF NOT EXISTS tamers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS effects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('heal', 'damage', 'buff', 'debuff', 'special', 'boss', 'evolution')),
      value INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      effectId INTEGER,
      dropChance INTEGER DEFAULT 0 CHECK(dropChance >= 0 AND dropChance <= 100),
      targetDigimons TEXT DEFAULT '[]',
      FOREIGN KEY (effectId) REFERENCES effects(id)
    );

    CREATE TABLE IF NOT EXISTS bosses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      effectId INTEGER,
      dp INTEGER NOT NULL,
      typeId INTEGER NOT NULL,
      FOREIGN KEY (typeId) REFERENCES digimon_types(id),
      FOREIGN KEY (effectId) REFERENCES effects(id)
    );

    CREATE TABLE IF NOT EXISTS boss_drops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bossId INTEGER NOT NULL,
      itemId INTEGER NOT NULL,
      dropChance INTEGER NOT NULL CHECK(dropChance >= 1 AND dropChance <= 100),
      FOREIGN KEY (bossId) REFERENCES bosses(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    );
  `);
}

export default db;
