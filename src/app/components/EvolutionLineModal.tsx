"use client";

import { useState, useEffect, useRef } from "react";
import { Digimon } from "../database/database_type";
import TypeIcon from "./TypeIcons";
import { capitalize, getLevelName } from "@/lib/utils";
import { getDigimonImagePath } from "@/lib/image-utils";

interface EvolutionLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: Digimon | null;
  allDigimons: Digimon[];
}

interface EvolutionConnection {
  from: Digimon;
  to: Digimon;
  color: string;
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
  const [connections, setConnections] = useState<EvolutionConnection[]>([]);
  const [showConnections, setShowConnections] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (digimon && allDigimons.length > 0) {
      // Reset states when opening modal
      setShowConnections(false);
      setEvolutionLine([]);
      setConnections([]);

      buildEvolutionLine(digimon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digimon, allDigimons, isOpen]);

  // Aguardar o render dos elementos antes de mostrar as conexões
  useEffect(() => {
    if (connections.length > 0 && isOpen) {
      const timer = setTimeout(() => {
        setShowConnections(true);
      }, 300); // Tempo otimizado
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      // Reset when modal closes
      setShowConnections(false);
    }
  }, [connections, isOpen]);

  const buildEvolutionLine = (selectedDigimon: Digimon) => {
    const line: Digimon[][] = [];
    const newConnections: EvolutionConnection[] = [];

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
            // Criar conexão
            const connection = {
              from: current,
              to: evo,
              color: getDigimonColor(current.id),
            };
            newConnections.push(connection);
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
            // Criar conexão reversa
            const parent = currentDigimons.find((c) =>
              d.evolution?.includes(c.id)
            );
            if (parent) {
              const connection = {
                from: d,
                to: parent,
                color: getDigimonColor(d.id),
              };
              newConnections.push(connection);
            }
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
    setConnections(newConnections);
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

  // Componente para desenhar as linhas de conexão
  const EvolutionConnections = () => {
    if (!showConnections || !containerRef.current || connections.length === 0) {
      return null;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const svgWidth = containerRect.width;
    const svgHeight = containerRect.height;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={svgWidth}
        height={svgHeight}
        style={{ zIndex: 1 }}
      >
        {connections.map((connection, index) => {
          const fromElement = document.getElementById(
            `digimon-${connection.from.id}`
          );
          const toElement = document.getElementById(
            `digimon-${connection.to.id}`
          );

          if (!fromElement || !toElement) {
            return null;
          }

          const fromRect = fromElement.getBoundingClientRect();
          const toRect = toElement.getBoundingClientRect();

          const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
          const toX = toRect.left + toRect.width / 2 - containerRect.left;
          const toY = toRect.top + toRect.height / 2 - containerRect.top;

          // Calcular pontos de controle para uma curva suave
          const controlPoint1X = fromX;
          const controlPoint1Y = fromY + (toY - fromY) * 0.3;
          const controlPoint2X = toX;
          const controlPoint2Y = toY - (toY - fromY) * 0.3;

          return (
            <g key={index}>
              {/* Linha principal */}
              <path
                d={`M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`}
                stroke={connection.color}
                strokeWidth="4"
                fill="none"
                strokeDasharray="8,4"
                opacity="0.9"
              />
              {/* Seta no final */}
              <polygon
                points={`${toX - 8},${toY - 4} ${toX},${toY} ${toX - 8},${
                  toY + 4
                }`}
                fill={connection.color}
                opacity="0.9"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4"
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
            <div
              ref={containerRef}
              className="relative min-h-[600px]"
              style={{ zIndex: 2 }}
            >
              {/* Linhas de conexão SVG */}
              <EvolutionConnections />

              {/* Digimons organizados por nível */}
              <div className="space-y-12">
                {evolutionLine.map((level, levelIndex) => {
                  if (!level || level.length === 0) return null;

                  return (
                    <div key={levelIndex}>
                      <div className="flex items-center mb-6">
                        <h3 className="text-lg font-bold text-white px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg mr-4">
                          {getLevelName(levelIndex + 1)}
                        </h3>
                        <div className="h-px bg-gradient-to-r from-gray-400 to-transparent flex-1"></div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-8">
                        {level.map((evo) => (
                          <div
                            id={`digimon-${evo.id}`}
                            key={evo.id}
                            className={`bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all w-40 transform hover:scale-105 ${
                              evo.id === digimon.id
                                ? "ring-4 ring-yellow-400 shadow-2xl"
                                : ""
                            }`}
                            style={{
                              borderWidth: "3px",
                              borderStyle: "solid",
                              borderColor: getDigimonColor(evo.id),
                              zIndex: 3,
                            }}
                          >
                            {/* Imagem */}
                            <div className="relative h-40 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden">
                              <img
                                src={
                                  evo.image || "/images/digimons/fallback1.jpg"
                                }
                                alt={evo.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/digimons/fallback1.jpg";
                                }}
                              />
                              {/* Badge de seleção */}
                              {evo.id === digimon.id && (
                                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                  Selecionado
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                              <p className="text-sm font-bold text-white truncate mb-2">
                                {capitalize(evo.name)}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`${getTypeColor(
                                    evo.typeId
                                  )} text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1`}
                                >
                                  <TypeIcon
                                    typeId={evo.typeId}
                                    size={10}
                                    className="text-white"
                                  />
                                  {evo.type?.name}
                                </span>
                                <span className="text-[10px] text-gray-300 font-semibold">
                                  Level {evo.level}
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 rounded-b-lg border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-200">
              💡 <span className="font-medium">Dica:</span> As linhas
              pontilhadas coloridas mostram as conexões evolutivas. O Digimon
              selecionado está destacado com borda dourada.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✨ Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
