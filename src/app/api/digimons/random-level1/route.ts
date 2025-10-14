import { NextResponse } from "next/server";
import { getDigimonsByLevel } from "@/lib/digimon-db";

// GET - Sortear Digimons level 1 aleatórios
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const countParam = url.searchParams.get("count");
    const count = countParam ? parseInt(countParam, 10) : 3;

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: "Quantidade deve estar entre 1 e 10" },
        { status: 400 }
      );
    }

    // Buscar todos os Digimons level 1 (apenas ATIVOS)
    const allLevel1Digimons = getDigimonsByLevel(1);
    const level1Digimons = allLevel1Digimons.filter((d) => d.active !== false);

    if (level1Digimons.length === 0) {
      return NextResponse.json(
        { error: "Nenhum Digimon level 1 ativo encontrado" },
        { status: 404 }
      );
    }

    // Sortear aleatoriamente sem repetição
    const shuffled = [...level1Digimons].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, level1Digimons.length));

    // Retornar apenas os dados necessários
    const result = selected.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.image,
      level: d.level,
      typeId: d.typeId,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao sortear Digimons:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
