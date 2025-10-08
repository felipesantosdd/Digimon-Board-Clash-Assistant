import fs from "fs";
import path from "path";

interface CleanupResult {
  directory: string;
  filesRemoved: string[];
  spaceFreed: number;
}

function cleanupDirectory(directory: string): CleanupResult {
  const dirPath = path.join(process.cwd(), "public", "images", directory);
  const filesRemoved: string[] = [];
  let spaceFreed = 0;

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Diretório ${directory} não encontrado, pulando...`);
    return { directory, filesRemoved, spaceFreed };
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    // Remover apenas PNG, JPG, JPEG (manter WebP e SVG)
    if (file.match(/\.(png|jpg|jpeg)$/i)) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      try {
        fs.unlinkSync(filePath);
        filesRemoved.push(file);
        spaceFreed += stats.size;
        console.log(
          `  🗑️  Removido: ${file} (${(stats.size / 1024).toFixed(1)}KB)`
        );
      } catch (error) {
        console.error(`  ❌ Erro ao remover ${file}:`, error);
      }
    }
  }

  return { directory, filesRemoved, spaceFreed };
}

function main() {
  console.log("🧹 Limpeza de Imagens Antigas\n");
  console.log("Removendo arquivos PNG/JPG (mantendo WebP e SVG)...\n");
  console.log("=".repeat(50));

  let totalFilesRemoved = 0;
  let totalSpaceFreed = 0;

  // Limpar Tamers
  console.log("\n👥 Limpando diretório Tamers...");
  const tamerResult = cleanupDirectory("tamers");
  totalFilesRemoved += tamerResult.filesRemoved.length;
  totalSpaceFreed += tamerResult.spaceFreed;
  console.log(`   ✓ ${tamerResult.filesRemoved.length} arquivos removidos`);

  // Limpar Digimons
  console.log("\n🤖 Limpando diretório Digimons...");
  const digimonResult = cleanupDirectory("digimons");
  totalFilesRemoved += digimonResult.filesRemoved.length;
  totalSpaceFreed += digimonResult.spaceFreed;
  console.log(`   ✓ ${digimonResult.filesRemoved.length} arquivos removidos`);

  // Limpar Items
  console.log("\n🎒 Limpando diretório Itens...");
  const itemResult = cleanupDirectory("items");
  totalFilesRemoved += itemResult.filesRemoved.length;
  totalSpaceFreed += itemResult.spaceFreed;
  console.log(`   ✓ ${itemResult.filesRemoved.length} arquivos removidos`);

  // Resumo
  console.log("\n" + "=".repeat(50));
  console.log("📊 Resumo da Limpeza:");
  console.log(`   Total de arquivos removidos: ${totalFilesRemoved}`);
  console.log(
    `   Espaço liberado: ${(totalSpaceFreed / 1024 / 1024).toFixed(2)}MB`
  );
  console.log("\n✅ Limpeza concluída!");
  console.log("\n💡 Apenas imagens WebP e SVG foram mantidas");
}

main();
