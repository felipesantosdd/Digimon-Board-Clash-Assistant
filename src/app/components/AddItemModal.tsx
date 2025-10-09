"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { Item } from "@/types/item";
import ImageCropper from "./ImageCropper";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: Item | null;
}

type EffectType = "heal" | "damage" | "buff" | "debuff" | "special" | "boss";

interface Effect {
  id: number;
  name: string;
  description: string;
  code: string;
  type: EffectType;
  value: number;
}

const effectTypeIcons: Record<EffectType, string> = {
  heal: "💚",
  damage: "💥",
  buff: "⬆️",
  debuff: "⬇️",
  special: "✨",
  boss: "👹",
};

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
}: AddItemModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    effectId: 1,
    image: "/images/items/fallback.svg",
    dropChance: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [effects, setEffects] = useState<Effect[]>([]);

  // Buscar efeitos da API
  useEffect(() => {
    const fetchEffects = async () => {
      try {
        const response = await fetch("/api/effects");
        if (response.ok) {
          const data = await response.json();
          // Filtrar apenas efeitos que não são do tipo "boss"
          const itemEffects = data.filter((e: Effect) => e.type !== "boss");
          setEffects(itemEffects);
        }
      } catch (error) {
        console.error("Erro ao carregar efeitos:", error);
      }
    };

    if (isOpen) {
      fetchEffects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description,
        effectId: editingItem.effectId || 1,
        image: editingItem.image,
        dropChance: editingItem.dropChance || 0,
      });
      setImagePreview(editingItem.image);
    } else {
      resetForm();
    }
  }, [editingItem, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      effectId: effects.length > 0 ? effects[0].id : 1,
      image: "/images/items/fallback.svg",
      dropChance: 0,
    });
    setImageFile(null);
    setImagePreview("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagePath = formData.image;

      // Se há uma nova imagem, fazer upload
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", imageFile);
        formDataUpload.append("type", "item");

        // Se está editando, enviar imagem antiga para deletar
        if (editingItem && editingItem.image) {
          formDataUpload.append("oldImage", editingItem.image);
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

      const itemData = {
        ...formData,
        image: imagePath,
      };

      // Se está editando
      if (editingItem) {
        const response = await fetch(`/api/items/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (response.ok) {
          enqueueSnackbar("Item atualizado com sucesso!", {
            variant: "success",
          });
          onSuccess();
          onClose();
        } else {
          throw new Error("Erro ao atualizar item");
        }
      } else {
        // Criando novo item
        const response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (response.ok) {
          enqueueSnackbar("Item adicionado com sucesso!", {
            variant: "success",
          });
          resetForm();
          onSuccess();
          onClose();
        } else {
          throw new Error("Erro ao adicionar item");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar(
        editingItem ? "Erro ao atualizar item" : "Erro ao adicionar item",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-2xl font-bold">
              {editingItem ? "✏️ Editar Item" : "➕ Adicionar Novo Item"}
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {editingItem
                ? "Atualize as informações do item"
                : "Crie um novo item para o jogo"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Imagem do Item
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
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
                    PNG, JPG ou SVG (máx 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Nome do Item *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Poção de Vida"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Descrição *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Ex: Restaura 1000 HP de um Digimon"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            {/* Efeito */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Efeito *
              </label>
              <select
                name="effectId"
                value={formData.effectId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {effects.map((effect) => (
                  <option key={effect.id} value={effect.id}>
                    {effectTypeIcons[effect.type]} {effect.name}
                  </option>
                ))}
              </select>
              {effects.length > 0 && formData.effectId && (
                <p className="text-xs text-gray-400 mt-2">
                  {
                    effects.find((e) => e.id === Number(formData.effectId))
                      ?.description
                  }
                </p>
              )}
            </div>

            {/* Chance de Drop */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Chance de Encontrar (0-100%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="dropChance"
                  value={formData.dropChance}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  placeholder="Ex: 30"
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Probabilidade de encontrar este item ao explorar o mapa
              </p>
            </div>

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
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? editingItem
                    ? "Atualizando..."
                    : "Adicionando..."
                  : editingItem
                  ? "💾 Salvar"
                  : "➕ Adicionar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
