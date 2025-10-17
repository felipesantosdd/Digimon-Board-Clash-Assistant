import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");

console.log("🔄 Restaurando banco completo a partir dos JSONs...\n");

// Conectar ao banco existente
const db = new Database(dbPath);

// Limpar todas as tabelas
console.log("🧹 Limpando dados existentes...");
db.exec(`
  DELETE FROM boss_drops;
  DELETE FROM bosses;
  DELETE FROM items;
  DELETE FROM tamers;
  DELETE FROM digimons;
  DELETE FROM effects;
  DELETE FROM attributes;
  DELETE FROM digimon_types;
`);
console.log("✓ Dados existentes removidos");

// Criar schema
db.exec(`
  CREATE TABLE IF NOT EXISTS digimon_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    weakness INTEGER
  );

  CREATE TABLE IF NOT EXISTS attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS digimons (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    level INTEGER NOT NULL,
    dp INTEGER DEFAULT 0,
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
    type TEXT NOT NULL CHECK(type IN ('heal', 'damage', 'buff', 'debuff', 'special', 'boss', 'evolution', 'utility')),
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
    active INTEGER DEFAULT 1,
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

console.log("✓ Schema criado\n");

const dataPath = path.join(process.cwd(), "src", "data");

// 1. Tipos
const typesData = JSON.parse(fs.readFileSync(path.join(dataPath, "digimon-types.json"), "utf-8"));
const typeStmt = db.prepare("INSERT INTO digimon_types (id, name, weakness) VALUES (?, ?, ?)");
for (const type of typesData) {
  typeStmt.run(type.id, type.name, type.weakness);
}
console.log(`✓ ${typesData.length} tipos importados`);

// 2. Attributes
const attributesData = JSON.parse(fs.readFileSync(path.join(dataPath, "digimon-attributes.json"), "utf-8"));
const attrStmt = db.prepare("INSERT INTO attributes (id, name, color, icon) VALUES (?, ?, ?, ?)");
for (const attr of attributesData) {
  attrStmt.run(attr.id, attr.name, attr.color || null, attr.icon || null);
}
console.log(`✓ ${attributesData.length} atributos importados`);

// 3. Effects
const effectsData = JSON.parse(fs.readFileSync(path.join(dataPath, "effects.json"), "utf-8"));
const effectStmt = db.prepare("INSERT INTO effects (id, name, description, code, type, value) VALUES (?, ?, ?, ?, ?, ?)");

// Mapear tipos inválidos para tipos válidos
const typeMapping: Record<string, string> = {
  'movement': 'special',
  'attack_bonus': 'buff',
  'defense_bonus': 'buff'
};

for (const effect of effectsData) {
  const validType = typeMapping[effect.type] || effect.type;
  effectStmt.run(
    effect.id,
    effect.name,
    effect.description,
    effect.code,
    validType,
    effect.value || 0
  );
}
console.log(`✓ ${effectsData.length} efeitos importados`);

// 4. Digimons
const digimonsData = JSON.parse(fs.readFileSync(path.join(dataPath, "digimons.json"), "utf-8"));
const digimonStmt = db.prepare(`
  INSERT INTO digimons (id, name, image, level, dp, typeId, evolution, active, boss, effectId, description, hp, atk, def, attribute_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const digimon of digimonsData) {
  digimonStmt.run(
    digimon.id,
    digimon.name,
    digimon.image,
    digimon.level,
    digimon.dp || 0,
    digimon.typeId,
    JSON.stringify(digimon.evolution || []),
    digimon.active !== false ? 1 : 0,
    digimon.boss === true ? 1 : 0,
    digimon.effectId || null,
    digimon.description || '',
    digimon.hp || 0,
    digimon.atk || 0,
    digimon.def || 0,
    digimon.attribute_id || null
  );
}
console.log(`✓ ${digimonsData.length} Digimons importados`);

// 5. Tamers
const tamersData = JSON.parse(fs.readFileSync(path.join(dataPath, "tamers.json"), "utf-8"));
const tamerStmt = db.prepare("INSERT INTO tamers (id, name, image) VALUES (?, ?, ?)");
for (const tamer of tamersData) {
  tamerStmt.run(tamer.id, tamer.name, tamer.image);
}
console.log(`✓ ${tamersData.length} tamers importados`);

// 6. Items
const itemsData = JSON.parse(fs.readFileSync(path.join(dataPath, "items.json"), "utf-8"));
const itemStmt = db.prepare(`
  INSERT INTO items (id, name, description, image, effectId, dropChance, targetDigimons, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const item of itemsData) {
  itemStmt.run(
    item.id,
    item.name,
    item.description,
    item.image,
    item.effectId || null,
    item.dropChance || 0,
    JSON.stringify(item.targetDigimons || []),
    item.active !== false ? 1 : 0
  );
}
console.log(`✓ ${itemsData.length} itens importados`);

// 7. Bosses
const bossesData = JSON.parse(fs.readFileSync(path.join(dataPath, "bosses.json"), "utf-8"));
const bossStmt = db.prepare(`
  INSERT INTO bosses (id, name, image, description, effectId, dp, typeId)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const boss of bossesData) {
  bossStmt.run(
    boss.id,
    boss.name,
    boss.image,
    boss.description || '',
    boss.effectId || null,
    boss.dp,
    boss.typeId
  );
}
console.log(`✓ ${bossesData.length} bosses importados`);

// 8. Boss Drops
const dropsData = JSON.parse(fs.readFileSync(path.join(dataPath, "boss-drops.json"), "utf-8"));
const dropStmt = db.prepare(`
  INSERT INTO boss_drops (id, bossId, itemId, dropChance)
  VALUES (?, ?, ?, ?)
`);

for (const drop of dropsData) {
  dropStmt.run(drop.id, drop.bossId, drop.itemId, drop.dropChance);
}
console.log(`✓ ${dropsData.length} boss drops importados`);

db.close();
console.log("\n🎉 Banco completo restaurado com sucesso!");

