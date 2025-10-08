import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");

// Verificar se o arquivo SQLite existe (não existe na Vercel)
if (!fs.existsSync(dbPath)) {
  console.log("⏭️  Pulando exportação: database.sqlite não encontrado");
  console.log("   Usando arquivos JSON já versionados no git");
  process.exit(0);
}

const db = new Database(dbPath);

// Exportar digimon_types
const types = db.prepare("SELECT * FROM digimon_types").all();

// Exportar digimons
const digimons = db.prepare("SELECT * FROM digimons").all();

// Exportar tamers
const tamers = db.prepare("SELECT * FROM tamers").all();

// Exportar items (se a tabela existir)
let items = [];
try {
  items = db.prepare("SELECT * FROM items").all();
} catch (error) {
  console.log("⚠️  Tabela 'items' não encontrada, usando dados padrão");
  items = [
    {
      id: 1,
      name: "Poção de Vida",
      description: "Restaura 1000 HP de um Digimon",
      image: "/images/items/potion.png",
      effect: "heal_1000",
    },
    {
      id: 2,
      name: "Super Poção",
      description: "Restaura 2000 HP de um Digimon",
      image: "/images/items/super-potion.png",
      effect: "heal_2000",
    },
    {
      id: 3,
      name: "Poção Completa",
      description: "Restaura completamente o HP de um Digimon",
      image: "/images/items/full-potion.png",
      effect: "heal_full",
    },
    {
      id: 4,
      name: "Reviver",
      description: "Revive um Digimon derrotado com metade do HP",
      image: "/images/items/revive.png",
      effect: "revive_half",
    },
    {
      id: 5,
      name: "Chip de Força",
      description: "Aumenta permanentemente o DP em 500",
      image: "/images/items/power-chip.png",
      effect: "boost_dp_500",
    },
    {
      id: 6,
      name: "Escudo Digital",
      description: "Protege de um ataque neste turno",
      image: "/images/items/shield.png",
      effect: "shield_turn",
    },
    {
      id: 7,
      name: "Cristal de Evolução",
      description: "Permite evolução imediata se disponível",
      image: "/images/items/evo-crystal.png",
      effect: "instant_evolution",
    },
    {
      id: 8,
      name: "Elixir Mágico",
      description: "Restaura HP e remove debuffs",
      image: "/images/items/elixir.png",
      effect: "heal_cleanse",
    },
  ];
}

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

fs.writeFileSync(
  path.join(dataDir, "tamers.json"),
  JSON.stringify(tamers, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, "items.json"),
  JSON.stringify(items, null, 2)
);

console.log("✅ Dados exportados com sucesso!");
console.log(`   - ${types.length} tipos de Digimon`);
console.log(`   - ${digimons.length} Digimons`);
console.log(`   - ${tamers.length} Tamers`);
console.log(`   - ${items.length} Itens`);

db.close();
