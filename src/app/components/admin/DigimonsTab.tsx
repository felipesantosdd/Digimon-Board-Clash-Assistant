"use client";

import { useState, useEffect } from "react";
import EvolutionModal from "../EvolutionModal";
import EvolutionLineModal from "../EvolutionLineModal";
import AddDigimonModal from "../AddDigimonModal";
import TypeIcon from "../TypeIcons";
import ImageCropper from "../ImageCropper";
import { Digimon } from "../../database/database_type";
import { useSnackbar } from "notistack";
import { capitalize, getLevelName } from "@/lib/utils";

interface DigimonsTabProps {
  isProduction?: boolean;
}

export default function DigimonsTab({
  isProduction = false,
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
  const [isEvolutionLineOpen, setIsEvolutionLineOpen] = useState(false);

  // Estados para modal de upload rápido de imagem (temporário para desenvolvimento)
  const [uploadingDigimon, setUploadingDigimon] = useState<Digimon | null>(
    null
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);

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

  const handleOpenUploadModal = (digimon: Digimon) => {
    setUploadingDigimon(digimon);
    setImagePreviewUrl(digimon.image || null);
    setCroppedImageFile(null);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadingDigimon(null);
    setImagePreviewUrl(null);
    setCroppedImageFile(null);
    setImageToCrop("");
    setShowCropper(false);
    setIsUploadModalOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        enqueueSnackbar("Por favor, selecione uma imagem válida", {
          variant: "warning",
        });
        return;
      }

      // Abrir cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Converter blob para File
    const extension = croppedBlob.type === "image/webp" ? "webp" : "jpg";
    const croppedFile = new File([croppedBlob], `cropped-image.${extension}`, {
      type: croppedBlob.type,
    });
    setCroppedImageFile(croppedFile);

    // Criar preview da imagem recortada
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);

    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
  };

  const handleUploadImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadingDigimon) return;

    if (!croppedImageFile) {
      enqueueSnackbar("Selecione e corte uma imagem primeiro", {
        variant: "warning",
      });
      return;
    }

    setUploadingImage(true);

    try {
      console.log("📤 Iniciando upload da imagem...");

      // Upload da imagem cortada
      const uploadFormData = new FormData();
      uploadFormData.append("file", croppedImageFile);
      uploadFormData.append("type", "digimon");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("❌ Erro no upload:", errorData);
        throw new Error(errorData.error || "Erro ao fazer upload da imagem");
      }

      const { path: url } = await uploadResponse.json();
      console.log("✅ Upload concluído:", url);

      // Atualizar o Digimon com a nova imagem
      console.log("🔄 Atualizando Digimon:", {
        id: uploadingDigimon.id,
        name: uploadingDigimon.name,
        level: uploadingDigimon.level,
        typeId: uploadingDigimon.typeId,
        image: url,
      });

      const updateResponse = await fetch(
        `/api/digimons/${uploadingDigimon.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: uploadingDigimon.name,
            level: uploadingDigimon.level,
            typeId: uploadingDigimon.typeId,
            image: url,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("❌ Erro ao atualizar:", errorData);
        throw new Error(errorData.error || "Erro ao atualizar Digimon");
      }

      const updatedDigimon = await updateResponse.json();
      console.log("✅ Digimon atualizado:", updatedDigimon);

      // Atualizar a lista local
      setDigimons((prev) =>
        prev.map((d) =>
          d.id === uploadingDigimon.id ? { ...d, image: url } : d
        )
      );

      enqueueSnackbar(
        `Imagem de ${capitalize(uploadingDigimon.name)} atualizada!`,
        {
          variant: "success",
        }
      );
      handleCloseUploadModal();

      // Recarregar os Digimons para garantir sincronização
      await fetchDigimons();
    } catch (error) {
      console.error("❌ Erro no processo:", error);
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao atualizar imagem",
        { variant: "error" }
      );
    } finally {
      setUploadingImage(false);
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
              <option value="4">Mega 1</option>
              <option value="5">Mega 2</option>
              <option value="6">Mega 3</option>
              <option value="7">Mega 4</option>
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
                      {/* Botão de Upload Rápido - Temporário para DEV */}
                      {process.env.NODE_ENV === "development" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUploadModal(digimon);
                          }}
                          className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                          title="Upload rápido de imagem"
                        >
                          📷
                        </button>
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

                        <div className="flex justify-between text-sm text-gray-300">
                          <span className="font-semibold">
                            <span className="text-blue-400">
                              {getLevelName(digimon.level)}
                            </span>
                          </span>
                        </div>

                        <div className="text-xs text-gray-400">
                          {digimon.evolution?.length || 0} evolução(ões)
                        </div>
                      </div>

                      <div className="space-y-2">
                        {!isProduction && (
                          <button
                            onClick={() => handleConfigureEvolutions(digimon)}
                            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Editar
                          </button>
                        )}

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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Seções por Nível - quando não há filtros */
            <div className="space-y-8">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
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
                              {/* Botão de Upload Rápido - Temporário para DEV */}
                              {process.env.NODE_ENV === "development" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenUploadModal(digimon);
                                  }}
                                  className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                                  title="Upload rápido de imagem"
                                >
                                  📷
                                </button>
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

                                <div className="flex justify-between text-sm text-gray-300">
                                  <span>
                                    Evoluções:{" "}
                                    <span className="font-bold text-purple-400">
                                      {digimon.evolution?.length || 0}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {!isProduction && (
                                  <button
                                    onClick={() =>
                                      handleConfigureEvolutions(digimon)
                                    }
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Editar
                                  </button>
                                )}

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

      {/* Image Cropper - Temporário para DEV */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="rect"
          outputSize={512}
          quality={0.92}
        />
      )}

      {/* Modal de Upload Rápido de Imagem - Temporário para DEV */}
      {isUploadModalOpen && uploadingDigimon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]"
          onClick={handleCloseUploadModal}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border-2 border-blue-500 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">📷</span>
                  Upload Rápido - {capitalize(uploadingDigimon.name)}
                </h3>
                <button
                  onClick={handleCloseUploadModal}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-blue-100 mt-1">
                Ferramenta temporária para desenvolvimento
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadImage} className="p-6">
              {/* Preview da Imagem */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Preview da Imagem
                </label>
                <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg overflow-hidden border-2 border-gray-600">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🖼️</div>
                        <p className="text-sm">Nenhuma imagem selecionada</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input de Arquivo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Selecionar e Cortar Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-400 mt-2">
                  ✂️ A imagem será cortada automaticamente após seleção
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
                  disabled={uploadingImage}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Enviando..." : "Salvar Imagem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
