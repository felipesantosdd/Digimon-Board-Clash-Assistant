import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Mapa de atributos (nome -> ID)
const ATTRIBUTE_MAP: Record<string, number> = {
  Neutral: 1,
  Fire: 2,
  Water: 3,
  Ice: 4,
  Plant: 5,
  Wind: 6,
  Earth: 7,
  Electric: 8, // Mapeando Electric para Thunder (ID 8)
  Light: 9,
  Dark: 10,
  Metal: 11,
  Unknown: 12,
};

console.log("\n🔥 ATUALIZANDO ATRIBUTOS DOS DIGIMONS A PARTIR DA LISTA\n");
console.log("═".repeat(90));

// Ler o arquivo atributes.txt
const attributesFilePath = path.join(process.cwd(), "atributes.txt");
const fileContent = fs.readFileSync(attributesFilePath, "utf8");
const lines = fileContent.split("\n").filter((line) => line.trim());

console.log(`\n📄 Lendo ${lines.length} linhas do arquivo...\n`);

let updated = 0;
let notFound = 0;
let skipped = 0;

const updates: Array<{ name: string; attribute: string; attributeId: number }> =
  [];

for (const line of lines) {
  const parts = line.split("\t").map((p) => p.trim());

  if (parts.length < 5) {
    continue;
  }

  // Estrutura: [0]=número, [1]=descrição, [2]=nome, [3]=nível, [4]=atributo, [5]=tipo
  const digimonName = parts[2];
  const attribute = parts[4];

  if (!digimonName || !attribute) {
    continue;
  }

  // Mapear o atributo para o ID
  const attributeId = ATTRIBUTE_MAP[attribute];

  if (!attributeId) {
    console.log(
      `⚠️  Atributo desconhecido: "${attribute}" para ${digimonName}`
    );
    skipped++;
    continue;
  }

  // Buscar o Digimon no banco (case-insensitive e tratando caracteres especiais)
  const searchName = digimonName.replace(/\s+/g, " ").trim().toLowerCase();

  const digimon = db
    .prepare(
      `
    SELECT id, name, attributeId 
    FROM digimons 
    WHERE LOWER(REPLACE(name, ' ', '')) = ?
  `
    )
    .get(searchName.replace(/\s+/g, "")) as
    | { id: number; name: string; attributeId: number }
    | undefined;

  if (!digimon) {
    console.log(`❌ Digimon não encontrado no banco: "${digimonName}"`);
    notFound++;
    continue;
  }

  // Atualizar apenas se for diferente
  if (digimon.attributeId !== attributeId) {
    db.prepare(
      `
      UPDATE digimons 
      SET attributeId = ? 
      WHERE id = ?
    `
    ).run(attributeId, digimon.id);

    updates.push({
      name: digimon.name,
      attribute,
      attributeId,
    });
    updated++;
  } else {
    skipped++;
  }
}

console.log("\n\n═".repeat(90));
console.log("\n✅ ATUALIZAÇÃO CONCLUÍDA!\n");
console.log(`   Digimons atualizados: ${updated}`);
console.log(`   Não encontrados: ${notFound}`);
console.log(`   Já estavam corretos: ${skipped - notFound}`);

if (updates.length > 0 && updates.length <= 20) {
  console.log("\n📋 Atualizações realizadas:");
  updates.forEach((u) => {
    console.log(`   • ${u.name} → ${u.attribute} (ID: ${u.attributeId})`);
  });
} else if (updates.length > 20) {
  console.log("\n📋 Primeiras 20 atualizações:");
  updates.slice(0, 20).forEach((u) => {
    console.log(`   • ${u.name} → ${u.attribute} (ID: ${u.attributeId})`);
  });
  console.log(`   ... e mais ${updates.length - 20} atualizações`);
}

console.log("\n");

db.close();


