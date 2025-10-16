"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { capitalize } from "@/lib/utils";
import ImageCropper from "../ImageCropper";
import TypeIcon from "../TypeIcons";

interface BossDigimon {
  id: number;
  name: string;
  image: string;
  level: number;
  typeId: number;
  boss: boolean;
  effectId?: number; // Efeito especial do boss
  description?: string; // Descrição do boss
}

type EffectType =
  | "heal"
  | "damage"
  | "buff"
  | "debuff"
  | "special"
  | "boss"
  | "evolution";

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
  evolution: "🧬",
};

const digimonTypes = [
  { id: 1, name: "Data" },
  { id: 2, name: "Vaccine" },
  { id: 3, name: "Virus" },
  { id: 4, name: "Free" },
  { id: 5, name: "Variable" },
  { id: 6, name: "Unknown" },
];

const getTypeColor = (typeId: number): string => {
  const colors = {
    1: "bg-blue-600", // Data
    2: "bg-green-600", // Vaccine
    3: "bg-red-600", // Virus
    4: "bg-yellow-600", // Free
    5: "bg-purple-600", // Variable
    6: "bg-gray-600", // Unknown
  };
  return colors[typeId as keyof typeof colors] || "bg-gray-600";
};

const getTypeName = (typeId: number): string => {
  const type = digimonTypes.find((t) => t.id === typeId);
  return type?.name || "Unknown";
};

interface BossesTabProps {
  isProduction?: boolean;
}

export default function BossesTab({ isProduction = false }: BossesTabProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [bossDigimons, setBossDigimons] = useState<BossDigimon[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBoss, setEditingBoss] = useState<BossDigimon | null>(null);

  const [formData, setFormData] = useState({
    effectId: 1,
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBossDigimons();
    fetchEffects();
  }, []);

  const fetchBossDigimons = async () => {
    try {
      const response = await fetch("/api/digimons");
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas Digimons marcados como boss
        const bosses = data.filter(
          (digimon: { boss?: boolean }) => digimon.boss === true
        );
        setBossDigimons(bosses);
      }
    } catch (error) {
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
    }
  };

  const handleEdit = (boss: BossDigimon) => {
    setEditingBoss(boss);
    setFormData({
      effectId: boss.effectId || 1,
      description: boss.description || "",
    });
    setImagePreview(boss.image);
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
    if (!editingBoss) return;

    try {
      // Atualizar apenas efeito e descrição do boss
      const response = await fetch(`/api/bosses/${editingBoss.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          effectId: formData.effectId,
          description: formData.description,
        }),
      });

      if (response.ok) {
        enqueueSnackbar("Configurações do boss atualizadas!", {
          variant: "success",
        });
        fetchBossDigimons();
        setEditingBoss(null);
        setImageFile(null);
        setImagePreview("");
      } else {
        const error = await response.json();
        enqueueSnackbar(error.error || "Erro ao salvar configurações", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Erro ao salvar configurações", { variant: "error" });
    }
  };

  const handleCancel = () => {
    setEditingBoss(null);
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
        <h2 className="text-2xl font-bold text-white">
          👹 {isProduction ? "Biblioteca de Bosses" : "Configurar Bosses"}
        </h2>
        <div className="text-sm text-gray-400">
          {bossDigimons.length} Digimon{bossDigimons.length !== 1 ? "s" : ""}{" "}
          marcado{bossDigimons.length !== 1 ? "s" : ""} como boss
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 <strong>Dica:</strong> Para marcar um Digimon como boss, edite-o na
          aba &quot;Digimons&quot; e ative o switch &quot;Pode ser Boss&quot;.
          Aqui você configura apenas os efeitos especiais e drops de cada boss.
        </p>
      </div>

      {/* Formulário de Configuração */}
      {!isProduction && editingBoss && (
        <div className="bg-gray-700 rounded-lg p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4">
            Configurar Boss: {editingBoss.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info do Digimon */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-300">
                Informações do Digimon
              </h4>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={editingBoss.image || "/images/digimons/fallback.svg"}
                    alt={editingBoss.name}
                    className="w-16 h-16 object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/digimons/fallback.svg";
                    }}
                  />
                  <div>
                    <h5 className="font-bold text-white">{editingBoss.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`${getTypeColor(
                          editingBoss.typeId
                        )} text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1`}
                      >
                        <TypeIcon
                          typeId={editingBoss.typeId}
                          size={12}
                          className="text-white"
                        />
                        {getTypeName(editingBoss.typeId)}
                      </span>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        Level {editingBoss.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações do Boss */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-300">
                Configurações do Boss
              </h4>

              {/* Efeito */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Efeito Especial
                </label>
                <select
                  value={formData.effectId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      effectId: Number(e.target.value),
                    })
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

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descrição do Boss
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Descrição especial deste boss..."
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              💾 Salvar Configurações
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
        {bossDigimons.map((boss) => (
          <div
            key={boss.id}
            className="bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-red-500 transition-all"
          >
            {/* Imagem */}
            <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-800">
              <img
                src={boss.image || "/images/digimons/fallback.svg"}
                alt={boss.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/digimons/fallback.svg";
                }}
              />
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                👹 Boss
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">
                {capitalize(boss.name)}
              </h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                {boss.description || "Sem descrição configurada"}
              </p>

              <div className="flex gap-2 mb-3 flex-wrap">
                <span
                  className={`text-xs ${getTypeColor(
                    boss.typeId
                  )} text-white px-2 py-1 rounded-full flex items-center gap-1`}
                >
                  <TypeIcon
                    typeId={boss.typeId}
                    size={10}
                    className="text-white"
                  />
                  {getTypeName(boss.typeId)}
                </span>
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                  Level {boss.level}
                </span>
                {boss.effectId &&
                  effects.find((e) => e.id === boss.effectId) && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
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
              {!isProduction && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(boss)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors"
                  >
                    ⚙️ Configurar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {bossDigimons.length === 0 && (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <div className="text-6xl mb-4">👹</div>
          <p className="text-gray-300 mb-4">Nenhum Digimon marcado como boss</p>
          <p className="text-sm text-gray-400 mb-4">
            Vá para a aba &quot;Digimons&quot; e marque alguns Digimons como
            boss
          </p>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCroppedImage}
          onCancel={() => setShowCropper(false)}
          aspectRatio={1}
          outputSize={512}
        />
      )}
    </div>
  );
}
