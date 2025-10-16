import { NextRequest, NextResponse } from "next/server";
import {
  getDigimonById,
  updateDigimon,
  deleteDigimon,
  getAllDigimons,
} from "@/lib/digimon-db";

// GET - Buscar um Digimon por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const digimon = getDigimonById(Number(id));

    if (!digimon) {
      return NextResponse.json(
        { error: "Digimon não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(digimon);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do Digimon (nome, level, dp, tipo)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, level, typeId, image, active, boss, attribute_id } = body;

    if (!name || level === undefined || level === null || !typeId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, level, typeId" },
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


    const updatedDigimon = updateDigimon(Number(id), {
      name: lowerName,
      level,
      typeId,
      ...(image && { image }),
      ...(active !== undefined && { active }),
      ...(boss !== undefined && { boss }),
      ...(attribute_id !== undefined && { attribute_id }),
    });


    if (!updatedDigimon) {
      return NextResponse.json(
        { error: "Digimon não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDigimon);
  } catch (error) {
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

    // Deletar imagem se for customizada (tem timestamp)
    if (digimon.image && digimon.image.startsWith("/images/")) {
      const fileName = digimon.image.split("/").pop();
      if (fileName && fileName.match(/^\d+_/)) {
        try {
          const fs = await import("fs/promises");
          const path = await import("path");
          const imagePath = path.join(
            process.cwd(),
            "public",
            digimon.image.substring(1)
          );

          await fs.unlink(imagePath);
        } catch (error) {
          // Não falhar a exclusão se a imagem não puder ser removida
        }
      }
    }

    // Deletar Digimon (e remover de todas as evoluções)
    deleteDigimon(digimonId);

    return NextResponse.json({
      success: true,
      message: `Digimon ${digimon.name} excluído com sucesso`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
