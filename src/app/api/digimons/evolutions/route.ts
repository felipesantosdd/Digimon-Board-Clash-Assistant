import { NextRequest, NextResponse } from "next/server";
import { getAllDigimons, getDigimonById } from "@/lib/digimon-db";

// POST - Buscar TODAS as opções de evolução possíveis para um Digimon
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

    // Buscar Digimons do próximo level (apenas ATIVOS)
    const nextLevelDigimons = allDigimons.filter(
      (d) => d.level === nextLevel && d.active !== false
    );

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

    // Escolher um aleatório como evolução final
    const finalEvolution =
      evolutionOptions[Math.floor(Math.random() * evolutionOptions.length)];

    // Para a animação: pegar vários Digimons aleatórios do próximo nível
    // Isso evita repetição quando há poucas opções de evolução
    const minAnimationOptions = 8; // Mínimo de 8 opções diferentes para animação
    let animationOptions = [...evolutionOptions];

    // Se tiver menos que o mínimo, adicionar Digimons aleatórios do mesmo nível
    if (animationOptions.length < minAnimationOptions) {
      // Pegar Digimons do mesmo nível que NÃO estão nas opções de evolução
      const otherDigimons = nextLevelDigimons.filter(
        (d) => !evolutionOptions.some((evo) => evo.id === d.id)
      );

      // Embaralhar e pegar alguns aleatórios
      const shuffled = otherDigimons.sort(() => Math.random() - 0.5);
      const needed = minAnimationOptions - animationOptions.length;
      const extras = shuffled.slice(0, needed);

      animationOptions = [...animationOptions, ...extras];
    }

    // Retornar opções de evolução, opções para animação e a evolução final
    return NextResponse.json({
      allOptions: evolutionOptions.map((d) => ({
        id: d.id,
        name: d.name,
        image: d.image,
      })),
      animationOptions: animationOptions.map((d) => ({
        id: d.id,
        name: d.name,
        image: d.image,
      })),
      finalEvolution: {
        id: finalEvolution.id,
        name: finalEvolution.name,
        image: finalEvolution.image,
        level: finalEvolution.level,
        dp: finalEvolution.dp,
        typeId: finalEvolution.typeId,
      },
      wasInEvolutionLine:
        currentDigimon.evolution?.includes(finalEvolution.id) || false,
    });
  } catch (error) {
    console.error("Erro ao buscar evoluções:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
