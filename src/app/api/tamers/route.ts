import { NextRequest, NextResponse } from "next/server";
import { getAllTamers, createTamer } from "@/lib/tamer-db";

// GET - Listar todos os Tamers
export async function GET() {
  try {
    const tamers = getAllTamers();
    console.log("📊 API /tamers retornando:", tamers);
    return NextResponse.json(tamers);
  } catch (error) {
    console.error("Erro ao buscar Tamers:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo Tamer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image } = body;

    if (!name || !image) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, image" },
        { status: 400 }
      );
    }

    // Verificar se já existe um Tamer com esse nome
    const allTamers = getAllTamers();
    const duplicateTamer = allTamers.find(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicateTamer) {
      return NextResponse.json(
        { error: `Já existe um Tamer com o nome "${name}"` },
        { status: 409 } // 409 Conflict
      );
    }

    const savedTamer = createTamer({
      name: name.trim(),
      image,
    });

    return NextResponse.json(savedTamer, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar Tamer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
