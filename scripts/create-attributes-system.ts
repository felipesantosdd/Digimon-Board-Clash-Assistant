import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔥 Criando sistema de Atributos Elementais...\n");

try {
  // PARTE 1: Criar tabela de atributos
  console.log("📝 Criando tabela 'digimon_attributes'...\n");

  db.exec(`
    CREATE TABLE IF NOT EXISTS digimon_attributes (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      weakness_id INTEGER,
      FOREIGN KEY (weakness_id) REFERENCES digimon_attributes(id)
    );
  `);

  console.log("✅ Tabela criada!\n");

  // PARTE 2: Inserir atributos elementais
  // Sistema de fraquezas baseado em elementos opostos
  const attributes = [
    { id: 1, name: "Neutro", weakness: null }, // Sem fraqueza
    { id: 2, name: "Fogo", weakness: 3 }, // Fraco contra Água
    { id: 3, name: "Água", weakness: 5 }, // Fraco contra Planta
    { id: 4, name: "Gelo", weakness: 2 }, // Fraco contra Fogo
    { id: 5, name: "Planta", weakness: 2 }, // Fraco contra Fogo
    { id: 6, name: "Vento", weakness: 7 }, // Fraco contra Terra
    { id: 7, name: "Terra", weakness: 3 }, // Fraco contra Água
    { id: 8, name: "Trovão", weakness: 7 }, // Fraco contra Terra
    { id: 9, name: "Luz", weakness: 10 }, // Fraco contra Trevas
    { id: 10, name: "Trevas", weakness: 9 }, // Fraco contra Luz
    { id: 11, name: "Metal", weakness: 8 }, // Fraco contra Trovão
    { id: 12, name: "Desconhecido", weakness: null }, // Sem fraqueza conhecida
  ];

  console.log("📝 Inserindo atributos:\n");

  // Desabilitar foreign keys temporariamente para inserir todos de uma vez
  db.pragma("foreign_keys = OFF");

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO digimon_attributes (id, name, weakness_id)
    VALUES (?, ?, ?)
  `);

  attributes.forEach((attr) => {
    stmt.run(attr.id, attr.name, attr.weakness);
    const weaknessName = attributes.find((a) => a.id === attr.weakness)?.name;
    console.log(
      `✅ [${attr.id}] ${attr.name} ${
        weaknessName ? `→ Fraco contra ${weaknessName}` : "(Sem fraqueza)"
      }`
    );
  });

  // Reabilitar foreign keys
  db.pragma("foreign_keys = ON");

  // PARTE 3: Adicionar coluna attributeId na tabela digimons
  console.log("\n📝 Adicionando coluna 'attributeId' na tabela digimons...\n");

  const tableInfo = db.pragma("table_info(digimons)") as Array<{
    name: string;
  }>;
  const hasAttributeId = tableInfo.some((col) => col.name === "attributeId");

  if (!hasAttributeId) {
    db.exec("ALTER TABLE digimons ADD COLUMN attributeId INTEGER DEFAULT 12"); // 12 = Desconhecido
    console.log("✅ Coluna 'attributeId' adicionada!");
  } else {
    console.log("✅ Coluna 'attributeId' já existe!");
  }

  console.log("\n" + "═".repeat(70));
  console.log("✅ Sistema de atributos criado com sucesso!");
  console.log("═".repeat(70));
  console.log("\n📊 SISTEMA DE ATRIBUTOS:");
  console.log("   12 atributos elementais cadastrados");
  console.log("   Sistema de fraquezas configurado");
  console.log("   Coluna attributeId adicionada aos Digimons");
  console.log("");
  console.log("💡 CICLO DE FRAQUEZAS:");
  console.log("   🔥 Fogo → 💧 Água → 🌿 Planta → 🔥 Fogo");
  console.log("   ⚡ Trovão → 🪨 Terra → 💧 Água");
  console.log("   ❄️ Gelo → 🔥 Fogo");
  console.log("   💨 Vento → 🪨 Terra");
  console.log("   ☀️ Luz ↔ 🌑 Trevas");
  console.log("   🔩 Metal → ⚡ Trovão");
  console.log("");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
