"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { capitalize } from "@/lib/utils";

type EffectType = "heal" | "damage" | "buff" | "debuff" | "special" | "boss";

interface Effect {
  id: number;
  name: string;
  description: string;
  code: string;
  type: EffectType;
  value: number;
}

const effectTypes = [
  { id: "heal", name: "Cura", icon: "💚", color: "bg-green-600" },
  { id: "damage", name: "Dano", icon: "💥", color: "bg-red-600" },
  { id: "buff", name: "Buff", icon: "⬆️", color: "bg-blue-600" },
  { id: "debuff", name: "Debuff", icon: "⬇️", color: "bg-orange-600" },
  { id: "special", name: "Especial", icon: "✨", color: "bg-purple-600" },
  { id: "boss", name: "Boss", icon: "👹", color: "bg-pink-600" },
];

export default function EffectsTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [effects, setEffects] = useState<Effect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEffect, setEditingEffect] = useState<Effect | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterType, setFilterType] = useState<EffectType | "all">("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    type: "heal" as EffectType,
    value: 0,
  });

  useEffect(() => {
    fetchEffects();
  }, []);

  const fetchEffects = async () => {
    try {
      const response = await fetch("/api/effects");
      if (response.ok) {
        const data = await response.json();
        setEffects(data);
      }
    } catch (error) {
      console.error("Erro ao carregar efeitos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (effect: Effect) => {
    setEditingEffect(effect);
    setFormData({
      name: effect.name,
      description: effect.description,
      code: effect.code,
      type: effect.type,
      value: effect.value,
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingEffect(null);
    setFormData({
      name: "",
      description: "",
      code: "",
      type: "heal",
      value: 0,
    });
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    try {
      const url = editingEffect
        ? `/api/effects/${editingEffect.id}`
        : "/api/effects";

      const method = editingEffect ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        enqueueSnackbar(
          editingEffect ? "Efeito atualizado!" : "Efeito criado!",
          { variant: "success" }
        );
        fetchEffects();
        setEditingEffect(null);
        setIsAddingNew(false);
      } else {
        const error = await response.json();
        enqueueSnackbar(error.error || "Erro ao salvar efeito", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Erro ao salvar efeito", { variant: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este efeito?")) return;

    try {
      const response = await fetch(`/api/effects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        enqueueSnackbar("Efeito deletado!", { variant: "success" });
        fetchEffects();
      } else {
        enqueueSnackbar("Erro ao deletar efeito", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Erro ao deletar efeito", { variant: "error" });
    }
  };

  const getFilteredEffects = () => {
    if (filterType === "all") return effects;
    return effects.filter((e) => e.type === filterType);
  };

  const getTypeInfo = (type: EffectType) => {
    return effectTypes.find((t) => t.id === type);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-300">Carregando efeitos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">✨ Gerenciar Efeitos</h2>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Filtro por Tipo */}
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as EffectType | "all")
            }
            className="flex-1 sm:flex-initial px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Tipos</option>
            {effectTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            ➕ Adicionar
          </button>
        </div>
      </div>

      {/* Formulário de Edição/Criação */}
      {(editingEffect || isAddingNew) && (
        <div className="bg-gray-700 rounded-lg p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingEffect ? "✏️ Editar Efeito" : "➕ Novo Efeito"}
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
                placeholder="Ex: Cura Pequena"
              />
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Código (único)
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: heal_1000"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as EffectType,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                {effectTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Valor
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1000"
              />
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
                rows={2}
                placeholder="Descrição do efeito..."
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
              onClick={() => {
                setEditingEffect(null);
                setIsAddingNew(false);
              }}
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Efeitos por Tipo */}
      <div className="space-y-6">
        {effectTypes
          .filter((t) => filterType === "all" || filterType === t.id)
          .map((typeInfo) => {
            const typeEffects = effects.filter((e) => e.type === typeInfo.id);
            if (typeEffects.length === 0) return null;

            return (
              <div
                key={typeInfo.id}
                className="bg-gray-700 rounded-lg p-4 border-2 border-gray-600"
              >
                {/* Header do Tipo */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-600">
                  <div
                    className={`${typeInfo.color} text-white text-2xl px-3 py-2 rounded-lg`}
                  >
                    {typeInfo.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {typeInfo.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {typeEffects.length} efeito
                      {typeEffects.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Grid de Efeitos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {typeEffects.map((effect) => (
                    <div
                      key={effect.id}
                      className="bg-gray-600 rounded-lg p-4 border-2 border-gray-500 hover:border-gray-400 transition-all"
                    >
                      {/* Info do Efeito */}
                      <div className="mb-3">
                        <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                          {typeInfo.icon} {capitalize(effect.name)}
                        </h4>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {effect.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded font-mono">
                            {effect.code}
                          </span>
                          {effect.value > 0 && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold">
                              {effect.value.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(effect)}
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(effect.id)}
                          className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
                        >
                          🗑️ Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Empty State */}
      {getFilteredEffects().length === 0 && !isAddingNew && (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-gray-300 mb-4">
            {filterType === "all"
              ? "Nenhum efeito cadastrado"
              : `Nenhum efeito do tipo "${
                  effectTypes.find((t) => t.id === filterType)?.name
                }"`}
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Adicionar Primeiro Efeito
          </button>
        </div>
      )}

      {/* Legenda de Tipos */}
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase">
          📋 Tipos de Efeitos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {effectTypes.map((type) => (
            <div
              key={type.id}
              className={`${type.color} text-white rounded-lg p-2 text-center`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-xs font-semibold">{type.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
