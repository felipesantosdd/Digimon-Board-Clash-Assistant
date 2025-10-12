import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔧 Corrigindo duplicações nos Armor Eggs...\n");

try {
  // Buscar todos os ovos
  const items = db.prepare("SELECT * FROM items WHERE name LIKE '%Ovo%' OR name LIKE '%Egg%' ORDER BY id").all() as Array<{
    id: number;
    name: string;
    description: string;
    targetDigimons: string;
  }>;

  console.log("📋 Ovos encontrados:\n");
  items.forEach(item => {
    console.log(`[ID: ${item.id}] ${item.name}`);
    console.log(`   Descrição: ${item.description}`);
    console.log(`   Target: ${item.targetDigimons}`);
    console.log('');
  });

  // Remover o primeiro "Ovo da Amizade" que tem apenas 2 evoluções
  const firstAmizade = items.find(item => 
    item.name === "Ovo da Amizade" && 
    item.description === "Fortalece os laços entre Digimons e aliados."
  );

  if (firstAmizade) {
    console.log(`\n❌ Removendo Ovo da Amizade duplicado (ID: ${firstAmizade.id})...`);
    db.prepare("DELETE FROM items WHERE id = ?").run(firstAmizade.id);
    console.log("✅ Ovo duplicado removido!");
  }

  // Atualizar o Ovo da Amizade correto para remover Thunderbirmon
  const correctAmizade = items.find(item => 
    item.name === "Ovo da Amizade" && 
    item.description === "Fortalece laços e trabalho em equipe entre parceiros."
  );

  if (correctAmizade) {
    // Thunderbirmon (541) deve estar apenas no Destino
    const targetDigimons = JSON.parse(correctAmizade.targetDigimons);
    const filtered = targetDigimons.filter((id: number) => id !== 541);
    
    db.prepare("UPDATE items SET targetDigimons = ? WHERE id = ?").run(
      JSON.stringify(filtered),
      correctAmizade.id
    );
    console.log(`\n✅ Removido Thunderbirmon do Ovo da Amizade (ID: ${correctAmizade.id})`);
    console.log(`   Evoluções atualizadas: ${filtered}`);
  }

  console.log("\n" + "═".repeat(70));
  console.log("✅ Correções aplicadas com sucesso!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

