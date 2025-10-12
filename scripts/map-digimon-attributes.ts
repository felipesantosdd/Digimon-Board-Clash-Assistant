import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔍 Mapeando atributos dos Digimons...\n");

try {
  // Buscar todos os Digimons
  const digimons = db.prepare("SELECT id, name FROM digimons").all() as Array<{
    id: number;
    name: string;
  }>;

  console.log(`📊 Total de Digimons: ${digimons.length}\n`);

  // Padrões de nome para cada atributo
  const attributePatterns: { [key: number]: string[] } = {
    2: [
      // FOGO
      "flame",
      "fire",
      "burning",
      "blaze",
      "aguni",
      "greymon",
      "tyranno",
      "volcanic",
      "magma",
      "inferno",
      "aldamon",
      "vritramon",
    ],
    3: [
      // ÁGUA
      "aqua",
      "water",
      "sea",
      "ocean",
      "marine",
      "dolphin",
      "whale",
      "submarine",
      "submari",
      "marin",
      "ranamon",
      "calmara",
      "otter",
      "zudomon",
    ],
    4: [
      // GELO
      "ice",
      "snow",
      "freeze",
      "frost",
      "kumamon",
      "korikaku",
      "frigid",
      "polar",
    ],
    5: [
      // PLANTA
      "plant",
      "wood",
      "forest",
      "tree",
      "flower",
      "rose",
      "lilly",
      "petal",
      "arbor",
      "jungle",
      "mushroom",
      "vege",
      "togemon",
      "palmon",
    ],
    6: [
      // VENTO
      "wind",
      "air",
      "sky",
      "bird",
      "eagle",
      "hawk",
      "falcon",
      "pegasus",
      "zephyr",
      "kazemon",
      "garuda",
      "phoenix",
      "aquila",
      "silphy",
    ],
    7: [
      // TERRA
      "earth",
      "ground",
      "rock",
      "stone",
      "dig",
      "drill",
      "grumble",
      "gigas",
      "mountain",
      "mammoth",
      "gorilla",
    ],
    8: [
      // TROVÃO
      "thunder",
      "electric",
      "lightning",
      "volt",
      "beetle",
      "kabuter",
      "kabuterimon",
      "elec",
      "thunder",
      "raijin",
      "raidramon",
    ],
    9: [
      // LUZ
      "angel",
      "holy",
      "seraph",
      "ophani",
      "light",
      "lob",
      "kendo",
      "beowolf",
      "magna",
      "pegasus",
      "unicorn",
      "celestial",
    ],
    10: [
      // TREVAS
      "dark",
      "shadow",
      "demon",
      "devil",
      "skull",
      "death",
      "lowe",
      "jager",
      "dusk",
      "velge",
      "evil",
      "nightmare",
      "devimon",
    ],
    11: [
      // METAL
      "metal",
      "steel",
      "mecha",
      "android",
      "machine",
      "cyber",
      "mugen",
      "chrome",
      "hisyary",
      "mercurymon",
      "sephirot",
    ],
  };

  const stats = {
    mapped: 0,
    unknown: 0,
    byAttribute: {} as { [key: number]: number },
  };

  // Inicializar contadores
  for (let i = 1; i <= 12; i++) {
    stats.byAttribute[i] = 0;
  }

  console.log("📝 Processando Digimons:\n");

  digimons.forEach((digimon) => {
    let attributeId = 12; // Default: Desconhecido
    const nameLower = digimon.name.toLowerCase();

    // Tentar encontrar padrão correspondente
    for (const [attrId, patterns] of Object.entries(attributePatterns)) {
      if (patterns.some((pattern) => nameLower.includes(pattern))) {
        attributeId = parseInt(attrId);
        break;
      }
    }

    // Atualizar Digimon
    db.prepare("UPDATE digimons SET attributeId = ? WHERE id = ?").run(
      attributeId,
      digimon.id
    );

    stats.byAttribute[attributeId]++;

    if (attributeId === 12) {
      stats.unknown++;
    } else {
      stats.mapped++;
    }
  });

  console.log("✅ Mapeamento concluído!\n");
  console.log("═".repeat(70));
  console.log("\n📊 RESULTADOS:\n");

  const attributeNames = [
    "",
    "Neutro",
    "Fogo",
    "Água",
    "Gelo",
    "Planta",
    "Vento",
    "Terra",
    "Trovão",
    "Luz",
    "Trevas",
    "Metal",
    "Desconhecido",
  ];

  for (let i = 1; i <= 12; i++) {
    if (stats.byAttribute[i] > 0) {
      const percentage = (
        (stats.byAttribute[i] / digimons.length) *
        100
      ).toFixed(1);
      console.log(
        `   ${attributeNames[i]}: ${stats.byAttribute[i]} (${percentage}%)`
      );
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log("\n📈 RESUMO:");
  console.log(
    `   ✅ Mapeados: ${stats.mapped} (${(
      (stats.mapped / digimons.length) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   ⚠️  Desconhecidos: ${stats.unknown} (${(
      (stats.unknown / digimons.length) *
      100
    ).toFixed(1)}%)`
  );
  console.log("");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
