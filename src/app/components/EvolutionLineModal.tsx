"use client";

import { useState, useEffect } from "react";
import { Digimon } from "../database/database_type";
import { capitalize } from "@/lib/utils";

interface EvolutionLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: Digimon | null;
  allDigimons: Digimon[];
}

// Gerar cor única baseada no ID do Digimon
const getDigimonColor = (id: number): string => {
  const colors = [
    "#ef4444", // red-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#06b6d4", // cyan-500
    "#a855f7", // purple-500
    "#84cc16", // lime-500
    "#f43f5e", // rose-500
  ];
  return colors[id % colors.length];
};

export default function EvolutionLineModal({
  isOpen,
  onClose,
  digimon,
  allDigimons,
}: EvolutionLineModalProps) {
  const [evolutionLine, setEvolutionLine] = useState<Digimon[][]>([]);

  useEffect(() => {
    if (digimon && allDigimons.length > 0) {
      buildEvolutionLine(digimon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digimon, allDigimons]);

  const buildEvolutionLine = (selectedDigimon: Digimon) => {
    const line: Digimon[][] = [];

    // Passo 1: Construir a linha evolutiva completa
    const startLevel = selectedDigimon.level;

    // Adicionar o próprio Digimon
    line[startLevel - 1] = [selectedDigimon];

    // Buscar evoluções (níveis superiores)
    let currentDigimons = [selectedDigimon];
    for (let level = startLevel + 1; level <= 7; level++) {
      const nextEvolutions: Digimon[] = [];

      currentDigimons.forEach((current) => {
        const evolutions = current.evolution || [];
        evolutions.forEach((evoId) => {
          const evo = allDigimons.find((d) => d.id === evoId);
          if (evo && !nextEvolutions.find((e) => e.id === evo.id)) {
            nextEvolutions.push(evo);
          }
        });
      });

      if (nextEvolutions.length > 0) {
        line[level - 1] = nextEvolutions;
        currentDigimons = nextEvolutions;
      } else {
        break;
      }
    }

    // Buscar pré-evoluções (níveis inferiores)
    currentDigimons = [selectedDigimon];
    for (let level = startLevel - 1; level >= 1; level--) {
      const preEvolutions: Digimon[] = [];

      allDigimons.forEach((d) => {
        if (
          d.level === level &&
          d.evolution?.some((id) => currentDigimons.some((c) => c.id === id))
        ) {
          if (!preEvolutions.find((e) => e.id === d.id)) {
            preEvolutions.push(d);
          }
        }
      });

      if (preEvolutions.length > 0) {
        line[level - 1] = preEvolutions;
        currentDigimons = preEvolutions;
      } else {
        break;
      }
    }

    setEvolutionLine(line);
  };

  if (!isOpen || !digimon) return null;

  const getTypeColor = (typeId: number) => {
    const colors: { [key: number]: string } = {
      1: "bg-blue-500",
      2: "bg-green-500",
      3: "bg-purple-500",
      4: "bg-gray-500",
      5: "bg-yellow-500",
      6: "bg-red-500",
    };
    return colors[typeId] || "bg-gray-500";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            🔄 Linha Evolutiva - {capitalize(digimon.name)}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Evolution Line */}
        <div className="p-6">
          {evolutionLine.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-300">
                Linha evolutiva não encontrada
              </h3>
            </div>
          ) : (
            <div className="space-y-8">
              {evolutionLine.map((level, levelIndex) => {
                if (!level || level.length === 0) return null;

                return (
                  <div key={levelIndex}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="h-px bg-gray-300 flex-1 max-w-xs"></div>
                      <h3 className="text-sm font-semibold text-white px-4 bg-gray-800">
                        Level {levelIndex + 1}
                      </h3>
                      <div className="h-px bg-gray-300 flex-1 max-w-xs"></div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                      {level.map((evo) => (
                        <div
                          key={evo.id}
                          className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all w-36 ${
                            evo.id === digimon.id ? "ring-4 ring-blue-400" : ""
                          }`}
                          style={{
                            borderWidth: "3px",
                            borderStyle: "solid",
                            borderColor: getDigimonColor(evo.id),
                          }}
                        >
                          {/* Imagem */}
                          <div className="relative h-32 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden">
                            <img
                              src={`/images/digimons/${evo.id
                                .toString()
                                .padStart(2, "0")}.png`}
                              alt={evo.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const fallback =
                                  target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-blue-100"
                              style={{ display: "none" }}
                            >
                              <span className="text-4xl">🤖</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-2">
                            <p className="text-sm font-bold text-white truncate">
                              {capitalize(evo.name)}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`${getTypeColor(
                                  evo.typeId
                                )} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}
                              >
                                {evo.type?.name}
                              </span>
                              <span className="text-[10px] text-gray-300">
                                DP: {evo.dp}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 rounded-b-lg border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-200">
              💡 <span className="font-medium">Dica:</span> A borda colorida
              indica o caminho evolutivo
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
