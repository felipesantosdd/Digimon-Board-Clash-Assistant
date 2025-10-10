"use client";

import { useState, useEffect, useRef } from "react";
import { Digimon } from "../database/database_type";
import { useSnackbar } from "notistack";
import { capitalize } from "@/lib/utils";
import ImageCropper from "./ImageCropper";

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: Digimon | null;
  allDigimons: Digimon[];
  onSaveEvolutions: (digimonId: number, evolutionIds: number[]) => void;
  onSaveDigimon?: (
    digimonId: number,
    data: {
      name: string;
      level: number;
      typeId: number;
      image?: string;
      active?: boolean;
      boss?: boolean;
    }
  ) => void;
}

const digimonTypes = [
  { id: 1, name: "Data" },
  { id: 2, name: "Vaccine" },
  { id: 3, name: "Virus" },
  { id: 4, name: "Free" },
  { id: 5, name: "Variable" },
  { id: 6, name: "Unknown" },
];

export default function EvolutionModal({
  isOpen,
  onClose,
  digimon,
  allDigimons,
  onSaveEvolutions,
  onSaveDigimon,
}: EvolutionModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedEvolutions, setSelectedEvolutions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Sistema de stats dinâmicos - não precisamos mais de DP fixo

  // Estados para edição do Digimon
  const [editMode, setEditMode] = useState(true); // Sempre em modo de edição
  const [editData, setEditData] = useState({
    name: "",
    level: 1,
    typeId: 1,
    active: true,
    boss: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpar formulário de edição
  const resetEditForm = () => {
    setSearchTerm("");
    setImageFile(null);
    setImagePreview("");
    if (digimon) {
      setEditData({
        name: digimon.name,
        level: digimon.level,
        typeId: digimon.typeId,
        active: digimon.active !== false,
        boss: digimon.boss || false,
      });
    }
  };

  useEffect(() => {
    if (digimon) {
      setSelectedEvolutions(digimon.evolution || []);
      setEditData({
        name: digimon.name,
        level: digimon.level,
        typeId: digimon.typeId,
        active: digimon.active !== false,
        boss: digimon.boss || false,
      });
      setSearchTerm("");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        enqueueSnackbar("Por favor, selecione apenas arquivos de imagem", {
          variant: "error",
        });
        return;
      }

      // Validar tamanho (máx 5MB para permitir crop)
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("Imagem muito grande! Máximo 5MB", {
          variant: "error",
        });
        return;
      }

      // Criar preview para crop
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Converter blob para File (WebP ou JPEG)
    const extension = croppedBlob.type === "image/webp" ? "webp" : "jpg";
    const croppedFile = new File([croppedBlob], `cropped-image.${extension}`, {
      type: croppedBlob.type,
    });
    setImageFile(croppedFile);

    // Criar preview da imagem recortada
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);

    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveDigimonData = async () => {
    console.log("💾 Salvando dados do Digimon:", {
      digimonId: digimon.id,
      editData,
    });
    if (onSaveDigimon) {
      try {
        let imagePath: string | undefined = undefined;

        // Se há uma nova imagem, fazer upload
        if (imageFile) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", imageFile);
          formDataUpload.append("type", "digimon");

          // Enviar imagem antiga para deletar
          if (digimon.image) {
            formDataUpload.append("oldImage", digimon.image);
          }

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formDataUpload,
          });

          if (uploadResponse.ok) {
            const { path } = await uploadResponse.json();
            imagePath = path;
            
            // Se o Digimon estava inativo e recebeu uma imagem, ativá-lo automaticamente
            if (editData.active === false && path) {
              enqueueSnackbar("Digimon ativado automaticamente ao adicionar imagem!", {
                variant: "info",
              });
            }
          } else {
            throw new Error("Erro ao fazer upload da imagem");
          }
        }

        await onSaveDigimon(digimon.id, {
          ...editData,
          ...(imagePath && { image: imagePath }),
          // Se uma nova imagem foi adicionada e o Digimon estava inativo, ativá-lo
          ...(imagePath && editData.active === false && { active: true }),
        });
        setSearchTerm("");
        setImageFile(null);
        setImagePreview("");
        enqueueSnackbar("Dados do Digimon salvos com sucesso!", {
          variant: "success",
        });
      } catch (error) {
        console.error("Erro ao salvar Digimon:", error);
        enqueueSnackbar("Erro ao salvar dados do Digimon", {
          variant: "error",
        });
      }
    }
  };

  const handleSaveAll = async () => {
    // Salvar evoluções
    onSaveEvolutions(digimon.id, selectedEvolutions);

    // Salvar dados do Digimon sempre (já que sempre está em modo de edição)
    if (onSaveDigimon) {
      try {
        let imagePath: string | undefined = undefined;

        // Se há uma nova imagem, fazer upload
        if (imageFile) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", imageFile);
          formDataUpload.append("type", "digimon");

          // Enviar imagem antiga para deletar
          if (digimon.image) {
            formDataUpload.append("oldImage", digimon.image);
          }

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formDataUpload,
          });

          if (uploadResponse.ok) {
            const { path } = await uploadResponse.json();
            imagePath = path;
          } else {
            throw new Error("Erro ao fazer upload da imagem");
          }
        }

        await onSaveDigimon(digimon.id, {
          ...editData,
          ...(imagePath && { image: imagePath }),
        });

        enqueueSnackbar("Dados do Digimon salvos com sucesso!", {
          variant: "success",
        });
      } catch (error) {
        console.error("Erro ao salvar Digimon:", error);
        enqueueSnackbar("Erro ao salvar dados do Digimon", {
          variant: "error",
        });
      }
    }

    resetEditForm(); // Limpar formulário ao salvar
    onClose();
  };

  const handleSave = () => {
    onSaveEvolutions(digimon.id, selectedEvolutions);
    resetEditForm(); // Limpar formulário ao salvar
    onClose();
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("🔄 handleEditChange:", { name, value, type: typeof value });

    setEditData((prev) => {
      const newData = {
        ...prev,
        [name]: ["typeId", "level"].includes(name) ? Number(value) : value,
      };
      console.log("📝 editData atualizado:", newData);
      return newData;
    });
  };

  // Filtrar Digimons que podem ser evoluções (não o próprio Digimon e apenas do nível seguinte)
  const possibleEvolutions = allDigimons.filter(
    (d) =>
      d.id !== digimon.id &&
      d.level === digimon.level + 1 &&
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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

      <div
        className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              {/* Imagem do Digimon no header - clicável */}
              <div
                className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg overflow-hidden relative cursor-pointer hover:scale-105 transition-transform"
                onClick={() => fileInputRef.current?.click()}
                title="Clique para alterar imagem"
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
              </div>
              <h2 className="text-2xl font-bold text-white">
                Configurar Evoluções - {capitalize(digimon.name)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-white">Dados do Digimon:</h3>
            </div>

            {/* Modo de Edição */}
            <div className="space-y-3">
              {/* Input de arquivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Level
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        handleEditChange({
                          target: { name: "level", value: level.toString() },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      className={`px-2 py-1 rounded border-2 text-xs transition-all ${
                        editData.level === level
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipos */}
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Tipo
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {digimonTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        handleEditChange({
                          target: {
                            name: "typeId",
                            value: type.id.toString(),
                          },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      className={`p-2 rounded border-2 transition-all flex flex-col items-center gap-1 ${
                        editData.typeId === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editData.typeId === type.id}
                        onChange={() => {}}
                        className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span
                        className={`text-[10px] font-medium ${
                          editData.typeId === type.id
                            ? "text-blue-700"
                            : "text-white"
                        }`}
                      >
                        {type.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Ativo/Inativo */}
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {/* Switch Ativo/Inativo */}
                  <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setEditData((prev) => ({
                          ...prev,
                          active: !prev.active,
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        editData.active ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          editData.active ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-xs font-medium ${
                        editData.active ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {editData.active ? "✅ Ativo" : "⚠️ Inativo"}
                    </span>
                    <p className="text-[10px] text-gray-400 ml-auto">
                      {editData.active
                        ? "Disponível no jogo"
                        : "Indisponível para novos jogos"}
                    </p>
                  </div>

                  {/* Switch Pode ser Boss */}
                  <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setEditData((prev) => ({ ...prev, boss: !prev.boss }))
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        editData.boss ? "bg-red-500" : "bg-gray-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          editData.boss ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-xs font-medium ${
                        editData.boss ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      {editData.boss ? "👹 Pode ser Boss" : "🐉 Normal"}
                    </span>
                    <p className="text-[10px] text-gray-400 ml-auto">
                      {editData.boss
                        ? "Pode aparecer como boss"
                        : "Apenas jogável"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-white">
                Selecionar Evoluções para Level {digimon.level + 1} (
                {selectedEvolutions.length} selecionadas):
              </h3>
              <div className="text-sm text-gray-200">
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
                className="w-full px-3 text-white py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {possibleEvolutions.length > 0 ? (
                possibleEvolutions.map((evolution) => (
                  <div
                    key={evolution.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedEvolutions.includes(evolution.id)
                        ? "border-blue-500 bg-blue-900 text-white"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800 text-white"
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
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-blue-100 rounded overflow-hidden relative">
                        <img
                          src={
                            evolution.image || "/images/digimons/fallback1.jpg"
                          }
                          alt={evolution.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/digimons/fallback1.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-white">
                          {capitalize(evolution.name)}
                        </p>
                        <p className="text-xs text-gray-200">
                          Level {evolution.level}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Nenhum Digimon encontrado
                  </h4>
                  <p className="text-gray-200">
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
              onClick={() => {
                resetEditForm(); // Limpar ao fechar modal
                onClose();
              }}
              className="px-4 py-2 text-gray-200 hover:text-white transition-colors font-semibold"
            >
              Cancelar
            </button>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={handleSaveAll}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                💾 Salvar Tudo
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
