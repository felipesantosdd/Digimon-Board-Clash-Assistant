import { NextRequest, NextResponse } from "next/server";
import { getBossById, updateBoss, deleteBoss } from "@/lib/boss-db";

// GET - Buscar boss por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const boss = getBossById(parseInt(id));

    if (!boss) {
      return NextResponse.json(
        { error: "Boss não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(boss);
  } catch (error) {
    console.error("Erro ao buscar boss:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar boss
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedBoss = updateBoss(parseInt(id), body);

    if (!updatedBoss) {
      return NextResponse.json(
        { error: "Boss não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBoss);
  } catch (error) {
    console.error("Erro ao atualizar boss:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar boss
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteBoss(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar boss:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
