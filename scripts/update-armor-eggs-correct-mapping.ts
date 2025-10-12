import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Atualizando mapeamento correto dos Armor Eggs...\n");

try {
  // Buscar todos os Digimons para verificar IDs
  const allDigimons = db.prepare("SELECT id, name, level FROM digimons").all() as Array<{
    id: number;
    name: string;
    level: number;
  }>;

  const findDigimonIds = (names: string[]): number[] => {
    const ids: number[] = [];
    names.forEach((name) => {
      const found = allDigimons.find((d) =>
        d.name.toLowerCase().includes(name.toLowerCase())
      );
      if (found) {
        ids.push(found.id);
      }
    });
    return ids;
  };

  // Mapeamento correto baseado na lista fornecida
  const correctMapping = [
    {
      name: "Ovo da Amizade",
      targetDigimons: findDigimonIds([
        "raidramon",
        "thunderbirmon",
        "togemogumon",
      ]),
    },
    {
      name: "Ovo da Confiabilidade",
      targetDigimons: findDigimonIds(["mantaraymon", "submarimon"]),
    },
    {
      name: "Ovo da Coragem",
      targetDigimons: findDigimonIds(["flamedramon", "lynxmon", "shadramon"]),
    },
    {
      name: "Ovo da Esperança",
      targetDigimons: findDigimonIds([
        "pegasusmon",
        "sheepmon",
        "sagittarimon",
      ]),
    },
    {
      name: "Ovo da Gentileza",
      targetDigimons: findDigimonIds(["prairiemon"]),
    },
    {
      name: "Ovo da Luz",
      targetDigimons: findDigimonIds([
        "harpymon",
        "nefertimon",
        "quetzalmon",
      ]),
    },
    {
      name: "Ovo da Pureza",
      targetDigimons: findDigimonIds(["shurimon", "yasyamon"]),
    },
    {
      name: "Ovo do Amor",
      targetDigimons: findDigimonIds(["halsemon", "pipismon", "sethmon"]),
    },
    {
      name: "Ovo do Conhecimento",
      targetDigimons: findDigimonIds(["digmon"]),
    },
    {
      name: "Ovo do Destino",
      targetDigimons: findDigimonIds(["rapidmon perfect", "goldveedramon"]),
    },
    {
      name: "Ovo dos Milagres",
      targetDigimons: findDigimonIds(["magnamon", "maildramon"]),
    },
  ];

  console.log("📝 Atualizando ovos:\n");

  correctMapping.forEach((egg) => {
    if (egg.targetDigimons.length > 0) {
      db.prepare("UPDATE items SET targetDigimons = ? WHERE name = ?").run(
        JSON.stringify(egg.targetDigimons),
        egg.name
      );
      console.log(`✅ ${egg.name}: ${egg.targetDigimons.length} Digimon(s)`);
      console.log(`   IDs: [${egg.targetDigimons.join(", ")}]`);

      // Mostrar nomes
      egg.targetDigimons.forEach((id) => {
        const d = allDigimons.find((dig) => dig.id === id);
        if (d) {
          console.log(`      → ${d.name}`);
        }
      });
      console.log("");
    } else {
      console.log(`⚠️  ${egg.name}: Nenhum Digimon encontrado no banco`);
      console.log("");
    }
  });

  console.log("═".repeat(70));
  console.log("✅ Mapeamento atualizado com sucesso!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");

