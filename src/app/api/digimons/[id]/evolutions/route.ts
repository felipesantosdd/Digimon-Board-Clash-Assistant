import { NextRequest, NextResponse } from "next/server";
import { getDigimonById, updateDigimonEvolutions } from "@/lib/digimon-db";

// PUT - Atualizar evoluções de um Digimon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const digimonId = parseInt(id);
    const body = await request.json();
    const { evolution } = body;

    if (!Array.isArray(evolution)) {
      return NextResponse.json(
        { error: "Evolução deve ser um array de IDs" },
        { status: 400 }
      );
    }

    const digimon = getDigimonById(digimonId);

    if (!digimon) {
      return NextResponse.json(
        { error: "Digimon não encontrado" },
        { status: 404 }
      );
    }

    // Validar se todos os IDs de evolução existem e são do nível seguinte
    const nextLevel = digimon.level + 1;
    for (const evoId of evolution) {
      const evoDigimon = getDigimonById(evoId);
      if (!evoDigimon) {
        return NextResponse.json(
          { error: `Digimon com ID ${evoId} não existe` },
          { status: 400 }
        );
      }
      if (evoDigimon.level !== nextLevel) {
        return NextResponse.json(
          { error: `Todas as evoluções devem ser do level ${nextLevel}` },
          { status: 400 }
        );
      }
    }

    const updatedDigimon = updateDigimonEvolutions(digimonId, evolution);

    return NextResponse.json(updatedDigimon);
  } catch (error) {
    console.error("Erro ao atualizar evoluções:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
