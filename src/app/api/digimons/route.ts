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
    const {
      name,
      image,
      level,
      typeId,
      evolution = [],
      active = true,
      boss = false,
      attribute_id = null,
    } = body;

    if (!name || !image || level === undefined || level === null || !typeId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, image, level, typeId" },
        { status: 400 }
      );
    }

    // Converter nome para lowercase
    const lowerName = name.trim().toLowerCase();

    // Verificar se já existe um Digimon com esse nome
    const allDigimons = getAllDigimons();
    const duplicateDigimon = allDigimons.find(
      (d) => d.name.toLowerCase() === lowerName
    );

    if (duplicateDigimon) {
      return NextResponse.json(
        { error: `Já existe um Digimon com o nome "${lowerName}"` },
        { status: 409 } // 409 Conflict
      );
    }

    const savedDigimon = createDigimon({
      name: lowerName,
      image,
      level,
      typeId,
      evolution,
      active,
      boss,
      attribute_id,
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
