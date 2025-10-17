// Adaptador para ler dados do JSON em produção
import digimonTypesData from "@/data/digimon-types.json";
import digimonsData from "@/data/digimons.json";
import attributesData from "@/data/digimon-attributes.json";
import tamersData from "@/data/tamers.json";
import itemsData from "@/data/items.json";

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

interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  effectId?: number;
  dropChance?: number;
  targetDigimons?: number[];
  active?: number;
}

export const jsonDb = {
  prepare: (query: string) => {
    return {
      all: (params?: number | string) => {
        // Detectar qual tabela está sendo consultada
        if (query.includes("digimon_types")) {
          return digimonTypesData as DigimonType[];
        }
        if (query.includes("tamers")) {
          return tamersData as Tamer[];
        }
        if (query.includes("items")) {
          return itemsData as Item[];
        }
        if (query.includes("digimons")) {
          // Verificar se tem filtro por nível
          if (query.includes("WHERE level = ?") && params !== undefined) {
            const level = params as number;
            return (digimonsData as Array<Record<string, unknown>>)
              .filter((d) => d.level === level)
              .map((d) => ({ ...d, dp: 0 }));
          }
          return (digimonsData as Array<Record<string, unknown>>).map((d) => ({
            ...d,
            dp: 0,
          }));
        }
        if (query.includes("attributes")) {
          return attributesData as Array<Record<string, unknown>>;
        }
        return [];
      },
      get: (params?: number | string) => {
        // Para queries com WHERE id = ?
        if (query.includes("tamers") && query.includes("WHERE id")) {
          const id = params;
          return (tamersData as Tamer[]).find((t) => t.id === id) || null;
        }
        if (query.includes("items") && query.includes("WHERE id")) {
          const id = params;
          return (itemsData as Item[]).find((i) => i.id === id) || null;
        }
        if (query.includes("digimons") && query.includes("WHERE id")) {
          const id = params;
          const digimon = (digimonsData as Array<Record<string, unknown>>).find(
            (d) => d.id === id
          );
          return digimon ? { ...digimon, dp: 0 } : null;
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
        return { changes: 0, lastInsertRowid: 0 };
      },
    };
  },
  exec: () => {
  },
};
