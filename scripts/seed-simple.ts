import { seedDatabase } from "../src/lib/digimon-db";

try {
  console.log("🚀 Iniciando seed do banco de dados...");
  seedDatabase();
  console.log("🎉 Seed concluído com sucesso!");
  process.exit(0);
} catch (error) {
  console.error("❌ Erro ao fazer seed:", error);
  process.exit(1);
}
