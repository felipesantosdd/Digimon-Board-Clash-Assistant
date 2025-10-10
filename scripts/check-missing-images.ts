import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

try {
  console.log("🔍 Verificando imagens de Digimons...\n");

  const digimons = db
    .prepare("SELECT id, name, image, level FROM digimons ORDER BY level, name")
    .all() as any[];

  let missing = 0;
  let notFound = 0;

  for (const digimon of digimons) {
    // Verificar se tem imagem
    if (!digimon.image || digimon.image === "" || digimon.image === "null") {
      console.log(`❌ [SEM IMAGEM] ${digimon.name} (Level ${digimon.level})`);
      missing++;
      continue;
    }

    // Verificar se o arquivo existe
    const imagePath = path.join(process.cwd(), "public", digimon.image);
    if (!fs.existsSync(imagePath)) {
      console.log(
        `❌ [ARQUIVO NÃO ENCONTRADO] ${digimon.name} (Level ${digimon.level})`
      );
      console.log(`   Caminho: ${digimon.image}`);
      notFound++;
    }
  }

  console.log("\n📊 Resumo:");
  console.log(`Total de Digimons: ${digimons.length}`);
  console.log(`Sem imagem cadastrada: ${missing}`);
  console.log(`Arquivo não encontrado: ${notFound}`);
  console.log(`OK: ${digimons.length - missing - notFound}`);

  // Listar alguns exemplos de imagens OK
  console.log("\n✅ Exemplos de imagens OK:");
  const working = digimons.filter((d) => {
    if (!d.image || d.image === "" || d.image === "null") return false;
    const imagePath = path.join(process.cwd(), "public", d.image);
    return fs.existsSync(imagePath);
  });

  working.slice(0, 5).forEach((d) => {
    console.log(`  ✓ ${d.name}: ${d.image}`);
  });
} catch (error) {
  console.error("❌ Erro:", error);
} finally {
  db.close();
}

