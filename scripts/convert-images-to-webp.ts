import sharp from "sharp";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

interface ConversionResult {
  original: string;
  converted: string;
  originalSize: number;
  newSize: number;
  savings: number;
}

async function convertImage(
  inputPath: string,
  outputPath: string,
  maxSize: number,
  quality: number
): Promise<ConversionResult> {
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;

  await sharp(inputPath)
    .resize(maxSize, maxSize, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: Math.round(quality * 100) })
    .toFile(outputPath);

  const newStats = fs.statSync(outputPath);
  const newSize = newStats.size;
  const savings = ((originalSize - newSize) / originalSize) * 100;

  return {
    original: inputPath,
    converted: outputPath,
    originalSize,
    newSize,
    savings,
  };
}

async function convertDirectory(
  directory: string,
  maxSize: number,
  quality: number
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  const dirPath = path.join(process.cwd(), "public", "images", directory);

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Diretório ${directory} não encontrado, pulando...`);
    return results;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    // Pular se não for imagem PNG/JPG ou se for .gitkeep
    if (!file.match(/\.(png|jpg|jpeg)$/i) || file === ".gitkeep") {
      continue;
    }

    const inputPath = path.join(dirPath, file);
    const baseName = path.parse(file).name;
    const outputPath = path.join(dirPath, `${baseName}.webp`);

    try {
      const result = await convertImage(
        inputPath,
        outputPath,
        maxSize,
        quality
      );
      results.push(result);
      console.log(
        `✅ ${file} → ${baseName}.webp (${(result.originalSize / 1024).toFixed(
          1
        )}KB → ${(result.newSize / 1024).toFixed(
          1
        )}KB, -${result.savings.toFixed(1)}%)`
      );
    } catch (error) {
      console.error(`❌ Erro ao converter ${file}:`, error);
    }
  }

  return results;
}

async function updateDatabase(
  table: string,
  directory: string,
  results: ConversionResult[]
) {
  if (results.length === 0) return;

  console.log(`\n🔄 Atualizando tabela ${table}...`);

  for (const result of results) {
    const fileName = path.basename(result.original);
    const baseName = path.parse(fileName).name;
    const oldPath = `/images/${directory}/${fileName}`;
    const newPath = `/images/${directory}/${baseName}.webp`;

    try {
      const stmt = db.prepare(`UPDATE ${table} SET image = ? WHERE image = ?`);
      const info = stmt.run(newPath, oldPath);

      if (info.changes > 0) {
        console.log(`  ✓ Atualizado: ${oldPath} → ${newPath}`);
      }
    } catch (error) {
      console.error(`  ❌ Erro ao atualizar ${oldPath}:`, error);
    }
  }
}

async function main() {
  console.log("🖼️  Conversão de Imagens para WebP\n");
  console.log("=".repeat(50));

  let totalOriginal = 0;
  let totalNew = 0;

  // Converter Tamers (256x256, qualidade 90%)
  console.log("\n👥 Convertendo Tamers...");
  const tamerResults = await convertDirectory("tamers", 256, 0.9);
  await updateDatabase("tamers", "tamers", tamerResults);
  tamerResults.forEach((r) => {
    totalOriginal += r.originalSize;
    totalNew += r.newSize;
  });

  // Converter Digimons (512x512, qualidade 92%)
  console.log("\n🤖 Convertendo Digimons...");
  const digimonResults = await convertDirectory("digimons", 512, 0.92);
  await updateDatabase("digimons", "digimons", digimonResults);
  digimonResults.forEach((r) => {
    totalOriginal += r.originalSize;
    totalNew += r.newSize;
  });

  // Converter Items (512x512, qualidade 92%)
  console.log("\n🎒 Convertendo Itens...");
  const itemResults = await convertDirectory("items", 512, 0.92);
  await updateDatabase("items", "items", itemResults);
  itemResults.forEach((r) => {
    totalOriginal += r.originalSize;
    totalNew += r.newSize;
  });

  // Resumo
  console.log("\n" + "=".repeat(50));
  console.log("📊 Resumo da Conversão:");
  console.log(`   Tamers: ${tamerResults.length} imagens`);
  console.log(`   Digimons: ${digimonResults.length} imagens`);
  console.log(`   Itens: ${itemResults.length} imagens`);
  console.log(
    `   Total: ${
      tamerResults.length + digimonResults.length + itemResults.length
    } imagens`
  );
  console.log(
    `   Tamanho original: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`
  );
  console.log(`   Tamanho final: ${(totalNew / 1024 / 1024).toFixed(2)}MB`);
  console.log(
    `   Economia: ${(
      ((totalOriginal - totalNew) / totalOriginal) *
      100
    ).toFixed(1)}%`
  );

  db.close();
  console.log("\n✅ Conversão concluída!");
  console.log("\n💡 Execute 'npm run export' para atualizar os arquivos JSON");
}

main().catch((error) => {
  console.error("❌ Erro durante conversão:", error);
  process.exit(1);
});
