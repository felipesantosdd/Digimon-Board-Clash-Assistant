import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Listar todos os drops
export async function GET() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json([]);
    }

    const drops = db
      .prepare("SELECT * FROM boss_drops ORDER BY bossId, id")
      .all();
    return NextResponse.json(drops);
  } catch (error) {
    console.error("Erro ao buscar drops:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo drop
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Operação não permitida em produção" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bossId, itemId, dropChance } = body;

    if (
      bossId === undefined ||
      itemId === undefined ||
      dropChance === undefined
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar dropChance (1-100)
    if (dropChance < 1 || dropChance > 100) {
      return NextResponse.json(
        { error: "Chance de drop deve estar entre 1 e 100" },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO boss_drops (bossId, itemId, dropChance)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(bossId, itemId, dropChance);

    const newDrop = db
      .prepare("SELECT * FROM boss_drops WHERE id = ?")
      .get(Number(result.lastInsertRowid));

    return NextResponse.json(newDrop, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar drop:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
