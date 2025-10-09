import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

interface CleanupResult {
  directory: string;
  filesRemoved: string[];
  spaceFreed: number;
  totalFiles: number;
  usedFiles: number;
}

interface ImageReference {
  image: string;
  source: string;
}

// Conectar ao banco de dados
const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

/**
 * Busca todas as imagens referenciadas no banco de dados
 */
function getUsedImages(): Set<string> {
  const usedImages = new Set<string>();

  console.log("\n🔍 Buscando imagens referenciadas no banco de dados...\n");

  // Buscar imagens de Digimons
  const digimons = db
    .prepare("SELECT image FROM digimons")
    .all() as ImageReference[];
  digimons.forEach((row) => {
    const fileName = path.basename(row.image);
    usedImages.add(fileName);
  });
  console.log(`  ✓ Digimons: ${digimons.length} imagens em uso`);

  // Buscar imagens de Tamers
  const tamers = db
    .prepare("SELECT image FROM tamers")
    .all() as ImageReference[];
  tamers.forEach((row) => {
    const fileName = path.basename(row.image);
    usedImages.add(fileName);
  });
  console.log(`  ✓ Tamers: ${tamers.length} imagens em uso`);

  // Buscar imagens de Items
  const items = db.prepare("SELECT image FROM items").all() as ImageReference[];
  items.forEach((row) => {
    const fileName = path.basename(row.image);
    usedImages.add(fileName);
  });
  console.log(`  ✓ Items: ${items.length} imagens em uso`);

  // Buscar imagens de Bosses
  const bosses = db
    .prepare("SELECT image FROM bosses")
    .all() as ImageReference[];
  bosses.forEach((row) => {
    const fileName = path.basename(row.image);
    usedImages.add(fileName);
  });
  console.log(`  ✓ Bosses: ${bosses.length} imagens em uso`);

  console.log(`\n📊 Total de imagens únicas em uso: ${usedImages.size}`);

  return usedImages;
}

/**
 * Limpa um diretório removendo imagens não utilizadas
 */
function cleanupDirectory(
  directory: string,
  usedImages: Set<string>
): CleanupResult {
  const dirPath = path.join(process.cwd(), "public", "images", directory);
  const filesRemoved: string[] = [];
  let spaceFreed = 0;
  let totalFiles = 0;
  let usedFiles = 0;

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Diretório ${directory} não encontrado, pulando...`);
    return { directory, filesRemoved, spaceFreed, totalFiles, usedFiles };
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    // Pular arquivos de fallback e SVG padrão
    if (file === "fallback.svg" || file.endsWith(".svg")) {
      continue;
    }

    totalFiles++;

    // Verificar se a imagem está sendo usada
    if (!usedImages.has(file)) {
      const filePath = path.join(dirPath, file);

      try {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        filesRemoved.push(file);
        spaceFreed += stats.size;
        console.log(
          `  🗑️  Removido: ${file} (${(stats.size / 1024).toFixed(1)}KB)`
        );
      } catch (error) {
        console.error(`  ❌ Erro ao remover ${file}:`, error);
      }
    } else {
      usedFiles++;
    }
  }

  return { directory, filesRemoved, spaceFreed, totalFiles, usedFiles };
}

function main() {
  console.log("🧹 Limpeza de Imagens Não Utilizadas\n");
  console.log("=" + "=".repeat(60));

  try {
    // Buscar todas as imagens em uso no banco
    const usedImages = getUsedImages();

    let totalFilesRemoved = 0;
    let totalSpaceFreed = 0;
    let totalFilesScanned = 0;
    let totalUsedFiles = 0;

    console.log("\n" + "=".repeat(60));
    console.log("\n🗂️  Verificando diretórios...\n");

    // Limpar Digimons
    console.log("🤖 Diretório: Digimons");
    const digimonResult = cleanupDirectory("digimons", usedImages);
    totalFilesRemoved += digimonResult.filesRemoved.length;
    totalSpaceFreed += digimonResult.spaceFreed;
    totalFilesScanned += digimonResult.totalFiles;
    totalUsedFiles += digimonResult.usedFiles;
    console.log(
      `   ✓ ${digimonResult.usedFiles} em uso, ${digimonResult.filesRemoved.length} removidos\n`
    );

    // Limpar Tamers
    console.log("👥 Diretório: Tamers");
    const tamerResult = cleanupDirectory("tamers", usedImages);
    totalFilesRemoved += tamerResult.filesRemoved.length;
    totalSpaceFreed += tamerResult.spaceFreed;
    totalFilesScanned += tamerResult.totalFiles;
    totalUsedFiles += tamerResult.usedFiles;
    console.log(
      `   ✓ ${tamerResult.usedFiles} em uso, ${tamerResult.filesRemoved.length} removidos\n`
    );

    // Limpar Items
    console.log("🎒 Diretório: Items");
    const itemResult = cleanupDirectory("items", usedImages);
    totalFilesRemoved += itemResult.filesRemoved.length;
    totalSpaceFreed += itemResult.spaceFreed;
    totalFilesScanned += itemResult.totalFiles;
    totalUsedFiles += itemResult.usedFiles;
    console.log(
      `   ✓ ${itemResult.usedFiles} em uso, ${itemResult.filesRemoved.length} removidos\n`
    );

    // Limpar Bosses
    console.log("👹 Diretório: Bosses");
    const bossResult = cleanupDirectory("bosses", usedImages);
    totalFilesRemoved += bossResult.filesRemoved.length;
    totalSpaceFreed += bossResult.spaceFreed;
    totalFilesScanned += bossResult.totalFiles;
    totalUsedFiles += bossResult.usedFiles;
    console.log(
      `   ✓ ${bossResult.usedFiles} em uso, ${bossResult.filesRemoved.length} removidos\n`
    );

    // Resumo final
    console.log("=".repeat(60));
    console.log("📊 Resumo da Limpeza:");
    console.log(`   Arquivos verificados: ${totalFilesScanned}`);
    console.log(`   Arquivos em uso: ${totalUsedFiles}`);
    console.log(`   Arquivos removidos: ${totalFilesRemoved}`);
    console.log(
      `   Espaço liberado: ${(totalSpaceFreed / 1024 / 1024).toFixed(2)} MB`
    );

    if (totalFilesRemoved === 0) {
      console.log("\n✅ Nenhuma imagem não utilizada encontrada!");
    } else {
      console.log("\n✅ Limpeza concluída com sucesso!");
    }

    console.log("\n💡 Apenas imagens referenciadas no banco foram mantidas");
  } catch (error) {
    console.error("\n❌ Erro ao executar limpeza:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
