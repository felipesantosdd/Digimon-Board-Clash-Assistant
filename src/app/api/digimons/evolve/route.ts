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

    // Verificar se há Digimons na linha evolutiva definida
    let evolutionOptions: typeof allDigimons = [];

    if (currentDigimon.evolution && currentDigimon.evolution.length > 0) {
      // Buscar evoluções definidas que sejam ativas
      const evolutionsInLine = allDigimons.filter(
        (d) => currentDigimon.evolution.includes(d.id) && d.active !== false
      );

      if (evolutionsInLine.length > 0) {
        evolutionOptions = evolutionsInLine;
      }
    }

    // Se não houver na linha evolutiva, buscar no próximo nível disponível
    if (evolutionOptions.length === 0) {
      // Buscar a partir do nível seguinte até encontrar Digimons ativos
      for (let level = currentDigimon.level + 1; level <= 7; level++) {
        const availableDigimons = allDigimons.filter(
          (d) => d.level === level && d.active !== false
        );

        if (availableDigimons.length > 0) {
          evolutionOptions = availableDigimons;
          break;
        }
      }
    }

    if (evolutionOptions.length === 0) {
      return NextResponse.json(
        { error: "Não há evoluções disponíveis" },
        { status: 404 }
      );
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
        typeId: randomEvolution.typeId,
        hp: randomEvolution.hp,
        atk: randomEvolution.atk,
        def: randomEvolution.def,
        attribute_id: randomEvolution.attribute_id,
      },
      wasInEvolutionLine:
        currentDigimon.evolution?.includes(randomEvolution.id) || false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
