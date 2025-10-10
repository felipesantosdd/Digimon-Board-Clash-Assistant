"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { capitalize } from "@/lib/utils";

interface Boss {
  id: number;
  name: string;
  image: string;
  dp: number;
  typeId: number;
}

interface Item {
  id: number;
  name: string;
  image: string;
}

interface BossDrop {
  id: number;
  bossId: number;
  itemId: number;
  dropChance: number; // 1-100
}

const digimonTypes = [
  { id: 1, name: "Data" },
  { id: 2, name: "Vaccine" },
  { id: 3, name: "Virus" },
  { id: 4, name: "Free" },
  { id: 5, name: "Variable" },
  { id: 6, name: "Unknown" },
];

interface BossDropsTabProps {
  isProduction?: boolean;
}

export default function BossDropsTab({
  isProduction = false,
}: BossDropsTabProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [drops, setDrops] = useState<BossDrop[]>([]);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDrop, setEditingDrop] = useState<BossDrop | null>(null);
  const [addingForBoss, setAddingForBoss] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    itemId: 0,
    dropChance: 50,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar drops
      const dropsRes = await fetch("/api/bosses/drops");
      if (dropsRes.ok) {
        const dropsData = await dropsRes.json();
        setDrops(dropsData);
      }

      // Buscar bosses
      const bossesRes = await fetch("/api/bosses");
      if (bossesRes.ok) {
        const bossesData = await bossesRes.json();
        setBosses(bossesData);
      }

      // Buscar items
      const itemsRes = await fetch("/api/items");
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drop: BossDrop) => {
    setEditingDrop(drop);
    setFormData({
      itemId: drop.itemId,
      dropChance: drop.dropChance,
    });
    setAddingForBoss(null);
  };

  const handleAddNew = (bossId: number) => {
    setEditingDrop(null);
    setAddingForBoss(bossId);
    setFormData({
      itemId: items[0]?.id || 0,
      dropChance: 50,
    });
  };

  const handleSave = async () => {
    try {
      if (editingDrop) {
        // Atualizar drop existente
        const response = await fetch(`/api/bosses/drops/${editingDrop.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          enqueueSnackbar("Drop atualizado!", { variant: "success" });
          fetchData();
          setEditingDrop(null);
        } else {
          const error = await response.json();
          enqueueSnackbar(error.error || "Erro ao atualizar drop", {
            variant: "error",
          });
        }
      } else if (addingForBoss !== null) {
        // Criar novo drop
        const response = await fetch("/api/bosses/drops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bossId: addingForBoss,
            ...formData,
          }),
        });

        if (response.ok) {
          enqueueSnackbar("Drop criado!", { variant: "success" });
          fetchData();
          setAddingForBoss(null);
        } else {
          const error = await response.json();
          enqueueSnackbar(error.error || "Erro ao criar drop", {
            variant: "error",
          });
        }
      }
    } catch {
      enqueueSnackbar("Erro ao salvar drop", { variant: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este drop?")) return;

    try {
      const response = await fetch(`/api/bosses/drops/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        enqueueSnackbar("Drop deletado!", { variant: "success" });
        fetchData();
      } else {
        enqueueSnackbar("Erro ao deletar drop", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Erro ao deletar drop", { variant: "error" });
    }
  };

  const getItemById = (itemId: number) => {
    return items.find((i) => i.id === itemId);
  };

  const getBossDrops = (bossId: number) => {
    return drops.filter((d) => d.bossId === bossId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-300">Carregando drops...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          🎁 Gerenciar Drops de Bosses
        </h2>
      </div>

      {bosses.length === 0 && (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <div className="text-6xl mb-4">🐉</div>
          <p className="text-gray-300 mb-4">
            Nenhum boss cadastrado. Crie bosses primeiro!
          </p>
        </div>
      )}

      {/* Cards de Bosses com seus Drops */}
      <div className="space-y-6">
        {bosses.map((boss) => {
          const bossDrops = getBossDrops(boss.id);
          const isAddingDrop = addingForBoss === boss.id;

          return (
            <div
              key={boss.id}
              className="bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden"
            >
              {/* Header do Boss */}
              <div className="bg-gradient-to-r from-purple-900 to-red-900 p-4">
                <div className="flex items-center gap-4">
                  {/* Imagem do Boss */}
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={boss.image}
                      alt={boss.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/bosses/default.png";
                      }}
                    />
                  </div>

                  {/* Info do Boss */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">
                      {capitalize(boss.name)}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {digimonTypes.find((t) => t.id === boss.typeId)?.name}
                      </span>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        {boss.dp.toLocaleString()} DP
                      </span>
                    </div>
                  </div>

                  {/* Botão Adicionar Drop */}
                  {!isProduction && (
                    <button
                      onClick={() => handleAddNew(boss.id)}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <span>➕</span>
                      <span className="hidden sm:inline">Adicionar Drop</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Formulário de Adicionar/Editar Drop */}
              {!isProduction &&
                (isAddingDrop ||
                  (editingDrop && editingDrop.bossId === boss.id)) && (
                  <div className="bg-gray-600 p-4 border-t-2 border-blue-500">
                    <h4 className="text-lg font-bold text-white mb-3">
                      {editingDrop ? "✏️ Editar Drop" : "➕ Novo Drop"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Item
                        </label>
                        <select
                          value={formData.itemId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              itemId: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Chance de Drop */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Chance de Drop (%)
                        </label>
                        <input
                          type="number"
                          value={formData.dropChance}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dropChance: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="100"
                          step="5"
                        />
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        💾 Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditingDrop(null);
                          setAddingForBoss(null);
                        }}
                        className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                )}

              {/* Lista de Drops do Boss */}
              <div className="p-4">
                {bossDrops.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">
                      Nenhum drop configurado para este boss
                    </p>
                    <p className="text-xs mt-1">
                      Clique em &quot;Adicionar Drop&quot; para configurar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                      🎁 Drops Configurados ({bossDrops.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bossDrops.map((drop) => {
                        const item = getItemById(drop.itemId);
                        const isEditing = editingDrop?.id === drop.id;

                        return (
                          <div
                            key={drop.id}
                            className={`bg-gray-600 rounded-lg p-3 border-2 transition-all ${
                              isEditing
                                ? "border-blue-500 ring-2 ring-blue-500/50"
                                : "border-gray-500 hover:border-gray-400"
                            }`}
                          >
                            {/* Item Info */}
                            <div className="flex items-center gap-3 mb-2">
                              {item?.image && (
                                <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">
                                  {item?.name || "Item Desconhecido"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ID: {drop.itemId}
                                </p>
                              </div>
                            </div>

                            {/* Chance de Drop */}
                            <div className="bg-gray-700 rounded p-2 mb-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                  Chance:
                                </span>
                                <span className="text-lg font-bold text-green-400">
                                  {drop.dropChance}%
                                </span>
                              </div>
                              {/* Barra Visual */}
                              <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
                                  style={{ width: `${drop.dropChance}%` }}
                                />
                              </div>
                            </div>

                            {/* Botões */}
                            {!isProduction && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(drop)}
                                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(drop.id)}
                                  className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                                >
                                  🗑️ Deletar
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {bosses.length > 0 && drops.length === 0 && (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <div className="text-6xl mb-4">🎁</div>
          <p className="text-gray-300 mb-4">Nenhum drop configurado ainda</p>
          <p className="text-sm text-gray-400">
            Clique em &quot;Adicionar Drop&quot; em qualquer boss para começar
          </p>
        </div>
      )}
    </div>
  );
}
