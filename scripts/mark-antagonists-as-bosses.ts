import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("👑 Marcando antagonistas das séries de Digimon como bosses...\n");

// Lista de antagonistas principais das séries de Digimon (Champion em diante)
const antagonists = [
  // Digimon Adventure
  "devimon",
  "etemon",
  "vamdemon",
  "myotismon",
  "venom vamdemon",
  "venomvamdemon",
  "metalseadramon",
  "metal seadramon",
  "puppetmon",
  "pinocchimon",
  "pinochimon",
  "mugendramon",
  "machinedramon",
  "piedmon",
  "piemon",
  "apocalymon",
  "dark masters",

  // Digimon Adventure 02
  "daemon",
  "archnemon",
  "arukenimon",
  "mummymon",
  "black wargreymon",
  "blackwargreymon",
  "belial vamdemon",
  "belialvamdemon",
  "malo myotismon",
  "maloMyotismon",
  "kimeramon",
  "diaboromon",
  "infermon",
  "keramon",

  // Digimon Tamers (Devas e outros)
  "beelzemon",
  "megidramon",
  "mihiramon",
  "sandiramon",
  "sinduramon",
  "pajiramon",
  "vajramon",
  "indramon",
  "kumbhiramon",
  "vikaralamon",
  "makuramon",
  "majiramon",
  "antylamon",
  "zhuqiaomon",

  // Digimon Frontier
  "cherubimon",
  "grumblemon",
  "gigasmon",
  "arbormon",
  "petaldramon",
  "ranamon",
  "calmaramon",
  "mercurymon",
  "sephirotmon",
  "lucemon",
  "lucemon falldown mode",
  "lucemon satan mode",
  "lucemon: falldown mode",
  "lucemon: satan mode",

  // Digimon Data Squad/Savers
  "belphemon",
  "belphemon sleep mode",
  "belphemon rage mode",
  "belphemon: sleep mode",
  "belphemon: rage mode",
  "craniummon",
  "sleipmon",

  // Outros antagonistas famosos
  "skullgreymon",
  "skull greymon",
  "metal etemon",
  "metaletemon",
  "piedmon",
  "myotismon",
  "vamdemon",
  "lady devimon",
  "ladydevimon",
  "marine devimon",
  "marinedevimon",
  "neo devimon",
  "neodevimon",
  "demon",
  "deamon",
  "phantomon",
  "fantomon",
  "skullsatamon",
  "skull satamon",
  "meicrackmon",
  "ordinemon",
  "algomon",
  "kurata",
  "gizumon",
  "darkdramon",
  "omnimon zwart",
  "omegamon zwart",
  "virus digimons",
];

// Buscar todos os Digimons
const allDigimons = db
  .prepare("SELECT id, name, level, boss FROM digimons")
  .all() as Array<{ id: number; name: string; level: number; boss: number }>;

console.log(`📊 Total de Digimons no banco: ${allDigimons.length}\n`);

let updated = 0;
let skipped = 0;

// Marcar antagonistas como bosses (apenas Champion em diante)
allDigimons.forEach((digimon) => {
  const isAntagonist = antagonists.some(
    (ant) =>
      digimon.name.toLowerCase().includes(ant.toLowerCase()) ||
      ant.toLowerCase().includes(digimon.name.toLowerCase())
  );

  if (isAntagonist && digimon.level >= 2 && !digimon.boss) {
    db.prepare("UPDATE digimons SET boss = 1 WHERE id = ?").run(digimon.id);
    console.log(
      `✅ [Level ${digimon.level}] ${digimon.name} (ID: ${digimon.id}) marcado como BOSS`
    );
    updated++;
  } else if (isAntagonist && digimon.level < 2) {
    console.log(
      `⏭️  [Level ${digimon.level}] ${digimon.name} (ID: ${digimon.id}) é antagonista mas está abaixo de Champion`
    );
    skipped++;
  } else if (isAntagonist && digimon.boss) {
    console.log(
      `ℹ️  [Level ${digimon.level}] ${digimon.name} (ID: ${digimon.id}) já era BOSS`
    );
  }
});

console.log("\n" + "═".repeat(60));
console.log(`✅ Digimons marcados como BOSS: ${updated}`);
console.log(`⏭️  Digimons ignorados (Level < 2): ${skipped}`);
console.log("═".repeat(60) + "\n");

// Mostrar estatísticas finais
const bosses = db
  .prepare("SELECT COUNT(*) as count FROM digimons WHERE boss = 1")
  .get() as { count: number };

console.log(`👑 Total de BOSSES no banco: ${bosses.count}`);

db.close();
console.log("\n✅ Processo concluído!");
