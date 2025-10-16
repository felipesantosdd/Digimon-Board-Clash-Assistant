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

    // Verificar se há Digimons na linha evolutiva definida
    let evolutionOptions: typeof allDigimons = [];
    let targetLevel = currentDigimon.level + 1;
    let wasInEvolutionLine = false;

    if (currentDigimon.evolution && currentDigimon.evolution.length > 0) {
      // Buscar evoluções definidas que sejam ativas
      const evolutionsInLine = allDigimons.filter(
        (d) => currentDigimon.evolution.includes(d.id) && d.active !== false
      );

      if (evolutionsInLine.length > 0) {
        // Encontrou evoluções na linha evolutiva
        evolutionOptions = evolutionsInLine;
        wasInEvolutionLine = true;
        // Pegar o menor nível entre as evoluções encontradas
        targetLevel = Math.min(...evolutionsInLine.map((d) => d.level));
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
          targetLevel = level;
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
      const sameLevelDigimons = allDigimons.filter(
        (d) =>
          d.level === targetLevel &&
          d.active !== false &&
          !evolutionOptions.some((evo) => evo.id === d.id)
      );

      // Embaralhar e pegar alguns aleatórios
      const shuffled = sameLevelDigimons.sort(() => Math.random() - 0.5);
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
        typeId: finalEvolution.typeId,
        hp: finalEvolution.hp,
        atk: finalEvolution.atk,
        def: finalEvolution.def,
        attribute_id: finalEvolution.attribute_id,
        evolution: finalEvolution.evolution,
      },
      wasInEvolutionLine: wasInEvolutionLine,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
