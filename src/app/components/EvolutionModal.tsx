"use client";

import { useState, useEffect } from "react";
import { Digimon } from "../database/database_type";

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: Digimon | null;
  allDigimons: Digimon[];
  onSaveEvolutions: (digimonId: number, evolutionIds: number[]) => void;
}

export default function EvolutionModal({
  isOpen,
  onClose,
  digimon,
  allDigimons,
  onSaveEvolutions,
}: EvolutionModalProps) {
  const [selectedEvolutions, setSelectedEvolutions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (digimon) {
      setSelectedEvolutions(digimon.evolution || []);
    }
  }, [digimon]);

  if (!isOpen || !digimon) return null;

  const handleEvolutionToggle = (evolutionId: number) => {
    setSelectedEvolutions((prev) => {
      if (prev.includes(evolutionId)) {
        return prev.filter((id) => id !== evolutionId);
      } else {
        return [...prev, evolutionId];
      }
    });
  };

  const handleSave = () => {
    onSaveEvolutions(digimon.id, selectedEvolutions);
    onClose();
  };

  // Filtrar Digimons que podem ser evoluções (não o próprio Digimon e apenas do nível seguinte)
  const possibleEvolutions = allDigimons.filter(
    (d) =>
      d.id !== digimon.id &&
      d.level === digimon.level + 1 &&
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Configurar Evoluções - {digimon.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Digimon Atual:</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <img
                src={`/images/digimons/${digimon.id
                  .toString()
                  .padStart(2, "0")}.png`}
                alt={digimon.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ display: "none" }}
              >
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-lg">{digimon.name}</p>
              <p className="text-sm text-gray-600">
                Level {digimon.level} • DP: {digimon.dp}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">
              Selecionar Evoluções para Level {digimon.level + 1} (
              {selectedEvolutions.length} selecionadas):
            </h3>
            <div className="text-sm text-gray-500">
              {possibleEvolutions.length} Digimons disponíveis
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar Digimons para evolução..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {possibleEvolutions.length > 0 ? (
              possibleEvolutions.map((evolution) => (
                <div
                  key={evolution.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedEvolutions.includes(evolution.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleEvolutionToggle(evolution.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEvolutions.includes(evolution.id)}
                      onChange={() => handleEvolutionToggle(evolution.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-blue-100 rounded flex items-center justify-center relative overflow-hidden">
                      <img
                        src={`/images/digimons/${evolution.id
                          .toString()
                          .padStart(2, "0")}.png`}
                        alt={evolution.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ display: "none" }}
                      >
                        <span className="text-lg">🤖</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {evolution.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Level {evolution.level} • DP: {evolution.dp}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum Digimon encontrado
                </h4>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Tente ajustar sua busca"
                    : `Não há Digimons de level ${
                        digimon.level + 1
                      } disponíveis`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar Evoluções
          </button>
        </div>
      </div>
    </div>
  );
}
