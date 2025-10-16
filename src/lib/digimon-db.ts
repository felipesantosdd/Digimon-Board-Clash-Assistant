import db from "./db";

export interface DigimonType {
  id: number;
  name: string;
  weakness: number | null;
}

export interface Digimon {
  id: number;
  name: string;
  image: string;
  level: number;
  typeId: number;
  evolution: number[];
  active?: boolean; // Indica se o Digimon está ativo (presente no CSV oficial)
  boss?: boolean; // Indica se pode ser usado como boss
  type?: DigimonType;
  hp?: number;
  atk?: number;
  def?: number;
  attribute_id?: number;
}

// Tipos de Digimon
export const digimonTypes = [
  { id: 1, name: "Data", weakness: 3 },
  { id: 2, name: "Vaccine", weakness: 1 },
  { id: 3, name: "Virus", weakness: 2 },
  { id: 4, name: "Free", weakness: null },
  { id: 5, name: "Variable", weakness: 4 },
  { id: 6, name: "Unknown", weakness: null },
];

// Funções de Digimon Types
export function getAllDigimonTypes(): DigimonType[] {
  return db
    .prepare("SELECT * FROM digimon_types ORDER BY id")
    .all() as DigimonType[];
}

export function getDigimonTypeById(id: number): DigimonType | undefined {
  return db.prepare("SELECT * FROM digimon_types WHERE id = ?").get(id) as
    | DigimonType
    | undefined;
}

// Funções de Digimons
export function getAllDigimons(): Digimon[] {
  const digimons = db
    .prepare("SELECT * FROM digimons ORDER BY level, name")
    .all() as Array<
    Omit<Digimon, "evolution" | "type" | "active" | "boss"> & {
      evolution: string;
      active?: number; // SQLite armazena como INTEGER (0 ou 1)
      boss?: number; // SQLite armazena como INTEGER (0 ou 1)
    }
  >;

  return digimons.map((d) => ({
    ...d,
    evolution: JSON.parse(d.evolution || "[]"),
    active: d.active === undefined ? true : d.active === 1, // Converter INTEGER para boolean
    boss: d.boss === 1, // Converter INTEGER para boolean
    type: getDigimonTypeById(d.typeId),
  }));
}

export function getDigimonById(id: number): Digimon | undefined {
  const digimon = db.prepare("SELECT * FROM digimons WHERE id = ?").get(id) as
    | (Omit<Digimon, "evolution" | "type" | "active" | "boss"> & {
        evolution: string;
        active?: number;
        boss?: number;
      })
    | undefined;

  if (!digimon) return undefined;

  return {
    ...digimon,
    evolution: JSON.parse(digimon.evolution || "[]"),
    active: digimon.active === undefined ? true : digimon.active === 1,
    boss: digimon.boss === 1,
    type: getDigimonTypeById(digimon.typeId),
  };
}

export function getDigimonsByLevel(level: number): Digimon[] {
  const digimons = db
    .prepare("SELECT * FROM digimons WHERE level = ? ORDER BY name")
    .all(level) as Array<
    Omit<Digimon, "evolution" | "type" | "active" | "boss"> & {
      evolution: string;
      active?: number;
      boss?: number;
    }
  >;

  return digimons.map((d) => ({
    ...d,
    evolution: JSON.parse(d.evolution || "[]"),
    active: d.active === undefined ? true : d.active === 1,
    boss: d.boss === 1,
    type: getDigimonTypeById(d.typeId),
  }));
}

export function createDigimon(digimon: Omit<Digimon, "id">): Digimon {
  const stmt = db.prepare(`
    INSERT INTO digimons (name, image, level, typeId, evolution, active, boss, hp, atk, attribute_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    digimon.name,
    digimon.image,
    digimon.level,
    digimon.typeId,
    JSON.stringify(digimon.evolution || []),
    digimon.active !== false ? 1 : 0,
    digimon.boss === true ? 1 : 0,
    digimon.hp ?? 0,
    digimon.atk ?? 0,
    digimon.attribute_id ?? null
  );

  return getDigimonById(Number(result.lastInsertRowid))!;
}

export function updateDigimonEvolutions(
  id: number,
  evolution: number[]
): Digimon | null {
  const stmt = db.prepare("UPDATE digimons SET evolution = ? WHERE id = ?");
  stmt.run(JSON.stringify(evolution), id);

  return getDigimonById(id) || null;
}

export function updateDigimon(
  id: number,
  data: {
    name: string;
    level: number;
    typeId: number;
    image?: string;
    active?: boolean;
    boss?: boolean;
    attribute_id?: number | null;
  }
): Digimon | null {
  // Construir query dinamicamente
  const fields: string[] = [];
  const values: (string | number)[] = [];

  fields.push("name = ?", "level = ?", "typeId = ?");
  values.push(data.name, data.level, data.typeId);

  if (data.image !== undefined) {
    fields.push("image = ?");
    values.push(data.image);
  }

  if (data.active !== undefined) {
    fields.push("active = ?");
    values.push(data.active ? 1 : 0);
  }

  if (data.boss !== undefined) {
    fields.push("boss = ?");
    values.push(data.boss ? 1 : 0);
  }

  if (data.attribute_id !== undefined) {
    fields.push("attribute_id = ?");
    values.push(
      (data.attribute_id === null
        ? null
        : Number(data.attribute_id)) as unknown as number
    );
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE digimons 
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  stmt.run(...values);

  return getDigimonById(id) || null;
}

export function deleteDigimon(id: number): void {
  // 1. Remover este ID de todas as evoluções de outros Digimons
  const allDigimons = getAllDigimons();

  for (const digimon of allDigimons) {
    if (digimon.evolution && digimon.evolution.includes(id)) {
      const updatedEvolutions = digimon.evolution.filter(
        (evoId) => evoId !== id
      );
      updateDigimonEvolutions(digimon.id, updatedEvolutions);
    }
  }

  // 2. Deletar o Digimon
  db.prepare("DELETE FROM digimons WHERE id = ?").run(id);

}

// Seed inicial
export function seedDatabase() {
  // Limpar dados existentes
  // Desabilitar FKs temporariamente para evitar falhas de ordem
  // (útil em dev quando há outras tabelas referenciando types)
  (db as any).exec?.("PRAGMA foreign_keys = OFF");

  db.prepare("DELETE FROM digimons").run();
  db.prepare("DELETE FROM digimon_types").run();

  // Inserir tipos
  const typeStmt = db.prepare(
    "INSERT INTO digimon_types (id, name, weakness) VALUES (?, ?, ?)"
  );
  for (const type of digimonTypes) {
    typeStmt.run(type.id, type.name, type.weakness);
  }

  // Inserir digimons (dados do seed anterior)
  const digimonStmt = db.prepare(`
    INSERT INTO digimons (id, name, image, level, dp, typeId, evolution)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedDigimons = [
    {
      id: 1,
      name: "Agumon",
      image: "/images/digimons/01.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [25, 28, 27],
    },
    {
      id: 2,
      name: "Gabumon",
      image: "/images/digimons/02.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 3,
      name: "veemon",
      image: "/images/digimons/03.png",
      typeId: 4,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 4,
      name: "Terriermon",
      image: "/images/digimons/04.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 5,
      name: "Guilmon",
      image: "/images/digimons/05.png",
      typeId: 3,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 6,
      name: "Patamon",
      image: "/images/digimons/06.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 7,
      name: "Salamon",
      image: "/images/digimons/07.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 8,
      name: "Tentomon",
      image: "/images/digimons/08.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 9,
      name: "Renamon",
      image: "/images/digimons/09.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 10,
      name: "Biyomon",
      image: "/images/digimons/10.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 11,
      name: "Betamon",
      image: "/images/digimons/11.png",
      typeId: 3,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 12,
      name: "Elecmon",
      image: "/images/digimons/12.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 13,
      name: "DemiDevimon",
      image: "/images/digimons/13.png",
      typeId: 3,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 14,
      name: "Gazimon",
      image: "/images/digimons/14.png",
      typeId: 3,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 15,
      name: "Gotsumon",
      image: "/images/digimons/15.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 16,
      name: "Flamemon",
      image: "/images/digimons/16.png",
      typeId: 5,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 17,
      name: "Dorumon",
      image: "/images/digimons/17.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 18,
      name: "Lopmon",
      image: "/images/digimons/18.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 19,
      name: "Palmon",
      image: "/images/digimons/19.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 20,
      name: "Gomamon",
      image: "/images/digimons/20.png",
      typeId: 2,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 21,
      name: "Armadillomon",
      image: "/images/digimons/21.png",
      typeId: 4,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 22,
      name: "Hawkmon",
      image: "/images/digimons/22.png",
      typeId: 4,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 23,
      name: "Meicoomon",
      image: "/images/digimons/23.png",
      typeId: 6,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 24,
      name: "Hackmon",
      image: "/images/digimons/24.png",
      typeId: 1,
      level: 1,
      dp: 2000,
      evolution: [],
    },
    {
      id: 25,
      name: "Greymon",
      image: "/images/digimons/25.png",
      typeId: 2,
      level: 2,
      dp: 5000,
      evolution: [35],
    },
    {
      id: 26,
      name: "DarkTyranomon",
      image: "/images/digimons/26.png",
      typeId: 3,
      level: 2,
      dp: 5000,
      evolution: [],
    },
    {
      id: 27,
      name: "Tuskmon",
      image: "/images/digimons/27.png",
      typeId: 3,
      level: 2,
      dp: 5000,
      evolution: [31, 34],
    },
    {
      id: 28,
      name: "Tyranomon",
      image: "/images/digimons/28.png",
      typeId: 3,
      level: 2,
      dp: 5000,
      evolution: [30, 31, 32, 33],
    },
    {
      id: 29,
      name: "v-dramon",
      image: "/images/digimons/29.png",
      typeId: 1,
      level: 1,
      dp: 5000,
      evolution: [],
    },
    {
      id: 30,
      name: "MasterTyranomon",
      image: "/images/digimons/30.png",
      typeId: 2,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 31,
      name: "Triceramon",
      image: "/images/digimons/31.png",
      typeId: 2,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 32,
      name: "Mametyramon",
      image: "/images/digimons/32.png",
      typeId: 3,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 33,
      name: "MetalTyranomon",
      image: "/images/digimons/33.png",
      typeId: 3,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 34,
      name: "Megadramon",
      image: "/images/digimons/34.png",
      typeId: 3,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 35,
      name: "SkullGreymon",
      image: "/images/digimons/35.png",
      typeId: 3,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 36,
      name: "WarGreymon",
      image: "/images/digimons/36.png",
      typeId: 2,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 37,
      name: "MetalGreymon Virus",
      image: "/images/digimons/37.png",
      typeId: 3,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 38,
      name: "MetalGreymon Vaccine",
      image: "/images/digimons/38.png",
      typeId: 2,
      level: 3,
      dp: 6000,
      evolution: [],
    },
    {
      id: 39,
      name: "Qinglongmon",
      image: "/images/digimons/39.png",
      typeId: 4,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 40,
      name: "Dinorexmon",
      image: "/images/digimons/40.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 41,
      name: "RustTyranomon",
      image: "/images/digimons/41.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 42,
      name: "Mugendramon",
      image: "/images/digimons/42.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 43,
      name: "Chaosdramon",
      image: "/images/digimons/43.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 44,
      name: "BlitzGreymon",
      image: "/images/digimons/44.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 45,
      name: "Omegamon Alter S",
      image: "/images/digimons/45.png",
      typeId: 4,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 46,
      name: "Gaioumon",
      image: "/images/digimons/46.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 47,
      name: "Gaioumon Itto Mode",
      image: "/images/digimons/47.png",
      typeId: 3,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 48,
      name: "VictoryGreymon",
      image: "/images/digimons/48.png",
      typeId: 2,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 49,
      name: "Omegamon",
      image: "/images/digimons/49.png",
      typeId: 4,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 50,
      name: "Aerov-dramon",
      image: "/images/digimons/50.png",
      typeId: 2,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 51,
      name: "UlforceV-dramon",
      image: "/images/digimons/51.png",
      typeId: 2,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 52,
      name: "AncientGreymon",
      image: "/images/digimons/52.png",
      typeId: 4,
      level: 4,
      dp: 12000,
      evolution: [],
    },
    {
      id: 53,
      name: "Huanglongmon",
      image: "/images/digimons/53.png",
      typeId: 4,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 54,
      name: "MoonMillenniumon",
      image: "/images/digimons/54.png",
      typeId: 3,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 55,
      name: "Millenniumon",
      image: "/images/digimons/55.png",
      typeId: 3,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 56,
      name: "Omegamon Alter B",
      image: "/images/digimons/56.png",
      typeId: 4,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 57,
      name: "Omegamon Zwart Defeat",
      image: "/images/digimons/57.png",
      typeId: 4,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 58,
      name: "Omegamon Zwart",
      image: "/images/digimons/58.png",
      typeId: 4,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 59,
      name: "Omegamon Merciful Mode",
      image: "/images/digimons/59.png",
      typeId: 4,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 60,
      name: "Goddramon",
      image: "/images/digimons/60.png",
      typeId: 2,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 61,
      name: "UlforceV-dramon Future Mode",
      image: "/images/digimons/61.png",
      typeId: 2,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 62,
      name: "Susanoomon",
      image: "/images/digimons/62.png",
      typeId: 4,
      level: 5,
      dp: 18000,
      evolution: [],
    },
    {
      id: 68,
      name: "ZeedMillenniumon",
      image: "/images/digimons/68.png",
      typeId: 3,
      level: 6,
      dp: 20000,
      evolution: [],
    },
  ];

  for (const d of seedDigimons) {
    digimonStmt.run(
      d.id,
      d.name,
      d.image,
      d.level,
      d.dp,
      d.typeId,
      JSON.stringify(d.evolution)
    );
  }


  // Reabilitar FKs
  (db as any).exec?.("PRAGMA foreign_keys = ON");
}
