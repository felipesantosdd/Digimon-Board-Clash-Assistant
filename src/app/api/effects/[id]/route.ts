import { NextRequest, NextResponse } from "next/server";
import { getEffectById, updateEffect, deleteEffect } from "@/lib/effects-db";

// GET - Buscar efeito por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const effect = getEffectById(parseInt(id));

    if (!effect) {
      return NextResponse.json(
        { error: "Efeito não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(effect);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar efeito
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedEffect = updateEffect(parseInt(id), body);

    if (!updatedEffect) {
      return NextResponse.json(
        { error: "Efeito não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEffect);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar efeito
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteEffect(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
