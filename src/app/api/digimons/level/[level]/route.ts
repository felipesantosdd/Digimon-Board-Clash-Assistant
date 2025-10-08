import { NextRequest, NextResponse } from "next/server";
import { getDigimonsByLevel } from "@/lib/digimon-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level: levelStr } = await params;
    const level = parseInt(levelStr, 10);

    if (isNaN(level) || level < 1 || level > 7) {
      return NextResponse.json(
        { error: "Nível inválido. Deve ser entre 1 e 7." },
        { status: 400 }
      );
    }

    const digimons = getDigimonsByLevel(level);

    return NextResponse.json(digimons);
  } catch (error) {
    console.error("Erro ao buscar Digimons por nível:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
