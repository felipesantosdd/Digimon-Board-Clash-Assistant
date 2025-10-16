import { NextRequest, NextResponse } from "next/server";
import { getAllEffects, createEffect } from "@/lib/effects-db";

// GET - Listar todos os efeitos
export async function GET() {
  try {
    const effects = getAllEffects();
    return NextResponse.json(effects);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo efeito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, code, type, value } = body;

    if (!name || !description || !code || !type) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, description, code, type" },
        { status: 400 }
      );
    }

    const newEffect = createEffect({
      name,
      description,
      code,
      type,
      value: value || 0,
    });

    return NextResponse.json(newEffect, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
