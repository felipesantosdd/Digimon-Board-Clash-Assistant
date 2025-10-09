import { NextRequest, NextResponse } from "next/server";
import { getAllDigimons, getDigimonById } from "@/lib/digimon-db";

// POST - Buscar opções de evolução para um Digimon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { digimonId } = body;

    if (!digimonId) {
      return NextResponse.json(
        { error: "digimonId é obrigatório" },
        { status: 400 }
      );
    }

    const currentDigimon = getDigimonById(digimonId);
    if (!currentDigimon) {
      return NextResponse.json(
        { error: "Digimon não encontrado" },
        { status: 404 }
      );
    }

    const allDigimons = getAllDigimons();
    const nextLevel = currentDigimon.level + 1;

    // BLOQUEIO TEMPORÁRIO: Não permitir evoluções para Mega (levels 4-7)
    if (nextLevel >= 4) {
      return NextResponse.json(
        {
          error: "Evoluções Mega estão temporariamente bloqueadas para testes",
        },
        { status: 403 }
      );
    }

    // Buscar Digimons do próximo level
    const nextLevelDigimons = allDigimons.filter((d) => d.level === nextLevel);

    if (nextLevelDigimons.length === 0) {
      return NextResponse.json(
        { error: "Não há Digimons do próximo level disponíveis" },
        { status: 404 }
      );
    }

    // Verificar se há Digimons na linha evolutiva (evolution array)
    let evolutionOptions: typeof nextLevelDigimons = [];
    if (currentDigimon.evolution && currentDigimon.evolution.length > 0) {
      evolutionOptions = nextLevelDigimons.filter((d) =>
        currentDigimon.evolution.includes(d.id)
      );
    }

    // Se não houver na linha evolutiva, usar todos do próximo level
    if (evolutionOptions.length === 0) {
      evolutionOptions = nextLevelDigimons;
    }

    // Escolher um aleatório
    const randomEvolution =
      evolutionOptions[Math.floor(Math.random() * evolutionOptions.length)];

    return NextResponse.json({
      evolution: {
        id: randomEvolution.id,
        name: randomEvolution.name,
        image: randomEvolution.image,
        level: randomEvolution.level,
        dp: randomEvolution.dp,
        typeId: randomEvolution.typeId,
      },
      wasInEvolutionLine:
        currentDigimon.evolution?.includes(randomEvolution.id) || false,
    });
  } catch (error) {
    console.error("Erro ao buscar evolução:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
