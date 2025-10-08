"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { capitalize } from "@/lib/utils";
import ImageCropper from "./ImageCropper";

interface DigimonType {
  id: number;
  name: string;
}

interface Digimon {
  id: number;
  name: string;
  level: number;
  dp: number;
  typeId: number;
}

interface AddDigimonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allDigimons: Digimon[];
}

export default function AddDigimonModal({
  isOpen,
  onClose,
  onSuccess,
  allDigimons,
}: AddDigimonModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const digimonTypes: DigimonType[] = [
    { id: 1, name: "Data" },
    { id: 2, name: "Vaccine" },
    { id: 3, name: "Virus" },
    { id: 4, name: "Free" },
    { id: 5, name: "Variable" },
    { id: 6, name: "Unknown" },
  ];

  // Mapeamento de níveis para DP padrão
  const levelToDp: { [key: number]: number } = {
    1: 2000,
    2: 5000,
    3: 8000,
    4: 12000,
    5: 18000,
    6: 20000,
    7: 25000,
  };

  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    dp: 2000,
    typeId: 1,
  });

  const [dpDisplay, setDpDisplay] = useState("2"); // Valor exibido (sem os 000)
  const [selectedPreEvolutions, setSelectedPreEvolutions] = useState<number[]>(
    []
  ); // IDs dos Digimons que evoluem para este
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpar formulário ao fechar
  const resetForm = () => {
    setFormData({
      name: "",
      level: 1,
      dp: 2000,
      typeId: 1,
    });
    setDpDisplay("2");
    setSelectedPreEvolutions([]);
    setSearchTerm("");
    setImageFile(null);
    setImagePreview("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagePath = `/images/digimons/fallback.svg`;

      // Se há uma imagem, fazer upload
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", imageFile);
        formDataUpload.append("type", "digimon");
        // Ao adicionar novo digimon não há imagem antiga para deletar

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

      // 1. Criar o novo Digimon
      const response = await fetch("/api/digimons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imagePath,
          evolution: [],
        }),
      });

      if (response.ok) {
        const newDigimon = await response.json();

        // 2. Atualizar os Digimons selecionados para adicionar este como evolução
        if (selectedPreEvolutions.length > 0) {
          for (const preEvoId of selectedPreEvolutions) {
            const preEvo = allDigimons.find((d) => d.id === preEvoId);
            if (preEvo) {
              const currentEvolutions =
                (preEvo as Digimon & { evolution?: number[] }).evolution || [];
              await fetch(`/api/digimons/${preEvoId}/evolutions`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  evolution: [...currentEvolutions, newDigimon.id],
                }),
              });
            }
          }
        }

        enqueueSnackbar("Digimon adicionado com sucesso!", {
          variant: "success",
        });
        resetForm(); // Limpar formulário após sucesso
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error || "Erro ao adicionar Digimon"}`, {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar Digimon:", error);
      enqueueSnackbar("Erro ao adicionar Digimon", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "dp") {
      // Armazenar o valor digitado
      setDpDisplay(value);
      // Converter para DP real (adicionar 000)
      const dpValue = Number(value) * 1000;
      setFormData((prev) => ({
        ...prev,
        dp: dpValue,
      }));
    } else if (name === "level") {
      const levelValue = Number(value);
      const defaultDp = levelToDp[levelValue] || 2000;

      setFormData((prev) => ({
        ...prev,
        level: levelValue,
        dp: defaultDp,
      }));
      setDpDisplay(String(defaultDp / 1000)); // Atualizar display
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ["typeId"].includes(name) ? Number(value) : value,
      }));
    }
  };

  const handlePreEvolutionToggle = (digimonId: number) => {
    setSelectedPreEvolutions((prev) => {
      if (prev.includes(digimonId)) {
        return prev.filter((id) => id !== digimonId);
      } else {
        return [...prev, digimonId];
      }
    });
  };

  // Filtrar Digimons do nível anterior
  const possiblePreEvolutions = allDigimons.filter(
    (d) =>
      d.level === formData.level - 1 &&
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

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
        className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-2xl font-bold">➕ Adicionar Novo Digimon</h2>
            {process.env.NODE_ENV === "development" && (
              <p className="text-green-100 text-sm mt-1">
                🛠️ Modo Desenvolvimento
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Imagem do Digimon
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🤖</span>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    📁 Selecionar Imagem
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG ou SVG (máx 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Nome do Digimon *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Agumon"
                className="w-full px-3 py-2 border text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-blue-500"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Level *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "level", value: level.toString() },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                      formData.level === level
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-600 text-white hover:border-gray-500"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* DP */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                DP (Digimon Power) *{" "}
                <span className="text-xs text-gray-500">(x1000)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="dp"
                  value={dpDisplay}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full text-white px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-blue-500"
                  placeholder="Ex: 2 = 2000 DP"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  = {formData.dp.toLocaleString()} DP
                </span>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Tipo *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {digimonTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "typeId", value: type.id.toString() },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.typeId === type.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.typeId === type.id}
                      onChange={() => {}}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.typeId === type.id
                          ? "text-green-700"
                          : "text-gray-200"
                      }`}
                    >
                      {type.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pré-Evoluções (apenas se level > 1) */}
            {formData.level > 1 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Pré-Evoluções (Level {formData.level - 1}) -{" "}
                    {selectedPreEvolutions.length} selecionadas
                  </label>
                </div>

                {/* Barra de pesquisa */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Buscar Digimons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-blue-500"
                  />
                </div>

                {/* Lista de Pré-Evoluções */}
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 border border-gray-700 rounded-lg p-2">
                  {possiblePreEvolutions.length > 0 ? (
                    possiblePreEvolutions.map((preEvo) => (
                      <div
                        key={preEvo.id}
                        className={`flex items-center p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedPreEvolutions.includes(preEvo.id)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                        onClick={() => handlePreEvolutionToggle(preEvo.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPreEvolutions.includes(preEvo.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-green-600"
                        />
                        <div className="flex-1 min-w-0 ml-3">
                          <p className="font-semibold text-sm truncate text-white">
                            {capitalize(preEvo.name)}
                          </p>
                          <p className="text-xs text-gray-200">
                            Level {preEvo.level} • DP: {preEvo.dp}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-300">
                        {searchTerm
                          ? "Nenhum Digimon encontrado"
                          : `Não há Digimons de level ${formData.level - 1}`}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-300 mt-2">
                  💡 Estes Digimons evoluirão para{" "}
                  {formData.name || "este novo Digimon"}
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adicionando..." : "➕ Adicionar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
