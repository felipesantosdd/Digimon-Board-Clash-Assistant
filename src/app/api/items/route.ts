import { NextRequest, NextResponse } from "next/server";
import { getAllItems, createItem } from "@/lib/item-db";

// GET - Listar todos os itens
export async function GET() {
  try {
    const items = getAllItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      image,
      effect,
      effectId,
      dropChance,
      targetDigimons,
    } = body;

    if (!name || !description || (!effect && !effectId)) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Validar dropChance (0-100)
    if (dropChance !== undefined && (dropChance < 0 || dropChance > 100)) {
      return NextResponse.json(
        { error: "Chance de drop deve estar entre 0 e 100" },
        { status: 400 }
      );
    }

    const newItem = createItem({
      name,
      description,
      image: image || "/images/items/fallback.svg",
      effect: effect || "", // Para compatibilidade
      effectId: effectId || undefined,
      dropChance: dropChance || 0,
      targetDigimons: targetDigimons || undefined,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
