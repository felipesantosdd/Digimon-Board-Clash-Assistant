import { NextRequest, NextResponse } from "next/server";
import { getAllDigimons, createDigimon } from "@/lib/digimon-db";

// GET - Listar todos os Digimons
export async function GET() {
  try {
    const digimons = getAllDigimons();
    return NextResponse.json(digimons);
  } catch (error) {
    console.error("Erro ao buscar Digimons:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo Digimon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image, level, dp, typeId, evolution = [] } = body;

    if (!name || !image || !level || !dp || !typeId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, image, level, dp, typeId" },
        { status: 400 }
      );
    }

    const savedDigimon = createDigimon({
      name,
      image,
      level,
      dp,
      typeId,
      evolution,
    });

    return NextResponse.json(savedDigimon, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar Digimon:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
