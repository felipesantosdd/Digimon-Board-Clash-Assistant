"use client";

import { useState, useEffect } from "react";
import EvolutionModal from "../EvolutionModal";
import AddDigimonModal from "../AddDigimonModal";
import { Digimon } from "../../database/database_type";
import { useSnackbar } from "notistack";
import { capitalize, getLevelName } from "@/lib/utils";

export default function DigimonsTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [digimons, setDigimons] = useState<Digimon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  // Carregar Digimons da API
  useEffect(() => {
    fetchDigimons();
  }, []);

  const fetchDigimons = async () => {
    try {
      const response = await fetch("/api/digimons");
      if (response.ok) {
        const data = await response.json();
        setDigimons(data);
      } else {
        console.error("Erro ao carregar Digimons");
      }
    } catch (error) {
      console.error("Erro ao carregar Digimons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureEvolutions = (digimon: Digimon) => {
    // Permitir visualização mas não edição em produção
    setSelectedDigimon(digimon);
    setIsModalOpen(true);
  };

  const handleSaveEvolutions = async (
    digimonId: number,
    evolutionIds: number[]
  ) => {
    try {
      const response = await fetch(`/api/digimons/${digimonId}/evolutions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ evolution: evolutionIds }),
      });

      if (response.ok) {
        setDigimons((prev) =>
          prev.map((digimon) =>
            digimon.id === digimonId
              ? { ...digimon, evolution: evolutionIds }
              : digimon
          )
        );
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Erro ao salvar evoluções", { variant: "error" });
    }
  };

  const handleSaveDigimon = async (
    digimonId: number,
    data: {
      name: string;
      level: number;
      dp: number;
      typeId: number;
      image?: string;
    }
  ) => {
    try {
      const response = await fetch(`/api/digimons/${digimonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedDigimon = await response.json();

        // Atualizar o estado local
        setDigimons((prev) =>
          prev.map((digimon) =>
            digimon.id === digimonId ? updatedDigimon : digimon
          )
        );
        setSelectedDigimon(updatedDigimon);

        // Recarregar a lista para garantir sincronização
        await fetchDigimons();

        enqueueSnackbar("Digimon atualizado com sucesso!", {
          variant: "success",
        });
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Erro ao atualizar Digimon", { variant: "error" });
    }
  };

  const handleAddDigimonSuccess = async () => {
    fetchDigimons();
  };

  const handleDeleteDigimon = async (
    digimonId: number,
    digimonName: string
  ) => {
    if (!confirm(`Tem certeza que deseja excluir ${digimonName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/digimons/${digimonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDigimons((prev) => prev.filter((d) => d.id !== digimonId));
        enqueueSnackbar(`${digimonName} excluído com sucesso!`, {
          variant: "success",
        });
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Erro ao excluir Digimon", { variant: "error" });
    }
  };

  const filteredDigimons = digimons.filter((digimon) => {
    const matchesSearch = digimon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === null || digimon.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

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

  const getTypeName = (typeId: number) => {
    const types: { [key: number]: string } = {
      1: "Data",
      2: "Vaccine",
      3: "Virus",
      4: "Free",
      5: "Variable",
      6: "Unknown",
    };
    return types[typeId] || "Unknown";
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Configuração de Evoluções
          </h2>
          <p className="text-gray-300">
            Selecione um Digimon para configurar suas evoluções
          </p>
        </div>

        {/* Botão Adicionar */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Adicionar Digimon
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Buscar Digimon
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do Digimon..."
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Filtrar por Level
            </label>
            <select
              value={levelFilter || ""}
              onChange={(e) =>
                setLevelFilter(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 text-white bg-gray-700 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
              <option value="6">Level 6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Digimons */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Carregando Digimons...
          </h3>
        </div>
      ) : (
        <>
          {/* Se houver busca ou filtro, mostrar em grid simples */}
          {searchTerm || levelFilter ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDigimons.map((digimon) => {
                const needsEvolution =
                  digimon.level <= 3 &&
                  (!digimon.evolution || digimon.evolution.length === 0);

                return (
                  <div
                    key={digimon.id}
                    className={`bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                      needsEvolution ? "ring-4 ring-red-500" : ""
                    }`}
                  >
                    <div className="relative h-40 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden">
                      <img
                        src={digimon.image}
                        alt={digimon.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/digimons/fallback.svg";
                        }}
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {capitalize(digimon.name)}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`${getTypeColor(
                              digimon.typeId
                            )} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                          >
                            {getTypeName(digimon.typeId)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-300">
                          <span className="font-semibold">
                            <span className="text-blue-400">
                              {getLevelName(digimon.level)}
                            </span>
                          </span>
                          <span className="font-semibold">
                            DP:{" "}
                            <span className="text-orange-400">
                              {digimon.dp}
                            </span>
                          </span>
                        </div>

                        <div className="text-xs text-gray-400">
                          {digimon.evolution?.length || 0} evolução(ões)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleConfigureEvolutions(digimon)}
                          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Editar
                        </button>

                        {process.env.NODE_ENV === "development" && (
                          <button
                            onClick={() =>
                              handleDeleteDigimon(
                                digimon.id,
                                capitalize(digimon.name)
                              )
                            }
                            className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Seções por Nível - quando não há filtros */
            <div className="space-y-8">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                const digimonsInLevel = digimons.filter(
                  (d) => d.level === level
                );

                if (digimonsInLevel.length === 0) return null;

                return (
                  <div key={level}>
                    {/* Cabeçalho da Seção */}
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-white">
                        {getLevelName(level)}
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                      <span className="text-gray-400 text-sm font-semibold">
                        {digimonsInLevel.length}{" "}
                        {digimonsInLevel.length === 1 ? "Digimon" : "Digimons"}
                      </span>
                    </div>

                    {/* Grid de Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {digimonsInLevel.map((digimon) => {
                        const needsEvolution =
                          digimon.level <= 3 &&
                          (!digimon.evolution ||
                            digimon.evolution.length === 0);

                        return (
                          <div
                            key={digimon.id}
                            className={`bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                              needsEvolution ? "ring-4 ring-red-500" : ""
                            }`}
                          >
                            <div className="relative h-40 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden">
                              <img
                                src={digimon.image}
                                alt={digimon.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/digimons/fallback.svg";
                                }}
                              />
                            </div>

                            <div className="p-4">
                              <h3 className="text-lg font-bold text-white mb-2">
                                {capitalize(digimon.name)}
                              </h3>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`${getTypeColor(
                                      digimon.typeId
                                    )} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                                  >
                                    {getTypeName(digimon.typeId)}
                                  </span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-300">
                                  <span>
                                    DP:{" "}
                                    <span className="font-bold text-orange-400">
                                      {digimon.dp}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  handleConfigureEvolutions(digimon)
                                }
                                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                ⚙️ Gerenciar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredDigimons.length === 0 && (searchTerm || levelFilter) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                Nenhum Digimon encontrado
              </h3>
            </div>
          )}

          {filteredDigimons.length > 0 && (searchTerm || levelFilter) && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-2">
                📋 Legenda:
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <div className="w-6 h-6 rounded border-4 border-red-500"></div>
                <span>
                  Digimons até Level 3{" "}
                  <strong>sem evoluções configuradas</strong>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <EvolutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        digimon={selectedDigimon}
        allDigimons={digimons}
        onSaveEvolutions={handleSaveEvolutions}
        onSaveDigimon={handleSaveDigimon}
      />

      <AddDigimonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddDigimonSuccess}
        allDigimons={digimons}
      />
    </>
  );
}
