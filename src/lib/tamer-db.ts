import db from "./db";

export interface Tamer {
  id: number;
  name: string;
  image: string;
}

// Funções de Tamers
export function getAllTamers(): Tamer[] {
  const tamers = db
    .prepare("SELECT * FROM tamers ORDER BY id")
    .all() as Tamer[];
  console.log("📊 getAllTamers retornando:", tamers);
  return tamers;
}

export function getTamerById(id: number): Tamer | undefined {
  return db.prepare("SELECT * FROM tamers WHERE id = ?").get(id) as
    | Tamer
    | undefined;
}

export function createTamer(tamer: Omit<Tamer, "id">): Tamer {
  const stmt = db.prepare(`
    INSERT INTO tamers (name, image)
    VALUES (?, ?)
  `);

  const result = stmt.run(tamer.name, tamer.image);

  return getTamerById(Number(result.lastInsertRowid))!;
}

export function updateTamer(
  id: number,
  data: { name: string; image: string }
): Tamer | null {
  const stmt = db.prepare("UPDATE tamers SET name = ?, image = ? WHERE id = ?");
  stmt.run(data.name, data.image, id);

  return getTamerById(id) || null;
}

export function deleteTamer(id: number): void {
  const stmt = db.prepare("DELETE FROM tamers WHERE id = ?");
  stmt.run(id);
}
