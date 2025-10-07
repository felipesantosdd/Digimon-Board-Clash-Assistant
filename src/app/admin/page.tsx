"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EvolutionModal from "../components/EvolutionModal";
import AddDigimonModal from "../components/AddDigimonModal";
import { Digimon } from "../database/database_type";
import { useSnackbar } from "notistack";

export default function AdminPage() {
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

    fetchDigimons();
  }, []);

  const handleConfigureEvolutions = (digimon: Digimon) => {
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
        // Atualizar a lista local
        setDigimons((prev) =>
          prev.map((digimon) =>
            digimon.id === digimonId
              ? { ...digimon, evolution: evolutionIds }
              : digimon
          )
        );
        console.log(
          `✅ Evoluções do Digimon ${digimonId} atualizadas com sucesso!`
        );
      } else {
        const error = await response.json();
        console.error("Erro ao salvar evoluções:", error.error);
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      console.error("Erro ao salvar evoluções:", error);
      enqueueSnackbar("Erro ao salvar evoluções", { variant: "error" });
    }
  };

  const handleSaveDigimon = async (
    digimonId: number,
    data: { name: string; level: number; dp: number; typeId: number }
  ) => {
    try {
      console.log("🚀 Fazendo PUT para:", `/api/digimons/${digimonId}`);
      console.log("📤 Dados enviados:", data);

      const response = await fetch(`/api/digimons/${digimonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedDigimon = await response.json();
        // Atualizar a lista local
        setDigimons((prev) =>
          prev.map((digimon) =>
            digimon.id === digimonId ? { ...digimon, ...data } : digimon
          )
        );
        // Atualizar o digimon selecionado
        setSelectedDigimon(updatedDigimon);
        enqueueSnackbar("Digimon atualizado com sucesso!", {
          variant: "success",
        });
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      console.error("Erro ao atualizar Digimon:", error);
      enqueueSnackbar("Erro ao atualizar Digimon", { variant: "error" });
    }
  };

  const handleAddDigimonSuccess = async () => {
    // Recarregar lista de Digimons
    const response = await fetch("/api/digimons");
    if (response.ok) {
      const data = await response.json();
      setDigimons(data);
    }
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
        // Remover da lista local
        setDigimons((prev) => prev.filter((d) => d.id !== digimonId));
        enqueueSnackbar(`${digimonName} excluído com sucesso!`, {
          variant: "success",
        });
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      console.error("Erro ao excluir Digimon:", error);
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
      1: "bg-blue-500", // Data
      2: "bg-green-500", // Vaccine
      3: "bg-purple-500", // Virus
      4: "bg-gray-500", // Free
      5: "bg-yellow-500", // Variable
      6: "bg-red-500", // Unknown
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
                Digimon Board Clash - Admin
              </h1>
            </Link>

            <div className="flex gap-4">
              <Link href="/digimons">
                <button className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Ver Digimons
                </button>
              </Link>
              <Link href="/tamers">
                <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Tamers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Configuração de Evoluções
            </h2>
            <p className="text-gray-600">
              Selecione um Digimon para configurar suas evoluções
            </p>
          </div>

          {/* Botão Adicionar - Apenas em Development */}
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Digimon
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do Digimon..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Level
              </label>
              <select
                value={levelFilter || ""}
                onChange={(e) =>
                  setLevelFilter(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Carregando Digimons...
            </h3>
            <p className="text-gray-500">
              Aguarde enquanto buscamos os dados do banco
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDigimons.map((digimon) => (
                <div
                  key={digimon.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagem do Digimon */}
                  <div className="relative h-32 bg-gradient-to-br from-orange-100 to-blue-100">
                    <img
                      src={`/images/digimons/${digimon.id
                        .toString()
                        .padStart(2, "0")}.png`}
                      alt={digimon.name}
                      className="w-full h-full object-contain p-2"
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
                      <span className="text-4xl">🤖</span>
                    </div>
                  </div>

                  {/* Informações do Digimon */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
                      {digimon.name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {/* Tipo */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`${getTypeColor(
                            digimon.typeId
                          )} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                        >
                          {getTypeName(digimon.typeId)}
                        </span>
                      </div>

                      {/* Level e DP */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="font-semibold">
                          Lv:{" "}
                          <span className="text-blue-600">{digimon.level}</span>
                        </span>
                        <span className="font-semibold">
                          DP:{" "}
                          <span className="text-orange-600">{digimon.dp}</span>
                        </span>
                      </div>

                      {/* Evoluções */}
                      <div className="text-xs text-gray-500">
                        {digimon.evolution?.length || 0} evolução(ões)
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleConfigureEvolutions(digimon)}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Configurar Evoluções
                      </button>

                      {process.env.NODE_ENV === "development" && (
                        <button
                          onClick={() =>
                            handleDeleteDigimon(digimon.id, digimon.name)
                          }
                          className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          🗑️ Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDigimons.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum Digimon encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Configuração de Evoluções e Edição */}
      <EvolutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        digimon={selectedDigimon}
        allDigimons={digimons}
        onSaveEvolutions={handleSaveEvolutions}
        onSaveDigimon={handleSaveDigimon}
      />

      {/* Modal de Adicionar Digimon */}
      <AddDigimonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddDigimonSuccess}
      />
    </div>
  );
}
