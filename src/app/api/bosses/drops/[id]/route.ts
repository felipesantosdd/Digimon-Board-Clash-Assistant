import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// PUT - Atualizar drop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Operação não permitida em produção" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { itemId, dropChance } = body;

    // Validar dropChance (1-100)
    if (dropChance !== undefined && (dropChance < 1 || dropChance > 100)) {
      return NextResponse.json(
        { error: "Chance de drop deve estar entre 1 e 100" },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE boss_drops 
      SET itemId = ?, dropChance = ?
      WHERE id = ?
    `);

    stmt.run(itemId, dropChance, parseInt(id));

    const updated = db
      .prepare("SELECT * FROM boss_drops WHERE id = ?")
      .get(parseInt(id));

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar drop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Operação não permitida em produção" },
        { status: 403 }
      );
    }

    const { id } = await params;
    db.prepare("DELETE FROM boss_drops WHERE id = ?").run(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
