"use client";

import { useState, useEffect } from "react";
import EvolutionModal from "../EvolutionModal";
import EvolutionLineModal from "../EvolutionLineModal";
import AddDigimonModal from "../AddDigimonModal";
import TypeIcon from "../TypeIcons";
import Image from "next/image";
import { Digimon } from "../../database/database_type";
import { useSnackbar } from "notistack";
import { capitalize, getLevelName } from "@/lib/utils";

interface DigimonsTabProps {
  isProduction?: boolean;
  onCountUpdate?: (count: number) => void;
}

export default function DigimonsTab({
  isProduction = false,
  onCountUpdate,
}: DigimonsTabProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [digimons, setDigimons] = useState<Digimon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  // Estados para visualização de linha evolutiva
  const [viewingDigimon, setViewingDigimon] = useState<Digimon | null>(null);
  const [attributesById, setAttributesById] = useState<
    Record<number, { id: number; name: string; image: string }>
  >({});
  const [isEvolutionLineOpen, setIsEvolutionLineOpen] = useState(false);

  // Carregar Digimons da API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDigimons();
    fetch("/api/attributes")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: Array<{ id: number; name: string; image: string }>) => {
        const map: Record<number, { id: number; name: string; image: string }> =
          {};
        for (const a of arr) map[a.id] = a;
        setAttributesById(map);
      })
      .catch(() => {});
  }, []);

  const getAttributeIcon = (attributeId?: number) => {
    switch (attributeId) {
      case 1:
        return "/images/icons/fire-icon.png";
      case 2:
        return "/images/icons/water-icon.png";
      case 3:
        return "/images/icons/plant-icon.png";
      case 4:
        return "/images/icons/ice-icon.png";
      case 5:
        return "/images/icons/electricity-icon.png";
      case 6:
        return "/images/icons/earth-icon.png";
      case 7:
        return "/images/icons/steel-icon.png";
      case 8:
        return "/images/icons/wind-icon.png";
      case 9:
        return "/images/icons/light-icon.png";
      case 10:
        return "/images/icons/dark-icon.png";
      case 11:
        return "/images/icons/null-icon.png";
      default:
        return "";
    }
  };

  const fetchDigimons = async () => {
    try {
      const response = await fetch("/api/digimons");
      if (response.ok) {
        const data = await response.json();
        setDigimons(data);

        // Contar Digimons ativos
        const activeCount = data.filter(
          (d: Digimon) => d.active !== false
        ).length;
        if (onCountUpdate) {
          onCountUpdate(activeCount);
        }
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureEvolutions = (digimon: Digimon) => {
    // Permitir visualização mas não edição em produção
    setSelectedDigimon(digimon);
    setIsModalOpen(true);
  };

  const handleViewEvolutionLine = (digimon: Digimon) => {
    setViewingDigimon(digimon);
    setIsEvolutionLineOpen(true);
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
      typeId: number;
      image?: string;
      active?: boolean;
      boss?: boolean;
      attribute_id?: number | null;
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

  const filteredDigimons = digimons
    .filter((digimon) => {
      const matchesSearch = digimon.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLevel =
        levelFilter === null || digimon.level === levelFilter;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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
              <option value="0">Armor</option>
              <option value="1">Rookie</option>
              <option value="2">Champion</option>
              <option value="3">Ultimate</option>
              <option value="4">Mega</option>
              <option value="5">Ultra</option>
              <option value="6">Super Mega</option>
              <option value="7">???</option>
              <option value="8">Spirits</option>
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
                    <div
                      className="relative h-56 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden cursor-pointer"
                      onClick={() => handleViewEvolutionLine(digimon)}
                      title="Clique para ver a linha evolutiva"
                    >
                      <img
                        src={digimon.image || "/images/digimons/fallback1.jpg"}
                        alt={digimon.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/digimons/fallback1.jpg";
                        }}
                      />
                      {/* Badge de Boss */}
                      {digimon.boss && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <span>👑</span>
                          <span>BOSS</span>
                        </div>
                      )}
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
                            )} text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1`}
                          >
                            <TypeIcon
                              typeId={digimon.typeId}
                              size={12}
                              className="text-white"
                            />
                            {getTypeName(digimon.typeId)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-300">
                          <span className="font-semibold">
                            <span className="text-blue-400">
                              {getLevelName(digimon.level)}
                            </span>
                          </span>
                          {(() => {
                            const attrId = (
                              digimon as unknown as {
                                attribute_id?: number;
                              }
                            ).attribute_id;
                            const attr = attrId
                              ? attributesById[attrId]
                              : undefined;
                            const icon = attr?.image || undefined;
                            if (!icon) return null;
                            return (
                              <span className="flex items-center gap-2">
                                <Image
                                  src={icon}
                                  alt="Atributo"
                                  width={20}
                                  height={20}
                                />
                              </span>
                            );
                          })()}
                        </div>

                        {/* HP / ATK / DEF */}
                        {(() => {
                          const dx = digimon as unknown as {
                            hp?: number;
                            atk?: number;
                            def?: number;
                          };
                          const hp = dx.hp ?? 0;
                          const atk = dx.atk ?? 0;
                          const def = dx.def ?? 0;
                          return (
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>
                                HP:{" "}
                                <span className="text-green-400 font-semibold">
                                  {hp.toLocaleString()}
                                </span>
                              </span>
                              <div className="flex gap-3">
                                <span>
                                  ATK:{" "}
                                  <span className="text-red-400 font-semibold">
                                    {atk.toLocaleString()}
                                  </span>
                                </span>
                                <span>
                                  DEF:{" "}
                                  <span className="text-blue-300 font-semibold">
                                    {def.toLocaleString()}
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="text-xs text-gray-400">
                          {digimon.evolution?.length || 0} evolução(ões)
                        </div>
                      </div>

                      <div className="space-y-2">
                        {!isProduction && (
                          <>
                            <button
                              onClick={() => handleConfigureEvolutions(digimon)}
                              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Editar
                            </button>

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
                          </>
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
              {[8, 0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
                const digimonsInLevel = digimons
                  .filter((d) => d.level === level)
                  .sort((a, b) => a.name.localeCompare(b.name));

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
                            <div
                              className="relative h-56 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden cursor-pointer"
                              onClick={() => handleViewEvolutionLine(digimon)}
                              title={
                                digimon.active === false
                                  ? "⚠️ Digimon Inativo - Não disponível no Time Stranger. Clique para ver linha evolutiva."
                                  : "Clique para ver a linha evolutiva"
                              }
                            >
                              <img
                                src={
                                  digimon.image ||
                                  "/images/digimons/fallback1.jpg"
                                }
                                alt={digimon.name}
                                className="w-full h-full object-cover"
                                style={
                                  digimon.active === false
                                    ? { filter: "grayscale(100%) opacity(0.6)" }
                                    : undefined
                                }
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/digimons/fallback1.jpg";
                                }}
                              />
                              {/* Badge de Boss */}
                              {digimon.boss && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                                  <span>👑</span>
                                  <span>BOSS</span>
                                </div>
                              )}
                              {digimon.active === false && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                  ⚠️ INATIVO
                                </div>
                              )}
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
                                    )} text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1`}
                                  >
                                    <TypeIcon
                                      typeId={digimon.typeId}
                                      size={12}
                                      className="text-white"
                                    />
                                    {getTypeName(digimon.typeId)}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-300">
                                  <span>
                                    Evoluções:{" "}
                                    <span className="font-bold text-purple-400">
                                      {digimon.evolution?.length || 0}
                                    </span>
                                  </span>
                                  {(digimon as any).attribute_id && (
                                    <span className="flex items-center gap-2">
                                      <Image
                                        src={getAttributeIcon(
                                          (digimon as any).attribute_id
                                        )}
                                        alt="Atributo"
                                        width={20}
                                        height={20}
                                      />
                                    </span>
                                  )}
                                </div>

                                {/* HP / ATK / DEF */}
                                {(() => {
                                  const hp = (digimon as any).hp ?? 0;
                                  const atk = (digimon as any).atk ?? 0;
                                  const def = (digimon as any).def ?? 0;
                                  return (
                                    <div className="flex justify-between text-xs text-gray-300">
                                      <span>
                                        HP:{" "}
                                        <span className="text-green-400 font-semibold">
                                          {hp.toLocaleString()}
                                        </span>
                                      </span>
                                      <div className="flex gap-3">
                                        <span>
                                          ATK:{" "}
                                          <span className="text-red-400 font-semibold">
                                            {atk.toLocaleString()}
                                          </span>
                                        </span>
                                        <span>
                                          DEF:{" "}
                                          <span className="text-blue-300 font-semibold">
                                            {def.toLocaleString()}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="space-y-2">
                                {!isProduction && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleConfigureEvolutions(digimon)
                                      }
                                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      Editar
                                    </button>

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
                                  </>
                                )}
                              </div>
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

      {/* Modal de Linha Evolutiva */}
      <EvolutionLineModal
        isOpen={isEvolutionLineOpen}
        onClose={() => setIsEvolutionLineOpen(false)}
        digimon={viewingDigimon}
        allDigimons={digimons}
      />
    </>
  );
}
