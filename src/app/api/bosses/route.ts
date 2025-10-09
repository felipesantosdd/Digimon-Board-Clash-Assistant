import { NextRequest, NextResponse } from "next/server";
import { getAllBosses, createBoss } from "@/lib/boss-db";

// GET - Listar todos os bosses
export async function GET() {
  try {
    const bosses = getAllBosses();
    return NextResponse.json(bosses);
  } catch (error) {
    console.error("Erro ao buscar bosses:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo boss
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image, description, effect, dp, typeId } = body;

    if (!name || !image || !description || !effect || !dp || !typeId) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const newBoss = createBoss({
      name,
      image,
      description,
      effect,
      dp,
      typeId,
    });

    return NextResponse.json(newBoss, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar boss:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
