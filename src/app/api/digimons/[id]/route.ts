import { NextRequest, NextResponse } from "next/server";
import {
  getDigimonById,
  updateDigimon,
  deleteDigimon,
  getAllDigimons,
} from "@/lib/digimon-db";

// PUT - Atualizar dados do Digimon (nome, level, dp, tipo)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("🔍 API PUT recebeu:", { id, body });
    const { name, level, dp, typeId, image } = body;
    console.log("📋 Campos extraídos:", { name, level, dp, typeId, image });

    if (!name || !level || !dp || !typeId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, level, dp, typeId" },
        { status: 400 }
      );
    }

    // Converter nome para lowercase
    const lowerName = name.trim().toLowerCase();

    // Verificar se já existe outro Digimon com esse nome
    const allDigimons = getAllDigimons();
    const duplicateDigimon = allDigimons.find(
      (d) => d.name.toLowerCase() === lowerName && d.id !== Number(id)
    );

    if (duplicateDigimon) {
      return NextResponse.json(
        { error: `Já existe um Digimon com o nome "${lowerName}"` },
        { status: 409 } // 409 Conflict
      );
    }

    console.log("💾 Executando UPDATE:", {
      name: lowerName,
      level,
      dp,
      typeId,
      image,
      id: Number(id),
    });

    const updatedDigimon = updateDigimon(Number(id), {
      name: lowerName,
      level,
      dp,
      typeId,
      ...(image && { image }),
    });

    console.log("✅ Digimon atualizado:", updatedDigimon);

    if (!updatedDigimon) {
      return NextResponse.json(
        { error: "Digimon não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDigimon);
  } catch (error) {
    console.error("Erro ao atualizar Digimon:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir Digimon
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
    const digimonId = Number(id);

    const digimon = getDigimonById(digimonId);

    if (!digimon) {
      return NextResponse.json(
        { error: "Digimon não encontrado" },
        { status: 404 }
      );
    }

    deleteDigimon(digimonId);

    return NextResponse.json({
      success: true,
      message: `Digimon ${digimon.name} excluído com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao excluir Digimon:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
