import { NextRequest, NextResponse } from "next/server";
import {
  getTamerById,
  updateTamer,
  deleteTamer,
  getAllTamers,
} from "@/lib/tamer-db";

// GET - Buscar Tamer por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tamer = getTamerById(Number(id));

    if (!tamer) {
      return NextResponse.json(
        { error: "Tamer não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(tamer);
  } catch (error) {
    console.error("Erro ao buscar Tamer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar Tamer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, image } = body;

    if (!name || !image) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, image" },
        { status: 400 }
      );
    }

    // Verificar se já existe outro Tamer com esse nome
    const allTamers = getAllTamers();
    const duplicateTamer = allTamers.find(
      (t) =>
        t.name.toLowerCase() === name.trim().toLowerCase() &&
        t.id !== Number(id)
    );

    if (duplicateTamer) {
      return NextResponse.json(
        { error: `Já existe um Tamer com o nome "${name}"` },
        { status: 409 } // 409 Conflict
      );
    }

    const updatedTamer = updateTamer(Number(id), {
      name: name.trim(),
      image,
    });

    if (!updatedTamer) {
      return NextResponse.json(
        { error: "Tamer não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTamer);
  } catch (error) {
    console.error("Erro ao atualizar Tamer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir Tamer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Operações de exclusão não são permitidas em produção." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const tamerId = Number(id);

    const tamer = getTamerById(tamerId);

    if (!tamer) {
      return NextResponse.json(
        { error: "Tamer não encontrado" },
        { status: 404 }
      );
    }

    deleteTamer(tamerId);

    return NextResponse.json({
      success: true,
      message: `Tamer ${tamer.name} excluído com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao excluir Tamer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
