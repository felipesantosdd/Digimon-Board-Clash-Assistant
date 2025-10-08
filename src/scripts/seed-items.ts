import { initializeItemsTable, seedItems } from "../lib/item-db";

console.log("🎒 Inicializando tabela de itens...");

try {
  initializeItemsTable();
  console.log("✅ Tabela de itens criada com sucesso!");

  console.log("📦 Populando itens...");
  seedItems();
  console.log("✅ Itens adicionados com sucesso!");
} catch (error) {
  console.error("❌ Erro ao inicializar itens:", error);
  process.exit(1);
}
