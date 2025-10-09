"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { capitalize } from "@/lib/utils";
import ImageCropper from "../ImageCropper";

interface Boss {
  id: number;
  name: string;
  image: string;
  description: string;
  effectId: number;
  dp: number;
  typeId: number;
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

const digimonTypes = [
  { id: 1, name: "Data" },
  { id: 2, name: "Vaccine" },
  { id: 3, name: "Virus" },
  { id: 4, name: "Free" },
  { id: 5, name: "Variable" },
  { id: 6, name: "Unknown" },
];

export default function BossesTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    effectId: 1,
    dp: 10000,
    typeId: 1,
    image: "/images/bosses/default.png",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBosses();
    fetchEffects();
  }, []);

  const fetchBosses = async () => {
    try {
      const response = await fetch("/api/bosses");
      if (response.ok) {
        const data = await response.json();
        setBosses(data);
      }
    } catch (error) {
      console.error("Erro ao carregar bosses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEffects = async () => {
    try {
      const response = await fetch("/api/effects");
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas efeitos do tipo "boss" e "special"
        const bossEffects = data.filter(
          (e: Effect) => e.type === "boss" || e.type === "special"
        );
        setEffects(bossEffects);
      }
    } catch (error) {
      console.error("Erro ao carregar efeitos:", error);
    }
  };

  const handleEdit = (boss: Boss) => {
    setEditingBoss(boss);
    setFormData({
      name: boss.name,
      description: boss.description,
      effectId: boss.effectId || 1,
      dp: boss.dp,
      typeId: boss.typeId,
      image: boss.image,
    });
    setImagePreview(boss.image);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingBoss(null);
    setFormData({
      name: "",
      description: "",
      effectId: effects.length > 0 ? effects[0].id : 1,
      dp: 10000,
      typeId: 1,
      image: "/images/bosses/default.png",
    });
    setImageFile(null);
    setImagePreview("");
    setIsAddingNew(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = (croppedImage: Blob) => {
    // Converter Blob para File
    const file = new File([croppedImage], "boss-image.webp", {
      type: "image/webp",
    });
    setImageFile(file);

    // Criar preview da imagem cortada
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setShowCropper(false);
  };

  const handleSave = async () => {
    try {
      console.log("💾 [BOSS] Iniciando salvamento...");
      console.log("📊 [BOSS] Form data:", formData);
      console.log("🖼️ [BOSS] Image file:", imageFile?.name);

      let imagePath = formData.image;

      // Se há uma nova imagem, fazer upload primeiro
      if (imageFile) {
        console.log("📤 [BOSS] Fazendo upload da imagem...");
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("type", "boss");

        // Se está editando, passar imagem antiga para deletar
        if (editingBoss?.image) {
          uploadFormData.append("oldImage", editingBoss.image);
          console.log(
            "🗑️ [BOSS] Imagem antiga para deletar:",
            editingBoss.image
          );
        }

        console.log("🌐 [BOSS] Enviando request para /api/upload...");
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        console.log("📡 [BOSS] Response status:", uploadResponse.status);

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imagePath = uploadData.path;
          console.log("✅ [BOSS] Upload concluído:", imagePath);
        } else {
          const errorData = await uploadResponse.json();
          console.error("❌ [BOSS] Erro no upload:", errorData);
          enqueueSnackbar(errorData.error || "Erro ao fazer upload da imagem", {
            variant: "error",
          });
          return;
        }
      }

      const url = editingBoss ? `/api/bosses/${editingBoss.id}` : "/api/bosses";
      const method = editingBoss ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imagePath,
        }),
      });

      if (response.ok) {
        enqueueSnackbar(editingBoss ? "Boss atualizado!" : "Boss criado!", {
          variant: "success",
        });
        fetchBosses();
        setEditingBoss(null);
        setIsAddingNew(false);
        setImageFile(null);
        setImagePreview("");
      } else {
        const error = await response.json();
        enqueueSnackbar(error.error || "Erro ao salvar boss", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Erro ao salvar boss", { variant: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este boss?")) return;

    try {
      const response = await fetch(`/api/bosses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        enqueueSnackbar("Boss deletado!", { variant: "success" });
        fetchBosses();
      } else {
        enqueueSnackbar("Erro ao deletar boss", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Erro ao deletar boss", { variant: "error" });
    }
  };

  const handleCancel = () => {
    setEditingBoss(null);
    setIsAddingNew(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-300">Carregando bosses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">🐉 Gerenciar Bosses</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ Adicionar Boss
        </button>
      </div>

      {/* Formulário de Edição/Criação */}
      {(editingBoss || isAddingNew) && (
        <div className="bg-gray-700 rounded-lg p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingBoss ? "Editar Boss" : "Novo Boss"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Devimon"
              />
            </div>

            {/* DP */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                DP (HP)
              </label>
              <input
                type="number"
                value={formData.dp}
                onChange={(e) =>
                  setFormData({ ...formData, dp: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                min="1000"
                step="1000"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={formData.typeId}
                onChange={(e) =>
                  setFormData({ ...formData, typeId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                {digimonTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Efeito */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Efeito
              </label>
              <select
                value={formData.effectId}
                onChange={(e) =>
                  setFormData({ ...formData, effectId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
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

            {/* Imagem */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Imagem do Boss
              </label>
              <div className="flex gap-4 items-center">
                {/* Preview da Imagem */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  title="Clique para alterar imagem"
                >
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/bosses/default.png";
                    }}
                  />
                </div>

                {/* Input oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Instruções */}
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-1">
                    Clique na imagem para fazer upload
                  </p>
                  <p className="text-xs text-gray-400">
                    Formatos aceitos: JPG, PNG, WebP
                  </p>
                  {imageFile && (
                    <p className="text-xs text-green-400 mt-2">
                      ✅ Nova imagem selecionada
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descrição do boss..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              💾 Salvar
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Bosses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bosses.map((boss) => (
          <div
            key={boss.id}
            className="bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-purple-500 transition-all"
          >
            {/* Imagem */}
            <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-800">
              <img
                src={boss.image}
                alt={boss.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/bosses/default.png";
                }}
              />
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                {boss.dp.toLocaleString()} DP
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">
                {capitalize(boss.name)}
              </h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                {boss.description}
              </p>

              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  {digimonTypes.find((t) => t.id === boss.typeId)?.name}
                </span>
                {boss.effectId &&
                  effects.find((e) => e.id === boss.effectId) && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                      {
                        effectTypeIcons[
                          effects.find((e) => e.id === boss.effectId)!.type
                        ]
                      }{" "}
                      {effects.find((e) => e.id === boss.effectId)!.name}
                    </span>
                  )}
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(boss)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(boss.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
                >
                  🗑️ Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bosses.length === 0 && !isAddingNew && (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <div className="text-6xl mb-4">🐉</div>
          <p className="text-gray-300 mb-4">Nenhum boss cadastrado</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Adicionar Primeiro Boss
          </button>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCroppedImage}
          onCancel={() => setShowCropper(false)}
          aspect={1}
          outputSize={{ width: 512, height: 512 }}
        />
      )}
    </div>
  );
}
