// Adaptador para ler dados do JSON em produção
import digimonTypesData from "@/data/digimon-types.json";
import digimonsData from "@/data/digimons.json";
import tamersData from "@/data/tamers.json";

interface DigimonType {
  id: number;
  name: string;
  weakness: number | null;
}

interface Digimon {
  id: number;
  name: string;
  image: string;
  level: number;
  dp: number;
  typeId: number;
  evolution: string;
}

interface Tamer {
  id: number;
  name: string;
  image: string;
}

export const jsonDb = {
  prepare: (query: string) => {
    return {
      all: () => {
        // Detectar qual tabela está sendo consultada
        if (query.includes("digimon_types")) {
          return digimonTypesData as DigimonType[];
        }
        if (query.includes("tamers")) {
          return tamersData as Tamer[];
        }
        if (query.includes("digimons")) {
          return digimonsData as Digimon[];
        }
        return [];
      },
      get: (params?: number | string) => {
        // Para queries com WHERE id = ?
        if (query.includes("tamers") && query.includes("WHERE id")) {
          const id = params;
          return (tamersData as Tamer[]).find((t) => t.id === id) || null;
        }
        if (query.includes("digimons") && query.includes("WHERE id")) {
          const id = params;
          return (digimonsData as Digimon[]).find((d) => d.id === id) || null;
        }
        if (query.includes("digimon_types") && query.includes("WHERE id")) {
          const id = params;
          return (
            (digimonTypesData as DigimonType[]).find((t) => t.id === id) || null
          );
        }
        return null;
      },
      run: () => {
        console.warn(
          "⚠️ Operações de escrita não são suportadas em produção (JSON mode)"
        );
        return { changes: 0, lastInsertRowid: 0 };
      },
    };
  },
  exec: () => {
    console.warn(
      "⚠️ Operações de escrita não são suportadas em produção (JSON mode)"
    );
  },
};
